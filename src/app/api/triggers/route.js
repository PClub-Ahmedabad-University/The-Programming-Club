import { NextResponse } from "next/server";
import connectDB from "../lib/db";
import triggerModel from "../models/trigger.model";
export async function POST(request) {
  try {
    const { sheetUrl, webhookUrl } = await request.json();

    if (!sheetUrl || !webhookUrl) {
      return NextResponse.json({ error: "Missing sheetUrl or webhookUrl" }, { status: 400 });
    }

    const scriptWebAppId = process.env.YOUR_SCRIPT_WEBAPP_ID;
    if (!scriptWebAppId) {
      return NextResponse.json({ error: "Missing SCRIPT_WEBAPP_ID in environment" }, { status: 500 });
    }

    const scriptRes = await fetch(
      `https://script.google.com/macros/s/${scriptWebAppId}/exec`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sheetUrl, webhookUrl }),
      }
    );
    await connectDB();
    await triggerModel.create({ sheetUrl, webhookUrl });
    const text = await scriptRes.text();
    return NextResponse.json({ success: true, message: text }, { status: 200 });
  } catch (error) {
    console.error("Trigger error:", error);
    return NextResponse.json(
      { error: "Server error", detail: error.message },
      { status: 500 }
    );
  }
}
export async function GET() {
  try {
    await connectDB();
    const triggers = await triggerModel.find().sort({ createdAt: -1 });
    return NextResponse.json({ triggers }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}