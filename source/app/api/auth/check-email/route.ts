import { NextResponse } from "next/server";
import dbConnect from "../../../lib/mongodb";
import User from "../../../lib/models/User";

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

    // Return whether the email exists
    return NextResponse.json({ exists: !!user });
  } catch (error) {
    console.error("Email check error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again later." },
      { status: 500 }
    );
  }
}