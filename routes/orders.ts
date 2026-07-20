import { Router, Request, Response } from 'express';
import Order from '../models/Order';

const router = Router();

// POST /api/orders
// Create a new order
router.post('/', async (req: Request, res: Response) => {
  try {
    const { customerName, customerEmail, serviceName, amount } = req.body;

    if (!customerEmail || !serviceName || !amount) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    // Generate a unique order ID
    const count = await Order.countDocuments();
    const orderId = `ORD-${new Date().getFullYear()}-${(count + 1).toString().padStart(3, '0')}`;

    const newOrder = new Order({
      orderId,
      customerName: customerName || 'Anonymous',
      customerEmail,
      serviceName,
      amount,
      status: 'Pending',
    });

    await newOrder.save();

    res.status(201).json({ success: true, data: newOrder });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ success: false, error: 'Failed to create order' });
  }
});

// GET /api/orders/user/:email
// Get orders for a specific user
router.get('/user/:email', async (req: Request, res: Response) => {
  try {
    const { email } = req.params;
    if (!email) {
      return res.status(400).json({ success: false, error: 'Email is required' });
    }

    const orders = await Order.find({ customerEmail: email }).sort({ orderDate: -1 });
    res.json({ success: true, data: orders });
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch orders' });
  }
});

// PUT /api/orders/:id/cancel
// Cancel an order (restricted to 3 days from order date)
router.put('/:id/cancel', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    if (order.status === 'Cancelled') {
      return res.status(400).json({ success: false, error: 'Order is already cancelled' });
    }

    if (order.status === 'Completed') {
      return res.status(400).json({ success: false, error: 'Completed orders cannot be cancelled' });
    }

    // Check if order date is older than 3 days
    const orderDate = new Date(order.orderDate).getTime();
    const currentDate = new Date().getTime();
    const diffTime = currentDate - orderDate;
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    if (diffDays > 3) {
      return res.status(400).json({ success: false, error: 'Orders cannot be cancelled after 3 days of purchase' });
    }

    order.status = 'Cancelled';
    await order.save();

    res.json({ success: true, message: 'Order cancelled successfully', data: order });
  } catch (error) {
    console.error('Error cancelling order:', error);
    res.status(500).json({ success: false, error: 'Failed to cancel order' });
  }
});

// DELETE /api/orders/:id
// Delete an order entirely from the database
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deletedOrder = await Order.findByIdAndDelete(id);

    if (!deletedOrder) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    res.json({ success: true, message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ success: false, error: 'Failed to delete order' });
  }
});

export default router;
