import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { parseJwtPayload } from '@/utils/jwt'

export type AuthUserRole = 'super-admin'

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  avatar?: string
  role: AuthUserRole
  businessId?: string
  businessName?: string
}

/** Maps legacy stored roles and API values to current AuthUserRole */
export function normalizeAuthRole(role: string): AuthUserRole {
  if (role === 'super-admin') return 'super-admin'
  if (role === 'SUPER_ADMIN') return 'super-admin'
  // legacy roles → super-admin (host/business removed)
  if (role === 'host') return 'super-admin'
  if (role === 'business') return 'super-admin'
  if (role === 'admin') return 'super-admin'
  if (role === 'employee') return 'super-admin'
  return 'super-admin'
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  passwordResetEmail: string | null
  verificationEmail: string | null
}

function userFromAccessToken(token: string | null): User | null {
  if (!token) return null
  const claims = parseJwtPayload<{
    id?: string
    email?: string
    role?: string
  }>(token)
  if (!claims?.id && !claims?.email) return null
  const email = claims.email ?? ''
  const localPart = email.includes('@') ? email.split('@')[0]! : email
  return {
    id: claims.id ?? '',
    email,
    firstName: localPart || 'User',
    lastName: '',
    role: normalizeAuthRole(claims.role ?? 'super-admin'),
  }
}

function readTokenFromStorage(): string | null {
  try {
    localStorage.removeItem('user')
    const token = localStorage.getItem('token')
    if (!token) return null
    const user = userFromAccessToken(token)
    if (!user) {
      localStorage.removeItem('token')
      return null
    }
    return token
  } catch {
    return null
  }
}

const storedToken = readTokenFromStorage()

const initialState: AuthState = {
  user: userFromAccessToken(storedToken),
  token: storedToken,
  isAuthenticated: !!storedToken,
  isLoading: false,
  error: null,
  passwordResetEmail: null,
  verificationEmail: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    loginSuccess: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.isLoading = false
      state.isAuthenticated = true
      const user = {
        ...action.payload.user,
        role: normalizeAuthRole(action.payload.user.role),
      }
      state.user = user
      state.token = action.payload.token
      state.error = null
      localStorage.setItem('token', action.payload.token)
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.error = action.payload
    },
    logout: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      state.error = null
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
    },
    setPasswordResetEmail: (state, action: PayloadAction<string>) => {
      state.passwordResetEmail = action.payload
    },
    setVerificationEmail: (state, action: PayloadAction<string>) => {
      state.verificationEmail = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    loadUserFromStorage: (state) => {
      const token = readTokenFromStorage()
      const user = userFromAccessToken(token)
      state.token = token
      state.user = user
      state.isAuthenticated = !!token && !!user
    },
  },
})

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  setPasswordResetEmail,
  setVerificationEmail,
  clearError,
  setLoading,
  loadUserFromStorage,
} = authSlice.actions

export default authSlice.reducer












