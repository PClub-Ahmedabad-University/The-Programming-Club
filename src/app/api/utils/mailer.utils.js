import nodemailer from "nodemailer";

const mailDetails = {
	host: "smtp.gmail.com",
	port: 465,
	secure: true,
	user: process.env.EMAIL_USER,
	password: process.env.EMAIL_PASS,
};

function envPresent() {
	if (Object.values(mailDetails).some((ele) => ele === null)) {
		console.error("Missing node mailer environment variables");
		return false;
	}
	return true;
}

const transport = nodemailer.createTransport({
	host: mailDetails.host,
	port: mailDetails.secure ? mailDetails.port : 587,
	secure: mailDetails.secure,
	auth: {
		user: mailDetails.user,
		pass: mailDetails.password,
	},
	tls: {
		rejectUnauthorized: false, // <--- ONLY for development/testing!
	},
});

export async function sendMail(to, subject, message) {
	if (!envPresent()) {
		return null;
	}
	return await transport.sendMail({
		from: mailDetails.user,
		to,
		subject,
		html: message,
	});
}
