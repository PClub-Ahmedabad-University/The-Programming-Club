import { registerUser, verifyRegistrationOTP } from "../../controllers/user.controller";
import { NextResponse } from "next/server";

export const POST = async(req) => {
    try {
        const data = await req.json();
        if (data.otp) {
            console.log(data.otp);
            try {
                const user = await verifyRegistrationOTP(data);
                return NextResponse.json(user);
            }
            catch(e){
                return NextResponse.json({ error: e.message }, { status: 500 });  
            }
        }
        const res = await registerUser(data);
        return NextResponse.json({data:res.data, message: "OTP sent to email. Please verify to complete registration." });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}