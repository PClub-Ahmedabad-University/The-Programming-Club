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
    
    try {
        // First, get the current role to ensure we have all fields
        const existingRole = await RecruitmentRole.findById(id);
        if (!existingRole) {
            return {
                statusCode: StatusCodes.NOT_FOUND,
                message: "Recruitment role not found"
            };
        }

        // Create update object with existing data and merge with new data
        const updateData = {
            title: data.title !== undefined ? data.title : existingRole.title,
            description: data.description !== undefined ? data.description : existingRole.description,
            google_form: data.google_form !== undefined ? data.google_form : existingRole.google_form,
            isRecruitmentOpen: data.isRecruitmentOpen !== undefined 
                ? data.isRecruitmentOpen 
                : existingRole.isRecruitmentOpen,
            image: existingRole.image // Default to existing image
        };

        console.log('Update data before image processing:', updateData);

        // Handle image upload if a new image is provided
        if (data.image && data.image.startsWith('data:image')) {
            console.log('Uploading new image to Cloudinary...');
            const uploadRes = await cloudinary.uploader.upload(data.image, {
                folder: "recruitment",
                resource_type: "image",
            });
            updateData.image = uploadRes.secure_url;
            console.log('Image uploaded:', updateData.image);
        } else if (data.image) {
            // If image is being updated to a URL (not base64)
            updateData.image = data.image;
        }

        console.log('Final update data:', updateData);
        
        // Update the role with all fields
        const updatedRole = await RecruitmentRole.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        ).lean();

        if (!updatedRole) {
            console.error('Failed to update role with id:', id);
            return {
                statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
                message: "Failed to update recruitment role"
            };
        }
        
        console.log('Successfully updated role:', JSON.stringify(updatedRole, null, 2));
        return {
            statusCode: StatusCodes.OK,
            message: "Recruitment role updated successfully",
            data: updatedRole
        };
    } catch (error) {
        console.error('Error in updateRecruitmentRole:', error);
        return {
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            message: error.message || 'Error updating recruitment role'
        };
    }
}

export const deleteRecruitmentRole = async (id) => {
    await connectDB();
    const deletedRole = await RecruitmentRole.findByIdAndDelete(id);
    if (!deletedRole) {
        return {
            statusCode: StatusCodes.NOT_FOUND,
            message: "Recruitment role not found or already deleted"
        };
    }
    return {
        statusCode: StatusCodes.OK,
        message: "Recruitment role deleted successfully"
    };
}

export default {
    createRecruitmentRole,
    getAllRecruitmentRoles,
    getRecruitmentRoleById,
    updateRecruitmentRole,
    deleteRecruitmentRole
};

