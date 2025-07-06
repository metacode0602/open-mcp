/**
 * Webhook回调测试示例
 * 用于测试 /api/callback/daily 接口
 */

export const testWebhookData = {
  event_type: 'repo_updated' as const,
  timestamp: new Date().toISOString(),
  data: {
    // 基本信息
    id: "123456789",
    full_name: "test-owner/test-repo",
    name: "test-repo",
    owner: "test-owner",
    owner_id: 12345,

    // 描述信息
    description: "这是一个测试仓库",
    description_zh: "This is a test repository",
    homepage: "https://example.com",

    // 统计信息
    stars: 100,
    forks: 20,
    contributor_count: 5,
    mentionable_users_count: 10,
    watchers_count: 50,
    pull_requests_count: 15,
    releases_count: 3,
    commit_count: 500,

    // 技术信息
    topics: ["javascript", "typescript", "react"],
    languages: [
      { name: "TypeScript", percentage: 60 },
      { name: "JavaScript", percentage: 30 },
      { name: "CSS", percentage: 10 }
    ],
    license_spdx_id: "MIT",
    default_branch: "main",

    // 时间信息
    created_at: "2023-01-01T00:00:00Z",
    pushed_at: "2024-01-01T00:00:00Z",
    last_commit: "2024-01-01T00:00:00Z",
    added_at: "2023-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",

    // 状态信息
    archived: false,

    // 资源信息
    icon_url: "https://example.com/icon.png",
    open_graph_image_url: "https://example.com/og-image.png",
    open_graph_image_oss_url: "https://oss.example.com/og-image.png",
    uses_custom_open_graph_image: true,

    // README内容
    readme_content: "# Test Repository\n\nThis is a test repository.",
    readme_content_zh: "# 测试仓库\n\n这是一个测试仓库。",

    // Release信息
    latest_release_name: "v1.0.0",
    latest_release_tag_name: "v1.0.0",
    latest_release_published_at: "2024-01-01T00:00:00Z",
    latest_release_url: "https://github.com/test-owner/test-repo/releases/tag/v1.0.0",
    latest_release_description: "First stable release",
    latest_release_description_zh: "第一个稳定版本",

    // 处理状态
    processing_status: {
      icon_processed: true,
      description_translated: true,
      readme_translated: true,
      og_image_processed: true,
      release_note_translated: true,
    },

    // 元数据
    meta: {
      task_name: "daily_repo_update",
      processed_at: new Date().toISOString(),
      processing_time_ms: 1500,
      success: true,
    },
  },
};

/**
 * 测试函数 - 发送测试请求
 */
export async function testWebhookCallback() {
  try {
    const response = await fetch('/api/callback/daily', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-webhook-signature': 'test-signature',
        'x-webhook-timestamp': new Date().toISOString(),
      },
      body: JSON.stringify(testWebhookData),
    });

    const result = await response.json();
    console.log('Webhook test result:', result);
    return result;
  } catch (error) {
    console.error('Test failed:', error);
    throw error;
  }
}

/**
 * 使用示例
 */
export async function exampleUsage() {
  console.log('开始测试webhook回调接口...');

  try {
    const result = await testWebhookCallback();

    if (result.success) {
      console.log('✅ 测试成功!');
      console.log(`- 仓库ID: ${result.data.repo_id}`);
      console.log(`- 快照ID: ${result.data.snapshot_id}`);
      console.log(`- 更新的应用数量: ${result.data.updated_apps_count}`);
      console.log(`- 处理时间: ${result.data.processed_at}`);
    } else {
      console.log('❌ 测试失败:', result.error);
    }
  } catch (error) {
    console.error('❌ 测试异常:', error);
  }
}

// 如果在浏览器环境中，可以这样调用：
// exampleUsage(); 