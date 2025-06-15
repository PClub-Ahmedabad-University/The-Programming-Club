import { loginUser } from "../../controllers/user.controller";
import { NextResponse } from "next/server";

export const POST = async (req) => {
	const data = await req.json();
	try {
		const { token } = await loginUser(data);
		return NextResponse.json({ token }, { status: 200 });
	} catch (e) {
		return NextResponse.json({ data: e.message }, { status: 500 });
	}
};
