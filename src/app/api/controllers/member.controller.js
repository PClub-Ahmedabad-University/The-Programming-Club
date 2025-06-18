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
        folder: "members",
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

export const updateMemberById = async (id, data) => {
    await connectDB();
    
    if (data.pfpImage && data.pfpImage.startsWith('data:image')) {
        const uploadRes = await cloudinary.uploader.upload(data.pfpImage, {
            folder: "members",
            resource_type: "image",
        });
        data.pfpImage = uploadRes.secure_url;
    }
    
    const updatedMember = await Member.findByIdAndUpdate(
        id,
        { $set: data },
        { new: true, runValidators: true }
    );
    
    if (!updatedMember) {
        throw new Error("Member not found or update failed");
    }
    
    return { message: "Member updated successfully", member: updatedMember };
}