# 阿里云OSS配置说明

## 环境变量配置

在 `apps/web/.env.local` 文件中添加以下配置：

```bash
# 阿里云OSS配置
ALIYUN_OSS_REGION=oss-cn-hangzhou
ALIYUN_ACCESS_KEY_ID=your_access_key_id
ALIYUN_ACCESS_KEY_SECRET=your_access_key_secret
ALIYUN_OSS_BUCKET=your_bucket_name

# 前端可访问的OSS配置（可选）
NEXT_PUBLIC_ALIYUN_OSS_BUCKET=your_bucket_name
NEXT_PUBLIC_ALIYUN_OSS_REGION=oss-cn-hangzhou
```

## 阿里云OSS设置步骤

1. **创建OSS Bucket**
   - 登录阿里云控制台
   - 进入对象存储OSS服务
   - 创建一个新的Bucket
   - 选择合适的区域（建议与服务器区域一致）

2. **创建AccessKey**
   - 进入RAM访问控制
   - 创建用户并分配OSS权限
   - 获取AccessKey ID和AccessKey Secret

3. **配置Bucket权限**
   - 设置Bucket为公共读（如果需要直接访问文件）
   - 或者配置CORS规则允许跨域访问

## 功能说明

### 上传流程

1. 前端选择文件后，调用 `/api/assets/oss` POST接口获取临时上传凭证
2. 使用临时凭证直接上传文件到OSS
3. 上传完成后调用GET接口通知服务器

### 支持的文件类型

- 图片：JPEG, PNG, GIF, WebP, SVG
- 文档：PDF, TXT, DOC, DOCX

### 文件大小限制

- 默认限制：10MB
- 可在代码中调整

### 安全特性

- 使用临时上传凭证，有效期15分钟
- 文件类型和大小验证
- 唯一文件名生成，避免冲突

## 使用示例

```typescript
import { uploadToOSS } from "@/lib/utils";

// 上传文件
const result = await uploadToOSS(file, "app-logos");
if (result.success) {
  console.log("上传成功:", result.url);
} else {
  console.error("上传失败:", result.error);
}
```
