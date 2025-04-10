import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import User from '../../../lib/models/User';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../api/auth/[...nextauth]/route';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authorized
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { userId } = await request.json();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Gebruiker ID is vereist' },
        { status: 400 }
      );
    }
    
    // Connect to database
    await dbConnect();
    
    // Allow users to delete their own account, or admins to delete any account
    const isAdmin = session.user.role === 'beheerder';
    const isSelf = session.user.id === userId;
    
    if (!isAdmin && !isSelf) {
      return NextResponse.json(
        { error: 'Je hebt geen toestemming om deze gebruiker te verwijderen' },
        { status: 403 }
      );
    }
    
    // Prevent deleting the last beheerder account
    if (isAdmin) {
      const user = await User.findById(userId);
      
      if (user && user.role === 'beheerder') {
        const beheerderCount = await User.countDocuments({ role: 'beheerder' });
        
        if (beheerderCount <= 1) {
          return NextResponse.json(
            { error: 'Kan de laatste beheerder niet verwijderen' },
            { status: 400 }
          );
        }
      }
    }
    
    // Delete user
    const deletedUser = await User.findByIdAndDelete(userId);
    
    if (!deletedUser) {
      return NextResponse.json(
        { error: 'Gebruiker niet gevonden' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      message: 'Gebruiker succesvol verwijderd' 
    });
    
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Fout bij verwijderen van gebruiker' },
      { status: 500 }
    );
  }
}