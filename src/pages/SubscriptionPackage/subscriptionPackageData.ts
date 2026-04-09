import { PACKAGE_TIERS } from '@/pages/Subscription/subscriptionData'

/** Package definition managed by super-admin (drives card UI + buy flow can sync later). */
export interface AdminSubscriptionPackage {
  id: string
  name: string
  price: number
  billingLabel: string
  mostPopular: boolean
  featureLabels: [string, string, string]
  features: [boolean, boolean, boolean]
}

export function tierSeedToAdminPackages(): AdminSubscriptionPackage[] {
  return PACKAGE_TIERS.map((t) => ({
    id: t.id,
    name: t.badge,
    price: t.price,
    billingLabel: t.billingLabel,
    mostPopular: !!t.mostPopular,
    featureLabels: [t.featureLabels[0], t.featureLabels[1], t.featureLabels[2]] as [
      string,
      string,
      string,
    ],
    features: [t.features[0], t.features[1], t.features[2]] as [boolean, boolean, boolean],
  }))
}
