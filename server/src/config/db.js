import mongoose from "mongoose";

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set");
  mongoose.set("strictQuery", true);
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 });
  } catch (err) {
    let host = "(unreadable URI)";
    try {
      host = new URL(uri).hostname;
    } catch {}
    console.error(`\nCould not connect to MongoDB at ${host}`);
    console.error(`Reason: ${err.reason?.type ?? err.name}`);
    console.error("Atlas: check the cluster isn't paused and your IP is allowed. Local: check mongod is running.\n");
    process.exit(1);
  }
  console.log(`MongoDB connected: ${mongoose.connection.name}`);
}