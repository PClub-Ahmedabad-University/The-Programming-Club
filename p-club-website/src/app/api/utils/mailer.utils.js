import nodemailer from "nodemailer";

const transport = nodemailer.createTransport({
	host: process.env.MAIL_HOST,
	port: process.env.MAIL_PORT,
	secure: process.env.NODE_ENV !== "development",
	auth: {
		user: process.env.MAIL_USER,
		password: process.env.MAIL_PASS,
	},
});

export async function sendMail(to, subject, message) {
	return await transport.sendMail({
		from: process.env.MAIL_USER,
		to,
		subject,
		html: message,
	});
}
