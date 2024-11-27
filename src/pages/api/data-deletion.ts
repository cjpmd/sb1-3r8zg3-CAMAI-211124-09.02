import { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';

// Function to parse and validate Facebook's signed request
function parseSignedRequest(signedRequest: string, appSecret: string) {
  const [encodedSig, payload] = signedRequest.split('.');
  
  // Decode the signature
  const sig = Buffer.from(encodedSig.replace(/-/g, '+').replace(/_/g, '/'), 'base64');
  
  // Decode the payload
  const data = JSON.parse(
    Buffer.from(payload.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8')
  );
  
  // Confirm the signature
  const expectedSig = crypto
    .createHmac('sha256', appSecret)
    .update(payload)
    .digest();
    
  if (!crypto.timingSafeEqual(sig, expectedSig)) {
    throw new Error('Invalid signature');
  }
  
  return data;
}

// Process user data deletion
async function deleteUserData(userId: string) {
  try {
    // Queue deletion job or process directly
    // This is where you would implement your actual data deletion logic
    console.log(`Queued deletion for user ${userId}`);
    return true;
  } catch (error) {
    console.error('Error processing deletion:', error);
    return false;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const signedRequest = req.body.signed_request;
    if (!signedRequest) {
      return res.status(400).json({ error: 'Missing signed_request parameter' });
    }

    // Get app secret from environment variable
    const appSecret = process.env.INSTAGRAM_CLIENT_SECRET;
    if (!appSecret) {
      throw new Error('Missing app secret');
    }

    // Parse and validate the signed request
    const data = parseSignedRequest(signedRequest, appSecret);

    // Queue the deletion job
    const success = await deleteUserData(data.user_id);

    // Return the required response format
    return res.status(200).json({
      url: `${process.env.VITE_REDIRECT_URI}/api/data-deletion`,
      confirmation_code: data.user_id, // Use user_id as confirmation code
      status: success ? "success" : "error"
    });
  } catch (error) {
    console.error('Error processing request:', error);
    return res.status(500).json({
      error: 'Internal server error',
      status: "error"
    });
  }
}
