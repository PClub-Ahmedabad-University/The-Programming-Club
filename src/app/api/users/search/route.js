// src/app/api/users/search/route.js
import { NextResponse } from "next/server";
import connectDB  from "@/app/api/lib/db"; // Connects to your MongoDB
import User from "@/app/api/models/user.model"; // Mongoose model for users

export const GET = async (req) => {
  try {
    await connectDB(); // Ensures a connection to the database

    // Extracts the 'query' from the URL (e.g., ?query=Het)
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query") || "";

    // Allow empty query to fetch all users
    // if (!query) {
    //   return NextResponse.json({ error: "Search query is required." }, { status: 400 });
    // }

    // Creates a flexible search pattern
    const regex = new RegExp(query, "i"); // 'i' means case-insensitive

    // MongoDB's '$or' operator searches in multiple fields
    const users = await User.find({
      $or: [
        { name: { $regex: regex } },
        { email: { $regex: regex } },
        // Assuming your user model has this field
        { enrollmentNumber: { $regex: regex } } 
      ],
    }).select("name email role registeredEvents createdAt enrollmentNumber"); // Only returns necessary fields

    // If no users are found, return a 404 error
    if (!users || users.length === 0) {
      return NextResponse.json({ error: "No users found." }, { status: 404 });
    }

    // Returns the found users with a success status
    return NextResponse.json(users, { status: 200 });

  } catch (e) {
    // If anything goes wrong, return a server error
    console.error("User search API error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
};