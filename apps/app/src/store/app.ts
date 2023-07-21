/* eslint-disable no-unused-vars */
import { ProfileFragment as Profile } from '@lens-protocol/client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const getHasCookies = () => {
  const store = localStorage.getItem('bcharity.cookies')
  const store_obj = JSON.parse(store ? store : '')
  if (store_obj.state) return store_obj.state.hasCookies
  return false
}

interface AppState {
  profiles: Profile[] | []
  setProfiles: (profiles: Profile[]) => void
  userSigNonce: number
  setUserSigNonce: (userSigNonce: number) => void
}

export const useAppStore = create<AppState>((set, get) => ({
  profiles: [],
  setProfiles: (profiles) => set(() => ({ profiles })),
  userSigNonce: 0,
  setUserSigNonce: (userSigNonce) => set(() => ({ userSigNonce }))
}))

interface AppPersistState {
  isConnected: boolean
  setIsConnected: (isConnected: boolean) => void
  isAuthenticated: boolean
  setIsAuthenticated: (isAuthenticated: boolean) => void
  currentUser: Profile | null
  setCurrentUser: (currentUser: Profile | null) => void
}

export const useAppPersistStore = create(
  persist<AppPersistState>(
    (set) => ({
      isConnected: false,
      setIsConnected: (isConnected) => {
        if (getHasCookies()) set(() => ({ isConnected }))
      },
      isAuthenticated: false,
      setIsAuthenticated: (isAuthenticated) => {
        if (getHasCookies()) set(() => ({ isAuthenticated }))
      },
      currentUser: null,
      setCurrentUser: (currentUser) => {
        if (getHasCookies()) set(() => ({ currentUser }))
      }
    }),
    { name: 'bcharity.store' }
  )
)

interface CookieState {
  hasCookies: boolean
  setHasCookies: (hasCookies: boolean) => void
}

export const useCookies = create(
  persist<CookieState>(
    (set) => ({
      hasCookies: false,
      setHasCookies: (hasCookies) => set(() => ({ hasCookies }))
    }),
    { name: 'bcharity.cookies' }
  )
)
