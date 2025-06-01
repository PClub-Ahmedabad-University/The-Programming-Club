import mongoose from "mongoose";

const eventSchema = mongoose.Schema({
	title: {
		type: String,
		required: true,
	},
	description: {
		type: String,
		required: true,
	},
	rules: {
		type: String,
	},
	date: {
		type: Date,
		required: true,
	},
	location: {
		type: String,
		required: true,
	},
	registrationOpen: {
		type: Boolean,
		required: true,
	},
	imageUrl: {
		type: String,
		required: true,
	},
	more_details: {
		type: String,
		required: true,
	},
});

const Event = mongoose.model("Event", eventSchema);

export default Event;
