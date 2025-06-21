import { StatusCodes } from 'http-status-codes';
import RecruitmentRole from "../models/recruitment.model";
import connectDB from "../lib/db";
import cloudinary from "../lib/cloudinary";

export const createRecruitmentRole = async (data) => {
    await connectDB();

    if (data.image && data.image.startsWith('data:image')) {
        const uploadRes = await cloudinary.uploader.upload(data.image, {
            folder: "recruitment",
            resource_type: "image",
        });
        data.image = uploadRes.secure_url;
    }

    const role = await RecruitmentRole.create(data);
    return {
        statusCode: StatusCodes.CREATED,
        data: role
    };
}

export const getAllRecruitmentRoles = async () => {
    try {
        await connectDB();
        console.log('Fetching all recruitment roles...');
        const roles = await RecruitmentRole.find().sort({ title: 1 });
        console.log('Fetched roles:', roles);
        
        if (!roles || roles.length === 0) {
            console.log('No recruitment roles found');
            return {
                statusCode: StatusCodes.OK,
                data: []
            };
        }
        
        return {
            statusCode: StatusCodes.OK,
            data: roles
        };
    } catch (error) {
        console.error('Error in getAllRecruitmentRoles:', error);
        throw {
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            message: error.message || 'Error fetching recruitment roles'
        };
    }
}

export const getRecruitmentRoleById = async (id) => {
    await connectDB();
    const role = await RecruitmentRole.findById(id);
    if (!role) {
        return {
            statusCode: StatusCodes.NOT_FOUND,
            message: "Recruitment role not found"
        };
    }
    return {
        statusCode: StatusCodes.OK,
        data: role
    };
}

export const updateRecruitmentRole = async (id, data) => {
    await connectDB();

    if (data.image && data.image.startsWith('data:image')) {
        const uploadRes = await cloudinary.uploader.upload(data.image, {
            folder: "recruitment",
            resource_type: "image",
        });
        data.image = uploadRes.secure_url;
    }

    const updatedRole = await RecruitmentRole.findByIdAndUpdate(
        id,
        { $set: data },
        { new: true, runValidators: true }
    );

    if (!updatedRole) {
        return {
            statusCode: StatusCodes.NOT_FOUND,
            message: "Recruitment role not found or update failed"
        };
    }

    return {
        statusCode: StatusCodes.OK,
        message: "Recruitment role updated successfully",
        data: updatedRole
    };
}

export const deleteRecruitmentRole = async (id) => {
    await connectDB();
    const deletedRole = await RecruitmentRole.findByIdAndDelete(id);
    if (!deletedRole) {
        return {
            statusCode: StatusCodes.NOT_FOUND,
            message: "Recruitment role not found"
        };
    }
    return {
        statusCode: StatusCodes.OK,
        message: "Recruitment role deleted successfully"
    };
}

export const addMemberToRole = async (roleId, memberData) => {
    await connectDB();
    const updatedRole = await RecruitmentRole.findByIdAndUpdate(
        roleId,
        { $push: { members: memberData } },
        { new: true, runValidators: true }
    );

    if (!updatedRole) {
        return {
            statusCode: StatusCodes.NOT_FOUND,
            message: "Failed to add member to role"
        };
    }

    return {
        statusCode: StatusCodes.OK,
        message: "Member added to role successfully",
        data: updatedRole
    };
}

export const removeMemberFromRole = async (roleId, memberId) => {
    await connectDB();
    const updatedRole = await RecruitmentRole.findByIdAndUpdate(
        roleId,
        { $pull: { members: { _id: memberId } } },
        { new: true }
    );

    if (!updatedRole) {
        return {
            statusCode: StatusCodes.NOT_FOUND,
            message: "Failed to remove member from role"
        };
    }

    return {
        statusCode: StatusCodes.OK,
        message: "Member removed from role successfully",
        data: updatedRole
    };
}

export const updateRoleLeader = async (roleId, leaderData) => {
    await connectDB();
    const updatedRole = await RecruitmentRole.findByIdAndUpdate(
        roleId,
        { $set: { leader: leaderData } },
        { new: true, runValidators: true }
    );

    if (!updatedRole) {
        return {
            statusCode: StatusCodes.NOT_FOUND,
            message: "Failed to update role leader"
        };
    }

    return {
        statusCode: StatusCodes.OK,
        message: "Role leader updated successfully",
        data: updatedRole
    };
}

export default {
    createRecruitmentRole,
    getAllRecruitmentRoles,
    getRecruitmentRoleById,
    updateRecruitmentRole,
    deleteRecruitmentRole,
    addMemberToRole,
    removeMemberFromRole,
    updateRoleLeader
};

