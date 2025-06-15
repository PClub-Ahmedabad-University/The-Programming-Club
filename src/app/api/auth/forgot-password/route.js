import { sendPasswordResetOTP, ransresetPasswordWithOTP } from "../../controllers/user.controller";
import { NextResponse } from "next/server";

export const POST = async (req) => {
	try {
		const data = await req.json();
		if (data.otp) {
			const result = await ransresetPasswordWithOTP(data);
			return NextResponse.json(result);
		}
		const { email } = data;
		await sendPasswordResetOTP(email);
		return NextResponse.json({ message: "OTP sent successfully" });
	} catch (error) {
		console.error("Error in /api/auth/forgot-password:", error);
		return NextResponse.json({ message: "Error resetting password" });
	}
};
