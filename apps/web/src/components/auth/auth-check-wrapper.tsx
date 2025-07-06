"use client"

import type React from "react"
import { useState } from "react"

import { LoginModal } from "@/components/auth/login-modal"
import { useSession } from "@/hooks/auth-hooks"

interface AuthCheckWrapperProps {
  children: React.ReactNode
  onAuthSuccess: () => void
  buttonText: React.ReactNode // Changed from string to React.ReactNode
}

export function AuthCheckWrapper({ children, onAuthSuccess, buttonText }: AuthCheckWrapperProps) {
  const { data: session } = useSession()
  const [showLoginModal, setShowLoginModal] = useState(false)

  const handleClick = () => {
    if (session) {
      onAuthSuccess()
    } else {
      setShowLoginModal(true)
    }
  }

  const handleLoginSuccess = () => {
    setShowLoginModal(false)
    onAuthSuccess()
  }

  return (
    <>
      {/* Use a wrapper div with onClick instead of a button */}
      <div onClick={handleClick} className="inline-flex cursor-pointer">
        {buttonText}
      </div>
      {showLoginModal && (
        <LoginModal
          onSuccess={handleLoginSuccess}
          open={showLoginModal}
          onOpenChange={setShowLoginModal}
        />
      )}
      {children}
    </>
  )
}
