import dbConnect from '../mongodb';
import UserVerification from '../models/UserVerification';

export async function cleanupExpiredVerifications() {
  try {
    await dbConnect();
    
    // Delete verification records that have expired and not been verified
    const result = await UserVerification.deleteMany({
      expires: { $lt: new Date() },
      verified: false
    });
    
    console.log(`Cleaned up ${result.deletedCount} expired verification records`);
    
    return result;
  } catch (error) {
    console.error('Error cleaning up expired verifications:', error);
    throw error;
  }
}