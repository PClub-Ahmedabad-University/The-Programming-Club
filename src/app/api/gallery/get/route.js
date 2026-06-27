import { NextResponse } from "next/server";
import { getAllEventGalleries } from "@/app/api/controllers/gallery.controller";
import { getCache, setCache } from "@/app/api/lib/redis_util";

const CACHE_TTL = 900;

export const GET = async (req) => {
  try {
    const { searchParams } = new URL(req.url);

    let page = parseInt(searchParams.get("page") || "1");
    let limit = parseInt(searchParams.get("limit") || "12");
    const activeFilter = searchParams.get("filter") || "All";

    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(limit) || limit < 1) limit = 12;
    if (limit > 100) limit = 100;

    const CACHE_KEY = `gallery:get:${page}:${limit}:${activeFilter}`;

    const cached = await getCache(CACHE_KEY);
    if (cached) {
      return NextResponse.json(cached, { status: 200 });
    }

    const result = await getAllEventGalleries(
      page,
      limit,
      activeFilter
    );

    const response = {
      success: true,
      data: result.data,
      allEventNames: result.allEventNames,
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