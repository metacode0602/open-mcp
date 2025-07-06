import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
import { createAuthClient } from "better-auth/client";
import { phoneNumberClient } from "better-auth/client/plugins";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
// 创建 auth 客户端
const authClient = createAuthClient({
  plugins: [phoneNumberClient()]
});

export function PhoneLogin() {
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSendCode = async () => {
    try {
      setIsLoading(true);
      await authClient.phoneNumber.sendOtp({
        phoneNumber: phone
      });
      setIsCodeSent(true);
      // 这里可以添加 toast 通知
    } catch (error) {
      console.error("发送验证码失败:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    try {
      setIsLoading(true);
      const isVerified = await authClient.phoneNumber.verify({
        phoneNumber: phone,
        code: code
      });
      console.log("[phone-login] [handleVerifyCode] isVerified", isVerified);
      if (isVerified) {
        toast.success("验证成功");
        // 验证成功，可以跳转到首页或其他页面
        console.log("验证成功");
        router.push("/");
      }
      // 这里可以添加 toast 通知
    } catch (error) {
      console.error("验证码验证失败:", error);
      toast.error(`验证码验证失败：${error instanceof Error ? error.message : "未知错误"}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>手机号登录</CardTitle>
          <CardDescription>请输入手机号获取验证码</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Input
              type="tel"
              placeholder="请输入手机号"
              value={phone}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhone(e.target.value)}
              disabled={isCodeSent}
            />
          </div>
          {isCodeSent && (
            <div className="space-y-2">
              <Input
                type="text"
                placeholder="请输入验证码"
                value={code}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCode(e.target.value)}
              />
            </div>
          )}
          <Button
            className="w-full"
            onClick={isCodeSent ? handleVerifyCode : handleSendCode}
            disabled={isLoading}
          >
            {isLoading
              ? "处理中..."
              : isCodeSent
                ? "验证登录"
                : "获取验证码"}
          </Button>
        </CardContent>
      </Card>
    </>
  );
} 