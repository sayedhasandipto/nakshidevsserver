import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Service from './models/Service';

dotenv.config();

const servicesData = [
  {
    serviceId: '1',
    title: 'জন্ম নিবন্ধন (আবেদন ও সংশোধন)',
    category: 'government',
    price: 500,
    duration: '5-7 days',
    rating: 4.8,
    reviews: 245,
    description: 'নতুন জন্ম নিবন্ধনের জন্য অনলাইনে আবেদন করুন অথবা বিদ্যমান নিবন্ধনের যেকোনো তথ্য নির্ভুলভাবে সংশোধন করার প্রক্রিয়া শুরু করুন। আপনার পরিচয় নিশ্চিত করতে এটি একটি অত্যাবশ্যকীয় ধাপ।',
    features: ['অনলাইন আবেদন', 'তথ্য যাচাই', 'দ্রুত সংশোধন', 'ডিজিটাল কপি ডাউনলোড'],
    providerId: {
      name: 'GovService BD',
      rating: 4.9,
      reviews: 1200,
      bio: 'Trusted government service facilitation partner.',
    },
    status: 'Active'
  },
  {
    serviceId: '2',
    title: 'ভোটার আইডি কার্ড',
    category: 'government',
    price: 300,
    duration: '7-10 days',
    rating: 4.6,
    reviews: 189,
    description: 'নতুন ভোটার হিসেবে নিবন্ধন করুন বা জাতীয় পরিচয়পত্রের ভুল সংশোধন করুন। স্মার্ট কার্ডের স্ট্যাটাস চেক করুন।',
    features: ['Form filling', 'Document collection', 'Center visit assistance'],
    providerId: {
      name: 'GovService BD',
      rating: 4.9,
      reviews: 1200,
    },
    status: 'Active'
  },
  {
    serviceId: '3',
    title: 'ব্যবসা নিবন্ধন',
    category: 'business',
    price: 2000,
    duration: '15-20 days',
    rating: 4.9,
    reviews: 567,
    description: 'ট্রেড লাইসেন্সসহ সম্পূর্ণ ব্যবসা নিবন্ধন প্রক্রিয়া। আইনি ডকুমেন্টেশন, লাইসেন্স প্রস্তুতি এবং ফাইলিং সহায়তা।',
    features: ['Legal documentation', 'License preparation', 'Filing assistance'],
    providerId: {
      name: 'Business Solutions Ltd.',
      rating: 4.8,
      reviews: 430,
    },
    status: 'Active'
  },
  {
    serviceId: '4',
    title: 'চাকরি আবেদন সহায়তা',
    category: 'business',
    price: 1000,
    duration: '3-5 days',
    rating: 4.7,
    reviews: 342,
    description: 'পেশাদার সিভি তৈরি, কভার লেটার এবং ইন্টারভিউ কোচিং সেবা। চাকরি পেতে সর্বোচ্চ সহায়তা।',
    features: ['CV preparation', 'Cover letter', 'Interview coaching'],
    providerId: {
      name: 'Career Care BD',
      rating: 4.9,
      reviews: 800,
    },
    status: 'Active'
  },
  {
    serviceId: '5',
    title: 'আইনি পরামর্শ',
    category: 'legal',
    price: 1500,
    duration: '1-2 days',
    rating: 4.8,
    reviews: 421,
    description: 'ব্যক্তিগত ও ব্যবসায়িক বিষয়ে বিশেষজ্ঞ আইনি পরামর্শ। ডকুমেন্ট রিভিউ, চুক্তি প্রস্তুত এবং আইনি সহায়তা।',
    features: ['Document review', 'Legal advice', 'Contract drafting'],
    providerId: {
      name: 'Legal Aid Experts',
      rating: 4.7,
      reviews: 320,
    },
    status: 'Active'
  },
  {
    serviceId: '6',
    title: 'ওয়েব ডেভেলপমেন্ট',
    category: 'technical',
    price: 5000,
    duration: '30-45 days',
    rating: 4.9,
    reviews: 893,
    description: 'আপনার ব্যবসার জন্য পেশাদার ওয়েবসাইট তৈরি। কাস্টম ডিজাইন, রেসপনসিভ লেআউট এবং এসইও অপটিমাইজেশন।',
    features: ['Custom design', 'Responsive layout', 'SEO optimization'],
    providerId: {
      name: 'Nakshi Devs',
      rating: 5.0,
      reviews: 950,
      bio: 'Premium web development agency.',
    },
    status: 'Active'
  },
];

const seedDB = async () => {
  const mongoURI = process.env.MONGODB_URI;
  if (!mongoURI) {
    console.error('MONGODB_URI is not defined in environment variables');
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoURI);
    console.log('MongoDB connected successfully');

    // Delete existing services to prevent duplicates during seed
    await Service.deleteMany({});
    console.log('Cleared existing services');

    // Insert new services
    await Service.insertMany(servicesData);
    console.log('Successfully seeded services data!');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDB();
