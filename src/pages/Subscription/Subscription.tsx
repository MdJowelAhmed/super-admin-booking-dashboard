import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { CardContent } from '@/components/ui/card'
import { Pagination } from '@/components/common/Pagination'
import { useUrlNumber } from '@/hooks/useUrlState'
import { useAppSelector } from '@/redux/hooks'
import { UserRole } from '@/types/roles'
import type { SubscriptionRow } from './subscriptionData'
import { SubscriptionTable } from './components/SubscriptionTable'
import { useGetSubscriptionUsersQuery } from '@/redux/api/subscriptionUserApi'

// (purchase flow helpers removed — super-admin only)

export default function Subscription() {
  const { user } = useAppSelector((s) => s.auth)
  const role = user?.role ?? ''
  const isSuperAdmin = role === UserRole.SUPER_ADMIN

  const [page, setPage] = useUrlNumber('page', 1)
  const [limit, setLimit] = useUrlNumber('limit', 10)

  const { data, isLoading } = useGetSubscriptionUsersQuery(
    { page, limit },
    { skip: !isSuperAdmin }
  )

  const tableRows: SubscriptionRow[] = useMemo(() => {
    if (!isSuperAdmin) return []
    const docs = data?.data?.data ?? []

    return docs.map((doc, idx) => {
      const statusRaw = String(doc.status ?? '').toLowerCase()
      const status: SubscriptionRow['status'] =
        statusRaw === 'active' ? 'active' : 'expired'

      const userRole = String(doc.userId?.role ?? '').toUpperCase()
      const accountType: SubscriptionRow['accountType'] =
        userRole === 'HOST' ? 'host' : 'business'

      return {
        id: doc._id,
        displaySerial: `#${(page - 1) * limit + idx + 1}`,
        packageName: doc.package?.title ?? '—',
        purchasedAt: doc.currentPeriodStart ?? doc.createdAt,
        endsAt: doc.currentPeriodEnd ?? doc.updatedAt ?? doc.createdAt,
        price: Number(doc.price ?? 0),
        currency: 'USD',
        status,
        userName: doc.userId?.name ?? '—',
        userEmail: doc.userId?.email ?? '—',
        accountType,
      }
    })
  }, [data, isSuperAdmin, limit, page])

  const totalItems = isSuperAdmin ? (data?.data?.meta?.total ?? 0) : 0
  const totalPages = isSuperAdmin ? (data?.data?.meta?.totalPages ?? 1) : 1

  const pageItems = tableRows

  // (buy flow removed — super-admin only)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="rounded-2xl border-0 bg-white shadow-sm">
        <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#2d2d2d] md:text-3xl">
              Subscription
            </h1>
            <p className="mt-1 text-sm text-muted-foreground md:text-base">
              Review and update all subscriber records
            </p>
          </div>
        </div>

        <CardContent className="p-0">
          <SubscriptionTable mode="admin" rows={isLoading ? [] : pageItems} />
          <div className="border-t border-gray-100 px-6 py-4">
            <Pagination
              currentPage={Math.min(page, totalPages)}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={limit}
              onPageChange={setPage}
              onItemsPerPageChange={(n) => {
                setLimit(n)
                setPage(1)
              }}
            />
          </div>
        </CardContent>
      </div>
    </motion.div>
  )
}
