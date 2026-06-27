import redis from "./redis";

export async function getCache(key) {
	const data = await redis.get(key);

	if (!data) {
		console.log("Cache miss for key: ", key);
		return null;
	}
	console.log("Cache hit for key: ", key);
	return JSON.parse(data);
}

export async function setCache(key, value, ttl = 3600) {
	await redis.set(
		key,
		JSON.stringify(value),
		"EX",
		ttl
	);
}