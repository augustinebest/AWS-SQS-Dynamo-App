import { Request, Response } from 'express';
import { createOrder } from '../services/orderService';

export const createOrderHandler = async (req: Request, res: Response) => {
    const { customer, items, totalAmount } = req.body;
    try {
        console.log("here", { customer, items, totalAmount })
        const order = await createOrder(customer, items, totalAmount);
        res.status(201).json(order);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create order' });
    }
};
