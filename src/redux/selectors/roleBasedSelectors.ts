import { RootState } from '../store'
import { UserRole } from '@/types/roles'
import { Car } from '@/types'

/**
 * Selector to get cars filtered by user role
 * Admin sees all cars, Business users see only their cars
 */
export const selectRoleBasedCars = (state: RootState): Car[] => {
  const { user } = state.auth

  if (!user) return []

  // NOTE: There is currently no `cars` slice in the store.
  // Keep selectors stable for callers, but return empty until cars state is added.
  void UserRole
  return []
}

/**
 * Selector to get paginated cars based on role
 */
export const selectPaginatedRoleBasedCars = (state: RootState): Car[] => {
  const roleBasedCars = selectRoleBasedCars(state)
  return roleBasedCars
}

/**
 * Selector to get total count of role-based filtered cars
 */
export const selectRoleBasedCarsCount = (state: RootState): number => {
  return selectRoleBasedCars(state).length
}

/**
 * Selector to calculate total pages for role-based filtered cars
 */
export const selectRoleBasedTotalPages = (state: RootState): number => {
  const count = selectRoleBasedCarsCount(state)
  if (count === 0) return 1
  return 1
}

/**
 * Check if user can modify a specific item
 */
export const selectCanModifyItem = (state: RootState, itemBusinessId?: string): boolean => {
  const { user } = state.auth

  if (!user) return false

  // Admin can modify everything
  if (user.role === UserRole.ADMIN) return true

  // Business users can only modify their own items
  if (user.role === UserRole.EMPLOYEE && user.businessId) {
    return itemBusinessId === user.businessId
  }

  return false
}
