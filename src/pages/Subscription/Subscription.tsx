import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { CardContent } from '@/components/ui/card'
import { Pagination } from '@/components/common/Pagination'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { useUrlNumber } from '@/hooks/useUrlState'
import { useAppSelector } from '@/redux/hooks'
import { UserRole } from '@/types/roles'
import {
  mockSubscriptions,
  type SubscriptionRow,
} from './subscriptionData'
import { SubscriptionTable } from './components/SubscriptionTable'
import { toast } from '@/utils/toast'

// (purchase flow helpers removed — super-admin only)

export default function Subscription() {
  const { user } = useAppSelector((s) => s.auth)
  const role = user?.role ?? ''
  const isSuperAdmin = role === UserRole.SUPER_ADMIN

  const [page, setPage] = useUrlNumber('page', 1)
  const [limit, setLimit] = useUrlNumber('limit', 10)

  const [rows, setRows] = useState<SubscriptionRow[]>(mockSubscriptions)
  const [cancelTarget, setCancelTarget] = useState<SubscriptionRow | null>(null)

  const tableRows = isSuperAdmin ? rows : []

  const totalItems = tableRows.length
  const totalPages = Math.max(1, Math.ceil(totalItems / limit))

  const pageItems = useMemo(() => {
    const start = (page - 1) * limit
    return tableRows.slice(start, start + limit)
  }, [tableRows, page, limit])

  // (buy flow removed — super-admin only)

  const confirmCancelSubscription = () => {
    if (!cancelTarget) return
    setRows((prev) =>
      prev.map((r) =>
        r.id === cancelTarget.id ? { ...r, status: 'expired' as const } : r
      )
    )
    toast({ variant: 'success', title: 'Subscription cancelled' })
    setCancelTarget(null)
  }

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
          <SubscriptionTable mode="admin" rows={pageItems} />
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

      <ConfirmDialog
        open={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        onConfirm={confirmCancelSubscription}
        title="Cancel subscription?"
        description={
          cancelTarget
            ? `Cancel “${cancelTarget.packageName}”? Your access will end after the current period (shown as expired in this demo).`
            : ''
        }
        confirmText="Cancel subscription"
      />
    </motion.div>
  )
}
