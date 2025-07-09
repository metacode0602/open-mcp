"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, AlertDescription } from "@repo/ui/components/ui/alert";
import { Button } from "@repo/ui/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@repo/ui/components/ui/form";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/components/ui/select";
import { AlertCircle, Github, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { trpc } from "@/lib/trpc/client";
import { CategorySelect } from "@/components/admin/category-select";

const formSchema = z.object({
  gitHubURL: z.string().url("请输入有效的URL").startsWith("https://github.com/", "必须是GitHub仓库地址"),
  type: z.enum(["client", "server", "application"]),
  categoryId: z.string().optional(),
});

export function AddGitHubAppButton() {
  const [open, setOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { gitHubURL: "", type: "client", categoryId: "" },
  });

  // tRPC queries and mutations
  const { data: categoriesData } = trpc.categories.search.useQuery({
    limit: 100,
    page: 1,
  });

  const createFromGitHub = trpc.apps.createFromGitHub.useMutation();

  const isPending = form.formState.isSubmitting || isProcessing;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsProcessing(true);
    try {
      const project = await createFromGitHub.mutateAsync({
        gitHubURL: values.gitHubURL,
        type: values.type,
        categoryId: values.categoryId || undefined,
      });

      if (project) {
        toast.success(`项目创建成功: ${project.name}`);
        setOpen(false);
        form.reset();
        router.push(`/admin/apps/${project.id}`);
      } else {
        toast.error("创建项目失败: 未返回项目数据");
      }
    } catch (error) {
      console.error("创建GitHub应用失败:", error);
      toast.error(`创建项目失败: ${(error as Error).message}`);
    } finally {
      setIsProcessing(false);
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && isPending) {
      return; // 防止在加载时关闭对话框
    }
    setOpen(newOpen);
    if (!newOpen) {
      form.reset();
    }
  };

  return (
    <Form {...form}>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button variant="default">
            <Github className="size-4 mr-2" />
            添加GitHub应用
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px]">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <DialogHeader>
              <DialogTitle>添加GitHub应用</DialogTitle>
              <DialogDescription>
                通过GitHub仓库URL添加应用。系统将自动获取仓库信息并创建应用记录。
              </DialogDescription>
            </DialogHeader>

            {createFromGitHub.error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {createFromGitHub.error.message}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <div className="grid grid-cols-[100px_1fr] items-center gap-4">
                <Label htmlFor="gitHubURL" className="text-right">
                  GitHub URL *
                </Label>
                <FormField
                  control={form.control}
                  name="gitHubURL"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          placeholder="https://github.com/owner/repo"
                          {...field}
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-[100px_1fr] items-center gap-4">
                <Label htmlFor="type" className="text-right">
                  应用类型 *
                </Label>
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value as string}
                          disabled={isPending}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="选择应用类型" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="client">客户端应用</SelectItem>
                            <SelectItem value="server">服务端应用</SelectItem>
                            <SelectItem value="application">完整应用程序</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-[100px_1fr] items-center gap-4">
                <Label htmlFor="categoryId" className="text-right">
                  应用分类
                </Label>
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <CategorySelect
                          categories={categoriesData?.data || []}
                          name="categoryId"
                          placeholder="选择应用分类（可选）"
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isPending}
              >
                取消
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                )}
                {isPending ? "创建中..." : "创建应用"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Form>
  );
}
