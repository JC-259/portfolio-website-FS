import { Duration, RemovalPolicy } from 'aws-cdk-lib';
import { Stack, StackProps, CfnOutput, Tags } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as certificatemanager from 'aws-cdk-lib/aws-certificatemanager';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import { S3BucketOrigin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { OriginAccessIdentity } from 'aws-cdk-lib/aws-cloudfront';
import * as s3 from 'aws-cdk-lib/aws-s3';
import getEnvs from "./utils/getEnvs";
import { PortfolioBackendStack } from './portfolio-backend-stack';
import { OriginRequestPolicy } from 'aws-cdk-lib/aws-cloudfront';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';

export interface DomainStackProps extends StackProps {
  domainName: string;
  backendStack: PortfolioBackendStack;
}

export class DomainStack extends Stack {
  public readonly certificate: certificatemanager.ICertificate;

  constructor(scope: Construct, id: string, props: DomainStackProps) {
    super(scope, id, {
      ...props,
      env: {
        ...props.env,
        region: 'eu-west-2',
      },
    });

    const { domainName } = props;
    const apiOrigin = props.backendStack.apiOrigin;

    this.certificate = certificatemanager.Certificate.fromCertificateArn(
        this,
        'ImportedCertificate',
        process.env.CERTIFICATE_ARN!
    );

    const cvBucket = new s3.Bucket(this, 'CVBucket', {
      bucketName: getEnvs().CV_BUCKET_NAME,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    });
    cvBucket.addCorsRule({
      allowedMethods: [s3.HttpMethods.GET],
      allowedOrigins: ['https://james-c.dev', 'https://www.james-c.dev'],
      allowedHeaders: ['*'],
    });

    // Create an empty placeholder to ensure the get-cv/ prefix exists
    new s3deploy.BucketDeployment(this, 'CreateGetCvFolder', {
      sources: [s3deploy.Source.data('get-cv/.keep', '')],
      destinationBucket: cvBucket,
    });

    // Create an Origin Access Identity for the CV bucket
    const cvOAI = new OriginAccessIdentity(this, 'CvBucketOAI', {
      comment: `OAI for CV bucket ${cvBucket.bucketName}`,
    });

    // S3 Bucket for frontend hosting
    const siteBucket = new s3.Bucket(this, 'SiteBucket', {
      bucketName: getEnvs().PORTFOLIO_WEBSITE_BUCKET,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: RemovalPolicy.RETAIN,
    });

    // Create OAI for the site bucket
    const siteOAI = new OriginAccessIdentity(this, 'SiteBucketOAI', {
      comment: `OAI for site bucket ${siteBucket.bucketName}`,
    });

    new CfnOutput(this, 'FrontendBucketName', {
      value: siteBucket.bucketName,
      description: 'S3 bucket used for frontend deployment',
    });

    const logBucket = new s3.Bucket(this, 'LogBucket', {
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      objectOwnership: s3.ObjectOwnership.OBJECT_WRITER,
    });

    const additionalBehaviours = Object.assign(
        Object.fromEntries(
            ['contact', 'verify-turnstile', 'get-open-to-work', 'set-open-to-work', 'projects'].map(path => [
              path,
              {
                origin: apiOrigin,
                allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
                viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
                originRequestPolicy: OriginRequestPolicy.CORS_CUSTOM_ORIGIN,
                responseHeadersPolicy: cloudfront.ResponseHeadersPolicy.CORS_ALLOW_ALL_ORIGINS_WITH_PREFLIGHT,
              }
            ])
        ),
        {
          'get-cv/*': {
            origin: S3BucketOrigin.withOriginAccessIdentity(cvBucket, { originAccessIdentity: cvOAI }),
            viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
            allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD,
            cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
            originRequestPolicy: cloudfront.OriginRequestPolicy.CORS_S3_ORIGIN,
            responseHeadersPolicy: cloudfront.ResponseHeadersPolicy.CORS_ALLOW_ALL_ORIGINS,
          }
        }
    );

    const distribution = new cloudfront.Distribution(this, 'SiteDistribution', {
      defaultRootObject: 'index.html',
      defaultBehavior: {
        origin: S3BucketOrigin.withOriginAccessIdentity(siteBucket, { originAccessIdentity: siteOAI }),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD,
        cachePolicy: new cloudfront.CachePolicy(this, 'FrontendCachePolicy', {
          cachePolicyName: 'FrontendOptimisedPolicy',
          defaultTtl: Duration.days(7),
          minTtl: Duration.hours(1),
          maxTtl: Duration.days(30),
          headerBehavior: cloudfront.CacheHeaderBehavior.none(),
          cookieBehavior: cloudfront.CacheCookieBehavior.none(),
          queryStringBehavior: cloudfront.CacheQueryStringBehavior.none(),
          enableAcceptEncodingGzip: true,
          enableAcceptEncodingBrotli: true,
        }),
      },
      additionalBehaviors: additionalBehaviours,
      domainNames: [domainName, `www.${domainName}`],
      certificate: this.certificate,
      logBucket: logBucket,
    });

    cvBucket.grantRead(cvOAI);

    // Grant OAI read access to the site bucket
    siteBucket.grantRead(siteOAI);

    // Outputs
    new CfnOutput(this, 'CertificateArn', { value: this.certificate.certificateArn });
    new CfnOutput(this, 'CloudFrontURL', { value: distribution.distributionDomainName });
    new CfnOutput(this, 'CloudFrontDistributionDomain', {
      value: distribution.distributionDomainName,
      description: 'Use this domain to point your Cloudflare DNS (CNAME)',
    });

    // Tags
    Tags.of(this).add('Project', 'Portfolio');
    Tags.of(this).add('Stack', 'Domain');
  }
}