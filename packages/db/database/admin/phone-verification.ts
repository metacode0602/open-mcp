import { eq } from "drizzle-orm"
import { db } from "../../index"
import { phoneVerificationCodes } from "../../schema"

// 生成6位随机验证码
const generateCode = () => Math.floor(Math.random() * 900000) + 100000

// 发送手机验证码
export async function sendPhoneCode(phone: string, age: number = 5): Promise<string> {
  // 生成验证码
  const code = generateCode().toString();

  // 保存验证码到数据库
  await db.insert(phoneVerificationCodes).values({
    phone,
    code,
    expiresAt: new Date(Date.now() + age * 60 * 1000), // 5分钟有效期
  })

  // TODO: 调用短信服务发送验证码
  // 这里仅返回验证码用于开发测试
  return code
}

// 验证手机验证码
export async function verifyPhoneCode(phone: string, code: string) {
  // 查找最新的验证码记录
  const record = await db.query.phoneVerificationCodes.findFirst({
    where: eq(phoneVerificationCodes.phone, phone),
    orderBy: (codes, { desc }) => [desc(codes.createdAt)],
  })

  // 验证码不存在或已过期
  if (!record || record.expiresAt < new Date()) {
    return false
  }

  // 验证码不匹配
  if (record.code !== code) {
    return false
  }

  // 验证成功后删除验证码记录
  await db.delete(phoneVerificationCodes).where(eq(phoneVerificationCodes.id, record.id))

  return true
} 