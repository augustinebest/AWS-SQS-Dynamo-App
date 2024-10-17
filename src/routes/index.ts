import { Router } from 'express';
import { createOrderHandler } from '../controllers/orderController';

const router = Router();

router.post('/orders', createOrderHandler);

export default router;
