import connectDB from "../lib/db";
import User from "../models/user.model";
import bcrypt from 'bcryptjs';
export const createNewAdmin = async(req) => {
    await connectDB();
    const data =  req.newAdmin;
    const cur = req.currentAdmin;
    const currentAdminReq = await User.findOne({email : cur.email});
    if(!currentAdminReq) {
        throw new Error('User not found');
    }
    const isMatch = await bcrypt.compare(cur.password, currentAdminReq.password);
    if (currentAdminReq.role !== 'admin') {
        throw new Error('Not authorized');
    }
    if (!isMatch) {
        throw new Error('Invalid credentials');
    }
    const hashedPass = await bcrypt.hash(data.password, 10);
    const newAdmin = await User.create({...data, password : hashedPass});
    return newAdmin;
}