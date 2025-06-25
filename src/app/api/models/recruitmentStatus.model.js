import mongoose from "mongoose";

const recruitmentStatusSchema = new mongoose.Schema({
    isRecruitmentOpen: { 
        type: Boolean, 
        required: true, 
        default: false 
    }
}, { timestamps: true });

const RecruitmentStatus = mongoose.models.RecruitmentStatus || 
                         mongoose.model("RecruitmentStatus", recruitmentStatusSchema);

export default RecruitmentStatus;
