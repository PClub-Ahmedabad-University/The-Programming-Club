import { NextResponse } from "next/server";
import { getUserRegisteredEvents } from "@/app/api/controllers/user.controller";

export async function GET(req, { params }) {
	try {
		const awaitedParams = await params;
		let email = decodeURIComponent(awaitedParams.email);
		
		// Remove any URL-encoded characters
		email = email.replace(/%40/g, '@').replace(/%2E/g, '.');
		
		if (!email || !email.includes('@')) {
			return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
		}
		
		const events = await getUserRegisteredEvents(email);
		return NextResponse.json({ events }, { status: 200 });
	} catch (err) {
		console.error("Error in api/user/events/[email]:", err);
		return NextResponse.json({ 
			error: err.message || 'Internal server error',
			details: process.env.NODE_ENV === 'development' ? err.stack : undefined 
		}, { 
			status: err.message === 'User not found' ? 404 : 500 
		});
	}
}
// http://localhost:3000/api/user/events/jay.s7@ahduni.edu.in
// Get
// {
//     "events": [
//         "684818601cad1ddc2f94f927"
//     ]
// }
