"use client"

import { Button } from "@repo/ui/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@repo/ui/components/ui/tabs"
import { Check } from "lucide-react"
import Image from "next/image"
import { useState } from "react"
import { toast } from "sonner"
interface PaymentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  amount: number
  adType: string
  days: number
}

export function PaymentDialog({ open, onOpenChange, amount, adType, days }: PaymentDialogProps) {
  const [paymentMethod, setPaymentMethod] = useState<string>("wechat")
  const [isProcessing, setIsProcessing] = useState(false)
  const [isPaymentComplete, setIsPaymentComplete] = useState(false)

  const handlePayment = async () => {
    setIsProcessing(true)

    // 模拟支付过程
    await new Promise((resolve) => setTimeout(resolve, 2000))

    setIsProcessing(false)
    setIsPaymentComplete(true)

    toast.success("支付成功", {
      description: "您的广告已成功购买，我们将尽快处理您的订单",
    })
  }

  const handleClose = () => {
    onOpenChange(false)
    // 重置状态，以便下次打开对话框时从头开始
    setTimeout(() => {
      setIsPaymentComplete(false)
    }, 300)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {!isPaymentComplete ? (
          <>
            <DialogHeader>
              <DialogTitle>支付订单</DialogTitle>
              <DialogDescription>请选择支付方式完成订单</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="rounded-lg bg-muted/50 p-4">
                <div className="flex justify-between mb-2">
                  <span className="text-muted-foreground">广告类型</span>
                  <span className="font-medium">{adType}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-muted-foreground">投放天数</span>
                  <span className="font-medium">{days} 天</span>
                </div>
                <div className="flex justify-between text-lg">
                  <span className="font-medium">总金额</span>
                  <span className="font-bold">¥{amount.toLocaleString()}</span>
                </div>
              </div>

              <Tabs defaultValue="wechat" onValueChange={setPaymentMethod}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="wechat">微信支付</TabsTrigger>
                  <TabsTrigger value="alipay">支付宝</TabsTrigger>
                </TabsList>

                <TabsContent value="wechat" className="pt-4">
                  <div className="flex flex-col items-center">
                    <div className="border-4 border-green-500 rounded-lg p-2 mb-4">
                      <Image
                        src="/placeholder.svg?height=200&width=200"
                        alt="微信支付二维码"
                        width={200}
                        height={200}
                        className="rounded-md"
                      />
                    </div>
                    <p className="text-sm text-muted-foreground text-center">请使用微信扫描上方二维码完成支付</p>
                  </div>
                </TabsContent>

                <TabsContent value="alipay" className="pt-4">
                  <div className="flex flex-col items-center">
                    <div className="border-4 border-blue-500 rounded-lg p-2 mb-4">
                      <Image
                        src="/placeholder.svg?height=200&width=200"
                        alt="支付宝支付二维码"
                        width={200}
                        height={200}
                        className="rounded-md"
                      />
                    </div>
                    <p className="text-sm text-muted-foreground text-center">请使用支付宝扫描上方二维码完成支付</p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                取消
              </Button>
              <Button onClick={handlePayment} disabled={isProcessing}>
                {isProcessing ? "处理中..." : "我已完成支付"}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2 mb-2">
                <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                  <Check className="h-6 w-6 text-green-600 dark:text-green-300" />
                </div>
                <DialogTitle>支付成功</DialogTitle>
              </div>
              <DialogDescription>您的广告订单已成功支付</DialogDescription>
            </DialogHeader>

            <div className="bg-muted/50 p-4 rounded-md space-y-3 my-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">订单编号</span>
                <span className="font-medium">AD{Date.now().toString().slice(-8)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">广告类型</span>
                <span className="font-medium">{adType}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">投放天数</span>
                <span className="font-medium">{days} 天</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">支付方式</span>
                <span className="font-medium">{paymentMethod === "wechat" ? "微信支付" : "支付宝"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">支付金额</span>
                <span className="font-medium">¥{amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">支付时间</span>
                <span className="font-medium">{new Date().toLocaleString()}</span>
              </div>
            </div>

            <div className="text-sm text-muted-foreground">
              <p>我们将在1个工作日内处理您的广告订单，并通过邮件通知您广告的上线时间。</p>
              <p className="mt-2">如有任何问题，请联系我们的客服团队。</p>
            </div>

            <DialogFooter>
              <Button onClick={handleClose}>完成</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

