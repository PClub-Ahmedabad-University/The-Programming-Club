import { addWinners } from "../../controllers/event.controller";
import { NextResponse } from "next/server";
import jwt from 'jsonwebtoken';

export const POST = async(req) => {
    try {
        const { token, eventTitle, eventWinners } = await req.json();

        if (!token) {
            return NextResponse.json(
                { error: "Token missing" },
                { status: 401 }
            );
        }
        let user = jwt.verify(token, process.env.JWT_SECRET);

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        if (user.role !== "admin") {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const updatedEvent = await addWinners({ eventTitle, eventWinners });
        return NextResponse.json(
            { event: updatedEvent },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            { error: error }, 
            { status: 403 }
        );
    }
}