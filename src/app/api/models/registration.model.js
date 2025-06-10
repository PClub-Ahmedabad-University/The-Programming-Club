import mongoose from "mongoose";

const registrationSchema = mongoose.Schema({
	userId: {
		type: String,
		required: true,
	},
	phone: {
		type: String,
		required: true,
	},
	college: {
		type: String,
		required: true,
	},
	teamName: {
		type: String,
		required: true,
	},
	registeredAt: {
		type: String,
		required: true,
	},
	eventId: {
		type: String,
		required: true,
	},
});

export default mongoose.models.Registration || mongoose.model("Registration", registrationSchema);
