import * as cdk from 'aws-cdk-lib';
import * as codepipeline from 'aws-cdk-lib/aws-codepipeline';
import * as codepipeline_actions from 'aws-cdk-lib/aws-codepipeline-actions';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import getEnvs from './utils/getEnvs';
import getPipelineEnvs from "./utils/getPipelineEnvs";

export class PipelineStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const pipelineEnvVars = getPipelineEnvs();

        // This method should not be used in a production environment to access secrets!
        const oauthToken = cdk.SecretValue.unsafePlainText(pipelineEnvVars.GITHUB_TOKEN_SECRET_NAME);

        const envVars = getEnvs();

        const portfolioDistributionId = envVars.PORTFOLIO_DISTRIBUTION_ID;

        const frontendBucket = s3.Bucket.fromBucketName(this, 'ImportedSiteBucket', envVars.PORTFOLIO_WEBSITE_BUCKET);

        // Add CloudFront access policy to imported bucket
        const bucketPolicyStatement = new iam.PolicyStatement({
          sid: 'AllowCloudFrontServicePrincipal',
          effect: iam.Effect.ALLOW,
          principals: [new iam.ServicePrincipal('cloudfront.amazonaws.com')],
          actions: ['s3:GetObject'],
          resources: [`${frontendBucket.bucketArn}/*`],
          conditions: {
            StringEquals: {
              'AWS:SourceArn': `arn:aws:cloudfront::${cdk.Aws.ACCOUNT_ID}:distribution/${portfolioDistributionId}`,
            },
          },
        });
        frontendBucket.addToResourcePolicy(bucketPolicyStatement);

        const sourceOutput = new codepipeline.Artifact();

        const frontendBuild = new codebuild.PipelineProject(this, 'FrontendBuild', {
            buildSpec: codebuild.BuildSpec.fromObject({
              version: '0.2',
              phases: {
                install: {
                  'runtime-versions': {
                    nodejs: 20,
                  },
                  commands: [
                    'cd frontend',
                    'npm ci',
                  ],
                },
                build: {
                  commands: [
                    'npm run build',
                    'echo "Frontend build completed successfully"',
                  ],
                },
                post_build: {
                  commands: [
                    'echo "Cleaning up .env..."',
                    'rm -f frontend/.env || true',
                    'echo "Uploading frontend build to S3..."',
                    'aws s3 sync dist s3://$PORTFOLIO_WEBSITE_BUCKET --delete',
                    'if [ -n "$PORTFOLIO_DISTRIBUTION_ID" ]; then echo "Creating CloudFront invalidation..."; aws cloudfront create-invalidation --distribution-id $PORTFOLIO_DISTRIBUTION_ID --paths "/*"; else echo "No CloudFront distribution ID provided; skipping invalidation."; fi'
                  ],
                },
              },
              artifacts: {
                files: [
                  '**/*',
                ],
                'base-directory': 'frontend/dist',
                'discard-paths': 'no',
              },
            }),
            environment: {
                environmentVariables: {
                    VITE_API_KEY: { value: envVars.API_KEY },
                    VITE_API_BASE_URL: { value: envVars.VITE_API_BASE_URL },
                    VITE_TURNSTILE_SITE_KEY: { value: envVars.VITE_TURNSTILE_SITE_KEY },
                    VITE_CV_URL: { value: envVars.VITE_CV_URL },
                    PORTFOLIO_WEBSITE_BUCKET: { value: envVars.PORTFOLIO_WEBSITE_BUCKET },
                    PORTFOLIO_DISTRIBUTION_ID: { value: envVars.PORTFOLIO_DISTRIBUTION_ID },
                },
            },
        });

        frontendBuild.addToRolePolicy(new iam.PolicyStatement({
          actions: ['s3:ListBucket'],
          resources: [frontendBucket.bucketArn]
        }));
        frontendBuild.addToRolePolicy(new iam.PolicyStatement({
          actions: ['s3:PutObject'],
          resources: [`${frontendBucket.bucketArn}/*`]
        }));
        frontendBuild.addToRolePolicy(new iam.PolicyStatement({
          actions: ['s3:DeleteObject'],
          resources: [`${frontendBucket.bucketArn}/*`]
        }));
        frontendBuild.addToRolePolicy(new iam.PolicyStatement({
          actions: ['cloudfront:CreateInvalidation'],
          resources: [`arn:aws:cloudfront::${cdk.Aws.ACCOUNT_ID}:distribution/${portfolioDistributionId}`]
        }));

        const backendBuild = new codebuild.PipelineProject(this, 'BackendBuild', {
            buildSpec: codebuild.BuildSpec.fromObject({
                version: '0.2',
                phases: {
                  install: {
                    'runtime-versions': {
                      nodejs: 20,
                    },
                    commands: [
                      'echo "Installing dependencies..."',
                      'cd cdk',
                      'npm install',
                    ],
                  },
                  build: {
                    commands: [
                      'echo "Building..."',
                      'rm -rf dist',
                      'echo "Running build process..."',
                      'npm run build',
                      'echo "Bundling lambdas..."',
                      'npm run bundle:lambdas',
                      'echo "Build completed"',
                    ],
                  },
                  post_build: {
                    commands: [
                      'echo "Cleaning up .env..."',
                      'rm -f .env',
                    ],
                  },
                },
                artifacts: {
                  'base-directory': 'cdk',
                  files: ['**/*'],
                  'discard-paths': 'no',
                },
                environment_variables: {
                  plaintext: {
                    NODE_OPTIONS: '--enable-source-maps',
                  },
                },
            }),
            environment: {
                environmentVariables: {
                    API_KEY: { value: envVars.API_KEY },
                    CDK_DEFAULT_REGION: { value: envVars.CDK_DEFAULT_REGION },
                    CERTIFICATE_ARN: { value: envVars.CERTIFICATE_ARN },
                    CONTACT_FROM_EMAIL: { value: envVars.CONTACT_FROM_EMAIL },
                    CONTACT_QUEUE_PARAM: { value: envVars.CONTACT_QUEUE_URL },
                    CONTACT_TO_EMAIL: { value: envVars.CONTACT_TO_EMAIL },
                    CV_BUCKET_NAME: { value: envVars.CV_BUCKET_NAME },
                    DOMAIN_NAME: { value: envVars.DOMAIN_NAME },
                    TURNSTILE_SECRET_KEY: { value: envVars.TURNSTILE_SECRET_KEY },
                    OPEN_TO_WORK_TABLE_NAME: { value: envVars.OPEN_TO_WORK_TABLE_NAME },
                    PORTFOLIO_DISTRIBUTION_ID: { value: envVars.PORTFOLIO_DISTRIBUTION_ID },
                    PORTFOLIO_WEBSITE_BUCKET: { value: envVars.PORTFOLIO_WEBSITE_BUCKET },
                    GITHUB_USERNAME: { value: pipelineEnvVars.GITHUB_USERNAME },
                    GITHUB_REPO: { value: pipelineEnvVars.GITHUB_REPO },
                    GITHUB_BRANCH: { value: pipelineEnvVars.GITHUB_BRANCH }
                },
            },
        });

        const frontendDeploy = new codebuild.PipelineProject(this, 'FrontendDeploy', {
            buildSpec: codebuild.BuildSpec.fromObject({
                version: '0.2',
                phases: {
                    install: {
                        runtimeVersions: {
                            nodejs: '20',
                        },
                    },
                    build: {
                        commands: [
                            'echo "Skipping build in deploy phase"',
                        ],
                    },
                    post_build: {
                        commands: [
                            'echo "Uploading frontend build to S3..."',
                            'aws s3 sync . s3://$PORTFOLIO_WEBSITE_BUCKET --delete',
                            'if [ -n "$PORTFOLIO_DISTRIBUTION_ID" ]; then echo "Creating CloudFront invalidation..."; aws cloudfront create-invalidation --distribution-id $PORTFOLIO_DISTRIBUTION_ID --paths "/*"; else echo "No CloudFront distribution ID provided; skipping invalidation."; fi'
                        ],
                    },
                },
                artifacts: {
                    files: ['**/*'],
                    'base-directory': 'frontend/dist',
                    'discard-paths': 'no',
                },
            }),
            environment: {
                buildImage: codebuild.LinuxBuildImage.STANDARD_6_0,
                environmentVariables: {
                    VITE_API_KEY: { value: envVars.API_KEY },
                    VITE_API_BASE_URL: { value: envVars.VITE_API_BASE_URL },
                    VITE_TURNSTILE_SITE_KEY: { value: envVars.VITE_TURNSTILE_SITE_KEY },
                    VITE_CV_URL: { value: envVars.VITE_CV_URL },
                    PORTFOLIO_WEBSITE_BUCKET: { value: envVars.PORTFOLIO_WEBSITE_BUCKET },
                    PORTFOLIO_DISTRIBUTION_ID: { value: portfolioDistributionId },
                },
            },
        })

        frontendDeploy.addToRolePolicy(new iam.PolicyStatement({
            actions: ['s3:PutObject', 's3:DeleteObject', 's3:ListBucket'],
          resources: [
            `${frontendBucket.bucketArn}/*`
          ]
        }));

        frontendDeploy.addToRolePolicy(new iam.PolicyStatement({
          actions: ['s3:ListBucket'],
          resources: [frontendBucket.bucketArn]
        }));

        frontendDeploy.addToRolePolicy(new iam.PolicyStatement({
          actions: ['s3:DeleteObject'],
          resources: [`${frontendBucket.bucketArn}/*`],
        }));

        frontendDeploy.addToRolePolicy(new iam.PolicyStatement({
            actions: ['cloudfront:CreateInvalidation'],
            resources: [
                `arn:aws:cloudfront::${cdk.Aws.ACCOUNT_ID}:distribution/${portfolioDistributionId}`
            ]
        }));

        const backendDeploy = new codebuild.PipelineProject(this, 'BackendDeploy', {
            buildSpec: codebuild.BuildSpec.fromObject({
                version: '0.2',
                environment_variables: {
                    plaintext: {
                        NODE_OPTIONS: '--enable-source-maps',
                    },
                },
                phases: {
                    install: {
                        'runtime-versions': {
                            nodejs: 20,
                        },
                    },
                    build: {
                        commands: [
                            'echo "Skipping build in deploy phase"'
                        ]
                    },
                    post_build: {
                        commands: [
                            'echo "Deploying backend stack..."',
                            'npx cdk deploy portfolio-backend-stack --require-approval never --app "npx ts-node --prefer-ts-exts bin/cdk.ts"',
                            'echo "Cleaning up .env..."',
                            'rm -f .env',
                        ],
                    },
                },
                artifacts: {
                    'base-directory': 'cdk',
                    files: ['**/*'],
                    'discard-paths': 'no',
                },
            }),
            environment: {
                buildImage: codebuild.LinuxBuildImage.STANDARD_6_0,
                environmentVariables: {
                    API_KEY: { value: envVars.API_KEY },
                    CDK_DEFAULT_REGION: { value: envVars.CDK_DEFAULT_REGION },
                    CERTIFICATE_ARN: { value: envVars.CERTIFICATE_ARN },
                    CONTACT_FROM_EMAIL: { value: envVars.CONTACT_FROM_EMAIL },
                    CONTACT_QUEUE_PARAM: { value: envVars.CONTACT_QUEUE_URL },
                    CONTACT_TO_EMAIL: { value: envVars.CONTACT_TO_EMAIL },
                    CV_BUCKET_NAME: { value: envVars.CV_BUCKET_NAME },
                    DOMAIN_NAME: { value: envVars.DOMAIN_NAME },
                    TURNSTILE_SECRET_KEY: { value: envVars.TURNSTILE_SECRET_KEY },
                    OPEN_TO_WORK_TABLE_NAME: { value: envVars.OPEN_TO_WORK_TABLE_NAME },
                    PORTFOLIO_DISTRIBUTION_ID: { value: envVars.PORTFOLIO_DISTRIBUTION_ID },
                    PORTFOLIO_WEBSITE_BUCKET: { value: envVars.PORTFOLIO_WEBSITE_BUCKET },
                    GITHUB_USERNAME: { value: pipelineEnvVars.GITHUB_USERNAME },
                    GITHUB_REPO: { value: pipelineEnvVars.GITHUB_REPO },
                    GITHUB_BRANCH: { value: pipelineEnvVars.GITHUB_BRANCH },
                    GITHUB_TOKEN_SECRET_NAME: { value: pipelineEnvVars.GITHUB_TOKEN_SECRET_NAME },
                },
            },
        });

        const artifactBucket = new s3.Bucket(this, 'ArtifactBucket', {
          encryption: s3.BucketEncryption.S3_MANAGED,
        });

        new codepipeline.Pipeline(this, 'PortfolioPipeline', {
            pipelineName: 'PortfolioFullPipeline',
            artifactBucket,
            stages: [
                {
                    stageName: 'Source',
                    actions: [
                        new codepipeline_actions.GitHubSourceAction({
                            actionName: 'GitHub_Source',
                            owner: pipelineEnvVars.GITHUB_USERNAME,
                            repo: pipelineEnvVars.GITHUB_REPO,
                            branch: pipelineEnvVars.GITHUB_BRANCH,
                            oauthToken,
                            output: sourceOutput,
                            trigger: codepipeline_actions.GitHubTrigger.WEBHOOK,
                        }),
                    ],
                },
                {
                    stageName: 'Build',
                    actions: [
                        new codepipeline_actions.CodeBuildAction({
                            actionName: 'Build_Backend',
                            project: backendBuild,
                            input: sourceOutput,
                            outputs: [new codepipeline.Artifact('BackendBuildOutput')],
                        }),
                        new codepipeline_actions.CodeBuildAction({
                            actionName: 'Build_Frontend',
                            project: frontendBuild,
                            input: sourceOutput,
                            outputs: [new codepipeline.Artifact('FrontendBuildOutput')],
                        }),
                    ],
                },
                {
                    stageName: 'Deploy',
                    actions: [
                        new codepipeline_actions.CodeBuildAction({
                            actionName: 'Deploy_Backend',
                            project: backendDeploy,
                            input: new codepipeline.Artifact('BackendBuildOutput'),
                        }),
                        new codepipeline_actions.CodeBuildAction({
                            actionName: 'Deploy_Frontend',
                            project: frontendDeploy,
                            input: new codepipeline.Artifact('FrontendBuildOutput'),
                        }),
                    ],
                },
            ],
        });
    }
}