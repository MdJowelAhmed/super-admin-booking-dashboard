import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CardContent } from '@/components/ui/card'
import { Pagination } from '@/components/common/Pagination'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { useUrlNumber } from '@/hooks/useUrlState'
import { mockControllers, type ControllerAccount } from './controllerData'
import { ControllerTable } from './components/ControllerTable'
import { ControllerDetailsModal } from './components/ControllerDetailsModal'
import { toast } from '@/utils/toast'

export default function ControllerPage() {
  const [page, setPage] = useUrlNumber('page', 1)
  const [limit, setLimit] = useUrlNumber('limit', 10)

  const [rows, setRows] = useState<ControllerAccount[]>(mockControllers)
  const [tab, setTab] = useState<'host' | 'business'>('host')
  const [detailsTarget, setDetailsTarget] = useState<ControllerAccount | null>(null)
  const [acceptTarget, setAcceptTarget] = useState<ControllerAccount | null>(null)
  const [rejectTarget, setRejectTarget] = useState<ControllerAccount | null>(null)

  const filteredRows = useMemo(() => rows.filter((r) => r.role === tab), [rows, tab])
  const totalItems = filteredRows.length
  const totalPages = Math.max(1, Math.ceil(totalItems / limit))

  const pageItems = useMemo(() => {
    const start = (page - 1) * limit
    return filteredRows.slice(start, start + limit)
  }, [filteredRows, page, limit])

  const requestAccept = (row: ControllerAccount) => {
    if (row.status !== 'pending') return
    setAcceptTarget(row)
  }

  const requestReject = (row: ControllerAccount) => {
    if (row.status !== 'pending') return
    setRejectTarget(row)
  }

  const confirmAccept = () => {
    if (!acceptTarget) return
    setRows((prev) =>
      prev.map((r) => (r.id === acceptTarget.id ? { ...r, status: 'accepted' } : r))
    )
    toast({ variant: 'success', title: 'Accepted' })
    setAcceptTarget(null)
  }

  const confirmReject = () => {
    if (!rejectTarget) return
    setRows((prev) =>
      prev.map((r) => (r.id === rejectTarget.id ? { ...r, status: 'rejected' } : r))
    )
    toast({ variant: 'success', title: 'Rejected' })
    setRejectTarget(null)
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
              Controller
            </h1>
            <p className="mt-1 text-sm text-muted-foreground md:text-base">
              Review host and business accounts and approve or reject pending requests
            </p>
          </div>
        </div>

        <CardContent className="p-0">
          <Tabs value={tab} onValueChange={(v) => {
            setTab(v as 'host' | 'business')
            setPage(1)
          }}>
            <div className="px-6 pt-4">
              <TabsList>
                <TabsTrigger value="host">Host</TabsTrigger>
                <TabsTrigger value="business">Business</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="host" className="mt-0">
              <ControllerTable
                rows={pageItems}
                onDetails={setDetailsTarget}
                onAccept={requestAccept}
                onReject={requestReject}
              />
            </TabsContent>

            <TabsContent value="business" className="mt-0">
              <ControllerTable
                rows={pageItems}
                onDetails={setDetailsTarget}
                onAccept={requestAccept}
                onReject={requestReject}
              />
            </TabsContent>
          </Tabs>
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
        open={!!acceptTarget}
        onClose={() => setAcceptTarget(null)}
        onConfirm={confirmAccept}
        title="Accept account?"
        description={
          acceptTarget
            ? `Accept ${acceptTarget.name} (${acceptTarget.email})?`
            : ''
        }
        confirmText="Accept"
      />

      <ConfirmDialog
        open={!!rejectTarget}
        onClose={() => setRejectTarget(null)}
        onConfirm={confirmReject}
        title="Reject account?"
        description={
          rejectTarget
            ? `Reject ${rejectTarget.name} (${rejectTarget.email})?`
            : ''
        }
        confirmText="Reject"
        variant="danger"
      />

      <ControllerDetailsModal
        open={!!detailsTarget}
        onClose={() => setDetailsTarget(null)}
        row={detailsTarget}
        onAccept={requestAccept}
        onReject={requestReject}
      />
    </motion.div>
  )
}
