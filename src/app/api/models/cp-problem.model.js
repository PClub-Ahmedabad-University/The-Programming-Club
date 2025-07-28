import mongoose from "mongoose";

const cpProblemSchema = new mongoose.Schema({
    problemId: {
        type: String, 
        required: true,
        unique: true
    },
    title: {
        type: String,
        required: true
    },
    link: {
        type: String,
        required: true,
        validate: {
            validator: function(v) {
                return /^https?:\/\//.test(v);
            },
            message: 'Link must be a valid URL'
        }
    },
    postedAt: {
        type: Date,
        default: Date.now
    },
    solution: {
        type: String,
        default: null
    },
    submittedUsers: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        submittedAt: {
            type: Date,
            default: Date.now
        },
        verdict: {
            type: String,
            enum: ["AC", "WA", "TLE", "RE", "CE", "Pending"],
            default: "Pending"
        }
    }],
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

cpProblemSchema.index({ postedAt: -1 });
cpProblemSchema.index({ "submittedUsers.userId": 1 });

const CPProblem = mongoose.models.CPProblem || mongoose.model("CPProblem", cpProblemSchema);

export default CPProblem;