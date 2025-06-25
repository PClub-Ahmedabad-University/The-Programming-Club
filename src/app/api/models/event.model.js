import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
	{
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
			default: "",
		},
		date: {
			type: Date,
			required: true,
		},
		time: {
			type: String,
			required: false,
		},
		duration: {
			type: String,
			required: false,
		},
		capacity: {
			type: String,
			required: false,
		},
		location: {
			type: String,
			required: true,
		},
		registrationOpen: {
			type: Boolean,
			required: true,
		},
		more_details: {
			type: String,
			required: true,
		},
		status: {
			type: String,
			required: true,
			enum: ["Completed", "Not Completed", "On Going", "Upcoming", "Other"],
		},
		type: {
			type: String, // CP, DEV, FUN, etc.
			required: true,
			enum: ["CP", "DEV", "FUN"],
		},
		winners: [
			{
				_id: { type: mongoose.Schema.Types.ObjectId, auto: true },
				name: { type: String },
				image: { type: String },
				description: { type: String },
			},
		],
		formLink: {
			type: String,
			required: false,
		},
		imageUrl: {
			type: String,
			required: true,
		},
	},
	{ timestamps: true }
);

// Check if the model exists before creating it
const Event = mongoose.models.Event || mongoose.model("Event", eventSchema);

export default Event;
