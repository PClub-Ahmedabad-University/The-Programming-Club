const { NextResponse } = require("next/server")
import { addMember } from "../../controllers/member.controller"

export const POST = async(req) => {
    try {
        const data = await req.json();
        const member = await addMember(data);
        return NextResponse.json(member, { status: 201 });
    } catch(e) {
        return NextResponse.json({error: e.message}, {status : 500});
    }
}