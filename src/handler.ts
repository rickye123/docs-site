import { APIGatewayEvent, Context, Callback } from 'aws-lambda';
import AWS from 'aws-sdk';

const docClient = new AWS.DynamoDB.DocumentClient();

export const createPage = async (event: APIGatewayEvent, context: Context, callback: Callback) => {
    const { title, slug, content } = JSON.parse(event.body || '{}');

    const params = {
        TableName: 'docs-pages',
        Item: {
            slug: slug,
            title: title,
            content: content,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
    };

    try {
        await docClient.put(params).promise();
        callback(null, {
            statusCode: 201,
            body: JSON.stringify({ message: 'Page created successfully' }),
        });
    } catch (error) {
        callback(null, {
            statusCode: 500,
            body: JSON.stringify({ message: 'Error saving page', error }),
        });
    }
};

export const getPage = async (event: APIGatewayEvent, context: Context, callback: Callback) => {
    const slug = event.pathParameters?.slug;
    const params = {
        TableName: 'docs-pages',
        Key: {
            slug: slug,
        },
    };

    try {
        const result = await docClient.get(params).promise();
        if (!result.Item) {
            callback(null, {
                statusCode: 404,
                body: JSON.stringify({ message: 'Page not found' }),
            });
        } else {
            callback(null, {
                statusCode: 200,
                body: JSON.stringify(result.Item),
            });
        }
    } catch (error) {
        callback(null, {
            statusCode: 500,
            body: JSON.stringify({ message: 'Error fetching page', error }),
        });
    }
};
