import nodemailer from "nodemailer";

const gmailUser = process.env.GMAIL_OAUTH_USER!;

function createTransporter() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: gmailUser,
      clientId: process.env.GMAIL_CLIENT_ID,
      clientSecret: process.env.GMAIL_CLIENT_SECRET,
      refreshToken: process.env.GMAIL_REFRESH_TOKEN,
    },
  });
}

export async function sendMail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const transporter = createTransporter();

  await transporter.sendMail({
    from: `"TJPing" <${gmailUser}>`,
    to,
    subject,
    html,
  });
}
