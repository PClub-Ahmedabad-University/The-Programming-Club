import crypto from "crypto";
import redis from "../lib/redis";
//import transporter from "../lib/nodemailer";
import { sendMail } from "../utils/mailv2.utils";
const generateOTP = async (email) => {
	const otp = crypto.randomInt(100000, 999999).toString();
	await redis.setex(email, 300, otp);
	console.log("sent otp for: ", email, ": ", otp);
	sendMail(email, "PClub OTP verification", `<p style="font-family: system-ui, -apple-system, BlinkMacSystemFont, Arial, sans-serif; color: #111;">
  Your one-time password (OTP) is:
</p>

<div
  style="
    display: inline-block;
    margin: 12px 0 16px;
    padding: 10px 18px;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, Arial, sans-serif;
    font-size: 22px;
    font-weight: 600;
    letter-spacing: 4px;
    background-color: #f2f4f7;
    border-radius: 6px;
    color: #111;
  "
>
  ${otp}
</div>

<p style="font-family: system-ui, -apple-system, BlinkMacSystemFont, Arial, sans-serif; color: #111;">
  This code will expire in <strong>5 minutes</strong>.
</p>

<p style="font-family: system-ui, -apple-system, BlinkMacSystemFont, Arial, sans-serif; color: #666; font-size: 13px;">
  If you did not request this code, you can safely ignore this email.
</p>
`);
	// await transporter.sendMail({
	// 	from: process.env.EMAIL_USER,
	// 	to: email,
	// 	subject: "PClub verification",
	// 	text: `Your otp is ${otp}. It will expire in 5 minutes.`,
	// });
	return true;
};

export default generateOTP;
