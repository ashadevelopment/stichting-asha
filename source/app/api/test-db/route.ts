// Create a new file: app/api/test-db/route.ts
import { NextResponse } from "next/server";
import connectDB from "../../lib/mongodb";

export async function GET() {
  try {
    await connectDB();
    return NextResponse.json({ status: "Database connection successful" });
  } catch (error) {
    console.error("Database connection test failed:", error);
    return NextResponse.json(
      { error: "Database connection failed" },
      { status: 500 }
    );
  }
}