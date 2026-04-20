import { RootState } from '../store'
import { UserRole } from '@/types/roles'
import { Car } from '@/types'

export const selectRoleBasedCars = (state: RootState): Car[] => {
  const { user } = state.auth
  if (!user) return []
  void UserRole
  return []
}

export const selectPaginatedRoleBasedCars = (state: RootState): Car[] =>
  selectRoleBasedCars(state)

export const selectRoleBasedCarsCount = (state: RootState): number =>
  selectRoleBasedCars(state).length

export const selectRoleBasedTotalPages = (state: RootState): number => {
  const count = selectRoleBasedCarsCount(state)
  if (count === 0) return 1
  return 1
}

export const selectCanModifyItem = (
  state: RootState,
  itemBusinessId?: string
): boolean => {
  const { user } = state.auth
  if (!user) return false

  if (user.role === UserRole.SUPER_ADMIN) {
    return true
  }
  void itemBusinessId

  return false
}
