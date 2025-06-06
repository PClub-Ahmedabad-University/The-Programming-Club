import { deleteEvent } from "@/app/api/controllers/event.controller";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
const secret = process.env.JWT_SECRET;
export const DELETE = async (req, { params }) => {
	try {
		const authHeader = req.headers.get("authorization");
		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}
		const token = authHeader.split(" ")[1];
		let decoded;
		try {
			decoded = jwt.verify(token, secret);
		} catch (err) {
			return NextResponse.json(
				{ error: "Invalid or expired token" },
				{ status: 401 }
			);
		}
		if (decoded.role !== "admin") {
			return NextResponse.json(
				{ error: "Forbidden: Admins only" },
				{ status: 403 }
			);
		}
		const awaitedParams = await params;
		const id = await awaitedParams.id;
		const deletedEvent = await deleteEvent(id);
		return NextResponse.json(
			{ message: "Event deleted successfully", data: deletedEvent },
			{ status: 200 }
		);
	} catch (error) {
		return NextResponse.json({ error: error.message }, { status: 404 });
	}
};

//Example url: http://localhost:3000/api/events/delete/683c0e21b605e104fb4e2274
// format: {{base}}/api/events/delete/id <- mongo objectId
// Example response
// {
//     "message": "Event deleted successfully",
//     "data": {
//         "_id": "683c0e21b605e104fb4e2274",
//         "title": "Tech Quiz 2020",
//         "description": "A thrilling technical quiz to test your knowledge across multiple domains.",
//         "rules": "Max 2 participants per team. No internet use allowed.",
//         "date": "2025-06-10T14:00:00.000Z",
//         "location": "Auditorium Hall A",
//         "registrationOpen": true,
//         "imageUrl": "https://res.cloudinary.com/dhizeooup/image/upload/v1748766241/events/pbrdmr6a8ixjoblwhvar.png",
//         "more_details": "Prizes worth ₹10,000! Certificate for all participants.",
//         "createdAt": "2025-06-01T08:24:01.942Z",
//         "updatedAt": "2025-06-01T08:24:01.942Z",
//         "__v": 0
//     }
// }