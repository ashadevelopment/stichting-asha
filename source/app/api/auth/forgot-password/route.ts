import { NextResponse } from "next/server";
import dbConnect from "../../../lib/mongodb";
import User from "../../../lib/models/User";
import PasswordReset from "../../../lib/models/PasswordReset";
import crypto from "crypto";
import { sendPasswordResetEmail } from "../../../lib/utils/email";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Normalize email to lowercase
    const normalizedEmail = email.toLowerCase();

    await dbConnect();

    // Find the user
    const user = await User.findOne({ email: normalizedEmail });

    // For security reasons, don't reveal if a user exists or not
    // We'll return a success message regardless

    // If the user exists, create a password reset token
    if (user) {
      // Generate a secure random token
      const resetToken = crypto.randomBytes(32).toString('hex');
      
      // Set expiry to 1 hour from now
      const expires = new Date();
      expires.setHours(expires.getHours() + 1);

      // Delete any existing reset tokens for this user
      await PasswordReset.deleteMany({ email: normalizedEmail });

      // Create a new reset token
      await PasswordReset.create({
        email: normalizedEmail,
        token: resetToken,
        expires,
        used: false,
      });

      // Get the base URL from environment or use a default
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;

      // Send the password reset email
      await sendPasswordResetEmail(normalizedEmail, resetUrl);
    }

    // Return success regardless of whether the email exists
    return NextResponse.json({ 
      message: "If an account with that email exists, a password reset link has been sent." 
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again later." },
      { status: 500 }
    );
  }
}