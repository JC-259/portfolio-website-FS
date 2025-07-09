import { logger } from '../utils/logger';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { SQSEvent, SQSHandler } from 'aws-lambda';
import { ContactFormPayload } from '../types/contactForm';
import getEnvs from '../utils/getEnvs';

const { CONTACT_FROM_EMAIL, CONTACT_TO_EMAIL, CDK_DEFAULT_REGION } = getEnvs();

if (!CONTACT_FROM_EMAIL || !CONTACT_TO_EMAIL) {
  logger.error('Missing CONTACT_FROM_EMAIL or CONTACT_TO_EMAIL in environment variables');
  throw new Error('Missing required email configuration.');
}

if (!CDK_DEFAULT_REGION) {
  logger.error('Missing CDK_DEFAULT_REGION in environment variables');
  throw new Error('Missing AWS region configuration.');
}

const sesClient = new SESClient({ region: CDK_DEFAULT_REGION });

export const handler: SQSHandler = async (event: SQSEvent) => {
  for (const record of event.Records) {
    const body = JSON.parse(record.body) as ContactFormPayload;

    const params = {
      Destination: {
        ToAddresses: [CONTACT_TO_EMAIL],
      },
      Message: {
        Body: {
          Text: {
            Data: `Name: ${body.name}\nEmail: ${body.email}\nMessage: ${body.message}`,
          },
        },
        Subject: {
          Data: `New Portfolio Website Contact Form Submission`,
        },
      },
      Source: CONTACT_FROM_EMAIL,
    };

    try {
      await sesClient.send(new SendEmailCommand(params));
      logger.info(`Email sent`, { email: body.email, requestId: record.messageId });
    } catch (error) {
      logger.error(`Failed to send email`, { email: body.email, requestId: record.messageId, error });
    }
  }
};
