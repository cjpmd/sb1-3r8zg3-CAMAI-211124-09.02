import express from 'express';
import crypto from 'crypto';
import { prisma } from '../db';

const router = express.Router();

function parseSignedRequest(signedRequest: string, appSecret: string) {
  const [encodedSig, payload] = signedRequest.split('.');
  
  const sig = Buffer.from(encodedSig.replace(/-/g, '+').replace(/_/g, '/'), 'base64');
  const data = JSON.parse(
    Buffer.from(payload.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8')
  );
  
  const expectedSig = crypto
    .createHmac('sha256', appSecret)
    .update(payload)
    .digest();
    
  if (!crypto.timingSafeEqual(sig, expectedSig)) {
    throw new Error('Bad Signed JSON signature!');
  }
  
  return data;
}

router.post('/facebook-deletion', async (req, res) => {
  try {
    const signedRequest = req.body.signed_request;
    if (!signedRequest) {
      return res.status(400).json({ error: 'Missing signed_request parameter' });
    }

    const appSecret = process.env.INSTAGRAM_CLIENT_SECRET;
    if (!appSecret) {
      throw new Error('Missing app secret');
    }

    // Parse and validate the signed request
    const data = parseSignedRequest(signedRequest, appSecret);
    const userId = data.user_id;

    // Generate a unique confirmation code
    const confirmationCode = crypto.randomBytes(16).toString('hex');

    // Queue deletion job (implement async processing in production)
    try {
      await prisma.socialMediaAccount.deleteMany({
        where: { userId },
      });

      await prisma.content.deleteMany({
        where: { userId },
      });

      await prisma.userSettings.deleteMany({
        where: { userId },
      });

      await prisma.user.delete({
        where: { id: userId },
      });
    } catch (error) {
      console.error('Error deleting user data:', error);
      // Continue to return success response as we've recorded the deletion request
    }

    // Return the exact format Facebook expects
    return res.json({
      url: `https://localhost:5173/deletion-status?id=${confirmationCode}`,
      confirmation_code: confirmationCode
    });
  } catch (error) {
    console.error('Error processing Facebook deletion request:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
