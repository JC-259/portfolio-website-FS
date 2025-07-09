import { Stack, StackProps, RemovalPolicy, Duration, Tags } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as path from 'path';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as eventsources from 'aws-cdk-lib/aws-lambda-event-sources';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import getEnvs from './utils/getEnvs';
import getPipelineEnvs from "./utils/getPipelineEnvs";
import * as cloudfront_origins from 'aws-cdk-lib/aws-cloudfront-origins';
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Certificate } from "aws-cdk-lib/aws-certificatemanager";

const {
  CERTIFICATE_ARN,
  CONTACT_FROM_EMAIL,
  CONTACT_TO_EMAIL,
  DOMAIN_NAME,
  TURNSTILE_SECRET_KEY,
  CONTACT_QUEUE_URL,
  API_KEY,
  CDK_DEFAULT_REGION,
  OPEN_TO_WORK_TABLE_NAME,
} = getEnvs();

const returnPipelineEnvs = getPipelineEnvs()

export class PortfolioBackendStack extends Stack {
  public readonly apiOrigin: cloudfront_origins.HttpOrigin;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, {
      ...props,
      description: 'Backend stack for portfolio site including API, Lambdas, and infrastructure.',
    });

    Tags.of(this).add('Project', 'PortfolioSite');
    Tags.of(this).add('Environment', 'Production');

    // Create SQS queue
    const contactQueue = new sqs.Queue(this, 'ContactQueue', {
      retentionPeriod: Duration.days(4),
      visibilityTimeout: Duration.seconds(30),
    });

    // Lambda for contact form handler
    const contactLambda = new NodejsFunction(this, 'ContactHandler', {
      entry: path.join(__dirname, '../lib/handlers/contact.ts'),
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_20_X,
      bundling: {
        externalModules: ['aws-sdk'],
        nodeModules: ['zod', '@aws-sdk/client-sqs'],
        minify: true,
        sourceMap: true,
        target: 'node20',
      },
      environment: {
        CONTACT_QUEUE_URL: CONTACT_QUEUE_URL,
        TURNSTILE_SECRET_KEY: TURNSTILE_SECRET_KEY,
        CDK_DEFAULT_REGION: CDK_DEFAULT_REGION,
      },
      description: 'Handles contact form submissions.',
      timeout: Duration.seconds(5),
    });
    contactQueue.grantSendMessages(contactLambda);

    // Lambda to verify captcha
    const verifyTurnstileLambda = new NodejsFunction(this, 'VerifyTurnstile', {
      entry: path.join(__dirname, '../lib/handlers/verifyTurnstileLambda.ts'),
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_20_X,
      bundling: {
        externalModules: ['aws-sdk'],
        nodeModules: ['axios', 'zod', 'form-data'],
        minify: true,
        sourceMap: true,
        target: 'node20',
      },
      environment: {
        TURNSTILE_SECRET_KEY: TURNSTILE_SECRET_KEY,
      },
      description: 'Verifies captcha tokens.',
      timeout: Duration.seconds(5),
    });

    const openToWorkTable = new dynamodb.Table(this, 'OpenToWorkTable', {
      tableName: OPEN_TO_WORK_TABLE_NAME,
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.RETAIN,
    });

    // Lambda to get open to work status
    const getOpenToWorkLambda = new NodejsFunction(this, 'GetOpenToWork', {
      entry: path.join(__dirname, '../lib/handlers/getOpenToWork.ts'),
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_20_X,
      bundling: {
        externalModules: ['aws-sdk'],
        nodeModules: ['zod'],
        minify: true,
        sourceMap: true,
        target: 'node20',
      },
      environment: {
        OPEN_TO_WORK_TABLE_NAME: OPEN_TO_WORK_TABLE_NAME,
        API_KEY: API_KEY
      },
      description: 'Retrieves open to work status.',
      timeout: Duration.seconds(5),
    });

    // Lambda to set open to work status
    const setOpenToWorkLambda = new NodejsFunction(this, 'SetOpenToWork', {
      entry: path.join(__dirname, '../lib/handlers/setOpenToWork.ts'),
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_20_X,
      bundling: {
        externalModules: ['aws-sdk'],
        nodeModules: ['zod'],
        minify: true,
        sourceMap: true,
        target: 'node20',
      },
      environment: {
        OPEN_TO_WORK_TABLE_NAME: openToWorkTable.tableName,
        API_KEY: API_KEY,
      },
      description: 'Sets open to work status.',
      timeout: Duration.seconds(5),
    });

    const dynamoPolicy = new iam.PolicyStatement({
      actions: ['dynamodb:GetItem', 'dynamodb:PutItem'],
      resources: [openToWorkTable.tableArn],
    });

    getOpenToWorkLambda.addToRolePolicy(dynamoPolicy);
    setOpenToWorkLambda.addToRolePolicy(dynamoPolicy);

    // Lambda to send email via SES from SQS
    const sendEmailsLambda = new NodejsFunction(this, 'SendEmails', {
      entry: path.join(__dirname, '../lib/handlers/sendEmails.ts'),
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_20_X,
      bundling: {
        externalModules: ['aws-sdk'],
        nodeModules: ['zod', `@aws-sdk/client-ses`],
        minify: true,
        sourceMap: true,
        target: 'node20',
      },
      environment: {
        CONTACT_FROM_EMAIL: CONTACT_FROM_EMAIL,
        CONTACT_TO_EMAIL: CONTACT_TO_EMAIL,
      },
      description: 'Sends emails from SQS messages.',
      timeout: Duration.seconds(5),
    });
    sendEmailsLambda.addEventSource(new eventsources.SqsEventSource(contactQueue));
    sendEmailsLambda.addToRolePolicy(new iam.PolicyStatement({
      actions: ['ses:SendEmail', 'ses:SendRawEmail'],
      resources: ['*'],
    }));

    // Lambda to fetch GitHub projects tagged "portfolio"
    const getGithubProjectsLambda = new NodejsFunction(this, 'GetGithubProjects', {
      entry: path.join(__dirname, '../lib/handlers/getGithubProjects.ts'),
      handler: 'handler',
      runtime: lambda.Runtime.NODEJS_20_X,
      bundling: {
        externalModules: ['aws-sdk'],
        minify: true,
        sourceMap: true,
        target: 'node20',
      },
      environment: {
        GITHUB_USERNAME: returnPipelineEnvs.GITHUB_USERNAME,
        GITHUB_TOKEN: returnPipelineEnvs.GITHUB_TOKEN_SECRET_NAME,
      },
      description: 'Fetches portfolio projects from GitHub',
      timeout: Duration.seconds(10),
    });

    // API Gateway
    const api = new apigateway.RestApi(this, 'PortfolioApi', {
      restApiName: 'Portfolio Service',
      cloudWatchRole: true,
      deployOptions: {
        metricsEnabled: true,
        loggingLevel: apigateway.MethodLoggingLevel.INFO,
        dataTraceEnabled: true,
      },
      defaultCorsPreflightOptions: {
        allowOrigins: ['https://james-c.dev', 'https://www.james-c.dev'],
        allowMethods: ['GET', 'POST', 'OPTIONS'],
        allowHeaders: [
          'Content-Type',
          'X-Amz-Date',
          'Authorization',
          'X-API-Key',
          'X-Amz-Security-Token',
          'x-portfolio-key'
        ],
        allowCredentials: true,
        statusCode: 200,
      },
    });
    const apiDomain = `${api.restApiId}.execute-api.${this.region}.amazonaws.com`;
    this.apiOrigin = new cloudfront_origins.HttpOrigin(apiDomain, {
      originPath: `/${api.deploymentStage.stageName}`,
    });

    const apiKey = api.addApiKey('PortfolioApiKey',
        { value: API_KEY }
    );

    const usagePlan = api.addUsagePlan('PortfolioUsagePlan', {
      name: 'PortfolioUsagePlan',
      throttle: {
        rateLimit: 10,
        burstLimit: 2,
      },
    });

    usagePlan.addApiKey(apiKey);
    usagePlan.addApiStage({
      stage: api.deploymentStage,
    });

    api.root.addResource('contact').addMethod('POST', new apigateway.LambdaIntegration(contactLambda), {
      apiKeyRequired: true,
    });
    api.root.addResource('verify-turnstile').addMethod('POST', new apigateway.LambdaIntegration(verifyTurnstileLambda), {
      apiKeyRequired: true,
    });
    api.root.addResource('get-open-to-work').addMethod('GET', new apigateway.LambdaIntegration(getOpenToWorkLambda), {
      apiKeyRequired: true,
    });
    api.root.addResource('set-open-to-work').addMethod('POST', new apigateway.LambdaIntegration(setOpenToWorkLambda), {
      apiKeyRequired: true,
    });
    api.root.addResource('projects').addMethod( 'GET', new apigateway.LambdaIntegration(getGithubProjectsLambda), {
      apiKeyRequired: false
    });

    const domainName = new apigateway.DomainName(this, 'PortfolioDomain', {
      domainName: `api.${DOMAIN_NAME}`,
      certificate: Certificate.fromCertificateArn(this, 'PortfolioCert', CERTIFICATE_ARN),
      endpointType: apigateway.EndpointType.EDGE,
      securityPolicy: apigateway.SecurityPolicy.TLS_1_2
    });

    new apigateway.BasePathMapping(this, 'BasePathMapping', {
      domainName,
      restApi: api,
      stage: api.deploymentStage
    });
  }
}