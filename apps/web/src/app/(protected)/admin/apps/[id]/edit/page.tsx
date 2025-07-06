import { ArrowLeft, Edit, Eye } from "lucide-react";
import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@repo/ui/components/ui/button";

import { AppEditForm } from "@/components/admin/apps/app-edit-form";

export const dynamic = "force-dynamic";

export default async function AppDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="应用详情"
        description="查看和管理应用详细信息"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href={`/admin/apps/${id}`}>
                <Eye className="mr-2 h-4 w-4" />
                查看详情
              </Link>
            </Button>
            <Button asChild>
              <Link href={`/admin/apps`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                返回应用列表
              </Link>
            </Button>
          </div>
        }
      />
      <AppEditForm appId={id} />
    </div>
  );
}
