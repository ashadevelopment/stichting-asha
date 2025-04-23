import { NextRequest, NextResponse } from "next/server";
import dbConnect from "../../../lib/mongodb";
import PasswordReset from "../../../lib/models/PasswordReset";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: "Token is required" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Find the token record
    const resetRequest = await PasswordReset.findOne({
      token,
      used: false,
      expires: { $gt: new Date() }
    });

    if (!resetRequest) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 400 }
      );
    }

    // Token is valid
    return NextResponse.json({ valid: true });
  } catch (error) {
    console.error("Token verification error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again later." },
      { status: 500 }
    );
  }
}