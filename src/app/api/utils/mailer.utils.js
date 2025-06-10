import nodemailer from "nodemailer";

const mailDetails = {
	host: process.env.MAIL_HOST,
	port: Number.parseInt(process.env.MAIL_PORT),
	secure: process.env.NODE_ENV !== "development",
	user: process.env.MAIL_USER,
	password: process.env.MAIL_PASS,
};

function envPresent() {
	console.log("mail details:", mailDetails);
	if (Object.values(mailDetails).some((ele) => ele === null)) {
		console.error("Missing mail environment variables");
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
