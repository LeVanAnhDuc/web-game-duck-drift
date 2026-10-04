import { useEffect, useSyncExternalStore } from 'react'
import { DUCKER_CONFIG } from '@/auth/config'
import { settleCallbackUrl } from '@/auth/duckerAuth'
import { getServerSnapshot, getSnapshot, signIn, signOut, subscribe } from '@/auth/duckerSession'
import type { AuthSnapshot } from '@/auth/types'

export type DuckerAuth = AuthSnapshot & {
  enabled: boolean
  profileUrl: string | null
  signIn: () => void
  signOut: () => void
}

export function useDuckerAuth(): DuckerAuth {
  // Server snapshot luôn là idle nên lần render đầu của client khớp HTML tĩnh.
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  // Next ghi URL hydrate (còn ?code&state) lại vào history — đặt lại URL sạch, một lần.
  useEffect(() => settleCallbackUrl(), [])
  return {
    ...snapshot,
    enabled: DUCKER_CONFIG !== null,
    profileUrl: DUCKER_CONFIG ? DUCKER_CONFIG.profileUrl : null,
    signIn,
    signOut,
  }
}
