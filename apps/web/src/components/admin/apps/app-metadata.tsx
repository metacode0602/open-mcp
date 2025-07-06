"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@repo/ui/components/ui/alert-dialog";
import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@repo/ui/components/ui/dialog";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/components/ui/select";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc/client";
import { Folder, Plus, Tag, Trash2 } from "lucide-react";
import { useState } from "react";
import { Category } from "@repo/db/types";

interface AppMetadataProps {
  appId: string;
}

interface DeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
}

function DeleteDialog({ isOpen, onClose, onConfirm, title, description }: DeleteDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>取消</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>确认删除</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function AppMetadata({ appId }: AppMetadataProps) {
  const [showAddTagDialog, setShowAddTagDialog] = useState(false);
  const [showAddCategoryDialog, setShowAddCategoryDialog] = useState(false);
  const [newTagName, setNewTagName] = useState(""); //用户输入的tag名称，或者点击选中后的名称
  const [newTagId, setNewTagId] = useState(""); // 用户点击后的tagId，如果是用户输入的则此值为空
  const [deleteDialogState, setDeleteDialogState] = useState<{
    isOpen: boolean;
    type: "tag" | "category";
    id: string;
    name: string;
  }>({
    isOpen: false,
    type: "tag",
    id: "",
    name: "",
  });


  const utils = trpc.useContext();

  // 查询
  const { data: tagsData, isLoading: isTagsLoading } = trpc.apps.getTags.useQuery({ appId });
  const { data: categoriesData, isLoading: isCategoriesLoading } = trpc.apps.getCategories.useQuery({ appId });
  const { data: allCategories } = trpc.categories.search.useQuery({
    query: "",
    limit: 100,
    page: 1,
  });
  const { data: allTags } = trpc.tags.search.useQuery({
    query: "",
    limit: 100,
    page: 1,
  });

  // Mutations
  const addTag = trpc.apps.addTag.useMutation({
    onSuccess: () => {
      toast.success("添加成功", {
        description: "标签已添加到应用",
      });
      setNewTagName("");
      setNewTagId("")
      setShowAddTagDialog(false);
      utils.apps.getTags.invalidate({ appId });
    },
    onError: (error) => {
      toast.error("添加失败", {
        description: error.message,
      });
    },
  });

  const removeTag = trpc.apps.removeTag.useMutation({
    onSuccess: () => {
      toast.success("移除成功", {
        description: "标签已从应用移除",
      });
      // 重置删除对话框状态
      setDeleteDialogState({
        isOpen: false,
        type: "tag",
        id: "",
        name: "",
      });
      // 刷新标签数据
      utils.apps.getTags.invalidate({ appId });
    },
    onError: (error) => {
      toast.error("移除失败", {
        description: error.message,
      });
      // 即使失败也关闭对话框
      setDeleteDialogState(prev => ({ ...prev, isOpen: false }));
    },
  });

  const addCategory = trpc.apps.addCategory.useMutation({
    onSuccess: () => {
      toast.success("添加成功", {
        description: "分类已添加到应用"
      });
      setShowAddCategoryDialog(false);
      utils.apps.getCategories.invalidate({ appId });
    },
    onError: (error) => {
      toast.error("添加失败", {
        description: error.message,
      });
    },
  });

  const removeCategory = trpc.apps.removeCategory.useMutation({
    onSuccess: () => {
      toast.success("移除成功", {
        description: "分类已从应用移除",
      });
      // 重置删除对话框状态
      setDeleteDialogState({
        isOpen: false,
        type: "category",
        id: "",
        name: "",
      });
      // 刷新分类数据
      utils.apps.getCategories.invalidate({ appId });
    },
    onError: (error) => {
      toast.error("移除失败", {
        description: error.message,
      });
      // 即使失败也关闭对话框
      setDeleteDialogState(prev => ({ ...prev, isOpen: false }));
    },
  });

  // 辅助函数
  const isTagAdded = (tagId: string) => {
    return tagsData?.some(t => t.tagId === tagId) || false;
  };

  const isCategoryAdded = (categoryId: string) => {
    return categoriesData?.some(c => c.categoryId === categoryId) || false;
  };

  // 处理函数
  const handleAddTag = () => {
    if (!newTagName.trim()) return;

    if (isTagAdded(newTagName)) {
      toast.error("添加失败", {
        description: "该标签已添加",
      });
      return;
    }

    addTag.mutate({
      appId,
      tagId: newTagId.trim(),
      tagName: newTagName.trim(),
    });
  };

  const handleAddCategory = (categoryId: string) => {
    if (isCategoryAdded(categoryId)) {
      toast.error("添加失败", {
        description: "该分类已添加",
      });
      return;
    }

    addCategory.mutate({
      appId,
      categoryId,
    });
  };

  const handleDelete = () => {
    // 检查是否有删除ID
    if (!deleteDialogState.id) {
      toast.error("删除失败", {
        description: "无效的删除项",
      });
      return;
    }

    if (deleteDialogState.type === "tag") {
      removeTag.mutate({
        appId,
        tagId: deleteDialogState.id,
      });
    } else {
      removeCategory.mutate({
        appId,
        categoryId: deleteDialogState.id,
      });
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">标签</CardTitle>
          <CardDescription>应用程序的相关标签</CardDescription>
        </CardHeader>
        <CardContent>
          {isTagsLoading ? (
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-10 w-24 bg-muted animate-pulse rounded-md" />
              ))}
            </div>
          ) : tagsData && tagsData.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {tagsData.map((tag) => (
                <div key={tag.id} className="flex items-center p-2 border rounded-md">
                  <Tag className="h-4 w-4 mr-2 text-blue-500" />
                  <span>{tag.tag?.name}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="ml-2 h-6 w-6"
                    onClick={() => setDeleteDialogState({
                      isOpen: true,
                      type: "tag",
                      id: tag.id,
                      name: tag.tag?.name || ""
                    })}
                    disabled={removeTag.isPending}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">暂无标签</p>
          )}
        </CardContent>
        <CardFooter>
          <Dialog open={showAddTagDialog} onOpenChange={setShowAddTagDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                添加标签
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>添加标签</DialogTitle>
                <DialogDescription>为应用添加新标签或选择现有标签。</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="tag-search">添加新标签</Label>
                  <div className="flex gap-2">
                    <Input
                      id="tag-search"
                      placeholder="输入标签名称..."
                      value={newTagName}
                      onChange={(e) => { setNewTagName(e.target.value); setNewTagId("") }}
                    />
                    <Button
                      onClick={handleAddTag}
                      disabled={!newTagName.trim() || addTag.isPending}
                    >
                      添加
                    </Button>
                  </div>
                </div>
                <div className="border rounded-md p-2">
                  <div className="text-sm font-medium mb-2">可用标签</div>
                  <div className="flex flex-wrap gap-2">
                    {allTags?.data?.filter(tag => !isTagAdded(tag.id)).map((tag) => (
                      <Badge
                        key={tag.id}
                        variant="outline"
                        className="cursor-pointer hover:bg-secondary"
                        onClick={() => {
                          setNewTagName(tag.name);
                          setNewTagId(tag.id);
                        }}
                      >
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => setShowAddTagDialog(false)}>关闭</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">分类</CardTitle>
          <CardDescription>应用程序所属的分类</CardDescription>
        </CardHeader>
        <CardContent>
          {isCategoriesLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-16 w-full bg-muted animate-pulse rounded-md" />
              ))}
            </div>
          ) : categoriesData && categoriesData.length > 0 ? (
            <div className="space-y-3">
              {categoriesData.map((category) => (
                <div key={category.id} className="flex items-center justify-between p-3 border rounded-md">
                  <div className="flex items-center">
                    <Folder className="h-5 w-5 mr-3 text-orange-500" />
                    <div>
                      <p className="font-medium">{category.category.name}</p>
                      <p className="text-sm text-muted-foreground">/{category.category.slug}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteDialogState({
                      isOpen: true,
                      type: "category",
                      id: category.id,
                      name: category.category.name
                    })}
                    disabled={removeCategory.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">暂无分类</p>
          )}
        </CardContent>
        <CardFooter>
          <Dialog open={showAddCategoryDialog} onOpenChange={setShowAddCategoryDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                添加分类
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>添加分类</DialogTitle>
                <DialogDescription>为应用选择分类。</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="category">选择分类</Label>
                  <Select onValueChange={handleAddCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择分类" />
                    </SelectTrigger>
                    <SelectContent>
                      {allCategories?.data
                        ?.filter((category) => !isCategoryAdded(category.id))
                        .map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => setShowAddCategoryDialog(false)}>关闭</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardFooter>
      </Card>

      <DeleteDialog
        isOpen={deleteDialogState.isOpen}
        onClose={() => setDeleteDialogState(prev => ({ ...prev, isOpen: false }))}
        onConfirm={handleDelete}
        title={`删除${deleteDialogState.type === 'tag' ? '标签' : '分类'}`}
        description={`确定要删除${deleteDialogState.type === 'tag' ? '标签' : '分类'} "${deleteDialogState.name}" 吗？`}
      />
    </div>
  );
}
