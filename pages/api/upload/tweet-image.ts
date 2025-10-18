import { NextApiRequest, NextApiResponse } from 'next';
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_CLOUDINARY_API_KEY,
  api_secret: process.env.NEXT_CLOUDINARY_API_SECRET,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { image, tweetId, imageIndex, userId } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'No image provided' });
    }

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Upload to Cloudinary with compression and auto-format conversion
    const result = await cloudinary.uploader.upload(image, {
      folder: `twitter-2.0/tweets/${userId}`,
      public_id: `${tweetId}_${imageIndex}_${Date.now()}`,
      resource_type: 'image',
      quality: 'auto:eco',
      format: 'webp',  // Convert to WebP for smaller file sizes
    });

    return res.status(200).json({
      imageUrl: result.secure_url
    });
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return res.status(500).json({ error: 'Failed to upload image' });
  }
}
