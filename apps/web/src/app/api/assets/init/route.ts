import { appsDataAccess } from "@repo/db/database/admin";
import { categoriesDataAccess } from "@repo/db/database/admin";
import fs from "fs";
import { NextRequest } from "next/server";
import path from "path";

import categoryData from "./category.json";
import clientData from "./client.json";
export const dynamic = "force-dynamic";


const createCategory = async () => {
  // 创建分类
  for (const category of categoryData.categories) {
    const categoryData = {
      name: category.name,
      description: category.description,
      slug: category.slug,
      status: "online" as const,
      parentId: "auba6cjwd02xl9u53wukbv8l",
    };

    console.log("[GET] [category] data: ", categoryData);

    try {
      const createdCategory = await categoriesDataAccess.create(categoryData);
    } catch (error) {
      console.error("创建分类失败:", error, categoryData);
    }
  }
}

const createApps = async (cateogrySlug: string) => {
  const category = await categoriesDataAccess.getBySlug(cateogrySlug);
  if (!category) {
    console.error(`未找到分类: ${cateogrySlug}`);
    return;
  }

  const data = fs.readFileSync(path.join(process.cwd(), `src/app/api/assets/init/${cateogrySlug}.json`), "utf-8");
  const apps = JSON.parse(data);

  for (const app of apps.apps) {
    const appData = {
      name: app.name,
      description: app.description,
      slug: app.slug,
      categoryId: category.id,
      repoId: undefined,
      owner: undefined,
      type: "server" as const,
      source: "automatic" as const,
      status: "approved" as const,
      publishStatus: "online" as const,
      banner: app.banner?.[0],
      website: app.website,
      github: app.github,
      docs: app.docs,
      version: app.version,
      categoryIds: [category.id],
    };

    try {
      const response = await fetch(process.env.PROD_CREATE_API_URL || "http://localhost:3000/api/assets/mcp", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.PROD_CREATE_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          githubUrl: app.github,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        console.log("data", JSON.stringify(data, null, 2));
        const project = data.data.project;
        appData.repoId = project.id;
        await appsDataAccess.create(appData, "system");
      } else {
        console.error("创建应用失败:", response.statusText);
      }
    } catch (error) {
      console.error("创建应用失败:", error, appData);
    }
  }
}

export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams;
    const type = params.get("type") as string;
    if (!type) {
      return new Response(JSON.stringify({ error: "初始化数据失败" }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }
    await createApps(type);

    // 创建应用
    // for (const app of apps) {
    //   const categoryId = categoryMap.get(app.category);
    //   if (!categoryId) {
    //     console.error(`未找到分类: ${app.category}`);
    //     continue;
    //   }

    //   const appData = {
    //     slug: app.name.toLowerCase().replace(/\s+/g, "-"),
    //     name: app.name,
    //     categoryId,
    //     description: app.description,
    //     banner: "", // 需要从其他地方获取
    //     website: app.website || "",
    //     github: app.github,
    //     docs: app.docs || "",
    //     version: app.version || "1.0.0",
    //     type: "server" as const,
    //     source: "automatic" as const,
    //     status: "approved" as const,
    //     publishStatus: "online" as const,
    //   };

    //   try {
    //     await appsDataAccess.create(appData, "system");
    //   } catch (error) {
    //     console.error("创建应用失败:", error, appData);
    //   }
    // }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("初始化数据失败:", error);
    return new Response(JSON.stringify({ error: "初始化数据失败" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    // 遍历 client.json 中的数据
    for (const app of clientData) {
      // 构建符合数据库表结构的数据
      const appData = {
        slug: app.slug,
        name: app.name,
        categoryId: app.categoryId,
        description: app.description,
        type: "server" as const,
        source: "automatic" as const,
        status: "approved" as const,
        publishStatus: "online" as const,
        banner: app.banner?.[0],
        website: app.website,
        github: app.github,
        docs: app.docs,
        version: app.version,
      };

      try {
        // 调用 create 方法写入数据库
        await appsDataAccess.create(appData, "system");
      } catch (error) {
        console.error("初始化数据失败:", error, appData);
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("初始化数据失败:", error);
    return new Response(JSON.stringify({ error: "初始化数据失败" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}