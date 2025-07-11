import mongoose from 'mongoose';

const userSchema = mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    enrollmentNumber: {
        type: String,
        required: true,
    },
    role: {
        type: String,
    },
    codechefHandle: {
        type: String,
        default: null,
    },
    codeforcesHandle: {
        type: String,
        default: null,
    },
    codeforcesRank: {
        type: String,
        default: "unrated",
    },
    codeforcesRating: {
        type: Number,
        default: 0,
    },
    registeredEvents: [{
        type: mongoose.Schema.Types.ObjectId,
    }]
},{timestamps:true});

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;