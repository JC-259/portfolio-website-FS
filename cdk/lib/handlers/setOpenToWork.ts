import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { PutCommand, DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { APIGatewayProxyHandler } from 'aws-lambda';
import { logger } from '../utils/logger';
import getEnvs from '../utils/getEnvs';

const API_KEY_HEADER = 'x-api-key';
const { STATUS_API_KEY, OPEN_TO_WORK_TABLE_NAME } = getEnvs();

const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
  'Access-Control-Allow-Methods': 'OPTIONS,POST',
};

if (!STATUS_API_KEY) {
  throw new Error('Missing API_KEY environment variable');
}

const dynamo = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamo);

export const handler: APIGatewayProxyHandler = async (event: any) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: CORS_HEADERS,
      body: '',
    };
  }

  // Enforce POST only
  if (event.httpMethod && event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: 'Method Not Allowed' }),
    };
  }

  try {
    const hdrs = event.headers || {};
    const providedKey = hdrs[API_KEY_HEADER] ?? hdrs[API_KEY_HEADER.toLowerCase()] ?? hdrs[API_KEY_HEADER.toUpperCase()];
    logger.info('Received request to update openToWork', { requestId: event.requestContext.requestId });
    if (!providedKey || providedKey !== STATUS_API_KEY) {
      return {
        statusCode: 401,
        headers: CORS_HEADERS,
        body: JSON.stringify({ message: 'Unauthorized' }),
      };
    }

    if (!event.body) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({ message: 'Missing request body' }),
      };
    }

    const { openToWork } = JSON.parse(event.body);
    if (typeof openToWork !== 'boolean') {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({ message: 'Invalid openToWork value' }),
      };
    }

    // Save openToWork to DynamoDB
    await docClient.send(
      new PutCommand({
        TableName: OPEN_TO_WORK_TABLE_NAME,
        Item: {
          id: 'openToWork',
          value: openToWork,
        },
      })
    );

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: 'Status updated successfully' }),
    };
  } catch (error) {
    logger.error('Error updating openToWork', { error, requestId: event?.requestContext?.requestId });
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: 'Internal server error' }),
    };
  }
};
