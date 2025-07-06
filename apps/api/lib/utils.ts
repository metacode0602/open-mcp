
// 格式化日期
export const formatDate = (dateString?: string | Date | null) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const getAssetUrl = (assetId?: string | null) => {
  if (assetId) {
    return `/api/assets/${assetId}`;

  }
  return "/placeholder.svg";
}

export const formatNumber = (number: number | string) => {
  return number.toLocaleString("zh-CN", {
    maximumFractionDigits: 2,
  });
}


// This is a mock implementation for demonstration purposes
// In a real app, you would integrate with your authentication provider

/**
 * Sends a verification code to the provided phone number
 */
export async function sendVerificationCode(phone: string): Promise<void> {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`Verification code sent to ${phone}`)
      resolve()
    }, 1000)
  })
}

/**
 * Verifies the code sent to the provided phone number
 */
export async function verifyPhoneCode(phone: string, code: string): Promise<void> {
  // Simulate API call
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // For demo purposes, any code "123456" is valid
      if (code === "123456") {
        console.log(`Phone ${phone} verified with code ${code}`)
        resolve()
      } else {
        reject(new Error("Invalid verification code"))
      }
    }, 1000)
  })
}

/**
 * Sends an OTP code to the provided email address
 */
export async function sendEmailOTP(email: string): Promise<void> {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`OTP code sent to ${email}`)
      resolve()
    }, 1000)
  })
}

/**
 * Verifies the OTP code sent to the provided email address
 */
export async function verifyEmailOTP(email: string, otp: string): Promise<void> {
  // Simulate API call
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // For demo purposes, any code "123456" is valid
      if (otp === "123456") {
        console.log(`Email ${email} verified with OTP ${otp}`)
        resolve()
      } else {
        reject(new Error("Invalid OTP code"))
      }
    }, 1000)
  })
}

/**
 * Checks if the user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  // In a real app, you would check the session/token
  return false
}

/**
 * Signs the user out
 */
export async function signOut(): Promise<void> {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log("User signed out")
      resolve()
    }, 500)
  })
}
