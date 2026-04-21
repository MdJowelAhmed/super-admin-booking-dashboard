import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CardContent } from '@/components/ui/card'
import { Pagination } from '@/components/common/Pagination'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { useUrlNumber } from '@/hooks/useUrlState'
import { useAppSelector } from '@/redux/hooks'
import { UserRole } from '@/types/roles'
import type { AppSliderItem, AppSliderTargetType } from './sliderData'
import { CreateEditSliderModal } from './components/CreateEditSliderModal'
import { AppSliderTable } from './components/AppSliderTable'
import {
  apiTypeFromTarget,
  buildBannerFormData,
  mapBannerToSliderRow,
  useAddAppSliderMutation,
  useDeleteAppSliderMutation,
  useGetAppSliderQuery,
  useUpdateAppSliderMutation,
} from '@/redux/api/appSliderApi'
import { toast } from '@/utils/toast'

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

export default function AppSlider() {
  const { user } = useAppSelector((state) => state.auth)
  const role = user?.role ?? ''
  const isSuperAdmin = role === UserRole.SUPER_ADMIN
  const defaultTargetType: AppSliderTargetType = 'host'

  const [page, setPage] = useUrlNumber('page', 1)
  const [limit, setLimit] = useUrlNumber('limit', 10)

  const { data, isLoading, isFetching, isError, error } = useGetAppSliderQuery({
    page,
    limit,
  })

  const [addAppSlider] = useAddAppSliderMutation()
  const [updateAppSlider] = useUpdateAppSliderMutation()
  const [deleteAppSlider] = useDeleteAppSliderMutation()

  const [createEditOpen, setCreateEditOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [editingSlider, setEditingSlider] = useState<AppSliderItem | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AppSliderItem | null>(null)

  const meta = data?.meta
  const totalItems = meta?.total ?? 0
  const totalPages = Math.max(1, meta?.totalPage ?? 1)

  const sliders = useMemo(() => {
    const list = data?.data ?? []
    return list.map((b, i) => mapBannerToSliderRow(b, i, page, limit))
  }, [data?.data, page, limit])

  const openCreate = () => {
    setModalMode('create')
    setEditingSlider(null)
    setCreateEditOpen(true)
  }

  const openEdit = (slider: AppSliderItem) => {
    setModalMode('edit')
    setEditingSlider(slider)
    setCreateEditOpen(true)
  }

  const requestDelete = (slider: AppSliderItem) => {
    setDeleteTarget(slider)
  }

  const handleSave = async (payload: {
    name: string
    buttonLabel: string
    imageFile: File | null
    targetType: AppSliderTargetType
  }) => {
    const typeStr = apiTypeFromTarget(payload.targetType)
    const dataPayload = {
      name: payload.name,
      buttonText: payload.buttonLabel,
      type: typeStr,
    }

    if (modalMode === 'create') {
      if (!payload.imageFile) {
        toast({
          variant: 'destructive',
          title: 'Please upload a banner image',
        })
        throw new Error('Missing image')
      }
      const formData = buildBannerFormData(dataPayload, payload.imageFile)
      await addAppSlider(formData).unwrap()
      toast({
        variant: 'success',
        title: 'Slider created',
      })
      return
    }

    if (!editingSlider) {
      throw new Error('No slider selected')
    }

    const formData = buildBannerFormData(
      dataPayload,
      payload.imageFile ?? undefined
    )
    await updateAppSlider({
      id: editingSlider.id,
      formData,
    }).unwrap()
    toast({
      variant: 'success',
      title: 'Slider updated',
    })
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteAppSlider(deleteTarget.id).unwrap()
      toast({ variant: 'success', title: 'Slider deleted' })
      setDeleteTarget(null)
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Could not delete slider',
        description: getErrorMessage(err),
      })
    }
  }

  const listBusy = isLoading || isFetching

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="bg-white border-0 shadow-sm rounded-2xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between p-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#2d2d2d] md:text-3xl">
              App Slider
            </h1>
            <p className="mt-1 text-sm text-muted-foreground md:text-base">
              Create, edit, or delete app banners. Choose whether each banner is for the host or business app.
            </p>
            {isError && (
              <p className="mt-2 text-sm text-destructive">
                {getErrorMessage(error)}
              </p>
            )}
          </div>

          <Button
            type="button"
            onClick={openCreate}
            className="rounded-md bg-primary hover:bg-[#5aad26] text-white shrink-0 gap-2"
          >
            <Plus className="h-5 w-5" />
            Create New Slider
          </Button>
        </div>

        <CardContent className="p-0">
          <AppSliderTable
            sliders={sliders}
            isSuperAdmin={isSuperAdmin}
            currentUserEmail={user?.email}
            onEdit={openEdit}
            onDelete={requestDelete}
            isLoading={listBusy}
          />
          <div className="px-6 py-4 border-t border-gray-100">
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

      <CreateEditSliderModal
        open={createEditOpen}
        onClose={() => {
          setCreateEditOpen(false)
          setEditingSlider(null)
        }}
        mode={modalMode}
        slider={editingSlider}
        isSuperAdmin={isSuperAdmin}
        defaultTargetType={defaultTargetType}
        onSave={handleSave}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete slider"
        description={
          deleteTarget
            ? `Remove “${deleteTarget.name}” from the app slider list? This cannot be undone.`
            : ''
        }
        confirmText="Delete"
      />
    </motion.div>
  )
}
