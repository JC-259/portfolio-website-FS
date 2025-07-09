import { Template } from 'aws-cdk-lib/assertions';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { App } from "aws-cdk-lib";
import { PortfolioBackendStack } from "../lib/portfolio-backend-stack";

jest.spyOn(lambda.Code, 'fromAsset').mockImplementation(
  (): lambda.AssetCode =>
    lambda.Code.fromInline('// stub code') as unknown as lambda.AssetCode
);

jest.mock('../lib/utils/getEnvs', () => ({
    __esModule: true,
    default: () => new Proxy({}, { get: () => 'newstring' }),
}));

jest.mock('../lib/utils/getPipelineEnvs', () => ({
    __esModule: true,
    default: () => new Proxy({}, { get: () => 'newstring' }),
}));

// test('should match the snapshot for the backend stack', () => {
//     const app = new App();
//     const stack = new PipelineStack(app, 'PortfolioPipelineStack', {});
//     const template = Template.fromStack(stack);
//
//     expect(template.toJSON()).toMatchSnapshot();
// });

test('should create 1 S3 bucket', () => {
    const app = new App();
    const stack = new PortfolioBackendStack(app, 'TestStack');

    const template = Template.fromStack(stack);

    template.resourceCountIs('AWS::S3::Bucket', 1);
});