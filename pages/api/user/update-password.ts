import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { collection, query, where, getDocs, updateDoc } from 'firebase/firestore';
import bcrypt from 'bcryptjs';
import { db } from '../../../firebase';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions) as any;

  if (!session || !session.user?.email) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current password and new password are required' });
  }

  // Password validation
  if (newPassword.length < 8) {
    return res.status(400).json({ error: 'New password must be at least 8 characters long' });
  }

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
  if (!passwordRegex.test(newPassword)) {
    return res.status(400).json({ error: 'New password must contain at least one lowercase letter, one uppercase letter, and one number' });
  }

  if (currentPassword === newPassword) {
    return res.status(400).json({ error: 'New password must be different from current password' });
  }

  try {
    // Find current user document by email (case-insensitive)
    const currentUserQuery = query(collection(db, 'users'), where('email', '==', session.user.email?.toLowerCase()));
    const currentUserSnapshot = await getDocs(currentUserQuery);

    if (currentUserSnapshot.docs.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userDoc = currentUserSnapshot.docs[0];
    const userData = userDoc.data();

    // Check if user has a password (OAuth users don't have passwords)
    if (!userData.hashedPassword) {
      return res.status(400).json({ error: 'Cannot change password for OAuth users' });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, userData.hashedPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password in database
    await updateDoc(userDoc.ref, {
      hashedPassword: hashedNewPassword
    });

    return res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error updating password:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}