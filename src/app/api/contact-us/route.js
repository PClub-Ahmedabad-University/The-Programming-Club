import sendContactUsMail from "../../api/controllers/contact-us.controller";
import { NextResponse } from "next/server";

export const POST = async(req) => {
    const data = await req.json();
    try {
        const query = await sendContactUsMail(data);
        return NextResponse.json(
            {query},
            {status:200}
        );
    } catch (error) {
        return NextResponse.json(
            {data: error.message},
            {status: 500}
        );
    }
}