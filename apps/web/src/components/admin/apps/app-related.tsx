"use client";

import { Badge } from "@repo/ui/components/ui/badge";
import { Button } from "@repo/ui/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@repo/ui/components/ui/dialog";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/components/ui/select";
import { trpc } from "@/lib/trpc/client";
import { Link2, Plus, Search, Star, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { getAssetUrl } from "@/lib/utils";
import { App, RelatedApp } from "@repo/db/types";

interface AppRelatedProps {
  appId: string;
}

export function AppRelated({ appId }: AppRelatedProps) {
  const [showAddRelatedDialog, setShowAddRelatedDialog] = useState(false);
  const [showAddRecommendationDialog, setShowAddRecommendationDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRecommendationType, setSelectedRecommendationType] = useState("popular");

  // 使用tRPC获取相关应用和推荐应用
  const { data: relatedApps, isLoading: isRelatedLoading } = trpc.apps.getRelatedApps.useQuery({ id: appId });
  const { data: recommendations, isLoading: isRecommendationsLoading } = trpc.apps.getRecommendations.useQuery({
    id: appId,
  });

  // 搜索应用
  const { data: searchResults, isLoading: isSearching } = trpc.apps.searchApps.useQuery(
    { query: searchTerm },
    { enabled: searchTerm.length > 2 } // 只在搜索词长度大于2时执行搜索
  );

  // tRPC mutations
  const utils = trpc.useContext();

  const addRelatedApp = trpc.apps.addRelatedApp.useMutation({
    onSuccess: () => {
      toast.success("添加成功", {
        description: "已添加到相关应用",
      });
      setShowAddRelatedDialog(false);
      // 刷新相关应用数据
      utils.apps.getRelatedApps.invalidate({ id: appId });
    },
    onError: (error) => {
      toast.error("添加失败", {
        description: error.message,
      });
    },
  });

  const removeRelatedApp = trpc.apps.removeRelatedApp.useMutation({
    onSuccess: () => {
      toast.success("移除成功", {
        description: "已从相关应用中移除",
      });
      // 刷新相关应用数据
      utils.apps.getRelatedApps.invalidate({ id: appId });
    },
    onError: (error) => {
      toast.error("移除失败", {
        description: error.message,
      });
    },
  });

  const addRecommendation = trpc.apps.addRecommendation.useMutation({
    onSuccess: () => {
      toast.success("添加成功", {
        description: "已添加到推荐应用",
      });
      setShowAddRecommendationDialog(false);
      // 刷新推荐应用数据
      utils.apps.getRecommendations.invalidate({ id: appId });
    },
    onError: (error) => {
      toast.error("添加失败", {
        description: error.message,
      });
    },
  });

  const removeRecommendation = trpc.apps.removeRecommendation.useMutation({
    onSuccess: () => {
      toast.success("移除成功", {
        description: "已从推荐应用中移除",
      });
      // 刷新推荐应用数据
      utils.apps.getRecommendations.invalidate({ id: appId });
    },
    onError: (error) => {
      toast.error("移除失败", {
        description: error.message,
      });
    },
  });

  // 处理函数
  const handleAddRelatedApp = (relatedAppId: string) => {
    addRelatedApp.mutate({
      appId,
      relatedAppId,
    });
  };

  const handleRemoveRelatedApp = (relatedAppId: string) => {
    removeRelatedApp.mutate({
      appId,
      relatedAppId,
    });
  };

  const handleAddRecommendation = (recommendedAppId: string) => {
    addRecommendation.mutate({
      appId,
      recommendedAppId,
      recommendationType: selectedRecommendationType,
    });
  };

  const handleRemoveRecommendation = (recId: string, recommendedAppId: string) => {
    removeRecommendation.mutate({
      appId: recId,
      recommendedAppId,
    });
  };

  return (
    <div className="grid grid-cols-1 gap-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-lg">相关应用</CardTitle>
              <CardDescription>与此应用相似的其他应用</CardDescription>
            </div>
            <Dialog open={showAddRelatedDialog} onOpenChange={setShowAddRelatedDialog}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  添加相关应用
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>添加相关应用</DialogTitle>
                  <DialogDescription>搜索并添加与此应用相关的应用。</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="flex items-center space-x-2">
                    <Input placeholder="搜索应用..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    <Button variant="outline" size="icon" disabled={isSearching}>
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-3 max-h-[300px] overflow-y-auto">
                    {isSearching ? (
                      <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="h-16 w-full bg-muted animate-pulse rounded-md" />
                        ))}
                      </div>
                    ) : searchResults && searchResults.length > 0 ? (
                      searchResults.map((result) => (
                        <div key={result.id} className="flex items-center justify-between p-3 border rounded-md">
                          <div className="flex items-center">
                            <img src={result.icon || "/placeholder.svg"} alt={result.name} className="h-8 w-8 rounded-md mr-3" />
                            <div>
                              <p className="font-medium">{result.name}</p>
                              <p className="text-xs text-muted-foreground">{result.description}</p>
                            </div>
                          </div>
                          <Button size="sm" variant="ghost" onClick={() => handleAddRelatedApp(result.id)} disabled={addRelatedApp.isPending}>
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      ))
                    ) : searchTerm.length > 2 ? (
                      <p className="text-center text-muted-foreground">未找到匹配的应用</p>
                    ) : (
                      <p className="text-center text-muted-foreground">请输入至少3个字符进行搜索</p>
                    )}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {isRelatedLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 w-full bg-muted animate-pulse rounded-md" />
              ))}
            </div>
          ) : relatedApps && relatedApps.length > 0 ? (
            <div className="space-y-4">
              {relatedApps.map((relApp) => (
                <div key={relApp.id} className="flex items-start justify-between p-3 border rounded-md">
                  <div className="flex items-start">
                    <img src={getAssetUrl(relApp.icon) || "/placeholder.svg"} alt={`${relApp.name} 图标`} className="h-10 w-10 rounded-md mr-3" />
                    <div>
                      <div className="flex items-center">
                        <h4 className="font-medium">{relApp.name}</h4>
                        <Badge variant="outline" className="ml-2">
                          相似度 {Math.round((relApp?.similarity ? relApp.similarity : 1) * 100)}%
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{relApp.description}</p>
                      <div className="flex items-center text-sm mt-1">
                        <Star className="h-3 w-3 text-yellow-500 mr-1" />
                        <span>{relApp.stars ?? 3}</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleRemoveRelatedApp(relApp.id)} disabled={removeRelatedApp.isPending}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center">
              <Link2 className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-2" />
              <p className="text-muted-foreground">暂无相关应用</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-lg">推荐应用</CardTitle>
              <CardDescription>系统推荐的应用</CardDescription>
            </div>
            <Dialog open={showAddRecommendationDialog} onOpenChange={setShowAddRecommendationDialog}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  添加推荐
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>添加推荐应用</DialogTitle>
                  <DialogDescription>添加推荐应用到不同的推荐类别。</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="recommendation-type">推荐类型</Label>
                    <Select defaultValue="popular" onValueChange={setSelectedRecommendationType}>
                      <SelectTrigger>
                        <SelectValue placeholder="选择推荐类型" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="popular">热门应用</SelectItem>
                        <SelectItem value="new">新上线应用</SelectItem>
                        <SelectItem value="similar">相似应用</SelectItem>
                        <SelectItem value="related">相关应用</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Input placeholder="搜索应用..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    <Button variant="outline" size="icon" disabled={isSearching}>
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-3 max-h-[300px] overflow-y-auto">
                    {isSearching ? (
                      <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="h-16 w-full bg-muted animate-pulse rounded-md" />
                        ))}
                      </div>
                    ) : searchResults && searchResults.length > 0 ? (
                      searchResults.map((result) => (
                        <div key={result.id} className="flex items-center justify-between p-3 border rounded-md">
                          <div className="flex items-center">
                            <img src={result.icon || "/placeholder.svg"} alt={result.name} className="h-8 w-8 rounded-md mr-3" />
                            <div>
                              <p className="font-medium">{result.name}</p>
                              <p className="text-xs text-muted-foreground">{result.description}</p>
                            </div>
                          </div>
                          <Button size="sm" variant="ghost" onClick={() => handleAddRecommendation(result.id)} disabled={addRecommendation.isPending}>
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      ))
                    ) : searchTerm.length > 2 ? (
                      <p className="text-center text-muted-foreground">未找到匹配的应用</p>
                    ) : (
                      <p className="text-center text-muted-foreground">请输入至少3个字符进行搜索</p>
                    )}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {isRecommendationsLoading ? (
            <div className="space-y-6">
              {[1, 2].map((i) => (
                <div key={i} className="space-y-3">
                  <div className="h-6 w-48 bg-muted animate-pulse rounded-md" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="h-16 w-full bg-muted animate-pulse rounded-md" />
                    <div className="h-16 w-full bg-muted animate-pulse rounded-md" />
                  </div>
                </div>
              ))}
            </div>
          ) : recommendations && recommendations.length > 0 ? (
            <div className="space-y-6">
              {recommendations.map((rec) => (
                <div key={rec.id}>
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium">{rec.title}</h4>
                    <Badge variant="outline">{rec.type === "popular" ? "热门" : rec.type === "new" ? "新上线" : "相关"}</Badge>
                  </div>
                  {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {rec.apps.map((recApp) => (
                      <div key={recApp.id} className="flex items-start justify-between p-3 border rounded-md">
                        <div className="flex items-start">
                          <img src={getAssetUrl(recApp.icon) || "/placeholder.svg"} alt={`${recApp.name} 图标`} className="h-8 w-8 rounded-md mr-2" />
                          <div>
                            <h5 className="font-medium text-sm">{recApp.name}</h5>
                            <p className="text-xs text-muted-foreground line-clamp-1">{recApp.description}</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleRemoveRecommendation(rec.id, recApp.id)} disabled={removeRecommendation.isLoading}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div> */}
                </div>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center">
              <Link2 className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-2" />
              <p className="text-muted-foreground">暂无推荐应用</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
