import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { imageData } = req.body;
    const timestamp = Date.now();
    const filename = `generated-image-${timestamp}.png`;
    const imagePath = path.join(process.cwd(), 'public', 'images', filename);

    // Remove the data URL prefix
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
    
    // Save the file
    fs.writeFileSync(imagePath, base64Data, 'base64');

    // Return the public URL
    res.status(200).json({ url: `/images/${filename}` });
  } catch (error) {
    console.error('Error saving image:', error);
    res.status(500).json({ message: 'Error saving image' });
  }
} 