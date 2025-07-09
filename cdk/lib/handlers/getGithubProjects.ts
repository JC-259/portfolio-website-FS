import type { APIGatewayProxyHandler } from 'aws-lambda';

export const handler: APIGatewayProxyHandler = async () => {
  const username = process.env.GITHUB_USERNAME;
  const token = process.env.GITHUB_TOKEN;

  const CORS_HEADERS = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
    'Access-Control-Allow-Methods': 'OPTIONS,GET',
  };

  if (!username || !token) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Missing GITHUB_USERNAME or GITHUB_TOKEN' })
    };
  }

  try {
    const searchUrl = `https://api.github.com/search/repositories?q=user:${username}+topic:portfolio&per_page=100`;
    const response = await fetch(searchUrl, {
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github.mercy-preview+json'
      }
    });

    if (!response.ok) {
      throw new Error(`GitHub Search API error: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as {
      items: Array<{
        name: string;
        description: string | null;
        html_url: string;
        topics?: string[];
      }>;
    };
    const projects = data.items.map(({ name, description, html_url: url, topics: tech = [] }) => ({
      name,
      description,
      url,
      tech: tech.filter(t => t !== 'portfolio')
    }));

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify(projects)
    };
  } catch (error: any) {
    console.error(error);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: error.message || 'Internal server error' })
    };
  }
};