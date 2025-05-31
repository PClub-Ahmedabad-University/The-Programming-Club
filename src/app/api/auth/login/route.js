import { loginUser } from "../../controllers/user.controller";
import { NextResponse } from "next/server";

export const POST = async(req) => {
    const data = await req.json();
    const { token, user } = await loginUser(data);
    return NextResponse.json({ token, data });
}