import connectDB from '@/app/api/lib/db';
import User from '@/app/api/models/user.model';

export default async function verifyUser(req) {
    try {
        await connectDB();
        const userId = req.userId;
        const user = await User.findById(userId);
        if (!user || user?.role !== 'admin') {
            return { success: false, error: 'Unauthorized' };
        }
        return { success: true, user };
    } catch (error) {
        return { success: false, error: 'Unauthorized' };
    }
}
