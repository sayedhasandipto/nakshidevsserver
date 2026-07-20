import { Router, Request, Response } from 'express';
import Service from '../models/Service';

const router = Router();

// GET /api/services
// Fetch all active services
router.get('/', async (req: Request, res: Response) => {
  try {
    const services = await Service.find({ status: 'Active' }).sort({ createdAt: -1 });
    res.json({ success: true, data: services });
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ success: false, error: 'Server error fetching services' });
  }
});

// GET /api/services/:id
// Fetch a single service by serviceId
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const service = await Service.findOne({ serviceId: id, status: 'Active' });
    
    if (!service) {
      return res.status(404).json({ success: false, error: 'Service not found' });
    }
    
    res.json({ success: true, service });
  } catch (error) {
    console.error('Error fetching service details:', error);
    res.status(500).json({ success: false, error: 'Server error fetching service details' });
  }
});

export default router;
