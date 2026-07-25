import dotenv from "dotenv";
import express, { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import cors from "cors";
import adminRoutes from "./routes/admin";
import ordersRoutes from "./routes/orders";
import servicesRoutes from "./routes/services";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Global Mongoose Cache logic for Vercel Serverless
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function connectDB() {
  const mongoURI = process.env.MONGODB_URI;
  if (!mongoURI) {
    throw new Error("MONGODB_URI is not defined in environment variables");
  }

  // ১. যদি আগে থেকেই একটিভ কানেকশন থাকে, সেটাই রিটার্ন করবে
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  // ২. যদি কানেকশন প্রসেসিংয়ে না থাকে, তবে নতুন কানেকশন ইনিশিয়ালাইজ করবে
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    };

    cached.promise = mongoose.connect(mongoURI, opts).then((m) => {
      return m;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null;
    cached.conn = null;
    throw err;
  }

  return cached.conn;
}

// Database connection middleware
app.use(async (req: Request, res: Response, next: NextFunction) => {
  try {
    await connectDB();
    next();
  } catch (err: any) {
    console.error("MongoDB connection error:", err);
    res.status(500).json({
      success: false,
      error: "Database connection failed: " + err.message,
    });
  }
});

// Routes
app.use("/api/admin", adminRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/services", servicesRoutes);

app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to GovService BD Backend API");
});

// For local development
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

// For Vercel Serverless Functions
export default app;
