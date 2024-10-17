import app from './app';
import { processMessages } from './services/analyticsService';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  
  // Poll SQS queue for messages
  setInterval(async () => {
    try {
      await processMessages();
    } catch (error) {
      console.error('Error processing messages:', error);
    }
  }, 10000);
});
