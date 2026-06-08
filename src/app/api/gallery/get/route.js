import { NextResponse } from "next/server";
import { getAllEventGalleries } from "@/app/api/controllers/gallery.controller";
import { getCache, setCache } from "@/app/api/lib/redis_util";

const CACHE_KEY = "gallery:get";
const CACHE_TTL = 900;

export const GET = async (req) => {
  try {
    const cached = await getCache(CACHE_KEY);
    if (cached) {
      return NextResponse.json({ data: cached }, { status: 200 });
    }

    const galleries = await getAllEventGalleries();
    await setCache(CACHE_KEY, galleries, CACHE_TTL);
    return NextResponse.json({ data: galleries }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
};