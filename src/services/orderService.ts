import { SendMessageCommand } from '@aws-sdk/client-sqs'
import { sqsClient } from '../config/sqs';
import { v4 as uuidv4 } from 'uuid';
import { saveOrder } from '../database/dynamo';

export const sendOrderToQueue = async (order: any) => {
    const command = new SendMessageCommand({
        QueueUrl: process.env.SQS_QUEUE_URL!,
        MessageBody: JSON.stringify(order),
        MessageAttributes: {
            orderId: {
                DataType: 'String',
                StringValue: order.orderId,
            },
        },
        MessageGroupId: 'OrderGroup',
    });
    try {
        console.log("SQS_QUEUE_URL::", process.env.SQS_QUEUE_URL!)
        await sqsClient.send(command);
        console.log('Order sent to the queue:', order);
    } catch (error) {
        console.error('Error sending order to queue:', error);
    }
};

export const createOrder = async (customer: string, items: any[], totalAmount: number) => {
    const order = {
        orderId: uuidv4(),
        customer,
        items,
        totalAmount,
        orderState: 'PENDING',
        createdAt: new Date().toISOString(),
    };

    try {
        // Send order to SQS queue
        await sendOrderToQueue(order);

        // Save Order to DynamoDB
        await saveOrder(order);
        return order;
    } catch (error) {
        console.error('Error creating order:', error);
        throw new Error('Failed to create order');
    }
};
