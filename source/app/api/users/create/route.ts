import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import User from '../../../lib/models/User';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    // Check if request is multipart form data
    const contentType = req.headers.get('content-type');
    if (!contentType || !contentType.includes('multipart/form-data')) {
      return NextResponse.json(
        { message: 'Content type must be multipart/form-data' },
        { status: 400 }
      );
    }

    const formData = await req.formData();
    
    // Extract user data
    const name = formData.get('name') as string;
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const role = formData.get('role') as string;
    const functionTitle = formData.get('function') as string;
    const phoneNumber = formData.get('phoneNumber') as string;
    
    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: 'Name, email, and password are required' },
        { status: 400 }
      );
    }
    
    await dbConnect();
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: 'Email already in use' },
        { status: 400 }
      );
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Handle profile picture if provided
    const profilePicture = formData.get('profilePicture') as File;
    let profilePictureData: {
      filename: string | null;
      contentType: string | null;
      data: string | null;
    } = {
      filename: null,
      contentType: null,
      data: null,
    };
    
    if (profilePicture) {
      profilePictureData = {
        filename: profilePicture.name,
        contentType: profilePicture.type,
        data: Buffer.from(await profilePicture.arrayBuffer()).toString('base64')
      };
    }
    
    // Create user
    const newUser = await User.create({
      name,
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role,
      function: functionTitle,
      phoneNumber,
      profilePicture: profilePictureData,
    });
    
    return NextResponse.json(
      { message: 'User created successfully', user: newUser },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { message: 'Error creating user' },
      { status: 500 }
    );
  }
}