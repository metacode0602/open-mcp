"use client";

import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@repo/ui/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/ui/components/ui/dropdown-menu";
import type React from "react";
import { memo, useMemo } from "react";

import { useAppBreadcrumbStore } from "./app-breadcrumb-store";

export const AppBreadcrumb = memo(() => {
  const { breadcrumbList, maxSize } = useAppBreadcrumbStore();

  const breadcrumbItemRenderList = useMemo(() => {
    if (!breadcrumbList.length) return [];

    const renderList: React.ReactNode[] = [];

    // 需要隐藏，从 [1] 开始，隐藏 maxSize 个项目
    if (breadcrumbList.length > maxSize) {
      // 添加第一个项目
      const firstItem = breadcrumbList.splice(0, 1)[0];
      if (firstItem) {
        renderList.push(
          <BreadcrumbItem key="item-first">
            <BreadcrumbLink href={firstItem.href}>
              {firstItem.title}
            </BreadcrumbLink>
          </BreadcrumbItem>,
          <BreadcrumbSeparator key="sep-first" />
        );
      }

      // 添加隐藏的项目
      const needHiddenItemList = breadcrumbList.splice(0, maxSize - 1);
      renderList.push(
        <BreadcrumbItem key="dropdown">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1">
              <BreadcrumbEllipsis className="h-4 w-4" />
              <span className="sr-only">Toggle menu</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {needHiddenItemList.map((item, index) => (
                <DropdownMenuItem key={`dropdown-${index}`}>
                  <BreadcrumbLink href={item.href}>{item.title}</BreadcrumbLink>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </BreadcrumbItem>,
        <BreadcrumbSeparator key="sep-dropdown" />
      );
    }

    // 添加其他项目
    breadcrumbList.forEach((item, index) => {
      const isLast = index === breadcrumbList.length - 1;

      if (isLast) {
        renderList.push(
          <BreadcrumbItem key={`item-${index}`}>
            <BreadcrumbPage>{item.title}</BreadcrumbPage>
          </BreadcrumbItem>
        );
      }

      if (!isLast) {
        renderList.push(
          <BreadcrumbItem key={`item-${index}`}>
            <BreadcrumbLink href={item.href}>{item.title}</BreadcrumbLink>
          </BreadcrumbItem>
        );
        renderList.push(<BreadcrumbSeparator key={`sep-${index}`} />);
      }
    });

    return renderList;
  }, [breadcrumbList, maxSize]);

  return (
    <Breadcrumb>
      <BreadcrumbList>{breadcrumbItemRenderList}</BreadcrumbList>
    </Breadcrumb>
  );
});

AppBreadcrumb.displayName = "AppBreadcrumb";
