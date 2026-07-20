import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import adminRoutes from './routes/admin';
import ordersRoutes from './routes/orders';
import servicesRoutes from './routes/services';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const mongoURI = process.env.MONGODB_URI;
if (mongoURI) {
    mongoose.connect(mongoURI)
        .then(() => console.log('MongoDB connected successfully'))
        .catch((err: Error) => console.error('MongoDB connection error:', err));
} else {
    console.warn('MONGODB_URI is not defined in environment variables');
}

// Routes
app.use('/api/admin', adminRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/services', servicesRoutes);

app.get('/', (req: Request, res: Response) => {
    res.send('Welcome to GovService BD Backend API');
});

// For Vercel Serverless Functions, we need to export the Express app
export default app;

// Only start the server locally if not running on Vercel
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}
