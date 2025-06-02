import { NextRequest, NextResponse } from "next/server";
import Redis from 'ioredis';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { printCustomRoutes } from "next/dist/build/utils";

const redis = new Redis(process.env.REDIS_URI);

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export default handler = async(req, res) => {
    const email = req.body();
    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }

    try {
        const otp = crypto.randomInt(100000, 999999).toString();

        await redis.setex(email, 300, otp);

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'PClub verification',
            text: `Your otp is ${otp}. It will expire in 5 minutes.`,
        });

        return res.status(200).json({ message: 'OTP sent to email' });
    } catch (error) {
        console.log(error);
        res.status(500).json({message: 'Error generating OTP' });
    }
}