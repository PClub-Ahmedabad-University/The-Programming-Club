import connectDB from "../lib/db";
import Like from "@/app/api/models/likes.model";

export const createLike = async (req, res) => {
    try {
        await connectDB();
        const { userId, blogId } = req.body;
        const like = await Like.create({ userId, blogId });
        res.status(200).json({data:like,message:"Created successfully"});
    } catch (error) {
        res.status(500).json({error: error.message});
    }
};

export const deleteLike = async (req, res) => {
    try {
        await connectDB();
        const { userId, blogId } = req.body;
        const like = await Like.deleteOne({ userId, blogId });
        res.status(200).json({data:like,message:"Deleted successfully"});
    } catch (error) {
        res.status(500).json({error: error.message});
    }
};
