import { getEventById } from "@/app/api/controllers/event.controller";
import { NextResponse } from "next/server";
import { getCache, setCache } from "@/app/api/lib/redis_util";

const CACHE_TTL = 900;

export const GET = async (req, { params }) => {
	try {
		const { id } = await params;
		const cacheKey = `events:get:${id}`;

		const cached = await getCache(cacheKey);
		if (cached) {
			return NextResponse.json({ event: cached }, { status: 200 });
		}

		const event = await getEventById(req);

		if (!event) {
			return NextResponse.json({ error: "Event not found" }, { status: 404 });
		}

		await setCache(cacheKey, event, CACHE_TTL);
		return NextResponse.json({ event }, { status: 200 });
	} catch (error) {
		console.error("Error in api/events/get/[id]:", error);
		return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
	}
};
