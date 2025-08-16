import { NextRequest, NextResponse } from "next/server";
import wmcgameaudienceModel from "../../models/wmcgameaudience.model";
import connectDB from "../../lib/db";

export const POST = async (req) => {
    try {
        await connectDB();

        const { enrollmentNumber, treasure } = await req.json();

        console.log("Scanned data:", { enrollmentNumber, treasure });

        if(!enrollmentNumber || !treasure) {
            return NextResponse.json({ error: "All fields are required" }, { status: 400 });
        }

        const audience = await wmcgameaudienceModel.findOne({ enrollmentNumber }).populate("pairedWith");
        if(!audience) {
            return NextResponse.json({ error: "No audience found with this enrollment number" }, { status: 404 });
        }

        console.log("Audience found:", audience);

        if(audience.count === -1) {
            return NextResponse.json({ message: "You have already found the treasure", data: "Treasure Found" }, { status: 400 });
        } else if(audience.count >= 3) {
            return NextResponse.json({ message: "You have reached the maximum attempts", data: "Max Attempts Reached" }, { status: 400 });
        } else {
            if(audience.pairedWith.treasure === treasure) {
                audience.count = -1;
                await audience.save();
                return NextResponse.json({ message: "You found the treasure", data: "Successful" }, { status: 200 });
            } else {
                audience.count += 1;
                await audience.save();
                return NextResponse.json({ message: "Wrong treasure", data: "Unsuccessful" }, { status: 200 });
            }
        }
    } catch (error) {
        console.log("Error scanning QR code", error);
        return NextResponse.json({ error: "Failed to scan QR code" }, { status: 500 });
    }
}