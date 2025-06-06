import ContactUsQuery from "../models/contact-us.model";
import connectDB from "../lib/db";
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const sendContactUsMail = async(data) => {
    await connectDB();
    const { name, email, message } = data;
    
    const query = await ContactUsQuery.create({
        name: name,
        email: email,
        message: message
    });

    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: 'drumil.b@ahduni.edu.in',
        subject: 'Contact Us Query',
        text: `Query received through Contact Us Form:\n
                FullName: ${name}\n
                Email: ${email}\n
                Message: ${message}`
    });

    return query;
}

export default sendContactUsMail;