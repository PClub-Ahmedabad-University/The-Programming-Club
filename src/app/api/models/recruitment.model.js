import mongoose from "mongoose";

const recruitmentRoleSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    google_form: {
        type: String,
        required: true
    },
    isRecruitmentOpen: {
        type: Boolean,
        default: false
    },
    description: {
        type: String,
        required: true
    }
}, { timestamps: true });

const RecruitmentRole = mongoose.models.RecruitmentRole || mongoose.model("RecruitmentRole", recruitmentRoleSchema);

export default RecruitmentRole;
