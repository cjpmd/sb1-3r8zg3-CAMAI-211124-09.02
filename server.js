const express = require('express');
const https = require('https');
const fs = require('fs');
const crypto = require('crypto');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Function to parse and validate Facebook's signed request
function parseSignedRequest(signedRequest, appSecret) {
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

// Facebook Data Deletion Callback Endpoint
app.post('/facebook-deletion', async (req, res) => {
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

    // Return the exact format Facebook expects
    return res.json({
      url: `https://localhost:3000/deletion-status?id=${confirmationCode}`,
      confirmation_code: confirmationCode
    });
  } catch (error) {
    console.error('Error processing Facebook deletion request:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Status check endpoint
app.get('/deletion-status', (req, res) => {
  const confirmationId = req.query.id;
  res.send(`Data deletion request ${confirmationId} is being processed`);
});

// Create HTTPS server
const options = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
};

https.createServer(options, app).listen(3000, () => {
  console.log('Server running on https://localhost:3000');
});
