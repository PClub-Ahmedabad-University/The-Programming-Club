import { getEvents } from "../../controllers/event.controller";
import { NextResponse } from "next/server";
import { getCache, setCache } from "../../lib/redis_util";

const CACHE_TTL = 900;

export const GET = async (req) => {
    try {
        const { searchParams } = new URL(req.url);

        let page = parseInt(searchParams.get("page") || "1");
        let limit = parseInt(searchParams.get("limit") || "6");
        const type = searchParams.get("type") || "ALL";

        if (isNaN(page) || page < 1) page = 1;
        if (isNaN(limit) || limit < 1) limit = 6;
        if (limit > 100) limit = 100;

        const CACHE_KEY = `events:get:${page}:${limit}:${type}`;

        const cached = await getCache(CACHE_KEY);
        if (cached) {
            return NextResponse.json(cached, { status: 200 });
        }

        const result = await getEvents(page, limit, type);

        const response = {
            success: true,
            data: result.data,
            pagination: result.pagination,
        };

        await setCache(CACHE_KEY, response, CACHE_TTL);

        return NextResponse.json(response, { status: 200 });
    } catch (e) {
        return NextResponse.json(
            { success: false, error: e.message },
            { status: 400 }
        );
    }
};