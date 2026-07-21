import dotenv from "dotenv";
import express, { Request, Response } from "express";
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

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

// Database connection middleware for serverless environment
app.use(async (req, res, next) => {
  const mongoURI = process.env.MONGODB_URI;
  if (!mongoURI) {
    console.warn("MONGODB_URI is not defined in environment variables");
    return res
      .status(500)
      .json({ success: false, error: "MONGODB_URI is not configured" });
  }

  // If connection appears ready, validate it with a ping
  if (mongoose.connection.readyState === 1 && mongoose.connection.db) {
    try {
      await mongoose.connection.db.admin().ping();
      return next();
    } catch (pingErr) {
      console.warn(
        "Stale MongoDB connection detected, reconnecting...",
        pingErr,
      );
      cached.promise = null;
      cached.conn = null;
      try {
        await mongoose.disconnect();
      } catch (_) {}
    }
  }

  // Create new connection or reconnect
  if (
    !cached.promise ||
    mongoose.connection.readyState === 0 ||
    mongoose.connection.readyState === 3
  ) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    };
    cached.promise = mongoose.connect(mongoURI, opts).then((m) => m);
  }

  try {
    cached.conn = await cached.promise;
    console.log("MongoDB connected successfully");
    next();
  } catch (err: any) {
    cached.promise = null;
    cached.conn = null;
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

// For Vercel Serverless Functions, we need to export the Express app
export default app;

// Only start the server locally if not running on Vercel
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}
