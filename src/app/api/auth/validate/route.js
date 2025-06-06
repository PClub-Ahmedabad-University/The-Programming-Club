import { validateUser } from "../../controllers/user.controller";
import { NextResponse } from "next/server";

export const GET = async (req) => {
	const data = await req.headers;
	if (!data) {
		return NextResponse.json(
			{
				data: "Invalid Headers",
			},
			{
				status: 400,
			}
		);
	}
	try {
		const response = await validateUser(data);
		return NextResponse.json(response[0], response[1]);
	} catch (e) {
		console.error("Error in route.js:", e);
		return NextResponse.json(
			{
				data: "Unknown Error Occurred",
			},
			{
				status: 500,
			}
		);
	}
};
