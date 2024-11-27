import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { env } from "~/env.mjs";

export const authRouter = createTRPCRouter({
  getConnectedAccounts: protectedProcedure
    .query(async ({ ctx }) => {
      const accounts = await ctx.db.socialMediaAccount.findMany({
        where: {
          userId: ctx.session.user.id,
        },
      });
      return accounts;
    }),

  handleInstagramCallback: protectedProcedure
    .input(
      z.object({
        code: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // Exchange code for access token
        const tokenResponse = await fetch(
          "https://api.instagram.com/oauth/access_token",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
              client_id: env.VITE_INSTAGRAM_CLIENT_ID,
              client_secret: env.INSTAGRAM_CLIENT_SECRET,
              grant_type: "authorization_code",
              redirect_uri: env.VITE_REDIRECT_URI,
              code: input.code,
            }),
          }
        );

        if (!tokenResponse.ok) {
          const error = await tokenResponse.text();
          console.error("Instagram token exchange failed:", error);
          throw new Error(`Failed to exchange code: ${error}`);
        }

        const tokenData = await tokenResponse.json();
        
        // Get long-lived access token
        const longLivedTokenResponse = await fetch(
          `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${env.INSTAGRAM_CLIENT_SECRET}&access_token=${tokenData.access_token}`
        );

        if (!longLivedTokenResponse.ok) {
          const error = await longLivedTokenResponse.text();
          console.error("Failed to get long-lived token:", error);
          throw new Error(`Failed to get long-lived token: ${error}`);
        }

        const longLivedTokenData = await longLivedTokenResponse.json();

        // Store the token in the database
        await ctx.db.socialMediaAccount.upsert({
          where: {
            userId_platform: {
              userId: ctx.session.user.id,
              platform: "INSTAGRAM",
            },
          },
          create: {
            userId: ctx.session.user.id,
            platform: "INSTAGRAM",
            accessToken: longLivedTokenData.access_token,
            tokenExpiry: new Date(Date.now() + longLivedTokenData.expires_in * 1000),
            accountId: tokenData.user_id.toString(),
          },
          update: {
            accessToken: longLivedTokenData.access_token,
            tokenExpiry: new Date(Date.now() + longLivedTokenData.expires_in * 1000),
            accountId: tokenData.user_id.toString(),
          },
        });

        return { success: true };
      } catch (error) {
        console.error("Instagram OAuth error:", error);
        throw error;
      }
    }),

  disconnectAccount: protectedProcedure
    .input(
      z.object({
        platform: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await ctx.db.socialMediaAccount.delete({
        where: {
          userId_platform: {
            userId: ctx.session.user.id,
            platform: input.platform,
          },
        },
      });

      return { success: true };
    }),
});
