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
    const { images, tweetId, userId } = req.body;

    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ error: 'No images provided' });
    }

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Upload all images to Cloudinary in parallel using Promise.all
    const uploadPromises = images.map((image, index) =>
      cloudinary.uploader.upload(image, {
        folder: `twitter-2.0/tweets/${userId}`,
        public_id: `${tweetId}_${index}_${Date.now()}`,
        resource_type: 'image',
        quality: 'auto:eco',
        format: 'webp',  // Convert to WebP for smaller file sizes
      })
    );

    const results = await Promise.all(uploadPromises);
    const imageUrls = results.map(result => result.secure_url);

    return res.status(200).json({
      imageUrls
    });
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return res.status(500).json({ error: 'Failed to upload images' });
  }
}
