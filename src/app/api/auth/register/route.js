import { registerUser } from "../../controllers/user.controller";
import { NextResponse } from "next/server";

export const POST = async(req) => {
    try {
        const data = await req.json();
        const user = await registerUser(data);
        return NextResponse.json(user);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}