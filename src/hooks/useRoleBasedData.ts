import { useMemo } from 'react'
import { useAppSelector } from '@/redux/hooks'
import { UserRole } from '@/types/roles'

interface DataItem {
  businessId?: string
  userId?: string
  [key: string]: string | number | undefined
}

/** Super-admin only: return full dataset when logged in. */
export const useRoleBasedData = <T extends DataItem>(data: T[]): T[] => {
  const { user } = useAppSelector((state) => state.auth)

  return useMemo(() => {
    if (!user) return []

    if (user.role === UserRole.SUPER_ADMIN) {
      return data
    }

    return []
  }, [data, user])
}

/** @deprecated Use useIsHost — kept for compatibility */
export const useIsAdmin = (): boolean => {
  const { user } = useAppSelector((state) => state.auth)
  return user?.role === UserRole.SUPER_ADMIN
}

/** @deprecated Kept for compatibility; host role removed. */
export const useIsHost = (): boolean => {
  const { user } = useAppSelector((state) => state.auth)
  return user?.role === UserRole.SUPER_ADMIN
}

/** @deprecated Kept for compatibility; business role removed. */
export const useIsBusiness = (): boolean => {
  const { user } = useAppSelector((state) => state.auth)
  return user?.role === UserRole.SUPER_ADMIN
}

export const useBusinessId = (): string | undefined => {
  const { user } = useAppSelector((state) => state.auth)
  return user?.businessId
}

export const useCanModifyItem = (item: DataItem): boolean => {
  const { user } = useAppSelector((state) => state.auth)

  if (!user) return false

  if (user.role === UserRole.SUPER_ADMIN) {
    return true
  }

  void item
  return false
}
