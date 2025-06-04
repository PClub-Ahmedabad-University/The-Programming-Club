import { NextResponse } from "next/server";
import { generateOTP } from "../utils/otp.utils";
import { sendMail } from "../utils/mailer.utils";
import jwt from "jsonwebtoken";
import Registration from "../models/registration.model";
import User from "../models/user.model";

export const POST = async (req) => {
	try {
		// * need token, event id, otherData { email, otpToken, otp, phone, college, teamName, registeredAt }
		const secret = process.env.secret; // * JWT secret
		// # check if the user is already logged in
		const { token, eventId, otherData } = req.body();
		if (!token) {
			// ? two possibilities - either the user is asking for the OTP or the user wants to give the otp
			// # to check what is happening check what is in the otherData object
			const { email, otpToken, otp, ...formDetails } = otherData;
			if (email) {
				// # the user is asking for the OTP by providing the email
				const newOtp = generateOTP(); // gives a 4 digit OTP
				sendMail(
					email,
					"OTP for PClub event registration",
					`<h2>Hello, your OTP is ${newOtp}</h2><br><h4>Thanks a lot for registering in the event. We'll be waiting for you!</h4>`
				);
				const otpToken = jwt.sign({ otp: newOtp, email }, secret, {
					expiresIn: "5m",
				});
				return NextResponse.json(
					{
						status: "success",
						data: otpToken,
					},
					{
						status: 200,
					}
				);
			} else if (otp && otpToken) {
				// # the user has the otp and wants to register
				try {
					jwt.verify(otpToken, secret);
				} catch (error) {
					return NextResponse.json({
						status: "error",
						data: "Invalid token",
					});
				}
				// * no error means the token is correct
				const { otp: originalOtp, email: userEmail } = jwt.decode(
					otpToken,
					secret
				);
				if (!originalOtp || !userEmail) {
					return NextResponse.json(
						{
							status: "error",
							data: "Missing either otp or user email",
						},
						{
							status: 404,
						}
					);
				}
				if (originalOtp === otp) {
					// # valid otp, register this email for the event
					const { phone, college, teamName, registeredAt } =
						formDetails;
					if (
						!eventId ||
						!phone ||
						!college ||
						!teamName ||
						!registeredAt
					) {
						return NextResponse.json(
							{
								status: "error",
								data: "Missing either of event id, phone, college name, team name or registered at",
							},
							{
								status: 400,
							}
						);
					}
					// # check if a user exists with this email
					const userExists = await User.find({ email: userEmail });
					if (userExists.length < 1) {
						return NextResponse.json(
							{
								status: "error",
								data: "User does not exist",
							},
							{
								status: 404,
							}
						);
					}
					// # if the user exists, register them
					await Registration.insertOne({
						eventId,
						phone,
						college,
						registeredAt,
						teamName,
						userId: userExists[0]._id,
					});
					return NextResponse.json(
						{
							status: "success",
							data: "User registered successfully",
						},
						{
							status: 200,
						}
					);
				}
			} else {
				return NextResponse.json(
					{
						status: "error",
						data: "Missing the user token",
					},
					{
						status: 401,
					}
				);
			}
		}
		// # validate the token first
		try {
			jwt.verify(token, secret);
		} catch (error) {
			return NextResponse.json(
				{
					status: "error",
					data: "Invalid user token",
				},
				{
					status: 401,
				}
			);
		}
		// * since the token is correct, get the user id
		const { id } = jwt.decode(token, secret);
		// # since the user token is present, add the user directly
		const { phone, college, teamName, registeredAt } = otherData;
		if (!eventId || !phone || !college || !teamName || !registeredAt) {
			return NextResponse.json(
				{
					status: "error",
					data: "Missing either of event id, phone, college, team name or registered id",
				},
				{
					status: 404,
				}
			);
		}
		// # register the user
		await Registration.insertOne({
			eventId,
			phone,
			college,
			registeredAt,
			teamName,
			userId: id,
		});
		return NextResponse.json(
			{
				status: "success",
				data: "User registered successfully",
			},
			{
				status: 200,
			}
		);
	} catch (error) {
		console.error("Error in registering user:", error);
		return NextResponse.json(
			{
				status: "error",
				data: "Unknown error",
			},
			{
				status: 500,
			}
		);
	}
};
