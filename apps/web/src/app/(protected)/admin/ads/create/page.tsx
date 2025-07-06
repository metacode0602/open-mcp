"use client";

import type React from "react";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { FormFileUpload } from "@/components/file-uploader";
import { Button } from "@repo/ui/components/ui/button";
import { Card, CardContent } from "@repo/ui/components/ui/card";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/components/ui/select";
import { Textarea } from "@repo/ui/components/ui/textarea";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc/client";

export default function AdCreatePage() {
  const router = useRouter();

  // Initial form state
  const [formData, setFormData] = useState({
    title: "",
    type: "banner",
    description: "",
    imageUrl: "",
    placement: "bottom",
    startDate: "",
    endDate: "",
    price: "",
    budget: "",
    appId: "",
  });

  const [imageAssetIds, setImageAssetIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // tRPC mutations
  const createAd = trpc.ads.create.useMutation({
    onSuccess: (data) => {
      toast.success("创建成功", {
        description: "广告已成功创建",
      });
      router.push(`/admin/ads/${data?.id}`);
    },
    onError: (error) => {
      toast.error("创建失败", {
        description: error.message,
      });
      setIsSubmitting(false);
    },
  });

  // Get apps for dropdown
  const { data: apps } = trpc.apps.search.useQuery({
    status: "approved",
    limit: 10,
  });

  // Handlers
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate form
    if (!formData.title || !formData.startDate || !formData.endDate || !formData.price) {
      toast.error("表单不完整", {
        description: "请填写所有必填字段",
      });
      setIsSubmitting(false);
      return;
    }

    // Create ad
    createAd.mutate({
      title: formData.title,
      type: formData.type as "banner" | "listing",
      description: formData.description,
      imageUrl: imageAssetIds.length > 0 ? imageAssetIds[0] : formData.imageUrl,
      placement: formData.placement as "top" | "middle" | "bottom",
      startDate: new Date(formData.startDate),
      endDate: new Date(formData.endDate),
      price: Number.parseFloat(formData.price),
      budget: Number.parseFloat(formData.budget || "0"),
      appId: formData.appId || undefined,
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUploadComplete = (assetIds: string[]) => {
    setImageAssetIds(assetIds);
  };

  // Get image upload recommendation based on ad type
  const getImageSizeRecommendation = () => {
    return formData.type === "banner" ? "推荐尺寸: 1200x300像素，横向矩形图片效果最佳" : "推荐尺寸: 600x600像素，正方形图片效果最佳";
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="创建广告"
        description="创建新的广告"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href="/admin/ads">
                <ArrowLeft className="mr-2 h-4 w-4" />
                返回列表
              </Link>
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "创建中..." : "创建广告"}
            </Button>
          </div>
        }
      />

      <Card>
        <CardContent className="pt-6">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">广告名称 *</Label>
                  <Input id="title" name="title" value={formData.title} onChange={handleChange} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="startDate">开始日期 *</Label>
                  <Input id="startDate" name="startDate" type="date" value={formData.startDate} onChange={handleChange} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">结束日期 *</Label>
                  <Input id="endDate" name="endDate" type="date" value={formData.endDate} onChange={handleChange} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">价格 (¥) *</Label>
                  <Input id="price" name="price" type="number" value={formData.price} onChange={handleChange} min="0" step="0.01" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="budget">预算</Label>
                  <Input id="budget" name="budget" value={formData.budget} onChange={handleChange} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="placement">展示位置</Label>
                  <Select value={formData.placement} onValueChange={(value) => handleSelectChange("placement", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="top">顶部</SelectItem>
                      <SelectItem value="middle">中部</SelectItem>
                      <SelectItem value="bottom">底部</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="appId">应用Id *</Label>
                  <Input id="appId" name="appId" value={formData.appId} onChange={handleChange} placeholder="请输入应用的slug" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">广告类型 *</Label>
                  <Select value={formData.type} onValueChange={(value) => handleSelectChange("type", value)} required>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="banner">横幅广告</SelectItem>
                      <SelectItem value="listing">列表广告</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>广告图片 *</Label>
                  <FormFileUpload
                    label="上传广告图片"
                    description="上传广告展示图片"
                    recommendedSize={getImageSizeRecommendation()}
                    accept="image/*"
                    assetType="ad"
                    onUploadComplete={handleUploadComplete}
                    maxFiles={1}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">广告描述</Label>
              <Textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={4} />
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
