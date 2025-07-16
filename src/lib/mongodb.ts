import mongoose from 'mongoose';

if (!process.env.MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env');
}

// Ensure we're connecting to the 'test' database
const MONGODB_URI = process.env.MONGODB_URI?.includes('/test') 
  ? process.env.MONGODB_URI 
  : process.env.MONGODB_URI?.replace(/\/[^/?]*(\?|$)/, '/test$1') || process.env.MONGODB_URI;

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// @ts-expect-error - global.mongoose is added at runtime
let cached: MongooseCache = global.mongoose;

if (!cached) {
  // @ts-expect-error - global.mongoose is added at runtime
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
      family: 4 // Use IPv4, skip trying IPv6
    };

    try {
    cached.promise = mongoose.connect(MONGODB_URI, opts);
    } catch (e) {
      cached.promise = null;
      throw e;
    }
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;
export { connectDB as connectToDatabase }; 