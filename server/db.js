import mongoose from "mongoose";

export async function connectDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is missing from community-react/.env");
  mongoose.set("strictQuery", true);
  await mongoose.connect(uri, {
    dbName: process.env.MONGODB_DB_NAME || "community_like",
    serverSelectionTimeoutMS: 10000,
  });
  console.log("Connected to MongoDB Atlas");
}
