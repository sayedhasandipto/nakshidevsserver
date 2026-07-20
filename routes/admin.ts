import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import User from '../models/User';
import Service from '../models/Service';
import Order from '../models/Order';

const router = Router();

// GET /api/admin/stats
router.get('/stats', async (req: Request, res: Response) => {
  try {
    // better-auth stores users in the 'user' collection (singular),
    // not in the Mongoose 'users' collection. Query natively.
    const db = mongoose.connection.db;
    const totalUsers = db ? await db.collection('user').countDocuments() : 0;
    const activeServices = await Service.countDocuments({ status: 'Active' });
    const totalOrders = await Order.countDocuments();

    // Calculate total revenue dynamically
    const orders = await Order.find();
    let totalRevenue = 0;
    orders.forEach(order => {
      const parsedAmount = parseInt(order.amount.replace(/[^\d]/g, ''), 10);
      if (!isNaN(parsedAmount)) {
        totalRevenue += parsedAmount;
      }
    });

    res.json({
      success: true,
      data: [
        { title: 'Total Users', value: totalUsers.toString(), change: '+12%', color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { title: 'Active Services', value: activeServices.toString(), change: '+5%', color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
        { title: 'Total Orders', value: totalOrders.toString(), change: '+23%', color: 'text-rose-500', bg: 'bg-rose-500/10' },
        { title: 'Monthly Revenue', value: `৳${totalRevenue.toLocaleString()}`, change: '+18%', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
      ]
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error fetching stats' });
  }
});

// GET /api/admin/revenue-chart
router.get('/revenue-chart', async (req: Request, res: Response) => {
  try {
    const orders = await Order.find().sort({ orderDate: 1 });

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const chartData: { name: string; revenue: number; orders: number }[] = [];
    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthName = months[d.getMonth()];
      const year = d.getFullYear();
      const label = `${monthName} ${year}`;
      chartData.push({ name: label, revenue: 0, orders: 0 });
    }

    orders.forEach(order => {
      const date = new Date(order.orderDate);
      const monthName = months[date.getMonth()];
      const year = date.getFullYear();
      const label = `${monthName} ${year}`;

      const parsedAmount = parseInt(order.amount.replace(/[^\d]/g, ''), 10);
      const amountVal = isNaN(parsedAmount) ? 0 : parsedAmount;

      const matchedBucket = chartData.find(item => item.name === label);
      if (matchedBucket) {
        matchedBucket.revenue += amountVal;
        matchedBucket.orders += 1;
      }
    });

    res.json({ success: true, data: chartData });
  } catch (error) {
    console.error('Error fetching revenue chart data:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// GET /api/admin/users
router.get('/users', async (req: Request, res: Response) => {
  try {
    const db = mongoose.connection.db;
    if (!db) {
      return res.status(500).json({ success: false, error: 'Database not connected' });
    }
    // better-auth stores users in the 'user' collection (singular)
    const users = await db.collection('user').find().sort({ createdAt: -1 }).toArray();

    // Map better-auth fields to our expected format
    const mapped = users.map((u: any) => ({
      _id: u._id.toString(),
      name: u.name || 'Unknown',
      email: u.email || '',
      role: u.role || 'client',
      status: u.banned ? 'Banned' : 'Active',
      joinedAt: u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : 'N/A',
    }));

    res.json({ success: true, data: mapped });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, error: 'Server error fetching users' });
  }
});

// GET /api/admin/services
router.get('/services', async (req: Request, res: Response) => {
  try {
    const services = await Service.find().sort({ createdAt: -1 });
    res.json({ success: true, data: services });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error fetching services' });
  }
});

// GET /api/admin/orders
router.get('/orders', async (req: Request, res: Response) => {
  try {
    const orders = await Order.find().sort({ orderDate: -1 });
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error fetching orders' });
  }
});

// POST /api/admin/services
// Create a new service
router.post('/services', async (req: Request, res: Response) => {
  try {
    const { serviceId, title, category, price, duration, description, features, providerId, rating, reviews } = req.body;

    if (!serviceId || !title || !category || price === undefined || !duration || !description || !providerId?.name) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const existingService = await Service.findOne({ serviceId });
    if (existingService) {
      return res.status(400).json({ success: false, error: 'Service ID already exists' });
    }

    const newService = new Service({
      serviceId,
      title,
      category,
      price,
      duration,
      rating: rating !== undefined ? Number(rating) : 5.0,
      reviews: reviews !== undefined ? Number(reviews) : 1,
      description,
      features: features || [],
      providerId,
      status: 'Active'
    });

    await newService.save();
    res.status(201).json({ success: true, data: newService });
  } catch (error) {
    console.error('Error creating service:', error);
    res.status(500).json({ success: false, error: 'Failed to create service' });
  }
});

// PUT /api/admin/services/:id
// Update a service
router.put('/services/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updatedService = await Service.findByIdAndUpdate(id, req.body, { new: true });

    if (!updatedService) {
      return res.status(404).json({ success: false, error: 'Service not found' });
    }

    res.json({ success: true, data: updatedService });
  } catch (error) {
    console.error('Error updating service:', error);
    res.status(500).json({ success: false, error: 'Failed to update service' });
  }
});

// DELETE /api/admin/services/:id
// Delete a service
router.delete('/services/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deletedService = await Service.findByIdAndDelete(id);

    if (!deletedService) {
      return res.status(404).json({ success: false, error: 'Service not found' });
    }

    res.json({ success: true, message: 'Service deleted successfully' });
  } catch (error) {
    console.error('Error deleting service:', error);
    res.status(500).json({ success: false, error: 'Failed to delete service' });
  }
});

export default router;
