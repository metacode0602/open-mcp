
import { createId } from "@paralleldrive/cuid2"
import { hash } from "bcrypt"
import { db } from "../index"
import * as schema from "../schema"

async function main() {
  console.log("🌱 开始初始化数据库...")

  // 清空现有数据（谨慎使用，仅用于开发环境）
  await clearDatabase()

  // 创建测试用户
  const userId = await createTestUser()

  // 创建模型库
  const modelIds = await createModels()

  // 创建仓库
  const repositoryIds = await createRepositories(userId)

  // 创建仓库模型
  await createRepositoryModels(repositoryIds, modelIds)

  // 创建打包任务
  await createPackagingJobs(userId, modelIds, repositoryIds)

  // 创建服务
  const serviceIds = await createServices(userId, repositoryIds)

  // 创建服务日志
  await createServiceLogs(serviceIds)

  // 创建服务指标
  await createServiceMetrics(serviceIds)

  // 创建部署状态
  await createDeployments(serviceIds)

  // 创建活动记录
  await createActivities(userId, serviceIds, repositoryIds)

  console.log("✅ 数据库初始化完成！")
}

async function clearDatabase() {
  console.log("🧹 清空现有数据...")

  // 按照依赖关系顺序删除数据
  await db.delete(schema.activities)
  await db.delete(schema.deployments)
  await db.delete(schema.serviceMetrics)
  await db.delete(schema.serviceLogs)
  await db.delete(schema.services)
  await db.delete(schema.packagingJobs)
  await db.delete(schema.repositoryModels)
  await db.delete(schema.repositories)
  await db.delete(schema.models)
  await db.delete(schema.phoneCodes)
  await db.delete(schema.verificationTokens)
  await db.delete(schema.sessions)
  await db.delete(schema.accounts)
  await db.delete(schema.users)
}

async function createTestUser() {
  console.log("👤 创建测试用户...")

  const userId = createId()

  await db.insert(schema.users).values({
    id: userId,
    name: "测试用户",
    email: "test@example.com",
    emailVerified: new Date(),
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=test",
    createdAt: new Date(),
    updatedAt: new Date(),
  })

  return userId
}

// 执行初始化
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("初始化失败:", error)
    process.exit(1)
  })

