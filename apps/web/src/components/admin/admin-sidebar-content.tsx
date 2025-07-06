"use client";
import { Button } from "@repo/ui/components/ui/button";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@repo/ui/components/ui/sidebar";
import {
  BarChart,
  CreditCard,
  FolderTree,
  LayoutDashboard,
  Lightbulb,
  LogOut,
  Package,
  Settings,
  Shield,
  Tags,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function AdminSidebarContent() {
  const pathname = usePathname();

  // 计算待处理项数量
  const pendingItems = {
    apps: 2,
    claims: 3,
    suggestions: 5,
    ads: 2,
    payments: 1,
    categories: 0,
    tags: 0,
  };

  const totalPendingItems = Object.values(pendingItems).reduce(
    (a, b) => a + b,
    0
  );

  return (
    <>
      <SidebarGroup>
        <SidebarGroupLabel>主要功能</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === "/admin"}>
                <Link href="/admin">
                  <LayoutDashboard className="h-4 w-4" />
                  <span>仪表盘</span>
                  {totalPendingItems > 0 && (
                    <SidebarMenuBadge>{totalPendingItems}</SidebarMenuBadge>
                  )}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith("/admin/apps")}
              >
                <Link href="/admin/apps">
                  <Package className="h-4 w-4" />
                  <span>应用管理</span>
                  {pendingItems.apps > 0 && (
                    <SidebarMenuBadge>{pendingItems.apps}</SidebarMenuBadge>
                  )}
                </Link>
              </SidebarMenuButton>
              <SidebarMenuSub>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton
                    asChild
                    isActive={pathname === "/admin/apps"}
                  >
                    <Link href="/admin/apps">所有应用</Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton
                    asChild
                    isActive={pathname === "/admin/apps/pending"}
                  >
                    <Link href="/admin/apps/pending">
                      待审核应用
                      {pendingItems.apps > 0 && (
                        <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                          {pendingItems.apps}
                        </span>
                      )}
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton
                    asChild
                    isActive={pathname === "/admin/apps/create"}
                  >
                    <Link href="/admin/apps/create">添加应用</Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              </SidebarMenuSub>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith("/admin/categories")}
              >
                <Link href="/admin/categories">
                  <FolderTree className="h-4 w-4" />
                  <span>分类管理</span>
                  {pendingItems.categories > 0 && (
                    <SidebarMenuBadge>
                      {pendingItems.categories}
                    </SidebarMenuBadge>
                  )}
                </Link>
              </SidebarMenuButton>
              <SidebarMenuSub>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton
                    asChild
                    isActive={pathname === "/admin/categories"}
                  >
                    <Link href="/admin/categories">所有分类</Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton
                    asChild
                    isActive={pathname === "/admin/categories/create"}
                  >
                    <Link href="/admin/categories/create">添加分类</Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              </SidebarMenuSub>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith("/admin/tags")}
              >
                <Link href="/admin/tags">
                  <Tags className="h-4 w-4" />
                  <span>标签管理</span>
                  {pendingItems.tags > 0 && (
                    <SidebarMenuBadge>{pendingItems.tags}</SidebarMenuBadge>
                  )}
                </Link>
              </SidebarMenuButton>
              <SidebarMenuSub>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton
                    asChild
                    isActive={pathname === "/admin/tags"}
                  >
                    <Link href="/admin/tags">所有标签</Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton
                    asChild
                    isActive={pathname === "/admin/tags/create"}
                  >
                    <Link href="/admin/tags/create">添加标签</Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              </SidebarMenuSub>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarGroup>
        <SidebarGroupLabel>业务管理</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith("/admin/ads")}
              >
                <Link href="/admin/ads">
                  <BarChart className="h-4 w-4" />
                  <span>广告管理</span>
                  {pendingItems.ads > 0 && (
                    <SidebarMenuBadge>{pendingItems.ads}</SidebarMenuBadge>
                  )}
                </Link>
              </SidebarMenuButton>
              <SidebarMenuSub>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton
                    asChild
                    isActive={pathname === "/admin/ads"}
                  >
                    <Link href="/admin/ads">所有广告</Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton
                    asChild
                    isActive={pathname === "/admin/ads/pending"}
                  >
                    <Link href="/admin/ads/pending">
                      待审核广告
                      {pendingItems.ads > 0 && (
                        <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                          {pendingItems.ads}
                        </span>
                      )}
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton
                    asChild
                    isActive={pathname === "/admin/ads/analytics"}
                  >
                    <Link href="/admin/ads/analytics">广告分析</Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              </SidebarMenuSub>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith("/admin/payments")}
              >
                <Link href="/admin/payments">
                  <CreditCard className="h-4 w-4" />
                  <span>支付管理</span>
                  {pendingItems.payments > 0 && (
                    <SidebarMenuBadge>{pendingItems.payments}</SidebarMenuBadge>
                  )}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith("/admin/claims")}
              >
                <Link href="/admin/claims">
                  <Shield className="h-4 w-4" />
                  <span>所有权申请</span>
                  {pendingItems.claims > 0 && (
                    <SidebarMenuBadge>{pendingItems.claims}</SidebarMenuBadge>
                  )}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith("/admin/suggestions")}
              >
                <Link href="/admin/suggestions">
                  <Lightbulb className="h-4 w-4" />
                  <span>建议管理</span>
                  {pendingItems.suggestions > 0 && (
                    <SidebarMenuBadge>
                      {pendingItems.suggestions}
                    </SidebarMenuBadge>
                  )}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarGroup>
        <SidebarGroupLabel>系统管理</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith("/admin/users")}
              >
                <Link href="/admin/users">
                  <Users className="h-4 w-4" />
                  <span>用户管理</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith("/admin/settings")}
              >
                <Link href="/admin/settings">
                  <Settings className="h-4 w-4" />
                  <span>系统设置</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <div className="mt-auto p-4">
        <Button variant="outline" className="w-full" asChild>
          <Link href="/login">
            <LogOut className="mr-2 h-4 w-4" />
            退出登录
          </Link>
        </Button>
      </div>
    </>
  );
}
