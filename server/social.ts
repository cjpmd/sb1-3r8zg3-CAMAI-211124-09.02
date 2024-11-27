import express from 'express';
import multer from 'multer';
import { SocialPlatform } from '../src/types/social';
import { Instagram, TikTok, YouTube, Facebook } from './platforms';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Handle OAuth token exchange
router.post('/token', async (req, res) => {
  try {
    const { code, platform } = req.body;
    let tokenData;

    switch (platform) {
      case 'instagram':
        tokenData = await Instagram.exchangeToken(code);
        break;
      case 'tiktok':
        tokenData = await TikTok.exchangeToken(code);
        break;
      case 'youtube':
        tokenData = await YouTube.exchangeToken(code);
        break;
      case 'facebook':
        tokenData = await Facebook.exchangeToken(code);
        break;
      default:
        throw new Error('Invalid platform');
    }

    res.json(tokenData);
  } catch (error) {
    console.error('Token exchange error:', error);
    res.status(500).json({ error: 'Failed to exchange token' });
  }
});

// Handle content upload
router.post('/upload', upload.fields([
  { name: 'file', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 }
]), async (req, res) => {
  try {
    const { platform, title, description, tags, location, scheduledTime, visibility } = req.body;
    const file = req.files['file'][0];
    const thumbnail = req.files['thumbnail']?.[0];

    let result;
    switch (platform as SocialPlatform) {
      case 'instagram':
        result = await Instagram.upload({
          file,
          thumbnail,
          title,
          description,
          tags,
          location,
          scheduledTime,
          visibility
        });
        break;
      case 'tiktok':
        result = await TikTok.upload({
          file,
          title,
          description,
          tags,
          scheduledTime,
          visibility
        });
        break;
      case 'youtube':
        result = await YouTube.upload({
          file,
          thumbnail,
          title,
          description,
          tags,
          scheduledTime,
          visibility
        });
        break;
      case 'facebook':
        result = await Facebook.upload({
          file,
          thumbnail,
          title,
          description,
          tags,
          location,
          scheduledTime,
          visibility
        });
        break;
      default:
        throw new Error('Invalid platform');
    }

    res.json(result);
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

export default router;
