/** Which app audience this banner is for (set by super admin on create/edit). */
export type AppSliderTargetType = 'host' | 'business'

export interface AppSliderItem {
  id: string
  /** Displayed in the S.No column, e.g. #1 (from pagination) */
  displaySerial: string
  imageUrl: string
  createdAt: string
  updatedAt?: string
  /** Not returned by banner API; reserved for future owner scoping */
  userEmail: string
  name: string
  buttonLabel: string
  targetType: AppSliderTargetType
}
