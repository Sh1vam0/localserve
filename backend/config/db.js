import mongoose from 'mongoose';
import ensureMasterAdmin from './ensureMasterAdmin.js';

let memoryServer = null;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  // 1. If Atlas URI or custom URI is provided, try to connect to it first
  if (uri && uri.startsWith('mongodb+srv://')) {
    try {
      console.log(`📡 Connecting to MongoDB Atlas (${uri.split('@')[1] || 'Cluster'})...`);
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log(`✅ Connected to MongoDB Atlas: ${conn.connection.host}`);
      await ensureMasterAdmin();
      return conn;
    } catch (error) {
      console.warn(`⚠️ Failed to connect to MongoDB Atlas: ${error.message}`);
      console.warn(`💡 Falling back to in-memory MongoDB so the demo continues smoothly without crashing.`);
    }
  } else if (uri && !uri.includes('localhost') && !uri.includes('127.0.0.1')) {
    try {
      console.log(`📡 Connecting to remote MongoDB: ${uri}...`);
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log(`✅ Connected to MongoDB: ${conn.connection.host}`);
      await ensureMasterAdmin();
      return conn;
    } catch (error) {
      console.warn(`⚠️ Could not reach remote DB: ${error.message}`);
    }
  } else {
    // Local URI was specified. Try local first:
    try {
      console.log(`Connecting to local MongoDB (${uri || 'mongodb://localhost:27017/localserv'})...`);
      const conn = await mongoose.connect(uri || 'mongodb://localhost:27017/localserv', {
        serverSelectionTimeoutMS: 2000,
      });
      console.log(`✅ Connected to local MongoDB: ${conn.connection.host}`);
      await ensureMasterAdmin();
      return conn;
    } catch (err) {
      console.log(`ℹ️ Local MongoDB not detected (${err.message}). Activating in-memory database fallback...`);
    }
  }

  // 2. Seamless In-Memory fallback for zero-setup execution
  try {
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    console.log(`🚀 Starting in-memory MongoDB instance...`);
    memoryServer = await MongoMemoryServer.create();
    const memUri = memoryServer.getUri();
    const conn = await mongoose.connect(memUri);
    console.log(`✅ Connected to In-Memory MongoDB: ${memUri}`);

    // Auto-seed in-memory database with demo users & businesses
    const { default: seedRunner } = await import('../seed/autoSeed.js');
    await seedRunner();
    await ensureMasterAdmin();
    return conn;
  } catch (memErr) {
    console.error(`❌ In-memory DB setup error: ${memErr.message}`);
  }
};

export default connectDB;
