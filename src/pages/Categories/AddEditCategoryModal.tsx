import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ModalWrapper, FormInput, FormSelect } from '@/components/common'
import { Button } from '@/components/ui/button'
import {
  useAddCategoryMutation,
  useUpdateCategoryMutation,
} from '@/redux/api/categoryApi'
import type { Category, CategoryType } from '@/types'
import { toast } from '@/utils/toast'
import { CATEGORY_TYPE_FORM_OPTIONS } from '@/utils/constants'

const categorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  type: z.enum(['category', 'amenities']),
})

type CategoryFormValues = z.infer<typeof categorySchema>

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

interface AddEditCategoryModalProps {
  open: boolean
  onClose: () => void
  mode: 'add' | 'edit'
  category?: Category
}

export function AddEditCategoryModal({
  open,
  onClose,
  mode,
  category,
}: AddEditCategoryModalProps) {
  const [addCategory, { isLoading: isAdding }] = useAddCategoryMutation()
  const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      type: 'category',
    },
  })

  useEffect(() => {
    if (!open) return
    if (mode === 'edit' && category) {
      reset({
        name: category.name,
        type: category.type,
      })
    } else {
      reset({
        name: '',
        type: 'category',
      })
    }
  }, [open, mode, category, reset])

  const onSubmit = async (data: CategoryFormValues) => {
    const body = {
      name: data.name.trim(),
      type: data.type as CategoryType,
    }
    try {
      if (mode === 'edit' && category) {
        await updateCategory({ id: category.id, ...body }).unwrap()
        toast({
          title: 'Category updated',
          description: `${body.name} has been updated.`,
        })
      } else {
        await addCategory(body).unwrap()
        toast({
          title: 'Category created',
          description: `${body.name} has been created.`,
        })
      }
      onClose()
    } catch (err) {
      toast({
        variant: 'destructive',
        title: mode === 'edit' ? 'Could not update' : 'Could not create',
        description: getErrorMessage(err),
      })
    }
  }

  const busy = isAdding || isUpdating

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title={mode === 'add' ? 'Add category / amenity' : 'Edit category / amenity'}
      description={
        mode === 'add'
          ? 'Send name and type as required by the API'
          : 'Update name and type'
      }
      size="md"
      className="max-w-lg bg-white"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <FormInput
          label="Name"
          placeholder="e.g. WiFi"
          error={errors.name?.message}
          required
          {...register('name')}
        />

        <FormSelect
          label="Type"
          value={watch('type')}
          options={CATEGORY_TYPE_FORM_OPTIONS}
          onChange={(value) =>
            setValue('type', value as CategoryType, { shouldValidate: true })
          }
          placeholder="Select type"
          error={errors.type?.message}
          required
        />

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button type="submit" isLoading={busy}>
            {mode === 'add' ? 'Create' : 'Save changes'}
          </Button>
        </div>
      </form>
    </ModalWrapper>
  )
}
