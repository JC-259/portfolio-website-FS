import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import getEnvs from './getEnvs';
import { logger } from './logger';

const { CONTACT_QUEUE_URL, CDK_DEFAULT_REGION } = getEnvs();

if (!CDK_DEFAULT_REGION) {
    throw new Error('CDK_DEFAULT_REGION is not defined in environment variables.');
}
const sqs = new SQSClient({ region: CDK_DEFAULT_REGION });

if (!CONTACT_QUEUE_URL) {
    throw new Error('CONTACT_QUEUE_URL is not defined in environment variables.');
}

export const sendToQueue = async (payload: any) => {

    logger.info('Sending message to SQS queue', { payload });

    const command = new SendMessageCommand({
        QueueUrl: CONTACT_QUEUE_URL,
        MessageBody: JSON.stringify(payload),
    });

    try {
        await sqs.send(command);
        const message = 'Message successfully sent to SQS'
        logger.info(message);
        return message
    } catch (error) {
        logger.error('Failed to send message to SQS', { error });
        throw error;
    }
};