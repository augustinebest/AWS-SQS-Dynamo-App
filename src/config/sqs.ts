import { SQSClient } from '@aws-sdk/client-sqs';

import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

export const sqsClient = new SQSClient({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
})