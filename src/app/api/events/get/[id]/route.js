import { getEventById } from "@/app/api/controllers/event.controller";
import { NextResponse } from "next/server";

export const GET = async (req) => {
  try {
    const event = await getEventById(req);

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json({ event }, { status: 200 });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
};
