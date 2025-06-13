import { NextResponse } from "next/server";
import { getUserRegisteredEvents } from "@/app/api/controllers/user.controller";

export async function GET(req, { params }) {
  try {
    const awaitedParams = await params;
    console.log("awaitedParams:", awaitedParams);
    const email = awaitedParams.email;
    console.log("email:", email);
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }
    const events = await getUserRegisteredEvents(email);
    return NextResponse.json({ events }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
// http://localhost:3000/api/user/events/jay.s7@ahduni.edu.in
// Get
// {
//     "events": [
//         "684818601cad1ddc2f94f927"
//     ]
// }