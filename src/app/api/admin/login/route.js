import { loginAdmin } from "../../controllers/admin.controller";
import { NextResponse } from "next/server";

export const POST = async (req) => {
	const data = await req.json();
	try {
		const { token } = await loginAdmin(data);
		return NextResponse.json({ token }, { status: 200 });
	} catch (e) {
		return NextResponse.json({ data: e.message }, { status: 500 });
	}
};
