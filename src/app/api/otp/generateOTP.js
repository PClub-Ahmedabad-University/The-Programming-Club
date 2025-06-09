import Redis from 'ioredis';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

const redis = new Redis(process.env.REDIS_URI || 'redis://localhost:6379', {
    maxRetriesPerRequest: 3,
    retryStrategy: (times) => {
        if (times > 3) {
            console.error('Max retries reached. Could not connect to Redis.');
            return null; 
        }
        return Math.min(times * 100, 2000); 
    }
});

redis.on('error', (err) => {
    console.error('Redis error:', err);
});

redis.on('connect', () => {
    console.log('Connected to Redis');
});

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const generateOTP = async(email) => {
    const otp = crypto.randomInt(100000, 999999).toString();

    await redis.setex(email, 300, otp);

    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'PClub verification',
        text: `Your otp is ${otp}. It will expire in 5 minutes.`,
    });
    return true;
}

export default generateOTP;