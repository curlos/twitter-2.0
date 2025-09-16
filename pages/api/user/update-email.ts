import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { collection, query, where, getDocs, updateDoc } from 'firebase/firestore';
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

  const { newEmail } = req.body;

  if (!newEmail) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(newEmail)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  if (newEmail === session.user.email) {
    return res.status(400).json({ error: 'New email must be different from current email' });
  }

  try {
    // Check if new email is already in use
    const emailCheckQuery = query(collection(db, 'users'), where('email', '==', newEmail));
    const emailCheckSnapshot = await getDocs(emailCheckQuery);

    if (emailCheckSnapshot.docs.length > 0) {
      return res.status(400).json({ error: 'Email is already in use' });
    }

    // Find current user document by email
    const currentUserQuery = query(collection(db, 'users'), where('email', '==', session.user.email));
    const currentUserSnapshot = await getDocs(currentUserQuery);

    if (currentUserSnapshot.docs.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userDoc = currentUserSnapshot.docs[0];
    await updateDoc(userDoc.ref, {
      email: newEmail
    });

    return res.status(200).json({ success: true, message: 'Email updated successfully' });
  } catch (error) {
    console.error('Error updating email:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}