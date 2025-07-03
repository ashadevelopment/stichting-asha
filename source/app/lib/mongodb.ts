import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

// Cache for main database connection
let cached = (global as any).mongoose || { conn: null, promise: null };

// Cache for media database connection
let mediaCached = (global as any).mongooseMedia || { conn: null, promise: null };

async function dbConnect() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      dbName: "Oase",
      bufferCommands: false,
    }).then((mongoose) => mongoose);
  }

  cached.conn = await cached.promise;
  (global as any).mongoose = cached;
  return cached.conn;
}

async function dbConnectMedia() {
  if (mediaCached.conn) return mediaCached.conn;

  if (!mediaCached.promise) {
    // Create a separate mongoose instance for media
    const mediaMongoose = new mongoose.Mongoose();
    mediaCached.promise = mediaMongoose.connect(MONGODB_URI, {
      dbName: "OaseMedia", // Separate database for media
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    }).then((mongoose) => mongoose);
  }

  mediaCached.conn = await mediaCached.promise;
  (global as any).mongooseMedia = mediaCached;
  return mediaCached.conn;
}

export default dbConnect;
export { dbConnectMedia };