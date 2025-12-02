import { Resend } from "resend";
import { env } from "~/env";

const resend = new Resend(env.RESEND_API_KEY);

// Simple email template
function otpEmailTemplate(code: string) {
  return `
    <div style="font-family: sans-serif; padding: 20px;">
      <h2>Your Login Code</h2>
      <p>Hello,</p>
      <p>Your OTP for logging into <strong>Digital Menu</strong> is:</p>
      <h1 style="font-size: 32px; letter-spacing: 4px;">${code}</h1>
      <p>This code will expire in 10 minutes.</p>
      <p>If you did not request this code, you can safely ignore this email.</p>
      <br/>
      <p>Best regards,<br/>Digital Menu Team</p>
    </div>
  `;
}

export async function sendOtpEmail(to: string, code: string) {
  try {
    await resend.emails.send({
      from: env.EMAIL_FROM, // can be onboarding@resend.dev during development
      to,
      subject: "Your Digital Menu Login Code",
      html: otpEmailTemplate(code),
    });

    return { success: true };
  } catch (error) {
    console.error("Resend email error:", error);
    return { success: false, error };
  }
}
