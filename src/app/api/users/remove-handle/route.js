import { NextResponse } from "next/server";
import User from "@/app/api/models/user.model";
import connectDB from "@/app/api/lib/db";
import jwt from "jsonwebtoken";

export const POST = async (req) => {
    try {
        const token=req.headers.get("Authorization").split(" ")[1];

        const userId=jwt.decode(token).id;

        if (!userId) {
            return NextResponse.json({ error: "User ID is required" }, { status: 400 });
        }

        await connectDB();

        const user = await User.findOne({ _id: userId });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }       

        user.codechefHandle = null;
        user.codeforcesHandle = null;
        user.codeforcesRank = "unrated";
        user.codeforcesRating = 0;

        await user.save();

        return NextResponse.json({ message: "Handle removed successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error removing handle:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
};