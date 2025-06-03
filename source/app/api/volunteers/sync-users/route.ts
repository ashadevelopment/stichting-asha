// source/app/api/volunteers/sync-users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import Volunteer from '../../../lib/models/Volunteer';
import User from '../../../lib/models/User';
import bcrypt from 'bcryptjs';

// Function to generate a random password
function generateRandomPassword(length: number = 12): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}

// POST - Sync existing approved volunteers as users
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    // Get all approved volunteers
    const approvedVolunteers = await Volunteer.find({ status: 'approved' });
    
    const results: {
        processed: number;
        created: number;
        skipped: number;
        errors: { email: string; error: string }[];
    } = {
        processed: 0,
        created: 0,
        skipped: 0,
        errors: []
    };

    for (const volunteer of approvedVolunteers) {
      results.processed++;
      
      try {
        // Check if user already exists
        const existingUser = await User.findOne({ 
          email: volunteer.email.toLowerCase() 
        });
        
        if (existingUser) {
          results.skipped++;
          console.log(`User already exists for volunteer: ${volunteer.email}`);
          continue;
        }

        // Generate temporary password
        const tempPassword = generateRandomPassword();
        const hashedPassword = await bcrypt.hash(tempPassword, 12);

        // Create user document
        const userData = {
          firstName: volunteer.firstName,
          lastName: volunteer.lastName,
          name: `${volunteer.firstName} ${volunteer.lastName}`,
          email: volunteer.email.toLowerCase(),
          password: hashedPassword,
          role: 'vrijwilliger',
          function: 'vrijwilliger',
          phoneNumber: volunteer.phoneNumber || '',
          isVerified: true,
          createdFromVolunteer: true,
          volunteerId: volunteer._id
        };

        await User.create(userData);
        results.created++;
        
        console.log(`Created user for approved volunteer: ${volunteer.email}`);
        
      } catch (error: any) {
        console.error(`Error creating user for volunteer ${volunteer.email}:`, error);
        results.errors.push({
          email: volunteer.email,
          error: error.message
        });
      }
    }

    return NextResponse.json({
      message: 'Volunteer sync completed',
      results
    });

  } catch (error: any) {
    console.error('Error syncing volunteers:', error);
    return NextResponse.json(
      { error: 'Er is een fout opgetreden bij het synchroniseren van vrijwilligers' },
      { status: 500 }
    );
  }
}