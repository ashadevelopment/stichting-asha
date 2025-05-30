import { NextResponse } from "next/server";

import dbConnect from "../../../lib/mongodb";
import User from "../../../lib/models/User";

import { hash } from "bcryptjs";

export async function POST(req: Request) {
  const { name, email, password } = await req.json();

  await dbConnect();
  const exists = await User.findOne({ email });
  if (exists) return NextResponse.json({ error: "Email already exists" }, { status: 400 });

  const hashedPassword = await hash(password, 12);
  const user = await User.create({ name, email, password: hashedPassword });

  return NextResponse.json({ user }, { status: 201 });
}