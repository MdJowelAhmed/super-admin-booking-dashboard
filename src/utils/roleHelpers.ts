import { UserRole } from '@/types/roles'

export const addBusinessIdToMockData = <T extends Record<string, unknown>>(
  data: T[],
  businessIdField: string = 'businessId'
): T[] => {
  const businessIds = ['business-001', 'business-002', 'business-003']
  return data.map((item, index) => ({
    ...item,
    [businessIdField]: businessIds[index % businessIds.length],
  }))
}

export const filterDataByRole = <T extends Record<string, unknown>>(
  data: T[],
  userRole: string,
  userBusinessId?: string,
  businessIdField: string = 'businessId'
): T[] => {
  void userBusinessId
  void businessIdField

  if (userRole === UserRole.SUPER_ADMIN) {
    return data
  }

  return []
}

export const canAccessItem = (
  item: Record<string, unknown>,
  userRole: string,
  userBusinessId?: string,
  businessIdField: string = 'businessId'
): boolean => {
  void item
  void userBusinessId
  void businessIdField

  if (userRole === UserRole.SUPER_ADMIN) {
    return true
  }

  return false
}

export const getRoleBadgeColor = (role: string): string => {
  switch (role) {
    case UserRole.SUPER_ADMIN:
      return 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-100'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
  }
}

export const getRoleDisplayName = (role: string): string => {
  switch (role) {
    case UserRole.SUPER_ADMIN:
      return 'Super Admin'
    case 'host':
    case 'HOST':
      return 'Host'
    case 'business':
    case 'SERVICE':
    case 'BUSINESS':
      return 'Business'
    default:
      return role ? role.charAt(0).toUpperCase() + role.slice(1) : 'Unknown'
  }
}
