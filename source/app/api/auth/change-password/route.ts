import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/authOptions";
import dbConnect from "../../../lib/mongodb";
import User from "../../../lib/models/User";
import { compare, hash } from "bcryptjs";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
    }

    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Beide wachtwoorden zijn vereist" }, { status: 400 });
    }

    await dbConnect();

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "Gebruiker niet gevonden" }, { status: 404 });
    }

    const passwordMatch = await compare(currentPassword, user.password);
    if (!passwordMatch) {
      return NextResponse.json({ error: "Huidig wachtwoord is onjuist" }, { status: 400 });
    }

    const hashedPassword = await hash(newPassword, 12);
    user.password = hashedPassword;
    await user.save();

    return NextResponse.json({ message: "Wachtwoord succesvol bijgewerkt" });
  } catch (err) {
    console.error("Change password error:", err);
    return NextResponse.json({ error: "Interne serverfout" }, { status: 500 });
  }
}