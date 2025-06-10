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
			required: true
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
			type: String, // completed-> completed, not-completed -> not completed.//ongoing -> ongoing
			required: true,
		},
		type: {
			type: String, // CP, DEV, FUN...
			required: true,
		},
		winners: [
			{
			  _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
			  name: { type: String },
			  image: { type: String },
			  description: { type: String } 
			}
		],
		formLink: {
			type: String,
			required: false,
		},
		//add new above this
		imageUrl: {
			type: String,
			required: true,
		},
	},
	{ timestamps: true }
);

const Event = mongoose.models.Event || mongoose.model("Event", eventSchema);

export default Event;
