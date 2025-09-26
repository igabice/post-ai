import nodemailer from "nodemailer";

// This function creates a Nodemailer transporter.
// For development, it uses an Ethereal test account.
// For production, you should replace this with your actual email service provider's settings.
export const createTransporter = async () => {
  // For development/testing, we'll create a test account on Ethereal
  if (process.env.NODE_ENV !== "production") {
    const testAccount = await nodemailer.createTestAccount();
    return {
      transporter: nodemailer.createTransport({
        host: "smtp.zoho.com",
        port: 465,
        secure: true,
        auth: {
          user: "dev@dataulinzi.com",
          pass: "CKRE88R9aC5w",
        },
        //  host: 'smtp.ethereal.email',
        // port: 587,
        // secure: false, // true for 465, false for other ports
        // auth: {
        //   user: testAccount.user,
        //   pass: testAccount.pass,
        // },
      }),
      testAccount,
    };
  }

  // --- PRODUCTION EMAIL CONFIGURATION ---
  // Replace this with your actual email service provider's configuration
  // Example for a generic SMTP provider:
  /*
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
  */

  // As a fallback for now, we'll still use Ethereal in production until configured.
  const testAccount = await nodemailer.createTestAccount();
  console.warn(
    "WARNING: Using Ethereal in production. Please configure a real email provider."
  );
  return {
    transporter: nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    }),
    testAccount,
  };
};
