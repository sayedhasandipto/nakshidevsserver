import mongoose, { Schema, Document } from 'mongoose';

export interface IService extends Document {
  serviceId: string;
  title: string;
  category: string;
  price: number;
  duration: string;
  rating: number;
  reviews: number;
  description: string;
  features: string[];
  providerId: {
    name: string;
    rating: number;
    reviews: number;
    bio?: string;
  };
  status: string;
  createdAt: Date;
}

const ServiceSchema: Schema = new Schema({
  serviceId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  duration: { type: String, required: true },
  rating: { type: Number, default: 0 },
  reviews: { type: Number, default: 0 },
  description: { type: String, required: true },
  features: { type: [String], default: [] },
  providerId: {
    name: { type: String, required: true },
    rating: { type: Number, default: 0 },
    reviews: { type: Number, default: 0 },
    bio: { type: String },
  },
  status: { type: String, default: 'Active', enum: ['Active', 'Inactive'] },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Service || mongoose.model<IService>('Service', ServiceSchema);
