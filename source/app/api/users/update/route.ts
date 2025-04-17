import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import User from '../../../lib/models/User';
import bcrypt from 'bcryptjs';

// Password validation function
function validatePassword(password: string) {
  const lengthValid = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  return {
    valid: lengthValid && hasNumber && hasSpecial,
    errors: {
      length: !lengthValid,
      number: !hasNumber,
      special: !hasSpecial
    }
  };
}

export async function PUT(req: NextRequest) {
  try {
    const formData = await req.formData();
    
    const userId = formData.get('userId') as string;
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const role = formData.get('role') as string;
    const functionTitle = formData.get('function') as string;
    const phoneNumber = formData.get('phoneNumber') as string;
    
    if (!userId) {
      return NextResponse.json(
        { message: 'User ID is required' },
        { status: 400 }
      );
    }
    
    await dbConnect();
    
    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }
    
    // Check if email is being changed and if it already exists
    const normalizedEmail = email.toLowerCase();
    if (email && normalizedEmail !== user.email) {
      const existingUser = await User.findOne({ email: normalizedEmail });
      if (existingUser) {
        return NextResponse.json(
          { message: 'Email already in use' },
          { status: 400 }
        );
      }
    }
    
    // Update user data
    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.email = normalizedEmail || user.email;
    user.role = role || user.role;
    user.function = functionTitle || user.function;
    user.phoneNumber = phoneNumber || user.phoneNumber;
    
    // Update password if provided
    if (password) {
      // Validate password
      const passwordCheck = validatePassword(password);
      if (!passwordCheck.valid) {
        // Create error message based on which rules failed
        let message = 'Password does not meet requirements: ';
        if (passwordCheck.errors.length) message += 'must be at least 8 characters; ';
        if (passwordCheck.errors.number) message += 'must contain at least one number; ';
        if (passwordCheck.errors.special) message += 'must contain at least one special character; ';
        
        return NextResponse.json(
          { message: message.trim() },
          { status: 400 }
        );
      }
      
      // Hash password
      user.password = await bcrypt.hash(password, 10);
    }
    
    // Save the updated user
    await user.save();
    
    return NextResponse.json(
      { message: 'User updated successfully', user },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { message: 'Error updating user' },
      { status: 500 }
    );
  }
}