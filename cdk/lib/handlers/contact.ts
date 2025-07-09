import { logger } from '../utils/logger';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { sendToQueue } from '../utils/sendToQueue';

export const handler = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    const allowedOrigins = ['https://james-c.dev', 'https://www.james-c.dev'];
    const origin = event.headers?.origin || '';
    const isAllowed = allowedOrigins.includes(origin);
    const CORS_HEADERS = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': isAllowed ? origin : 'https://james-c.dev',
        'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
        'Access-Control-Allow-Methods': 'OPTIONS,POST',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Max-Age': '300',
        'Vary': 'Origin',
    };

    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: CORS_HEADERS,
            body: JSON.stringify({ message: 'CORS preflight OK' }),
        };
    }

    const requestId = event.requestContext?.requestId;

    logger.info('Received contact form submission', { requestId });

    if (!event.body) {
        return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ message: 'Missing request body' }) };
    }

    const { name, email, message } = JSON.parse(event.body);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (
        typeof name !== 'string' || name.trim().length < 2 ||
        typeof email !== 'string' || !emailRegex.test(email) ||
        typeof message !== 'string' || message.trim().length < 10
    ) {
        return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ message: 'Invalid input format' }) };
    }

    if (!name || !email || !message ) {
        return { statusCode: 400, headers: CORS_HEADERS, body: JSON.stringify({ message: 'Missing required fields' }) };
    }

    if (!process.env.CONTACT_QUEUE_URL) {
        logger.error('CONTACT_QUEUE_URL is not defined in environment variables');
        return {
            statusCode: 500,
            headers: CORS_HEADERS,
            body: JSON.stringify({ success: false, message: 'Internal configuration error.' }),
        };
    }

    try {
        logger.info('Attempting to send to queue', { requestId });
        await sendToQueue({ name, email, message });
        return {
            statusCode: 200,
            headers: CORS_HEADERS,
            body: JSON.stringify({ success: true, message: 'Message sent!' }),
        };
    } catch (error) {
        logger.error('Error sending to queue', { error, requestId });
        return {
            statusCode: 500,
            headers: CORS_HEADERS,
            body: JSON.stringify({ success: false, message: 'Failed to send message.' }),
        };
    }
};