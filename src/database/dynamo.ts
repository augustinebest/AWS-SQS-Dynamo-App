import "dotenv/config";
import { DynamoDBClient, PutItemCommand, GetItemCommand } from '@aws-sdk/client-dynamodb';

// Create a DynamoDB client
export const dynamoClient = new DynamoDBClient({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});

// Function to save an order to the DynamoDB table
export const saveOrder = async (order: any) => {
    const command = new PutItemCommand({
        TableName: process.env.DYNAMODB_TABLE_NAME,
        Item: {
            orderId: { S: order.orderId },
            customer: { S: order.customer },
            totalAmount: { N: order.totalAmount.toString() },
            orderState: { S: order.orderState },
            createdAt: { S: order.createdAt },
        },
    });

    try {
        await dynamoClient.send(command);
        console.log('Order saved to DynamoDB:', order);
    } catch (error) {
        console.error('Error saving order to DynamoDB:', error);
        throw new Error('Failed to save order');
    }
};

// Function to get an order from the DynamoDB table
export const getOrder = async (orderId: string, createdAt: string) => {
    const command = new GetItemCommand({
        TableName: process.env.DYNAMODB_TABLE_NAME,
        Key: {
            orderId: { S: orderId },
            createdAt: { S: createdAt },
        },
    });

    try {
        const result = await dynamoClient.send(command);
        if (result.Item) {
            return {
                orderId: result.Item.orderId.S,
                customer: result.Item.customer.S,
                totalAmount: parseFloat(result.Item.totalAmount.N!),
                orderState: result.Item.orderState.S,
                createdAt: result.Item.createdAt.S,
            };
        } else {
            console.log(`Order with ID ${orderId} not found.`);
            return null;
        }
    } catch (error) {
        console.error('Error fetching order from DynamoDB:', error);
        throw new Error('Failed to get order');
    }
};