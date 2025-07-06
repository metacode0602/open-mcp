import { authClient } from "@/lib/auth-client"
import { createAuthHooks } from "@daveyplate/better-auth-tanstack"

export const authHooks = createAuthHooks(authClient) as ReturnType<typeof createAuthHooks>

export const {
  useSession,
  usePrefetchSession,
  useToken,
  useListAccounts,
  useListSessions,
  useListDeviceSessions,
  useListPasskeys,
  useUpdateUser,
  useUnlinkAccount,
  useRevokeOtherSessions,
  useRevokeSession,
  useRevokeSessions,
  useSetActiveSession,
  useRevokeDeviceSession,
  useDeletePasskey,
  useAuthQuery,
  useAuthMutation
} = authHooks
