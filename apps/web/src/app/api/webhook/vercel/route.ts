import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Vercel API 测试接口
 * 模拟通过vercel创建项目，处理所有可能的情况
 * @param request 
 * @returns 
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { githubUrl } = body;

    // 验证请求参数
    if (!githubUrl) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required parameter: githubUrl"
        },
        { status: 400 }
      );
    }

    // 验证 GitHub URL 格式
    const githubRegex = /^(?:https?:\/\/)?github\.com\/(?<owner>[^/]+)\/(?<name>[a-zA-Z0-9._-]+?)(?:[/?#]|$)/;
    const match = githubUrl.toLowerCase().match(githubRegex);

    if (!match?.groups) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid GitHub URL format"
        },
        { status: 400 }
      );
    }

    const { owner, name } = match.groups;

    // 模拟不同的测试场景
    const testScenario = request.nextUrl.searchParams.get('scenario') || 'success';

    switch (testScenario) {
      case 'success':
        // 成功创建项目
        return NextResponse.json({
          success: true,
          data: {
            project: {
              id: `prj_${owner}_${name}_${Date.now()}`,
              name: name,
              description: `A ${name} project imported from GitHub`,
              owner: owner,
              repository: {
                type: 'github',
                repo: `${owner}/${name}`,
                repoId: `${owner}/${name}`,
                productionBranch: 'main',
                deployHooks: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
              targets: {
                production: {
                  url: `https://${name}-${owner}.vercel.app`,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                },
                preview: {
                  url: `https://${name}-${owner}-preview.vercel.app`,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                }
              },
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
          }
        });

      case 'unauthorized':
        // 未授权错误
        return NextResponse.json(
          {
            success: false,
            error: "Unauthorized: Invalid or missing token"
          },
          { status: 401 }
        );

      case 'forbidden':
        // 禁止访问错误
        return NextResponse.json(
          {
            success: false,
            error: "Forbidden: Insufficient permissions"
          },
          { status: 403 }
        );

      case 'not_found':
        // 仓库不存在
        return NextResponse.json(
          {
            success: false,
            error: "Repository not found or access denied"
          },
          { status: 404 }
        );

      case 'conflict':
        // 项目已存在
        return NextResponse.json(
          {
            success: false,
            error: "Project already exists"
          },
          { status: 409 }
        );

      case 'rate_limit':
        // 速率限制
        return NextResponse.json(
          {
            success: false,
            error: "Rate limit exceeded"
          },
          { status: 429 }
        );

      case 'server_error':
        // 服务器错误
        return NextResponse.json(
          {
            success: false,
            error: "Internal server error"
          },
          { status: 500 }
        );

      case 'timeout':
        // 超时错误
        return NextResponse.json(
          {
            success: false,
            error: "Request timeout"
          },
          { status: 408 }
        );

      case 'invalid_repo':
        // 无效仓库（私有仓库或无权限）
        return NextResponse.json(
          {
            success: false,
            error: "Repository is private or access denied"
          },
          { status: 403 }
        );

      case 'empty_response':
        // 空响应
        return NextResponse.json({
          success: true,
          data: null
        });

      case 'malformed_response':
        // 格式错误的响应
        return NextResponse.json({
          success: true,
          data: {
            project: {
              // 缺少必需的 id 字段
              name: name,
              description: "Malformed response"
            }
          }
        });

      default:
        // 默认成功响应
        return NextResponse.json({
          success: true,
          data: {
            project: {
              id: `prj_${owner}_${name}_${Date.now()}`,
              name: name,
              description: `A ${name} project imported from GitHub`,
              owner: owner,
              repository: {
                type: 'github',
                repo: `${owner}/${name}`,
                repoId: `${owner}/${name}`,
                productionBranch: 'main',
                deployHooks: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
              targets: {
                production: {
                  url: `https://${name}-${owner}.vercel.app`,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                },
                preview: {
                  url: `https://${name}-${owner}-preview.vercel.app`,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                }
              },
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
          }
        });
    }

  } catch (error) {
    // 处理 JSON 解析错误
    return NextResponse.json(
      {
        success: false,
        error: "Invalid JSON in request body"
      },
      { status: 400 }
    );
  }
}

/**
 * GET 方法用于测试接口状态
 */
export async function GET() {
  return NextResponse.json({
    message: "Vercel API Test Endpoint",
    description: "This is a test endpoint for simulating Vercel API responses",
    usage: {
      method: "POST",
      body: {
        githubUrl: "https://github.com/owner/repo"
      },
      queryParams: {
        scenario: "success|unauthorized|forbidden|not_found|conflict|rate_limit|server_error|timeout|invalid_repo|empty_response|malformed_response"
      }
    },
    examples: [
      {
        description: "成功创建项目",
        url: "/api/callback/vercel?scenario=success",
        method: "POST",
        body: {
          githubUrl: "https://github.com/vercel/next.js"
        }
      },
      {
        description: "未授权错误",
        url: "/api/callback/vercel?scenario=unauthorized",
        method: "POST",
        body: {
          githubUrl: "https://github.com/vercel/next.js"
        }
      },
      {
        description: "仓库不存在",
        url: "/api/callback/vercel?scenario=not_found",
        method: "POST",
        body: {
          githubUrl: "https://github.com/nonexistent/repo"
        }
      }
    ]
  });
}