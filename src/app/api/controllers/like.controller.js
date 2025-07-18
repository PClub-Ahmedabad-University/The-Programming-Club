import connectDB from "../lib/db";
import Like from "../models/likes.model";

export async function createLike(blogId, userId) {
  try {
    await connectDB();
    
    // Input validation
    if (!blogId || !userId) {
      throw new Error('Missing required fields');
    }

    // Check if like already exists
    const existingLike = await Like.findOne({ blogId, userId });
    if (existingLike) {
      return { 
        success: false, 
        message: 'Already liked',
        like: existingLike
      };
    }

    // Create new like
    const like = await Like.create({ blogId, userId });
    return { 
      success: true, 
      message: 'Like added successfully',
      like 
    };
  } catch (error) {
    console.error('Error in createLike:', error);
    if (error.name === 'ValidationError') {
      throw new Error('Invalid input data');
    }
    throw error;
  }
}

export const deleteLike = async (blogId, userId) => {
  try {
    await connectDB();
    
    // Input validation
    if (!blogId || !userId) {
      throw new Error('Missing required fields');
    }

    // Delete the like
    const result = await Like.deleteOne({ userId, blogId });
    
    if (result.deletedCount === 0) {
      return { 
        success: false, 
        message: 'Like not found' 
      };
    }

    return { 
      success: true, 
      message: 'Like removed successfully',
      deletedCount: result.deletedCount 
    };
  } catch (error) {
    console.error('Error in deleteLike:', error);
    throw error;
  }
};
