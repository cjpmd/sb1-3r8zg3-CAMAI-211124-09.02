import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
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

export const dataDeletionRouter = createTRPCRouter({
  handleDataDeletion: publicProcedure
    .input(
      z.object({
        signed_request: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const appSecret = process.env.INSTAGRAM_CLIENT_SECRET;
        if (!appSecret) {
          throw new Error('Missing app secret');
        }

        // Parse and validate the signed request
        const data = parseSignedRequest(input.signed_request, appSecret);
        const userId = data.user_id;

        // Delete user data from database
        await ctx.db.socialMediaAccount.deleteMany({
          where: { userId },
        });

        await ctx.db.content.deleteMany({
          where: { userId },
        });

        await ctx.db.userSettings.deleteMany({
          where: { userId },
        });

        await ctx.db.user.delete({
          where: { id: userId },
        });

        // Return the required response format with HTTPS URL
        return {
          url: process.env.VITE_DATA_DELETION_URL || 'https://localhost:5173/data-deletion',
          confirmation_code: userId,
          status: "success"
        };
      } catch (error) {
        console.error('Error processing data deletion:', error);
        return {
          url: process.env.VITE_DATA_DELETION_URL || 'https://localhost:5173/data-deletion',
          status: "error"
        };
      }
    }),
});
