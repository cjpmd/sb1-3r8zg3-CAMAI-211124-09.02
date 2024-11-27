import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const deletionRouter = createTRPCRouter({
  deleteUserData: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Verify the user is deleting their own data
      if (input.userId !== ctx.session.user.id) {
        throw new Error("Unauthorized");
      }

      // Delete social media accounts
      await ctx.db.socialMediaAccount.deleteMany({
        where: {
          userId: input.userId,
        },
      });

      // Delete user content
      await ctx.db.content.deleteMany({
        where: {
          userId: input.userId,
        },
      });

      // Delete user settings
      await ctx.db.userSettings.deleteMany({
        where: {
          userId: input.userId,
        },
      });

      // Delete user account
      await ctx.db.user.delete({
        where: {
          id: input.userId,
        },
      });

      return { success: true };
    }),
});
