import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import connectDB from "../lib/db";
import generateOTP from "../otp/generateOTP.js";
import verifyOTP from "../otp/verifyOTP.js";

const secret = process.env.JWT_SECRET;
export const isUnique = async(data) => {
	const user = await User.findOne({ email: data.email });
	if(user) {
		throw new Error("Sign in using Ahmedabad University Email");
	}
};
export const registerUser = async (data) => {
	await connectDB();

	const email = data.email;

	const domain = email.substring(email.lastIndexOf("@") + 1);

	if (domain != "ahduni.edu.in") {
		throw new Error("Sign in using Ahmedabad University Email");
	}
	const user = await User.findOne({ email: data.email });
	if(user) {
		throw new Error("Email already exists");
	}
	
	await generateOTP(email);

	return {
		message: "OTP sent to email. Please verify to complete registration.",
	};
};

export const verifyRegistrationOTP = async (data) => {
	await connectDB();

	const { email, otp, password, ...rest } = data;

	const verified = await verifyOTP(email, otp);

	if (!verified) {
		throw new Error("Invalid or incorrect OTP");
	}

	const hashedPassword = await bcrypt.hash(password, 10);
	const user = await User.create({
		email,
		password: hashedPassword,
		...rest,
	});

	return user;
};

export const loginUser = async (data) => {
	await connectDB();
	const user = await User.findOne({ email: data.email });
	if (!user) {
		throw new Error("User not found");
	}

	const isMatch = await bcrypt.compare(data.password, user.password);
	if (!isMatch) {
		throw new Error("Invalid credentials");
	}

	const token = jwt.sign({ id: user._id, role: user.role }, secret, {
		expiresIn: "7d",
	});
	return { token, user };
};

export const sendPasswordResetOTP = async (email) => {
	await connectDB();
	const user = await User.findOne({ email });

	if (!user) {
		throw new Error("User not found");
	}

	await generateOTP(email);
	return {
		message: "OTP sent to email. Please verify to reset your password.",
	};
};

export const resetPasswordWithOTP = async (data) => {
	await connectDB();
	const { email, otp, newPassword } = data;

	const verified = await verifyOTP(email, otp);
	if (!verified) {
		throw new Error("Invalid or incorrect OTP");
	}

	const hashedPassword = await bcrypt.hash(newPassword, 10);
	const user = await User.findOneAndUpdate(
		{ email },
		{ password: hashedPassword },
		{ new: true }
	);

	if (!user) {
		throw new Error("User not found");
	}

	return { message: "Password reset successful " };
};

export const validateUser = async (headers) => {
	connectDB();
	const authHeader = headers.get("authorization");
	const unAuthorized = [
		{
			data: "Unauthorized",
		},
		{
			status: 401,
		},
	];
	if (!authHeader || !authHeader.startsWith("Bearer ")) {
		return unAuthorized;
	}
	const token = authHeader.split(" ")[1];
	if (!token) {
		return unAuthorized;
	}
	const jwtSecret = process.env.JWT_SECRET;
	if (!jwtSecret) {
		console.error("Missing JWT Secret! (auth/validate/validateUser)");
		return [
			{
				data: "Unknown Error Occurred!",
			},
			{
				status: 500,
			},
		];
	}
	let id, role;
	const invalidToken = [
		{
			data: "Invalid Token",
		},
		{
			status: 400,
		},
	];
	try {
		({ id, role } = jwt.verify(token, jwtSecret));
	} catch (error) {
		console.error("token not verified");
		return invalidToken;
	}
	if (!id || !role) {
		console.error("id or role missing in token");
		return invalidToken;
	}
	if(role === 'user'){
		console.error("user trying to access admin panel is not allwoed");
		return invalidToken;
	}
	const userExists = await User.find({ _id: id, role });
	if (userExists.length < 1) {
		console.error("user not found");
		return invalidToken;
	}
	return [
		{
			data: "Valid User",
		},
		{
			status: 200,
		},
	];
};
export const getUserRegisteredEvents = async (email) => {
    await connectDB();
    const user = await User.findOne({ email })
        .populate({
            path: 'registeredEvents',
            model: 'Event',
            select: '-__v -createdAt -updatedAt',
            options: { sort: { date: -1 } } 
        });

    if (!user) {
        throw new Error("User not found");
    }

    return user.registeredEvents || [];
};