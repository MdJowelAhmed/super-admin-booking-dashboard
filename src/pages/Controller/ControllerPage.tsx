import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Pagination } from '@/components/common/Pagination'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { useUrlNumber } from '@/hooks/useUrlState'
import { mapBusinessRequestToAccount } from './controllerData'
import type { ControllerAccount } from './controllerData'
import { ControllerTable } from './components/ControllerTable'
import { ControllerDetailsModal } from './components/ControllerDetailsModal'
import { toast } from '@/utils/toast'
import {
  useGetBusinessRequestsQuery,
  useUpdateBusinessRequestStatusMutation,
  type ApiBusinessRoleType,
} from '@/redux/api/controllerApi'

function getErrorMessage(err: unknown): string {
  if (
    err &&
    typeof err === 'object' &&
    'data' in err &&
    err.data &&
    typeof err.data === 'object' &&
    'message' in err.data &&
    typeof (err.data as { message: unknown }).message === 'string'
  ) {
    return (err.data as { message: string }).message
  }
  if (err instanceof Error) return err.message
  return 'Something went wrong. Please try again.'
}

export default function ControllerPage() {
  const [page, setPage] = useUrlNumber('page', 1)
  const [limit, setLimit] = useUrlNumber('limit', 10)

  const [tab, setTab] = useState<'host' | 'business'>('host')
  const [detailsTarget, setDetailsTarget] = useState<ControllerAccount | null>(null)
  const [acceptTarget, setAcceptTarget] = useState<ControllerAccount | null>(null)
  const [rejectTarget, setRejectTarget] = useState<ControllerAccount | null>(null)

  const roleType: ApiBusinessRoleType = tab === 'host' ? 'HOST' : 'SERVICE'

  const { data, isLoading, isFetching, isError, error } = useGetBusinessRequestsQuery({
    page,
    limit,
    roleType,
  })

  const [updateStatus, { isLoading: isUpdating }] =
    useUpdateBusinessRequestStatusMutation()

  const rows = useMemo(
    () => (data?.data ?? []).map(mapBusinessRequestToAccount),
    [data?.data]
  )

  const meta = data?.meta
  const totalItems = meta?.total ?? 0
  const totalPages = Math.max(1, meta?.totalPage ?? 1)

  const listBusy = isLoading || isFetching

  const requestAccept = (row: ControllerAccount) => {
    if (row.status !== 'pending') return
    setAcceptTarget(row)
  }

  const requestReject = (row: ControllerAccount) => {
    if (row.status !== 'pending') return
    setRejectTarget(row)
  }

  const confirmAccept = async () => {
    if (!acceptTarget) return
    try {
      await updateStatus({
        id: acceptTarget.id,
        body: { status: 'approved' },
      }).unwrap()
      toast({ variant: 'success', title: 'Approved' })
      setAcceptTarget(null)
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Could not approve',
        description: getErrorMessage(err),
      })
    }
  }

  const confirmReject = async () => {
    if (!rejectTarget) return
    try {
      await updateStatus({
        id: rejectTarget.id,
        body: { status: 'rejected' },
      }).unwrap()
      toast({ variant: 'success', title: 'Rejected' })
      setRejectTarget(null)
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Could not reject',
        description: getErrorMessage(err),
      })
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="rounded-2xl border-0 bg-white shadow-sm">
        <div className="flex flex-col gap-2 border-b border-gray-100 px-6 py-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#2d2d2d] md:text-3xl">
              Business requests
            </h1>
            <p className="mt-1 text-sm text-muted-foreground md:text-base">
              Review host and service (business) applications. Approve or reject pending
              requests.
            </p>
            {isError && (
              <p className="mt-2 text-sm text-destructive">{getErrorMessage(error)}</p>
            )}
          </div>
        </div>

        <CardContent className="p-0">
          <Tabs
            value={tab}
            onValueChange={(v) => {
              setTab(v as 'host' | 'business')
              setPage(1)
            }}
          >
            <div className="px-6 pt-4">
              <TabsList>
                <TabsTrigger value="host">Host</TabsTrigger>
                <TabsTrigger value="business">Business</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="host" className="mt-0">
              <ControllerTable
                rows={rows}
                onDetails={setDetailsTarget}
                onAccept={requestAccept}
                onReject={requestReject}
                isLoading={listBusy}
              />
            </TabsContent>

            <TabsContent value="business" className="mt-0">
              <ControllerTable
                rows={rows}
                onDetails={setDetailsTarget}
                onAccept={requestAccept}
                onReject={requestReject}
                isLoading={listBusy}
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
        title="Approve request?"
        description={
          acceptTarget
            ? `Approve ${acceptTarget.name} (${acceptTarget.email})?`
            : ''
        }
        confirmText="Approve"
        variant="info"
        isLoading={isUpdating}
      />

      <ConfirmDialog
        open={!!rejectTarget}
        onClose={() => setRejectTarget(null)}
        onConfirm={confirmReject}
        title="Reject request?"
        description={
          rejectTarget
            ? `Reject ${rejectTarget.name} (${rejectTarget.email})?`
            : ''
        }
        confirmText="Reject"
        variant="danger"
        isLoading={isUpdating}
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
