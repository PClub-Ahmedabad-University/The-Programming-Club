import { NextRequest, NextResponse } from "next/server";
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URI);

export default handler = async(req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).json({ message: 'Email and OTP are required' });
    }

    try {
        const storedOTP = await redis.get(email);

        if (!storedOTP) {
            return res.status(400).json({ message: 'OTP not found' });
        }

        if (storedOTP != opt) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        await redis.del(email);

        return res.status(200).json({ message: 'OTP verified successfully' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Eror verifying OTP' });
    }
}