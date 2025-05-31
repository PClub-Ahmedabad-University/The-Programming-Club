import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import connectDB from '../lib/db';

const secret = process.env.secret;

export const registerUser = async(data) => {
    await connectDB();
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await User.create({ ...data, password: hashedPassword });
    return user;
}

export const loginUser = async(data) => {
    await connectDB();
    const user = await User.findOne({ email: data.email });
    if (!user) {
        throw new Error('User not found');
    }

    const isMatch = await bcrypt.compare(data.password, user.password);
    if (!isMatch) {
        throw new Error('Invalid credentials');
    }

    const token = jwt.sign({ id: user._id }, secret, { expiresIn: '7d' })
    return { token, user };
}