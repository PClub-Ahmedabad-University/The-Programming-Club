import { NextResponse } from "next/server";
import { getAllEventGalleries } from "@/app/api/controllers/gallery.controller";
import jwt from "jsonwebtoken"; 
const secret = process.env.JWT_SECRET;
export const GET = async (req) => {
  try {
    const { searchParams } = new URL(req.url);
    let page = parseInt(searchParams.get("page") || "1");
    let limit = parseInt(searchParams.get("limit") || "12");
    const activeFilter = searchParams.get("filter") || "All";

    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(limit) || limit < 1) limit = 12;
    if (limit > 100) limit = 100;

    const result = await getAllEventGalleries(page, limit, activeFilter);
    return NextResponse.json({
      success: true,
      data: result.data,
      allEventNames: result.allEventNames,
      pagination: result.pagination
    }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message }, { status: 400 });
  }
};