"use client"

import type React from "react"

import { useState } from "react"

import { Button } from "@repo/ui/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@repo/ui/components/ui/dialog"
import { LoginForm } from "./signin-form"

interface LoginModalProps {
  trigger?: React.ReactNode
  onSuccess?: () => void
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function LoginModal({ trigger, onSuccess, open, onOpenChange }: LoginModalProps) {
  const [internalOpen, setInternalOpen] = useState(false)

  const isControlled = open !== undefined && onOpenChange !== undefined
  const isOpen = isControlled ? open : internalOpen
  const setIsOpen = isControlled ? onOpenChange : setInternalOpen

  const handleSuccess = () => {
    setIsOpen(false)
    onSuccess?.()
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{trigger || <Button>登录</Button>}</DialogTrigger>
      <DialogContent className="sm:max-w-md p-0 border-none">
        <DialogTitle className="sr-only">
          登录
        </DialogTitle>
        <DialogDescription className="sr-only">请登录</DialogDescription>
        <LoginForm onSuccess={handleSuccess} onCancel={() => setIsOpen(false)} isModal={true} />
      </DialogContent>
    </Dialog>
  )
}
