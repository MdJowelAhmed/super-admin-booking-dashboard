import { ConfirmDialog } from '@/components/common'
import { useDeleteCategoryMutation } from '@/redux/api/categoryApi'
import type { Category } from '@/types'
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
  return 'Something went wrong'
}

interface DeleteCategoryModalProps {
  open: boolean
  onClose: () => void
  category: Category
}

export function DeleteCategoryModal({
  open,
  onClose,
  category,
}: DeleteCategoryModalProps) {
  const [deleteCategory, { isLoading }] = useDeleteCategoryMutation()

  const handleDelete = async () => {
    try {
      await deleteCategory(category.id).unwrap()
      toast({
        title: 'Deleted',
        description: `"${category.name}" has been removed.`,
      })
      onClose()
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Could not delete',
        description: getErrorMessage(err),
      })
    }
  }

  return (
    <ConfirmDialog
      open={open}
      onClose={onClose}
      onConfirm={handleDelete}
      title="Delete category"
      description={`Are you sure you want to delete "${category.name}" (${category.type})? This cannot be undone.`}
      confirmText="Delete"
      variant="danger"
      isLoading={isLoading}
    />
  )
}
