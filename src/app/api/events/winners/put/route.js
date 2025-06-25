import { updateWinner } from "@/app/api/controllers/event.controller";
import { NextResponse } from "next/server";
import sharp from "sharp";

// --- Helpers for base64 format detection & conversion ---
const getImageFormat = (base64) => {
  const matches = base64.match(/^data:image\/([a-zA-Z0-9+]+);base64,/);
  return matches ? matches[1].toLowerCase() : null;
};

const convertHeicToJpeg = async (base64Heic) => {
  const buffer = Buffer.from(base64Heic.split(",")[1], "base64");
  const jpegBuffer = await sharp(buffer).jpeg().toBuffer();
  return `data:image/jpeg;base64,${jpegBuffer.toString("base64")}`;
};

// --- PUT handler ---
export const PUT = async (req) => {
  try {
    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      return NextResponse.json(
        { success: false, error: "Invalid JSON payload" },
        { status: 400 }
      );
    }

    const { eventId, winnerId, updateData } = body;

    if (!eventId || !winnerId || !updateData) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: eventId, winnerId, and updateData are required",
        },
        { status: 400 }
      );
    }

    // 🔄 Convert HEIC to JPEG if necessary
    if (updateData.image && typeof updateData.image === "string") {
      const format = getImageFormat(updateData.image);
      if (format === "heic" || format === "heif") {
        console.log("Converting HEIC image to JPEG...");
        updateData.image = await convertHeicToJpeg(updateData.image);
      }
    }

    const result = await updateWinner({ eventId, winnerId, updateData });

    return NextResponse.json(result, {
      status: 200,
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Internal server error",
        ...(process.env.NODE_ENV === "development" && {
          stack: error.stack,
          originalError: error.originalError?.message,
        }),
      },
      {
        status: error.statusCode || 500,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  }
};
