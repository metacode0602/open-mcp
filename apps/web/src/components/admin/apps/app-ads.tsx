"use client";

import type React from "react";

import { FormFileUpload } from "@/components/file-uploader";
import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@repo/ui/components/ui/dialog";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/components/ui/select";
import { Textarea } from "@repo/ui/components/ui/textarea";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc/client";
import { getAssetUrl } from "@/lib/utils";
import { BarChart, Edit, Loader2, Plus } from "lucide-react";
import { useEffect, useState } from "react";

interface AppAdsProps {
  appId: string;
}

export function AppAds({ appId }: AppAdsProps) {
  // 状态管理
  const [showAddAdDialog, setShowAddAdDialog] = useState(false);
  const [showEditAdDialog, setShowEditAdDialog] = useState(false);
  const [selectedAdType, setSelectedAdType] = useState<"banner" | "listing">("banner");
  const [imageAssetIds, setImageAssetIds] = useState<string[]>([]);
  const [currentAd, setCurrentAd] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);


  // 表单初始值
  const initialFormState = {
    title: "",
    description: "",
    type: "banner" as "banner" | "listing",
    startDate: "",
    endDate: "",
    price: "",
    imageUrl: "",
  };

  const [formData, setFormData] = useState(initialFormState);

  // 重置表单
  const resetForm = () => {
    setImageAssetIds([]);
    setFormData(initialFormState);
    setSelectedAdType("banner");
  };

  // 使用tRPC获取广告数据
  const { data: ads, isLoading, refetch } = trpc.ads.getListByAppId.useQuery({ appId });

  // tRPC mutations
  const createAd = trpc.ads.create.useMutation({
    onSuccess: () => {
      toast.success("广告已创建", {
        description: "广告已提交审核",
      });
      setShowAddAdDialog(false);
      resetForm();
      refetch();
      setIsSubmitting(false);
    },
    onError: (error) => {
      toast.error("创建失败", {
        description: error.message,
      });
      setIsSubmitting(false);
    },
  });

  const updateAd = trpc.ads.update.useMutation({
    onSuccess: () => {
      toast.success("广告已更新", {
        description: "广告信息已成功更新",
      });
      setShowEditAdDialog(false);
      resetForm();
      refetch();
      setIsSubmitting(false);
    },
    onError: (error) => {
      toast.error("更新失败", {
        description: error.message,
      });
      setIsSubmitting(false);
    },
  });

  const updateAdStatus = trpc.ads.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("状态已更新", {
        description: "广告状态已成功更新",
      });
      refetch();
    },
    onError: (error) => {
      toast.error("更新失败", {
        description: error.message,
      });
    },
  });

  // 当选择编辑广告时，填充表单数据
  useEffect(() => {
    if (currentAd) {
      setFormData({
        title: currentAd.title || "",
        description: currentAd.description || "",
        type: currentAd.type || "banner",
        // @ts-expect-error
        startDate: currentAd.startDate ? new Date(currentAd.startDate).toISOString().split("T")[0] : "",
        // @ts-expect-error
        endDate: currentAd.endDate ? new Date(currentAd.endDate).toISOString().split("T")[0] : "",
        price: currentAd.price?.toString() || "",
        imageUrl: currentAd.imageUrl || "",
      });
      setSelectedAdType(currentAd.type || "banner");
      if (currentAd.imageUrl) {
        setImageAssetIds([currentAd.imageUrl]);
      }
    }
  }, [currentAd]);

  // 处理表单输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 处理广告类型变化
  const handleAdTypeChange = (value: string) => {
    setSelectedAdType(value as "banner" | "listing");
    setFormData((prev) => ({
      ...prev,
      type: value as "banner" | "listing",
    }));
  };

  // 处理上传完成
  const handleUploadComplete = (assetIds: string[]) => {
    setImageAssetIds(assetIds);
  };

  // 处理创建广告
  const handleCreateAd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    createAd.mutate({
      appId,
      title: formData.title,
      type: formData.type,
      startDate: new Date(formData.startDate),
      endDate: new Date(formData.endDate),
      price: Number(formData.price),
      description: formData.description,
      imageUrl: imageAssetIds[0] || "",
      userId: "",
      budget: Number(formData.price),
    });
  };

  // 处理更新广告
  const handleUpdateAd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentAd) return;

    setIsSubmitting(true);

    updateAd.mutate({
      id: currentAd.id,
      title: formData.title,
      type: formData.type,
      startDate: new Date(formData.startDate),
      endDate: new Date(formData.endDate),
      price: Number(formData.price),
      budget: Number(formData.price),
      // 这里可以根据需要决定是否更新预算
      description: formData.description,
      imageUrl: imageAssetIds[0] || currentAd.imageAssetId || "",
    });
  };

  // 处理更新广告状态
  const handleUpdateAdStatus = (adId: string, newStatus: string) => {
    updateAdStatus.mutate({
      id: adId,
      status: newStatus as "active" | "pending" | "completed" | "rejected" | "paused",
    });
  };

  // 打开编辑对话框
  const openEditDialog = (ad: any) => {
    setCurrentAd(ad);
    setShowEditAdDialog(true);
  };

  // 格式化日期
  const formatDate = (dateString: string | Date) => {
    if (!dateString) return "未指定";
    return new Date(dateString).toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // 获取状态徽章
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500 hover:bg-green-600">活跃</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">待审核</Badge>;
      case "paused":
        return <Badge className="bg-orange-500 hover:bg-orange-600">已暂停</Badge>;
      case "rejected":
        return <Badge className="bg-red-500 hover:bg-red-600">已拒绝</Badge>;
      case "expired":
        return <Badge className="bg-gray-500 hover:bg-gray-600">已过期</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // 获取图片上传推荐尺寸提示
  const getImageSizeRecommendation = (type: "banner" | "listing") => {
    return type === "banner" ? "推荐尺寸: 1200x300像素，横向矩形图片效果最佳" : "推荐尺寸: 600x600像素，正方形图片效果最佳";
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-lg">广告管理</CardTitle>
            <CardDescription>管理应用的广告和推广</CardDescription>
          </div>
          <Dialog
            open={showAddAdDialog}
            onOpenChange={(open) => {
              setShowAddAdDialog(open);
              if (!open) resetForm();
            }}
          >
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                创建广告
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl h-[70vh]">
              <DialogHeader>
                <DialogTitle>创建新广告</DialogTitle>
                <DialogDescription>为应用创建新的广告推广。</DialogDescription>
              </DialogHeader>
              <div className="overflow-y-auto pr-1 max-h-[calc(70vh-10rem)] scrollbar-hide">
                <form id="create-ad-form" className="space-y-4 py-4 p-2" onSubmit={handleCreateAd}>
                  <div className="space-y-2">
                    <Label htmlFor="title">广告标题</Label>
                    <Input id="title" name="title" placeholder="输入广告标题" value={formData.title} onChange={handleInputChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">广告描述</Label>
                    <Textarea id="description" name="description" placeholder="请输入广告描述内容" className="min-h-[100px]" value={formData.description} onChange={handleInputChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type">广告类型</Label>
                    <Select name="type" value={formData.type} onValueChange={handleAdTypeChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="选择广告类型" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="banner">横幅广告</SelectItem>
                        <SelectItem value="listing">列表广告</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startDate">开始日期</Label>
                      <Input id="startDate" name="startDate" type="date" value={formData.startDate} onChange={handleInputChange} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endDate">结束日期</Label>
                      <Input id="endDate" name="endDate" type="date" value={formData.endDate} onChange={handleInputChange} required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">价格 (元)</Label>
                    <Input id="price" name="price" type="number" min="0" step="0.01" value={formData.price} onChange={handleInputChange} required />
                  </div>
                  <FormFileUpload
                    label="广告图片"
                    description="上传广告展示图片"
                    recommendedSize={getImageSizeRecommendation(selectedAdType)}
                    accept="image/*"
                    assetType="ad"
                    onUploadComplete={handleUploadComplete}
                    maxFiles={1}
                  />
                </form>
              </div>
              <DialogFooter>
                <Button type="submit" form="create-ad-form" disabled={isSubmitting || !imageAssetIds.length}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      创建中...
                    </>
                  ) : (
                    "创建广告"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-6">
            {[1, 2].map((i) => (
              <div key={i} className="h-64 w-full bg-muted animate-pulse rounded-md" />
            ))}
          </div>
        ) : ads && ads.length > 0 ? (
          <div className="space-y-6">
            {ads.map((ad) => (
              <div key={ad.id} className="border rounded-md overflow-hidden">
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{ad.title}</h4>
                      {ad.description && <p className="text-sm text-muted-foreground mt-1">{ad.description}</p>}
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">{ad.type === "banner" ? "横幅广告" : "列表广告"}</Badge>
                        {getStatusBadge(ad.status)}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{ad.price} 元</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(ad.startDate)} - {formatDate(ad.endDate)}
                      </p>
                    </div>
                  </div>

                  {ad.imageUrl && (
                    <div className="mt-4 border rounded-md overflow-hidden">
                      <img src={getAssetUrl(ad.imageUrl) || "/placeholder.svg"} alt={ad.title} className={`w-full h-auto object-cover ${ad.type === "banner" ? "max-h-[150px]" : "max-h-[300px]"}`} />
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div className="p-3 border rounded-md">
                      <p className="text-sm text-muted-foreground">展示次数</p>
                      <p className="font-medium">{ad.impressions?.toLocaleString() || 0}</p>
                    </div>
                    <div className="p-3 border rounded-md">
                      <p className="text-sm text-muted-foreground">点击次数</p>
                      <p className="font-medium">{ad.clicks?.toLocaleString() || 0}</p>
                    </div>
                    <div className="p-3 border rounded-md">
                      <p className="text-sm text-muted-foreground">点击率</p>
                      <p className="font-medium">{ad.ctr || "0"}%</p>
                    </div>
                  </div>
                </div>
                <div className="bg-muted p-3 flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => openEditDialog(ad)}>
                    <Edit className="mr-2 h-4 w-4" />
                    编辑
                  </Button>
                  {ad.status === "active" ? (
                    <Button variant="outline" size="sm" onClick={() => handleUpdateAdStatus(ad.id, "paused")} disabled={updateAdStatus.isPending}>
                      暂停
                    </Button>
                  ) : ad.status === "paused" ? (
                    <Button size="sm" onClick={() => handleUpdateAdStatus(ad.id, "active")} disabled={updateAdStatus.isPending}>
                      激活
                    </Button>
                  ) : (
                    <Button size="sm" disabled={ad.status === "rejected" || updateAdStatus.isPending}>
                      {ad.status === "pending" ? "审核中" : "已结束"}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-6 text-center">
            <BarChart className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-2" />
            <p className="text-muted-foreground">暂无广告</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={() => setShowAddAdDialog(true)}>
              创建第一个广告
            </Button>
          </div>
        )}
      </CardContent>

      {/* 编辑广告对话框 */}
      <Dialog
        open={showEditAdDialog}
        onOpenChange={(open) => {
          setShowEditAdDialog(open);
          if (!open) {
            setCurrentAd(null);
            resetForm();
          }
        }}
      >
        <DialogContent className="max-w-2xl h-[70vh]">
          <DialogHeader>
            <DialogTitle>编辑广告</DialogTitle>
            <DialogDescription>修改广告信息和设置。</DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto pr-1 max-h-[calc(70vh-10rem)] scrollbar-hide">
            <form id="edit-ad-form" className="space-y-4 py-4 p-2" onSubmit={handleUpdateAd}>
              <div className="space-y-2">
                <Label htmlFor="edit-title">广告标题</Label>
                <Input id="edit-title" name="title" placeholder="输入广告标题" value={formData.title} onChange={handleInputChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">广告描述</Label>
                <Textarea id="edit-description" name="description" placeholder="请输入广告描述内容" className="min-h-[100px]" value={formData.description} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-type">广告类型</Label>
                <Select name="type" value={formData.type} onValueChange={handleAdTypeChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择广告类型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="banner">横幅广告</SelectItem>
                    <SelectItem value="listing">列表广告</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-startDate">开始日期</Label>
                  <Input id="edit-startDate" name="startDate" type="date" value={formData.startDate} onChange={handleInputChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-endDate">结束日期</Label>
                  <Input id="edit-endDate" name="endDate" type="date" value={formData.endDate} onChange={handleInputChange} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-price">价格 (元)</Label>
                <Input id="edit-price" name="price" type="number" min="0" step="0.01" value={formData.price} onChange={handleInputChange} required />
              </div>
              <div className="space-y-2">
                <Label>当前广告图片</Label>
                {currentAd?.imageUrl || formData.imageUrl ? (
                  <div className="border rounded-md overflow-hidden">
                    <img src={getAssetUrl(currentAd?.imageUrl || formData.imageUrl)} alt={formData.title} className="w-full h-auto object-cover max-h-[200px]" />
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">无图片</p>
                )}
              </div>
              <FormFileUpload
                label="更新广告图片"
                description="上传新的广告展示图片（可选）"
                recommendedSize={getImageSizeRecommendation(selectedAdType)}
                accept="image/*"
                assetType="ad"
                onUploadComplete={handleUploadComplete}
                initialPreviews={currentAd?.imageUrl ? [{
                  url: currentAd.imageUrl,
                  assetId: currentAd.imageUrl
                }] : []}
                maxFiles={1}
                required={false}
              />
            </form>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditAdDialog(false)} disabled={isSubmitting}>
              取消
            </Button>
            <Button type="submit" form="edit-ad-form" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  保存中...
                </>
              ) : (
                "保存更改"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
