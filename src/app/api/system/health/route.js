import { NextRequest, NextResponse } from "next/server";
export const GET  = async(req) => {
    return NextResponse.json({
        "system":"system is healthy"
    });
}