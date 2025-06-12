import mongoose from 'mongoose';

const userSchema = mongoose.Schema({
    email: {
        type: String,
        required: true,
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
        required: true
    },
    role: {
        type: String,
    },
    registeredEvents: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'events'
    }]
},{timestamps:true});

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;