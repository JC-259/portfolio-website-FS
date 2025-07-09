import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { PutCommand, DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { APIGatewayProxyHandler } from 'aws-lambda';
import { logger } from '../utils/logger';
import getEnvs from '../utils/getEnvs';

const API_KEY_HEADER = 'x-api-key';
const { API_KEY, OPEN_TO_WORK_TABLE_NAME } = getEnvs();

const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
  'Access-Control-Allow-Methods': 'OPTIONS,GET',
};

if (!API_KEY) {
  throw new Error('Missing API_KEY environment variable');
}

const dynamo = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamo);

export const handler: APIGatewayProxyHandler = async (event: any) => {
  try {
    const providedKey = event.headers[API_KEY_HEADER];
    logger.info('Received request to update openToWork', { requestId: event.requestContext.requestId });
    if (!providedKey || providedKey !== API_KEY) {
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
    logger.error('Error updating openToWork', { error, requestId: event.requestContext.requestId });
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: 'Internal server error' }),
    };
  }
};
