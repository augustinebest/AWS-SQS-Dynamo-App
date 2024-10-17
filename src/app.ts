import express, { Application } from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import routes from './routes';

// Load environment variables from .env file
dotenv.config();

// Initialize the Express application
const app: Application = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api', routes);

// Health check endpoint
app.get('/', (req, res) => {
  res.status(200).json({ message: 'API is up and running!' });
});

// Error handling middleware
app.use((err: any, req: any, res: any, next: any) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

export default app;
