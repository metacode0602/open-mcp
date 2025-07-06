"use client";

import {
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@repo/ui/components/ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { memo, useMemo } from "react";

import type { IAppSidebarNavItem } from "./type";

type IProps = {
  items: IAppSidebarNavItem[];
};

export const SidebarNav = memo(({ items }: IProps) => {
  const pathname = usePathname();

  const navItemList = useMemo(() => {
    return items.map((item) => ({
      ...item,
      isActive: (pathname: string) => {
        console.log(pathname, item.url, pathname.includes(item.url));
        return pathname.includes(item.url);
      },
    }));
  }, [items, pathname]);

  return (
    <SidebarMenu>
      {navItemList.map((item) => (
        <SidebarMenuItem key={item.title}>
          <SidebarMenuButton asChild isActive={item.isActive?.(pathname)}>
            <Link href={item.url}>
              {item.icon}
              <span>{item.title}</span>
              {item.badge && (
                <SidebarMenuBadge className="ml-auto bg-primary text-primary-foreground">
                  {item.badge}
                </SidebarMenuBadge>
              )}
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
});
