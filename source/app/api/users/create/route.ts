import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import User from '../../../lib/models/User';
import UserVerification from '../../../lib/models/UserVerification';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { sendVerificationEmail } from '../../../lib/utils/verification-email';

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
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const role = formData.get('role') as string;
    let functionTitle = formData.get('function') as string;
    const phoneNumber = formData.get('phoneNumber') as string;

    // Validate required fields
    if (!firstName) {
      return NextResponse.json(
        { message: 'First name is required' },
        { status: 400 }
      );
    }

    if (!lastName) {
      return NextResponse.json(
        { message: 'Last name is required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }
    
    if (!firstName || !lastName || !email || !password) {
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

    // Check if there's a pending verification for this email
    const existingVerification = await UserVerification.findOne({ email });
    if (existingVerification) {
      return NextResponse.json(
        { message: 'Verification email already sent. Please check your inbox.' },
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
    
    // For specific roles, set function title to be the same as role
    if (['developer', 'vrijwilliger', 'stagiair'].includes(role)) {
      functionTitle = role;
    }
    
    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    
    // Set expiry to 24 hours from now
    const expires = new Date();
    expires.setHours(expires.getHours() + 24);
    
    // Create user verification entry
    await UserVerification.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role,
      function: functionTitle,
      phoneNumber,
      profilePicture: profilePictureData,
      verificationToken,
      expires,
      verified: false
    });
    
    // Send verification email
    await sendVerificationEmail(email, firstName, verificationToken);
    
    return NextResponse.json(
      { 
        message: 'Verification email sent. The user needs to verify their email before the account is created.',
        status: 'pending_verification'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { message: 'Error creating user' },
      { status: 500 }
    );
  }
}