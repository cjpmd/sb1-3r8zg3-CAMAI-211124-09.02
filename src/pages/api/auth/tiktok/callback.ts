import { type NextApiRequest, type NextApiResponse } from "next";
import { prisma } from "@/server/db";
import { TIKTOK_CLIENT_KEY } from "@/lib/tiktokClient";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { code, state } = req.query;

  if (!code || typeof code !== "string") {
    return res.status(400).json({ message: "Missing code parameter" });
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch(
      "https://open-api.tiktok.com/oauth/access_token/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_key: TIKTOK_CLIENT_KEY,
          client_secret: process.env.TIKTOK_CLIENT_SECRET!,
          code,
          grant_type: "authorization_code",
        }),
      }
    );

    const tokenData = await tokenResponse.json();

    if (!tokenData.access_token) {
      throw new Error("Failed to get access token");
    }

    // Get user info
    const userResponse = await fetch(
      "https://open-api.tiktok.com/oauth/userinfo/",
      {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      }
    );

    const userData = await userResponse.json();

    // Create or update user in database
    const user = await prisma.user.upsert({
      where: { tiktokId: userData.open_id },
      create: {
        tiktokId: userData.open_id,
        name: userData.display_name,
        image: userData.avatar_url,
        tiktokAccessToken: tokenData.access_token,
        tiktokRefreshToken: tokenData.refresh_token,
      },
      update: {
        name: userData.display_name,
        image: userData.avatar_url,
        tiktokAccessToken: tokenData.access_token,
        tiktokRefreshToken: tokenData.refresh_token,
      },
    });

    // Redirect to app with success
    res.redirect(
      `/auth/success?provider=tiktok&userId=${user.id}`
    );
  } catch (error) {
    console.error("TikTok auth error:", error);
    res.redirect("/auth/error?provider=tiktok");
  }
}
