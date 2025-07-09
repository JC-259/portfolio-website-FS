#!/usr/bin/env node
import * as dotenv from 'dotenv';
import * as path from "path";
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
import { App } from 'aws-cdk-lib';
import { PortfolioBackendStack } from '../lib/portfolio-backend-stack';
import { CertificateStack } from '../lib/certificate-stack';
import { DomainStack } from '../lib/domain-stack';
import { PipelineStack } from '../lib/codepipeline-stack';

const tla = 'portfolio';

const app = new App({
    context: {
        tla,
    },
});

const backendStack = new PortfolioBackendStack(app, `${tla}-backend-stack`, {
    env: {
        account: process.env.CDK_DEFAULT_ACCOUNT,
        region: process.env.CDK_DEFAULT_REGION,
    },
});

new CertificateStack(app, `${tla}-certificate-stack`, {
    env: {
        account: process.env.CDK_DEFAULT_ACCOUNT,
        region: process.env.CDK_DEFAULT_REGION,
    },
    domainName: process.env.DOMAIN_NAME!,
});

new DomainStack(app, `${tla}-domain-stack`, {
    env: {
        account: process.env.CDK_DEFAULT_ACCOUNT,
        region: process.env.CDK_DEFAULT_REGION,
    },
    domainName: process.env.DOMAIN_NAME!,
    backendStack
});

new PipelineStack(app, `${tla}-pipeline-stack`, {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  }
});
