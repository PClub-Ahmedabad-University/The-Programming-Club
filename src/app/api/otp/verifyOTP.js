import redis from "../lib/redis";

const verifyOTP = async (email, otp) => {
	const storedOTP = await redis.get(email);
	console.log("otp for ", email, ":", storedOTP, "recived: ", otp);
	if (!storedOTP) {
		return false;
	}

	if (storedOTP != otp) {
		return false;
	}

	await redis.del(email);

	return true;
};

export default verifyOTP;
