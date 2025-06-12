import { loginUser } from "../../controllers/user.controller";
import { NextResponse } from "next/server";

export const POST = async(req) => {
    const data = await req.json();
    try {
        const { token, user } = await loginUser(data);
        console.log(data);
        return NextResponse.json(
            { token, data },
            {status: 200}
        );
    } catch(e) {
        return NextResponse.json(
            {data:e.message},
            {status:400}
        );
    }
}