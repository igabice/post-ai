import nodemailer from "nodemailer";

// This function creates a Nodemailer transporter.
// For development, it uses an Ethereal test account.
// For production, you should replace this with your actual email service provider's settings.
export const createTransporter = async () => {
  const useTestAccount = process.env.NODE_ENV !== 'production' && !process.env.EMAIL_SERVER_USER;

  if (useTestAccount) {
    const testAccount = await nodemailer.createTestAccount();
    console.warn(
      "WARNING: Using Ethereal test account. Configure EMAIL_SERVER_USER in .env.local to use a real email provider."
    );
    return {
      transporter: nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      }),
      testAccount,
    };
  }

  // --- PRODUCTION EMAIL CONFIGURATION ---
  return {
    transporter: nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: Number(process.env.EMAIL_SERVER_PORT),
      secure: process.env.EMAIL_SERVER_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    }),
  };
};
