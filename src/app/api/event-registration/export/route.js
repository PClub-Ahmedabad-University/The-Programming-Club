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
        const registrations = await Registration.find({ event_id: eventId }).lean();
        
        if (!registrations.length) {
            return NextResponse.json(
                { error: "No participants"}, 
                { status: 404 }
            );
        }

        const headerSet = new Set();
        registrations.forEach(r => Object.keys(r).forEach(k => headerSet.add(k)));
        const header = Array.from(headerSet);

        const rows = registrations.map(r =>
                header
                    .map(field => {
                        let v = r[field] == null ? '' : r[field];
                        if (typeof v === "object") v = JSON.stringify(v);
                        return `"${String(v).replace(/"/g, '""')}"`;
                    })
                    .join(",")
        );

        const csv = [header.join(","), ...rows].join("\n");

        return new NextResponse(csv, {
            status: 200,
            headers: {
                "Content-Type": "text/csv",
                "Content-Disposition": `attachment; filename="participants_${eventId}.csv"`,
            },
        });
    } catch (error) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}