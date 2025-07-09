import { logger } from '../utils/logger';
import { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { GetCommand, DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import getEnvs from '../utils/getEnvs';

const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
  'Access-Control-Allow-Methods': 'OPTIONS,GET',
};
const { API_KEY, OPEN_TO_WORK_TABLE_NAME } = getEnvs();

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  const method = event.requestContext?.http?.method;
  if (method === 'OPTIONS') {
    return { statusCode: 204, headers: CORS_HEADERS };
  }

  const receivedApiKey = event.headers?.['x-api-key'];
  logger.info('Received API key header', { receivedApiKey });

  if (receivedApiKey !== API_KEY) {
    logger.warn('Invalid API key received', { receivedApiKey, API_KEY });
    return {
      statusCode: 403,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Forbidden' }),
    };
  }

  const dynamo = new DynamoDBClient({});
  const docClient = DynamoDBDocumentClient.from(dynamo);

  try {
    const { Item } = await docClient.send(new GetCommand({
      TableName: OPEN_TO_WORK_TABLE_NAME,
      Key: { id: 'openToWork' },
    }));
    const openToWork = Item?.value ?? false;
    logger.info('Retrieved openToWork status', { openToWork, requestId: event.requestContext.requestId });

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({ openToWork }),
    };
  } catch (error) {
    logger.error('Error retrieving openToWork status', { error, requestId: event.requestContext.requestId });

    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ error: 'Could not retrieve status' }),
    };
  }
};