import mongoose from 'mongoose';

const antiCopilotEventSchema = new mongoose.Schema({
    machineId: {
        type: String,
        required: true,
        index: true
    },
    name: {
        type: String,
        required: true
    },
    rollNumber: {
        type: String,
        required: true,
        index: true
    },
    clan: {
        type: String,
        required: true,
        lowercase: true,
        index: true
    },
    leaderName: {
        type: String,
        required: true,
        index: true
    },
    status: {
        type: String,
        enum: ['enabled', 'disabled'],
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now,
        index: true
    }
}, {
    timestamps: true
});

// Create compound indexes for efficient queries
antiCopilotEventSchema.index({ machineId: 1, timestamp: -1 });
antiCopilotEventSchema.index({ clan: 1, timestamp: -1 });

export default mongoose.models.AntiCopilotEvent || mongoose.model('AntiCopilotEvent', antiCopilotEventSchema);
