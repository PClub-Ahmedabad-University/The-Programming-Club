import { registerUser, verifyRegistrationOTP } from "../../controllers/user.controller";
import { NextResponse } from "next/server";

export const POST = async(req) => {
    try {
        const data = await req.json();
        if (data.otp) {
            const user = await verifyRegistrationOTP(data);
            return NextResponse.json(user);
        }
        await registerUser(data);
        return NextResponse.json({ message: "OTP sent to email. Please verify to complete registration." });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}