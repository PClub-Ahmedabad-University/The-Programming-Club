import Member from "../models/member.model";    
import jwt from 'jsonwebtoken'
import connectDB from "../lib/db";
import cloudinary from "../lib/cloudinary";
const secret = process.env.JWT_SECRET;

export const addMember = async(data) => {
    await connectDB();
    const image = data.pfpImage;
    if (image) {
        const uploadRes = await cloudinary.uploader.upload(image, {
        folder: "events",
        resource_type: "image",
        });
        data.pfpImage = uploadRes.secure_url;
    }
    const member = await Member.create(data);
    return member;
}
export const getAllMember = async () => {
    await connectDB();
    const members = await Member.find();
    if (!members || members.length === 0) {
        throw new Error("No members found");
    }
    return members;
}
export const getMemberById = async (id) => {
    await connectDB();
    const member = await Member.findById(id);
    if (!member) {
        throw new Error("Member not found");
    }
    return member;
}
export const deleteMemberById = async (id) => {
    await connectDB();
    const member = await Member.findByIdAndDelete(id);
    if (!member) {
        throw new Error("Member not found");
    }
    return { message: "Member deleted successfully" };
}