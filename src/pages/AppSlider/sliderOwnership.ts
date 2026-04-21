import type { AppSliderItem } from './sliderData'

/** Host/business may edit/delete only sliders they created (same email as session). */
export function isAppSliderOwner(slider: AppSliderItem, sessionEmail: string | undefined | null): boolean {
  const b = slider.userEmail?.trim().toLowerCase() ?? ''
  if (!b) {
    return true
  }
  const a = sessionEmail?.trim().toLowerCase() ?? ''
  return a.length > 0 && a === b
}
