import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import User from '../../../lib/models/User';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../api/auth/[...nextauth]/route';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authorized (beheerder or developer)
    if (!session || !session.user || !['beheerder', 'developer'].includes(session.user.role as string)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get form data
    const formData = await request.formData();
    
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const email = formData.get('email') as string;
    const role = formData.get('role') as string;
    const functionTitle = formData.get('function') as string;
    const phoneNumber = formData.get('phoneNumber') as string;
    const password = formData.get('password') as string;
    const profilePicture = formData.get('profilePicture') as File | null;
    
    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { error: 'Verplichte velden ontbreken' },
        { status: 400 }
      );
    }
    
    // Connect to database
    await dbConnect();
    
    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email is al in gebruik' },
        { status: 400 }
      );
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user object
    const userData: any = {
      name: `${firstName} ${lastName}`,
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: role || 'user',
      function: functionTitle || null,
      phoneNumber: phoneNumber || null,
    };
    
    // Process profile picture if exists
    if (profilePicture) {
      const buffer = Buffer.from(await profilePicture.arrayBuffer());
      const base64Data = buffer.toString('base64');
      
      userData.profilePicture = {
        data: base64Data,
        contentType: profilePicture.type,
        filename: profilePicture.name
      };
    }
    
    // Create user
    const newUser = new User(userData);
    await newUser.save();
    
    return NextResponse.json({ 
      message: 'Gebruiker succesvol aangemaakt',
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });
    
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Fout bij maken van gebruiker' },
      { status: 500 }
    );
  }
}