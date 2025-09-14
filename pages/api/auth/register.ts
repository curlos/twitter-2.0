import { NextApiRequest, NextApiResponse } from 'next';
import { addDoc, collection, query, where, getDocs } from 'firebase/firestore';
import bcrypt from 'bcrypt';
import { db } from '../../../firebase';
import cryptoRandomString from 'crypto-random-string';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ message: 'Email, password, and name are required' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long' });
  }

  try {
    // Check if user already exists
    const existingUserQuery = query(collection(db, 'users'), where('email', '==', email));
    const existingUserSnapshot = await getDocs(existingUserQuery);

    if (existingUserSnapshot.docs.length > 0) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Generate username from name
    const baseTag = name.split(' ').join('').toLowerCase();

    // Check if username is taken and generate unique one if needed
    const tagQuery = query(collection(db, 'users'), where('tag', '==', baseTag));
    const tagSnapshot = await getDocs(tagQuery);
    const userTag = tagSnapshot.docs.length === 0 ? baseTag : baseTag + cryptoRandomString({ length: 6 });

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user document
    const userDoc = {
      email,
      name,
      tag: userTag,
      hashedPassword,
      profilePic: '/assets/default_profile_pic.png',
      bio: null,
      location: null,
      website: null,
      banner: null,
      dateJoined: new Date()
    };

    await addDoc(collection(db, 'users'), userDoc);

    res.status(201).json({
      message: 'User created successfully',
      user: {
        email: userDoc.email,
        name: userDoc.name,
        tag: userDoc.tag
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}