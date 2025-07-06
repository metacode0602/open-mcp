import { claimsDataAccess, verificationsDataAccess } from "@repo/db/database/admin";
import { appsDataAccess } from "@repo/db/database/admin";
import { protectedProcedure, router } from "../../trpc";
import { zCreateClaimsFormSchema, zUpdateClaimSchema, zSearchClaimsSchema } from "@repo/db/types";
import { z } from "zod";

export const mcpClaimsRouter = router({
  // 发送验证码
  // 发送魔法链接
  sendMagicLink: protectedProcedure
    .input(z.object({
      email: z.string().email(),
      appId: z.string(),
    }))
    .mutation(async ({ input }) => {
      const { email, appId } = input;

      const value = await verificationsDataAccess.create(email, new Date(Date.now() + 5 * 60 * 1000));
      // 生成验证码
      console.info("[sendMagicLink] [code]", value);

      // 发送验证邮件
      // await sendValidationEmail({
      //   to: email,
      //   subject: "应用所有权验证码",
      //   code,
      // });

      return { success: true, identifier: value?.id as string };
    }),

  // 验证魔法链接
  verifyMagicLink: protectedProcedure
    .input(z.object({
      email: z.string().email(),
      code: z.string().length(6),
      appId: z.string(),
      identifier: z.string(),
    }))
    .mutation(async ({ input }) => {
      const { email, code, appId } = input;

      const verification = await verificationsDataAccess.getById(input.identifier);
      if (!verification || verification.identifier !== email) { //邮箱不匹配
        throw new Error("验证码不存在");
      }

      if (verification.value !== code) {
        throw new Error("验证码错误");
      }

      if (verification.expiresAt < new Date()) {
        throw new Error("验证码已过期");
      }

      return { success: true };
    }),

  // 创建应用提交
  create: protectedProcedure.input(zCreateClaimsFormSchema).mutation(async ({ ctx, input }) => {
    const app = await appsDataAccess.getById(input.appId);
    if (!app) {
      throw new Error("应用不存在");
    }

    return claimsDataAccess.create({
      ...input, appName: app.name, appSlug: app.slug,
      appType: app.type, userId: ctx.user.id, userName: ctx.user.name,
      userEmail: ctx.user.email, appIcon: app.icon,
      status: "pending",
      title: app.name,
    });
  }),

  // 更新应用提交
  update: protectedProcedure.input(zUpdateClaimSchema).mutation(async ({ input }) => {
    return claimsDataAccess.update(input.id, input);
  }),

  // 获取应用提交
  getById: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ input }) => {
    return claimsDataAccess.getById(input.id);
  }),

  // 搜索应用提交
  search: protectedProcedure.input(zSearchClaimsSchema).query(async ({ input, ctx }) => {
    input.userId = ctx.user.id
    // @ts-expect-error
    return claimsDataAccess.search(input);
  }),

}); 