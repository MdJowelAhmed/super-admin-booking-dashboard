import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { Pagination } from '@/components/common/Pagination'
import { useUrlNumber } from '@/hooks/useUrlState'
import {
  mapSubscriptionPackageFromApi,
  type AdminSubscriptionPackage,
} from './subscriptionPackageData'
import { SubscriptionPackageCard } from './components/SubscriptionPackageCard'
import {
  AddEditPackageModal,
  type SaveSubscriptionPackageInput,
} from './components/AddEditPackageModal'
import {
  useAddSubscriptionPackageMutation,
  useDeleteSubscriptionPackageMutation,
  useGetSubscriptionPackagesQuery,
  useUpdateSubscriptionPackageMutation,
} from '@/redux/api/subscriptionPackage'
import { toast } from '@/utils/toast'

export default function SubscriptionPackagePage() {
  const [page, setPage] = useUrlNumber('page', 1)
  const [limit, setLimit] = useUrlNumber('limit', 10)

  const { data, isFetching } = useGetSubscriptionPackagesQuery({ page, limit })
  const [addPackage] = useAddSubscriptionPackageMutation()
  const [updatePackage] = useUpdateSubscriptionPackageMutation()
  const [deletePackage, { isLoading: isDeleting }] = useDeleteSubscriptionPackageMutation()

  const packages = useMemo(
    () => (data?.data ?? []).map(mapSubscriptionPackageFromApi),
    [data?.data]
  )

  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [editing, setEditing] = useState<AdminSubscriptionPackage | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AdminSubscriptionPackage | null>(null)

  const openCreate = () => {
    setModalMode('create')
    setEditing(null)
    setModalOpen(true)
  }

  const openEdit = (pkg: AdminSubscriptionPackage) => {
    setModalMode('edit')
    setEditing(pkg)
    setModalOpen(true)
  }

  const handleSave = async (payload: SaveSubscriptionPackageInput) => {
    try {
      if (modalMode === 'edit' && payload.id) {
        await updatePackage({
          id: payload.id,
          title: payload.title,
          description: payload.description,
          price: payload.price,
          duration: payload.duration,
          paymentType: payload.paymentType,
          features: payload.features,
        }).unwrap()
        toast({ variant: 'success', title: 'Package updated' })
      } else {
        await addPackage({
          title: payload.title,
          description: payload.description,
          price: payload.price,
          duration: payload.duration,
          paymentType: payload.paymentType,
          features: payload.features,
        }).unwrap()
        toast({ variant: 'success', title: 'Package created' })
      }
    } catch {
      toast({ variant: 'destructive', title: 'Action failed' })
    }
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    try {
      await deletePackage(deleteTarget.id).unwrap()
      toast({ variant: 'success', title: 'Package deleted' })
      setDeleteTarget(null)
    } catch {
      toast({ variant: 'destructive', title: 'Delete failed' })
    }
  }

  const totalItems = data?.meta?.total ?? packages.length
  const totalPages = Math.max(1, data?.meta?.totalPage ?? 1)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#2d2d2d] md:text-3xl">
            Subscription Package
          </h1>
          <p className="mt-1 text-sm text-muted-foreground md:text-base">
            Create and manage subscription plans shown to hosts and businesses
          </p>
        </div>
        <Button
          type="button"
          onClick={openCreate}
          className="shrink-0 gap-2 rounded-md bg-primary text-white hover:bg-[#5aad26]"
        >
          <Plus className="h-5 w-5" />
          Add package
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {packages.map((pkg, index) => (
          <motion.div
            key={pkg.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06 * index }}
            className="h-full"
          >
            <SubscriptionPackageCard pkg={pkg} onEdit={openEdit} onDelete={setDeleteTarget} />
          </motion.div>
        ))}
      </div>

      {packages.length === 0 && (
        <p className="text-center text-muted-foreground py-12 border rounded-xl bg-white">
          {isFetching
            ? 'Loading packages…'
            : 'No packages yet. Click "Add package" to create one.'}
        </p>
      )}

      <div className="border-t border-gray-100 px-6 py-4 bg-white rounded-2xl shadow-sm">
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

      <AddEditPackageModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setEditing(null)
        }}
        mode={modalMode}
        pkg={editing}
        onSave={handleSave}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete package"
        description={
          deleteTarget
            ? `Remove the “${deleteTarget.title}” package? Subscribers may still reference it until you update billing.`
            : ''
        }
        confirmText="Delete"
        isLoading={isDeleting}
      />
    </motion.div>
  )
}
