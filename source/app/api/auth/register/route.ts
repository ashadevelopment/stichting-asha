import { NextResponse } from "next/server";

import dbConnect from "../../../lib/mongodb";
import User from "../../../lib/models/User";

import { hash } from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    // Valideer invoer
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Naam, e-mail en wachtwoord zijn verplicht" },
        { status: 400 }
      );
    }

    // Zorg voor consistentie door de e-mail naar kleine letters te converteren
    const normalizedEmail = email.toLowerCase();

    await dbConnect();
    
    // Controleer of de gebruiker al bestaat
    const exists = await User.findOne({ email: normalizedEmail });
    if (exists) {
      return NextResponse.json(
        { error: "Email bestaat al" },
        { status: 400 }
      );
    }

    // Hash het wachtwoord
    const hashedPassword = await hash(password, 12);
    
    // Maak de gebruiker aan
    const user = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role: "user" // Standaard rol
    });

    // Verwijder wachtwoord uit de response
    const newUser = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role
    };

    return NextResponse.json({ user: newUser }, { status: 201 });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Er is een fout opgetreden bij het registreren" },
      { status: 500 }
    );
  }
}