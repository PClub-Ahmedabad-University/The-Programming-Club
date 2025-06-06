import mongoose from 'mongoose';

const contactUsQuerySchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        match: [/.+\@.+\..+/, 'Please fill a valid email address']
    },
    message: {
        type: String,
        required: true
    }
}, { 
    timestamps: true
});

export default mongoose.models.ContactUsQuery || mongoose.model('ContactUsQuery', contactUsQuerySchema);