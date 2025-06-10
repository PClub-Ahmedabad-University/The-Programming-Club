import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URI || 'redis://localhost:6379', {
    maxRetriesPerRequest: 3,
    retryStrategy: (times) => {
        if (times > 3) {
            console.error('Max retries reached. Could not connect to Redis.');
            return null; // Stop retrying after 3 attempts
        }
        return Math.min(times * 100, 2000); // Exponential backoff up to 2s
    }
});

redis.on('error', (err) => {
    console.error('Redis error:', err);
});

redis.on('connect', () => {
    console.log('Connected to Redis');
});

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