import { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { verifyTurnstile } from '../utils/verifyTurnstile';

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
    const CORS_HEADERS = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
        'Access-Control-Allow-Methods': 'OPTIONS,GET',
    };

    if (event.requestContext?.http?.method === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: CORS_HEADERS,
            body: '',
        };
    }

    let token: string | undefined;
    try {
        const body = JSON.parse(event.body || '{}');
        token = body.token;
    } catch {
        return {
            statusCode: 400,
            headers: CORS_HEADERS,
            body: JSON.stringify({ error: 'Invalid JSON' }),
        };
    }

    if (!token) {
        return {
            statusCode: 400,
            headers: CORS_HEADERS,
            body: JSON.stringify({ error: 'Missing token' }),
        };
    }

    const isValid = await verifyTurnstile(token);

    return {
        statusCode: isValid ? 200 : 403,
        headers: CORS_HEADERS,
        body: JSON.stringify({ success: isValid }),
    };
};