import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URI);

const verifyOTP = async(email, otp) => {
    const storedOTP = await redis.get(email);

    if (!storedOTP) {
        return false;    
    }

    if (storedOTP != otp) {
        return false;    
    }

    await redis.del(email);

    return true; 
}

export default verifyOTP;