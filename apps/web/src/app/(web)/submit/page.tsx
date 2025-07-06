"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ArrowLeft, Upload, Server, Laptop, BrainCircuit, X } from "lucide-react";

import { Button } from "@repo/ui/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import { Textarea } from "@repo/ui/components/ui/textarea";
import { trpc } from "@/lib/trpc/client";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@repo/ui/components/ui/form";
import { cn } from "@repo/ui/lib/utils";
import { toast } from "sonner";
// 表单验证模式
const formSchema = z.object({
  nickname: z.string().min(1, "昵称不能为空"),
  email: z.string().email("请输入有效的邮箱地址"),
  name: z.string().min(1, "应用名称不能为空"),
  description: z.string().min(10, "描述至少需要10个字符"),
  type: z.enum(["client", "server", "application"]),
  website: z.string().url("请输入有效的网址").optional().or(z.literal("")),
  github: z.string().url("请输入有效的GitHub仓库地址").optional().or(z.literal("")),
  tags: z.string().optional(),
  serverConfig: z.string().optional(),
  logoUrl: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function SubmitPage() {
  const router = useRouter();

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 使用tRPC mutation
  const submitMutation = trpc.mcpSubmit.create.useMutation({
    onSuccess: () => {
      setIsSubmitting(false);
      toast.success("提交成功", {
        description: "您的应用信息已成功提交，我们将尽快审核",
      });
      router.push("/");
    },
    onError: (error) => {
      setIsSubmitting(false);
      toast.error("提交失败", {
        description: error.message || "提交应用时出错，请稍后再试",
      });
    },
  });

  // 初始化表单
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nickname: "",
      email: "",
      name: "",
      description: "",
      type: "client",
      website: "",
      github: "",
      tags: "",
      serverConfig: "",
      logoUrl: "",
    },
  });

  // 监听类型变化，以便显示/隐藏服务器配置字段
  const appType = form.watch("type");

  // 处理图片上传
  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 验证文件类型和大小
    const validTypes = ["image/jpeg", "image/png", "image/svg+xml"];
    const maxSize = 2 * 1024 * 1024; // 2MB

    if (!validTypes.includes(file.type)) {
      toast.error("不支持的文件类型", {
        description: "请上传 JPG, PNG 或 SVG 格式的图片",
      });
      return;
    }

    if (file.size > maxSize) {
      toast.error("文件过大", {
        description: "图片大小不能超过 2MB",
      });
      return;
    }

    // 设置预览
    const reader = new FileReader();
    reader.onload = (e) => {
      setLogoPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    setLogoFile(file);

    // 上传图片
    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("assetType", "logo");
      formData.append("contentType", file.type);

      const response = await fetch("/api/assets", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("上传失败");
      }

      const data = await response.json();
      form.setValue("logoUrl", data.url);
      toast.success("上传成功", {
        description: "图片已成功上传",
      });
    } catch (error) {
      toast.error("上传失败", {
        description: "图片上传失败，请重试",
      });
      setLogoFile(null);
      setLogoPreview(null);
    } finally {
      setIsUploading(false);
    }
  };

  // 删除图片
  const handleDeleteLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    form.setValue("logoUrl", "");
  };

  // 提交表单
  const onSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);
      // 处理标签，将逗号分隔的字符串转换为数组
      const tags = values.tags ? values.tags.split(",").map(tag => tag.trim()) : [];

      await submitMutation.mutateAsync({
        ...values,
        tags,
        title: values.name,
      });
    } catch (error) {
      setIsSubmitting(false);
      // 错误已在mutation的onError中处理
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-3xl">
        <div className="mb-8 text-center">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="absolute left-4 top-4 md:left-8 md:top-8"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回
          </Button>
          <h1 className="text-3xl font-bold mb-2">提交应用</h1>
          <p className="text-muted-foreground">分享您的 MCP 客户端、服务器或应用，让更多的人了解和使用您的产品</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card className="w-full">
              <CardHeader>
                <CardTitle>应用信息</CardTitle>
                <CardDescription>请填写您的应用信息，带 * 的字段为必填项</CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>应用类型 *</Label>
                  <div className="grid grid-cols-3 gap-4">
                    <div
                      className={`flex flex-col items-center justify-center p-4 rounded-lg border cursor-pointer transition-colors ${appType === "client" ? "border-primary bg-primary/5" : "border-muted hover:border-primary/50"
                        }`}
                      onClick={() => form.setValue("type", "client")}
                    >
                      <Laptop className="h-8 w-8 mb-2" />
                      <span className="cursor-pointer">客户端</span>
                      <p className="text-xs text-muted-foreground text-center mt-1">MCP 客户端应用</p>
                    </div>
                    <div
                      className={`flex flex-col items-center justify-center p-4 rounded-lg border cursor-pointer transition-colors ${appType === "server" ? "border-primary bg-primary/5" : "border-muted hover:border-primary/50"
                        }`}
                      onClick={() => form.setValue("type", "server")}
                    >
                      <Server className="h-8 w-8 mb-2" />
                      <span className="cursor-pointer">服务器</span>
                      <p className="text-xs text-muted-foreground text-center mt-1">MCP 服务器应用</p>
                    </div>
                    <div
                      className={`flex flex-col items-center justify-center p-4 rounded-lg border cursor-pointer transition-colors ${appType === "application" ? "border-primary bg-primary/5" : "border-muted hover:border-primary/50"
                        }`}
                      onClick={() => form.setValue("type", "application")}
                    >
                      <BrainCircuit className="h-8 w-8 mb-2" />
                      <span className="cursor-pointer">AI 应用</span>
                      <p className="text-xs text-muted-foreground text-center mt-1">基于 MCP 的应用</p>
                    </div>
                  </div>
                  <input type="hidden" {...form.register("type")} />
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="nickname"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>个人昵称 *</FormLabel>
                        <FormControl>
                          <Input placeholder="您的昵称" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>邮箱 *</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="your@email.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>应用名称 *</FormLabel>
                      <FormControl>
                        <Input placeholder="例如：My MCP Client" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>应用描述 *</FormLabel>
                      <FormControl>
                        <Textarea placeholder="简要描述您的应用功能和特点" {...field} rows={4} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>官方网站</FormLabel>
                        <FormControl>
                          <Input placeholder="https://example.com" {...field} type="url" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="github"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>GitHub 仓库</FormLabel>
                        <FormControl>
                          <Input placeholder="https://github.com/username/repo" {...field} type="url" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>标签</FormLabel>
                      <FormControl>
                        <Input placeholder="用逗号分隔，例如：AI 助手, MCP 客户端, 自然语言" {...field} />
                      </FormControl>
                      <FormDescription>用逗号分隔多个标签</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="space-y-2">
                  <Label htmlFor="logo">应用图标 *</Label>
                  <div className="flex items-center justify-center w-full">
                    <label
                      htmlFor="logo"
                      className={cn(
                        "flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer",
                        logoPreview ? "border-primary" : "bg-muted/40 hover:bg-muted/60"
                      )}
                    >
                      {logoPreview ? (
                        <div className="relative w-full h-full flex items-center justify-center">
                          <img src={logoPreview} alt="Logo preview" className="max-h-28 max-w-28 object-contain" />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              handleDeleteLogo();
                            }}
                            className="absolute top-2 right-2 p-1 rounded-full bg-background/80 hover:bg-background"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 mb-3 text-muted-foreground" />
                          <p className="mb-2 text-sm text-muted-foreground">
                            <span className="font-semibold">点击上传</span> 或拖放文件
                          </p>
                          <p className="text-xs text-muted-foreground">SVG, PNG 或 JPG (最大 2MB)</p>
                        </div>
                      )}
                      <input
                        id="logo"
                        type="file"
                        className="hidden"
                        accept="image/png,image/jpeg,image/svg+xml"
                        onChange={handleLogoChange}
                        disabled={isUploading}
                      />
                    </label>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex justify-between">
                <Button variant="outline" type="button" onClick={() => router.back()}>
                  取消
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || isUploading}
                  className="min-w-[100px]"
                >
                  {isSubmitting || isUploading ? (
                    <div className="flex items-center">
                      <span className="mr-2">提交中</span>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    </div>
                  ) : (
                    "提交应用"
                  )}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </Form>
      </div>
    </div>
  );
}
