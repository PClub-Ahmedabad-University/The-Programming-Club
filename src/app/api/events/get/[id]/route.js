import { getEventById } from "@/app/api/controllers/event.controller";
import { NextResponse } from "next/server";

export const GET = async(req) => {
    try {
        const event = await getEventById(req);
        return NextResponse.json({event:event, status:200});
    } catch (error) {
        return NextResponse.json({ error: error});
    }
}