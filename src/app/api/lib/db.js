import mongoose from "mongoose";
import dotenv from "dotenv"
dotenv.config()
const MONGODB_URI = process.env.MONGO_URI;

if (!MONGODB_URI) {
	throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
}

let cached = global.mongoose;

if (!cached) {
	cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
	if (cached.conn) {
		return cached.conn;
	}

	if (!cached.promise) {
		const opts = {
			bufferCommands: false,
			serverSelectionTimeoutMS: 10000, // 10 seconds timeout
			socketTimeoutMS: 45000, // 45 seconds socket timeout
			family: 4, // Force IPv4
		};

		try {
			cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
				console.log("MongoDB connected successfully");
				return mongoose;
			});
		} catch (error) {
			console.error("MongoDB connection error:", error);
			process.exit(0);
		}
	}

	try {
		cached.conn = await cached.promise;
	} catch (e) {
		console.error("MongoDB connection failed:", e);
		process.exit(0);
	}

	return cached.conn;
}

export default connectDB;
