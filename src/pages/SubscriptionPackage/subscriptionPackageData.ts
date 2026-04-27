import type { PaymentType, SubscriptionPackageApiDoc } from '@/redux/api/subscriptionPackage'

export type AdminSubscriptionPackageFeature = {
  name?: string
  description: string
  limit: number | null
  isUnlimited: boolean
}

/** Package definition managed by super-admin (from API). */
export interface AdminSubscriptionPackage {
  id: string
  title: string
  description: string
  price: number
  duration: string
  paymentType: PaymentType | string
  features: AdminSubscriptionPackageFeature[]
  status?: string
  subscriptionType?: string
  createdAt?: string
  updatedAt?: string
}

export function mapSubscriptionPackageFromApi(
  doc: SubscriptionPackageApiDoc
): AdminSubscriptionPackage {
  return {
    id: doc._id,
    title: doc.title,
    description: doc.description,
    price: doc.price,
    duration: doc.duration,
    paymentType: doc.paymentType,
    features: (doc.features ?? []).map((f) => ({
      name: f.name,
      description: f.description,
      limit: f.limit ?? null,
      isUnlimited: !!f.isUnlimited,
    })),
    status: doc.status,
    subscriptionType: doc.subscriptionType,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  }
}
