import { Resend } from "resend";

const resend = new Resend(process.env.resendKey);

/**
 * Send an email using Resend
 * @param {string|string[]} to - Recipient(s) email address
 * @param {string} subject - Email subject
 * @param {string} text - Plain text body
 * @param {JSX.Element} [react] - Optional React component for HTML template
 * @returns {Promise<object>} - Resend API response
 */
// import emailjs from "@emailjs/nodejs";

// export async function sendMail(to, subject, message) {
//   try {
//     if (
//       !process.env.EMAILJS_SERVICE_ID ||
//       !process.env.EMAILJS_TEMPLATE_ID ||
//       !process.env.EMAILJS_PUBLIC_KEY ||
//       !process.env.EMAILJS_PRIVATE_KEY
//     ) {
//       throw new Error("Missing EmailJS configuration in environment variables");
//     }

//     const data = await emailjs.send(
//       process.env.EMAILJS_SERVICE_ID,
//       process.env.EMAILJS_TEMPLATE_ID,
//       {
//         to: to,
//         subject: subject,
//         html: message,
//       },
//       {
//         publicKey: process.env.EMAILJS_PUBLIC_KEY,
//         privateKey: process.env.EMAILJS_PRIVATE_KEY,
//       }
//     );

//     return { success: true, data };
//   } catch (error) {
//     console.error("EmailJS send error:", error);
//     return {
//       success: false,
//       error: error.text || error.message || error,
//     };
//   }
// }


export async function sendMail(to, subject, message) {
  try {
    if (!process.env.resendKey || !process.env.resendMail) {
      throw new Error("Missing resendKey or resendMail in environment");
    }

    const data = await resend.emails.send({
      from: process.env.resendMail, 
      to,
      subject,
      html: message, 
    });

    return { success: true, data };
  } catch (error) {
    console.error("Email send error:", error);
    return { success: false, error: error.message || error };
  }
}