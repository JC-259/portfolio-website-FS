import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as certificatemanager from 'aws-cdk-lib/aws-certificatemanager';

export class CertificateStack extends Stack {
    constructor(
        scope: Construct,
        id: string,
        props: StackProps & { domainName: string }
    ) {
        super(scope, id, {
            ...props,
            env: {
                account: props.env?.account,
                region: "us-east-1",
            }
        });

        new certificatemanager.Certificate(this, 'GeneratedCert', {
            domainName: props.domainName,
            subjectAlternativeNames: [`www.${props.domainName}`, `api.${props.domainName}`],
            validation: certificatemanager.CertificateValidation.fromDns(),
        });
    }
}