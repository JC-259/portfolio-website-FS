# Backend (CDK) – Portfolio Infrastructure

This folder contains all AWS infrastructure for the portfolio site.

## 📁 Stacks

- `portfolio-certificate-stack` - Generates domain certificates
- `portfolio-domain-stack`      - Deploys Cloudfront and resources for hosting the website
- `portfolio-backend-stack`     - Deploys the rest of the resources for the backend
- `portfolio-pipeline-stack`    - Deploys the codepipeline stack, and builds the frontend and backend

## 🛠 Services Used

- API Gateway
- Lambda (Node.js)
- DynamoDB
- SQS
- SES
- CodePipeline
- CodeBuild

- Cloudflare

## 🧾 Buildspecs

Buildspecs are inline within the codepipeline stack, not a separate file.

## 🧰 Setup

1. Bootstrap CDK (required for each environment/region):

```bash
# Bootstrap for ACM certificates (must be in us-east-1 for CloudFront)
cd cdk
npx ts-node --prefer-ts-exts bin/cdk.ts
cdk bootstrap --app "npx ts-node --prefer-ts-exts bin/cdk.ts" --profile <PROFILENAMEHERE> aws://<AWS_ACCOUNT>/us-east-1

# Bootstrap for your backend's primary region
cdk bootstrap --app "npx ts-node --prefer-ts-exts bin/cdk.ts" --profile <PROFILENAMEHERE> aws://<AWS_ACCOUNT>/<AWS_REGION>
```

2. Deploy stacks:
```bash
cd ../ npm run deploy:certificates
cd ../ npm run deploy:domain
cd ../ npm run deploy:backend
cd ../ npm run deploy:pipeline
```

3. Monitor logs via CloudWatch once deployed.

## 🌐 Domain Setup

Ensure your domain is configured in Cloudflare with the appropriate DNS records.  
ACM certificates **must** be provisioned in the `us-east-1` region, as this is required for use with CloudFront.  
Check that your Cloudflare DNS records point to the correct CloudFront distribution or other resources as needed.

## 🔒 Notes

- All secrets are managed via environment variables (not Secrets Manager).
- CodePipeline assumes GitHub access via personal access token.

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `npx cdk deploy`  deploy this stack to your default AWS account/region
* `npx cdk diff`    compare deployed stack with current state
* `npx cdk synth`   emits the synthesized CloudFormation template
