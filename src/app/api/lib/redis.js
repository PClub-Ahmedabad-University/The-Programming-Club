import Redis from "ioredis";
if (!process.env.REDIS_URI) {
	throw new Error("REDIS_URI is not defined");
}
const redis = new Redis(process.env.REDIS_URI, {
	maxRetriesPerRequest: 3,
	retryStrategy: (times) => {
		if (times > 3) {
			console.error("Max retries reached. Could not connect to Redis.");
		}
		return Math.min(times * 100, 2000);
	},
});

redis.on("error", (err) => {
	console.error("Redis error:", err);
});

redis.on("connect", () => {
	console.log("Connected to Redis");
});

export default redis;
