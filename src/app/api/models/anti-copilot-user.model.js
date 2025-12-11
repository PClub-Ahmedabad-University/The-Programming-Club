import mongoose from 'mongoose';

const antiCopilotUserSchema = new mongoose.Schema({
    machineId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    rollNumber: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    clan: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        index: true
    },
    leaderName: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    currentStatus: {
        type: String,
        enum: ['enabled', 'disabled'],
        default: 'disabled'
    },
    registeredAt: {
        type: Date,
        default: Date.now
    },
    lastSeen: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Create compound index for efficient queries
antiCopilotUserSchema.index({ clan: 1, leaderName: 1 });

export default mongoose.models.AntiCopilotUser || mongoose.model('AntiCopilotUser', antiCopilotUserSchema);
