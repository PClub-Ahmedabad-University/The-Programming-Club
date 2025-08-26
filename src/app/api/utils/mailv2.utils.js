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