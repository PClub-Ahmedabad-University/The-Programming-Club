import Registration from "../../models/registration.model";
import { NextResponse } from "next/server";
import connectDB from "../../lib/db";
import jwt from 'jsonwebtoken';
import User from "../../models/user.model";

const secret = process.env.JWT_SECRET;

export const POST = async (req) => {
    try {
        await connectDB();
        const { token, eventId } = await req.json();
        if (!token) {
            return NextResponse.json(
                { error: 'Unauthorized. Only admins are allowed' },
                { status: 403 }
            );
        }
        let user = jwt.verify(token, secret);
        if (user.role !== "admin") {
            return NextResponse.json(
                { error: 'Unauthorized. Only admins are allowed' },
                { status: 403 }
            );
        }
        const registrations = await Registration.find({ eventId });
        const registeredUsers = registrations.map(r => r.userId);
        const users = await User.find({ _id: { $in: registeredUsers }});
        const header = ["_id", "name", "email", "rollNo"];
        const rows = users.map(u => 
            [u._id, u.name, u.email, u.enrollmentNumber].join(",")
        );
        const csv = [header.join(",", ...rows)].join("\n");

        return new NextResponse(csv, {
            status: 200,
            headers: {
                "Content-Type": "text/csv",
                "Content-Disposition": `attachment; filename="participants_${eventId}.csv"`
            }
        });
    } catch (error) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}