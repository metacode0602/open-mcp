import { emailSubscriptionDataAccess, usersDataAccess } from "@repo/db/database/admin";
import { zCreateEmailSubscriptionSchema } from "@repo/db/types";
import { publicProcedure, router } from "../../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { sendVerificationEmail } from "@repo/email";

export const mcpSubscriptionsRouter = router({
  subscribe: publicProcedure
    .input(zCreateEmailSubscriptionSchema)
    .mutation(async ({ input }) => {
      try {
        // Check if email already exists
        const existing = await emailSubscriptionDataAccess.getByEmail(input.email);
        if (existing && existing.isVerified) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: '该邮箱已订阅',
          });
        }
        // 判断是否是注册用户的邮箱
        const user = await usersDataAccess.getByEmail(input.email);
        if (user) {
          input.userId = user.id;
        }
        const subscription = await emailSubscriptionDataAccess.create({
          ...input,
          // Set defaults if not provided
          utmSource: input.utmSource || "openmcp",
          utmMedium: input.utmMedium || "subscribe_form",
          utmCampaign: input.utmCampaign || "organic",
        });

        if (!subscription || !subscription.verificationToken) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: '订阅失败，请稍后重试',
          });
        }
        // TODO: Send verification email using email package
        await sendVerificationEmail(input.email, subscription.verificationToken);
        return subscription;
      } catch (error) {
        console.error('订阅失败:', error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '订阅失败，请稍后重试',
        });
      }
    }),

  verify: publicProcedure
    .input(z.object({
      token: z.string(),
    }))
    .mutation(async ({ input }) => {
      try {
        return await emailSubscriptionDataAccess.verify(input.token);
      } catch (error) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: '验证链接无效或已过期',
        });
      }
    }),

  unsubscribe: publicProcedure
    .input(z.object({
      email: z.string().email(),
      token: z.string(),
    }))
    .mutation(async ({ input }) => {
      try {
        const existing = await emailSubscriptionDataAccess.getByEmail(input.email);
        if (!existing) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: '该邮箱未订阅',
          });
        }
        if (existing.verificationToken !== input.token) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: '无效的退订链接',
          });
        }
        // Check if the token is expired
        const now = new Date();
        if (existing.verificationExpires && existing.verificationExpires < now) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: '退订链接已过期',
          });
        }
        // Proceed to delete the subscription
        return await emailSubscriptionDataAccess.delete(input.email);
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: '取消订阅失败，请稍后重试',
        });
      }
    }),
});