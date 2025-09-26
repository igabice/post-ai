import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { sendInviteToTeamAdmin } from "@/services/invites";
import { createTransporter } from "@/lib/nodemailer";
import { getAdminDb } from "@/lib/firebase-admin";

export async function POST(request: Request) {
  const { teamId, inviteeEmail } = await request.json();

  if (!teamId || !inviteeEmail) {
    return NextResponse.json(
      { error: "Missing teamId or inviteeEmail" },
      { status: 400 }
    );
  }

  try {
    // 1. Create invitation in Firestore using Admin SDK
    // const adminDb = getAdminDb();
    // const invitationId = await sendInviteToTeamAdmin(
    //   adminDb,
    //   teamId,
    //   inviteeEmail
    // );

    // 2. Get the transporter
    const { transporter, testAccount } = await createTransporter();

    // 3. Construct the invitation link
    const origin = request.headers.get("origin") || "http://localhost:3000";
    const inviteLink = `${origin}/accept-invite?token=${"invitationId"}`;

    // 4. Send the email
    const info = await transporter.sendMail({
      from: '"Content Compass" <dev@dataulinzi.com>',
      to: inviteeEmail,
      subject: "You have been invited to join a team on Content Compass",
      text: `Click here to accept your invitation: ${inviteLink}`,
      html: `
        <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
          <h1 style="color: #333;">Content Compass</h1>
          <p>You have been invited to join a team on Content Compass.</p>
          <p>Click <a href="${inviteLink}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">here</a> to accept your invitation.</p>
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #777;">
            <p>Follow us on social media:</p>
            <p>
              <a href="#" style="margin: 0 5px; text-decoration: none; color: #777;">Twitter</a> |
              <a href="#" style="margin: 0 5px; text-decoration: none; color: #777;">Facebook</a> |
              <a href="#" style="margin: 0 5px; text-decoration: none; color: #777;">Instagram</a> |
              <a href="#" style="margin: 0 5px; text-decoration: none; color: #777;">TikTok</a> |
              <a href="#" style="margin: 0 5px; text-decoration: none; color: #777;">LinkedIn</a>
            </p>
            <p>&copy; ${new Date().getFullYear()} Content Compass. All rights reserved.</p>
          </div>
        </div>
      `,
    });

    console.log("Message sent: %s", info.messageId);

    let previewUrl = null;
    if (testAccount) {
      // Preview only available when sending through an Ethereal account
      previewUrl = nodemailer.getTestMessageUrl(info);
      console.log("Preview URL: %s", previewUrl);
    }

    return NextResponse.json({ success: true, previewUrl });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to send invitation" },
      { status: 500 }
    );
  }
}
