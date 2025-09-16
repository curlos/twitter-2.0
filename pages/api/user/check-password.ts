import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../firebase';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = await getServerSession(req, res, authOptions) as any;

  if (!session || !session.user?.email) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Find current user document by email
    const currentUserQuery = query(collection(db, 'users'), where('email', '==', session.user.email));
    const currentUserSnapshot = await getDocs(currentUserQuery);

    if (currentUserSnapshot.docs.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userDoc = currentUserSnapshot.docs[0];
    const userData = userDoc.data();

    // Check if user has a password (OAuth users don't have passwords)
    const hasPassword = !!userData.hashedPassword;

    return res.status(200).json({ hasPassword });
  } catch (error) {
    console.error('Error checking user password:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}