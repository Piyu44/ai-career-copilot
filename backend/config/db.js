import mongoose from "mongoose";

/**
 * MongoDB connection. The API still boots without MONGODB_URI so the mock AI
 * flow can be exercised, but persistence requires a configured Atlas cluster.
 */
export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn("⚠️  MONGODB_URI not set — running without persistence (demo mode).");
    return null;
  }
  try {
    mongoose.set("strictQuery", true);
    const conn = await mongoose.connect(uri, { maxPoolSize: 10 });
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  }
}
