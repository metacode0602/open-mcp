"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import { Textarea } from "@repo/ui/components/ui/textarea";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc/client";

// 表单验证模式
const formSchema = z.object({
  name: z
    .string()
    .min(2, {
      message: "标签名称至少需要2个字符",
    })
    .max(50, {
      message: "标签名称不能超过50个字符",
    }),
  slug: z
    .string()
    .min(2, {
      message: "标识符至少需要2个字符",
    })
    .max(50, {
      message: "标识符不能超过50个字符",
    })
    .regex(/^[a-z0-9-]+$/, {
      message: "标识符只能包含小写字母、数字和连字符",
    }),
  description: z
    .string()
    .max(200, {
      message: "描述不能超过200个字符",
    })
    .optional(),
});

export default function TagEditPage() {
  const params = useParams();
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);

  // 使用 tRPC 获取标签数据
  const {
    data: tag,
    isLoading,
    error,
  } = trpc.tags.getById.useQuery({
    id: params.id as string,
  });

  // 使用 tRPC 更新标签
  const { mutate: updateTag } = trpc.tags.update.useMutation({
    onSuccess: () => {
      toast.success("保存成功", {
        description: "标签信息已更新",
      });
      router.push(`/admin/tags/${params.id}`);
    },
    onError: (error) => {
      toast.error("保存失败", {
        description: error.message
      });
      setIsSubmitting(false);
    },
  });

  // 表单定义
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
    },
  });

  // 当标签数据加载完成时，更新表单默认值
  if (tag && !form.getValues("name")) {
    form.reset({
      name: tag.name,
      slug: tag.slug,
      description: tag.description || "",
    });
  }

  // 表单提交处理
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    updateTag({
      id: params.id as string,
      ...values,
    });
  }

  // 自动生成标识符
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
  };

  // 当名称变化时，自动更新标识符（如果标识符为空）
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    form.setValue("name", name);

    const currentSlug = form.getValues("slug");
    if (!currentSlug) {
      const slug = generateSlug(name);
      form.setValue("slug", slug);
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h3 className="text-lg font-medium">加载失败</h3>
          <p className="text-sm text-muted-foreground">{error.message}</p>
        </div>
      </div>
    );
  }

  if (isLoading || !tag) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="编辑标签"
        description="修改标签信息"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href={`/admin/tags/${params.id}`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                返回详情
              </Link>
            </Button>
            <Button
              type="submit"
              form="edit-form"
              disabled={isSubmitting}
            >
              <Save className="mr-2 h-4 w-4" />
              {isSubmitting ? "保存中..." : "保存更改"}
            </Button>
          </div>
        }
      />

      <form
        id="edit-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6"
      >
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">标签名称</Label>
              <Input
                id="name"
                {...form.register("name")}
                onChange={handleNameChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">标签标识</Label>
              <Input
                id="slug"
                {...form.register("slug")}
                required
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="description">描述</Label>
              <Textarea
                id="description"
                {...form.register("description")}
                className="min-h-[100px]"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
