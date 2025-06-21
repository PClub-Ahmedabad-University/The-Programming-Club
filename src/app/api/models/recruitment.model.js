import mongoose from "mongoose";


const memberSchema = new mongoose.Schema({
    name: { type: String, required: true },
    linkedin: { type: String, required: true },
});

const leaderSchema = new mongoose.Schema({
    name: { type: String, required: true },
    linkedin: { type: String, required: true },
});

const recruitmentRoleSchema = new mongoose.Schema({
    title: { type: String, required: true },
    image: { type: String, required: true },
    google_form: { type: String, required: true },
    isRecruitmentOpen: { type: Boolean, default: false },
    leader: { type: leaderSchema, required: true },
    members: { type: [memberSchema], default: [] },
}, { timestamps: true });

const RecruitmentRole = mongoose.models.RecruitmentRole || mongoose.model("RecruitmentRole", recruitmentRoleSchema);

export default RecruitmentRole;
