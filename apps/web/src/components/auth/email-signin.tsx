"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Alert, AlertDescription } from "@repo/ui/components/ui/alert"
import { Button } from "@repo/ui/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@repo/ui/components/ui/form"
import { Input } from "@repo/ui/components/ui/input"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@repo/ui/components/ui/input-otp"
import { ArrowRight, CheckCircle2,Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect,useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { authClient } from "@/lib/auth-client"

const emailSchema = z.object({
  email: z.string().email("请输入有效的邮箱地址"),
})

const otpSchema = z.object({
  otp: z.string().length(6, "验证码必须是6位数字"),
})

interface EmailLoginProps {
  onSuccess?: () => void
}

export function EmailLogin({ onSuccess }: EmailLoginProps) {
  const [step, setStep] = useState<"email" | "verification" | "success">("email")
  const [isLoading, setIsLoading] = useState(false)
  const [emailAddress, setEmailAddress] = useState("")
  const [countdown, setCountdown] = useState(0)
  const router = useRouter();
  const otpInputRef = useRef<HTMLInputElement>(null)

  const emailForm = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: "",
    },
  })

  const otpForm = useForm<z.infer<typeof otpSchema>>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: "",
    },
  })

  useEffect(() => {
    if (step === "verification" && otpInputRef.current) {
      otpInputRef.current.focus()
    }
  }, [step])

  const startCountdown = () => {
    setCountdown(60)
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const onEmailSubmit = async (data: z.infer<typeof emailSchema>) => {
    try {
      setIsLoading(true)
      const { data: result, error } = await authClient.emailOtp.sendVerificationOtp({
        email: data.email,
        type: "sign-in" // or "email-verification", "forget-password"
      })
      console.warn("[email-signin] [onEmailSubmit] result", result, error)
      // await sendEmailOtp({
      //   email: data.email,
      //   type: "sign-in"
      // })
      setEmailAddress(data.email)
      setStep("verification")
      startCountdown()
    } catch (error) {
      console.error("发送验证码失败:", error)
      toast.error("发送验证码失败", { description: "请检查邮箱地址是否正确" })
    } finally {
      setIsLoading(false)
    }
  }

  const onOTPSubmit = async (data: z.infer<typeof otpSchema>) => {
    try {
      setIsLoading(true)
      // await emailOtpSignIn({
      //   email: emailAddress,
      //   otp: data.otp
      // })
      const { data: result, error } = await authClient.signIn.emailOtp({
        email: emailAddress,
        otp: data.otp
      })
      console.warn("[email-signin] [onOTPSubmit] result", result, error)
      if (error) { //说明失败了
        toast.error("验证错误", { description: "错误验证码，请重新输入" })
      } else {
        setStep("success")
        if (onSuccess) {
          onSuccess?.()
        } else {
          router.push("/")
        }
      }

    } catch (error) {
      console.error("验证码验证失败:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const resendOTP = async () => {
    try {
      setIsLoading(true)
      await authClient.emailOtp.sendVerificationOtp({
        email: emailAddress,
        type: "sign-in"
      })
      otpForm.reset({ otp: "" })
      startCountdown()
      if (otpInputRef.current) {
        otpInputRef.current.focus()
      }
    } catch (error) {
      console.error("重新发送验证码失败:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (step === "success") {
    return (
      <div className="space-y-4">
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription>验证成功，正在登录...</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {step === "email" ? (
        <Form {...emailForm}>
          <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4">
            <FormField
              control={emailForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>邮箱地址</FormLabel>
                  <FormControl>
                    <Input placeholder="请输入邮箱地址" type="email" {...field} className="h-11" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  发送中
                </>
              ) : (
                <>
                  继续
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </Form>
      ) : (
        <Form {...otpForm}>
          <form onSubmit={otpForm.handleSubmit(onOTPSubmit)} className="space-y-4">
            <div className="text-sm text-muted-foreground mb-4">
              验证码已发送至 <span className="font-medium">{emailAddress}</span>
            </div>
            <FormField
              control={otpForm.control}
              name="otp"
              render={({ field }) => (
                <FormItem className="space-y-4">
                  <FormLabel>验证码</FormLabel>
                  <FormControl>
                    <div className="flex justify-center">
                      <InputOTP
                        maxLength={6}
                        {...field}
                        value={field.value || ""}
                        onChange={(value) => {
                          field.onChange(value)
                          if (value.length === 6) {
                            otpForm.handleSubmit(onOTPSubmit)()
                          }
                        }}
                        ref={otpInputRef}
                      >
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  验证中
                </>
              ) : (
                "验证并登录"
              )}
            </Button>
            <div className="flex justify-between items-center mt-2">
              <Button type="button" variant="link" className="p-0 h-auto" onClick={() => setStep("email")}>
                更换邮箱
              </Button>
              <Button
                type="button"
                variant="link"
                className="p-0 h-auto"
                onClick={resendOTP}
                disabled={countdown > 0 || isLoading}
              >
                {countdown > 0 ? `重新发送(${countdown}s)` : "重新发送"}
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  )
}
