import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import connectDB from '../lib/db';
import generateOTP from '../otp/generateOTP.js';
import verifyOTP from '../otp/verifyOTP.js';

const secret = process.env.secret;

export const registerUser = async(data) => {
    await connectDB();

    const email = data.email;

    const domain = email.substring(email.lastIndexOf("@") + 1);

    if (domain != "ahduni.edu.in") {
        throw new Error('Sign in using Ahmedabad University Email');
    }

    await generateOTP(email);

    return { message: 'OTP sent to email. Please verify to complete registration.' };
}

export const verifyRegistrationOTP = async(data) => {
    await connectDB();

    const { email, otp, password, ...rest} = data;

    const verified = await verifyOTP(email, otp);

    if (!verified) {
        throw new Error('Invalid or incorrect OTP');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashedPassword, ...rest });

    return user;
}

export const loginUser = async(data) => {
    await connectDB();
    const user = await User.findOne({ email: data.email });
    if (!user) {
        throw new Error('User not found');
    }

    const isMatch = await bcrypt.compare(data.password, user.password);
    if (!isMatch) {
        throw new Error('Invalid credentials');
    }

    const token = jwt.sign({ id: user._id }, secret, { expiresIn: '7d' })
    return { token, user };
}

export const sendPasswordResetOTP = async(email) => {
    await connectDB();
    const user = await User.findOne({ email });

    if (!user) {
        throw new Error('User not found');
    }

    await generateOTP(email);
    return { message: 'OTP sent to email. Please verify to reset your password.' };
}

export const resetPasswordWithOTP = async(data) => {
    await connectDB();
    const { email, otp, newPassword } = data;
    
    const verified = await verifyOTP(email, otp);
    if (!verified) {
        throw new Error('Invalid or incorrect OTP');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const user = await User.findOneAndUpdate(
        { email },
        { password: hashedPassword },
        { new: true }
    );

    if (!user) {
        throw new Error('User not found');
    }

    return { message: 'Password reset successful '};
}