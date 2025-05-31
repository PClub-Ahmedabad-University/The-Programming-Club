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
});

const UserSchema = mongoose.model('UserSchema', userSchema);
export default UserSchema;