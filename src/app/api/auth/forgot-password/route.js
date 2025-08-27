import { sendPasswordResetOTP, ransresetPasswordWithOTP } from "../../controllers/user.controller";
import { NextResponse } from "next/server";

export const POST = async (req) => {
  try {
    const data = await req.json();

    if (data.otp) {
      // Reset password with OTP
      try {
        const result = await ransresetPasswordWithOTP(data);
        return NextResponse.json({ success: true, message: "Password reset successfully", ...result });
      } catch (err) {
        console.error("Error in ransresetPasswordWithOTP:", err);
        return NextResponse.json({ success: false, message: err.message || "Invalid or incorrect OTP" }, { status: 400 });
      }
    } else if (data.email) {
      // Send OTP
      try {
        await sendPasswordResetOTP(data.email);
        return NextResponse.json({ success: true, message: "OTP sent successfully" });
      } catch (err) {
        console.error("Error in sendPasswordResetOTP:", err);
        return NextResponse.json({ success: false, message: err.message || "Failed to send OTP" }, { status: 400 });
      }
    } else {
      return NextResponse.json({ success: false, message: "Email or OTP not provided" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error parsing request in /api/auth/forgot-password:", error);
    return NextResponse.json({ success: false, message: "Invalid request" }, { status: 400 });
  }
};
