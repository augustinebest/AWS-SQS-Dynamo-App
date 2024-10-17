import { ReceiveMessageCommand, DeleteMessageCommand } from '@aws-sdk/client-sqs'
import { sqsClient } from '../config/sqs';
import { dynamoClient, getOrder } from '../database/dynamo';
import { UpdateItemCommand } from '@aws-sdk/client-dynamodb';

export const updateOrderState = async (orderId: string, createdAt: string, newState: string) => {
    const tableName = process.env.DYNAMODB_TABLE_NAME;
    if (!tableName) {
        console.error("DYNAMODB_TABLE_NAME is not set");
        throw new Error("DYNAMODB_TABLE_NAME environment variable is required");
    }
    const command = new UpdateItemCommand({
        TableName: tableName,
        Key: {
            orderId: { S: orderId },
            createdAt: { S: createdAt },
        },
        UpdateExpression: 'SET orderState = :state',
        ExpressionAttributeValues: {
            ':state': { S: newState },
        },
    });

    try {
        await dynamoClient.send(command);
        console.log(`Order ${orderId} updated to state: ${newState}`);
    } catch (error) {
        console.error(`Error updating order ${orderId}:`, error);
    }
}

export const processMessages = async () => {
    const command = new ReceiveMessageCommand({
        QueueUrl: process.env.SQS_QUEUE_URL!,
        MaxNumberOfMessages: 10,
        VisibilityTimeout: 20,
        WaitTimeSeconds: 5,
    });

    try {
        const result = await sqsClient.send(command);
        console.log("processMessages", result)
        if (result.Messages) {
            for (const message of result.Messages) {
                const order = JSON.parse(message.Body!);
                console.log('Processing order:', order);

                // Ensure orderId exists before proceeding
                if (!order.orderId) {
                    console.error('Order does not have an orderId:', order);
                    return;
                }

                // Update the order state in DynamoDB to PROCESSING
                await updateOrderState(order.orderId, order.createdAt, 'PROCESSING');

                // Simulate some business logic (e.g., payment verification)
                const isPaymentVerified = false; // Simulated outcome
                console.log("isPaymentVerified********", isPaymentVerified);

                if (isPaymentVerified) {
                    // Payment verified, update the order state to COMPLETED
                    await updateOrderState(order.orderId, order.createdAt, 'COMPLETED');
                } else {
                    console.log(`Payment verification failed for order ${order.orderId}`);
                    // Optionally, you could add logic to retry or handle the failed state
                }

                // Check Status: COMPLETED from the Database
                const orderCompleted = await getOrder(order.orderId, order.createdAt);
                console.log("orderCompleted*****", orderCompleted)

                if (orderCompleted?.orderId === order.orderId && orderCompleted?.orderState === "COMPLETED") {
                    // Delete message after processing
                    const deleteCommand = new DeleteMessageCommand({
                        QueueUrl: process.env.SQS_QUEUE_URL!,
                        ReceiptHandle: message.ReceiptHandle!,
                    });
                    await sqsClient.send(deleteCommand);
                    console.log("Order removed from queue");
                }

            }
        }
    } catch (error) {
        console.error('Error processing messages:', error);
    }

};
