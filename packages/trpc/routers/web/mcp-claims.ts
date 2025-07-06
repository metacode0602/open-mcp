import { appsDataAccess, claimsDataAccess } from "@repo/db/database/admin";

import { protectedProcedure, router } from "../../trpc";
import { z } from "zod";
import { randomInt } from "crypto";

// 生成6位随机验证码
const generateCode = () => randomInt(100000, 999999).toString();

export const mcpClaimsRouter = router({

  // 发送魔法链接
  sendMagicLink: protectedProcedure
    .input(z.object({
      email: z.string().email(),
      appId: z.string(),
    }))
    .mutation(async ({ input }) => {
      const { email, appId } = input;

      // 生成验证码
      const code = generateCode();
      console.info("[sendMagicLink] [code]", code);

      // 发送验证邮件
      // await sendValidationEmail({
      //   to: email,
      //   subject: "应用所有权验证码",
      //   code,
      // });

      return { success: true };
    }),

  // 验证魔法链接
  verifyMagicLink: protectedProcedure
    .input(z.object({
      email: z.string().email(),
      code: z.string().length(6),
      appId: z.string(),
    }))
    .mutation(async ({ input }) => {
      const { email, code, appId } = input;

      return { success: true };
    }),

  // 创建所有权申请
  create: protectedProcedure
    .input(z.object({
      appId: z.string(),
      email: z.string().email(),
      proofUrl: z.string().url(),
      proofType: z.enum(["email", "phone", "website", "other"]),
    }))
    .mutation(async ({ input, ctx }) => {
      // 确保用户已登录
      const app = await appsDataAccess.getById(input.appId);
      if (!app) {
        throw new Error("应用不存在");
      }
      // 设置当前用户ID
      const data = {
        ...input,
        appName: app.name,
        appSlug: app.slug,
        appType: app.type,
        appIcon: app.icon,
        userName: ctx.user.name,
        userEmail: input?.email,
        userId: ctx.user.id,
        status: "pending",
      };

      return claimsDataAccess.create(data);
    }),

  // 更新所有权申请
  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      proofUrl: z.string().url(),
      proofType: z.enum(["email", "phone", "website", "other"]),
    }))
    .mutation(async ({ input, ctx }) => {
      const { id, ...data } = input;

      // 获取当前申请
      const claim = await claimsDataAccess.getById(id);
      if (!claim) {
        throw new Error("申请不存在");
      }

      // 检查权限
      if (claim.userId !== ctx.user.id) {
        throw new Error("无权修改此申请");
      }

      // 只能修改待处理状态的申请
      if (claim.status !== "pending") {
        throw new Error("只能修改待处理状态的申请");
      }

      return claimsDataAccess.update(id, data);
    }),

  // 获取所有权申请
  getById: protectedProcedure
    .input(z.object({
      id: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      // 获取当前申请
      const claim = await claimsDataAccess.getById(input.id);
      if (!claim) {
        throw new Error("申请不存在");
      }
      // 检查权限
      if (claim.userId !== ctx.user.id) {
        throw new Error("申请不存在");
      }
      // 返回申请详情
      return claim;
    }),

  // 搜索所有权申请
  search: protectedProcedure
    .input(z.object({
      status: z.enum(["pending", "approved", "rejected"]).optional(),
    }))
    .query(async ({ input, ctx }) => {
      // 如果登录，可以查看自己的所有申请
      return claimsDataAccess.search({
        ...input,
        userId: ctx.user?.id,
      });
    }),

  // 删除所有权申请
  delete: protectedProcedure
    .input(z.object({
      id: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { id } = input;

      // 获取当前申请
      const claim = await claimsDataAccess.getById(id);
      if (!claim) {
        throw new Error("申请不存在");
      }

      // 检查权限
      if (claim.userId !== ctx.user.id) {
        throw new Error("无权删除此申请");
      }

      return claimsDataAccess.delete(id);
    }),
}); 