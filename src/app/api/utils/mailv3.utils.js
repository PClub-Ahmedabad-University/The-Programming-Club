export const runtime = "nodejs";
/**
 * Send an email using Brevo (via REST API)
 * @param {string|string[]} to - Recipient(s) email address
 * @param {string} subject - Email subject
 * @param {string} message - HTML body
 * @returns {Promise<object>} - Brevo API response
 */
export async function sendMail(to, subject, message) {
  try {
    if (!process.env.brevoKey || !process.env.brevoMail) {
      throw new Error("Missing brevoKey or brevoMail in environment");
    }
    
    const payload = {
      sender: { email: process.env.brevoMail },
      to: Array.isArray(to) ? to.map(email => ({ email })) : [{ email: to }],
      subject,
      htmlContent: message,
    };

    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "content-type": "application/json",
        "api-key": process.env.brevoKey,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Brevo API error");
    }

    return { success: true, data };
  } catch (error) {
    console.error("Email send error:", error);
    return { success: false, error: error.message || error };
  }
}
