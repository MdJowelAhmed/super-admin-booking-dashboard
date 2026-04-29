import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ModalWrapper, FormInput, FormSelect } from '@/components/common'
import { Button } from '@/components/ui/button'
import { toast } from '@/utils/toast'
import type { AdminSubscriptionPackage } from '../subscriptionPackageData'
import type { PaymentType } from '@/redux/api/subscriptionPackage'

const PAYMENT_TYPE_OPTIONS = [
  { value: 'Monthly', label: 'Monthly' },
  { value: 'Quarterly', label: 'Quarterly' },
  { value: 'Half-Yearly', label: 'Half-Yearly' },
  { value: 'Yearly', label: 'Yearly' },
] as const

const DURATION_OPTIONS = [
  { value: 'monthly', label: 'Monthly' },
  { value: '3 months', label: '3 months' },
  { value: '6 months', label: '6 months' },
  { value: '1 year', label: '1 year' },
] as const

type DurationValue = (typeof DURATION_OPTIONS)[number]['value']

const schema = z
  .object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().min(1, 'Description is required'),
    price: z.coerce.number().positive('Price must be greater than 0'),
    duration: z.enum(['monthly', '3 months', '6 months', '1 year'], {
      required_error: 'Duration is required',
    }),
    paymentType: z.enum(['Monthly', 'Quarterly', 'Half-Yearly', 'Yearly'], {
      required_error: 'Payment type is required',
    }),
    p0On: z.boolean(),
    p1On: z.boolean(),
    p2On: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (!data.p0On && !data.p1On && !data.p2On) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['p0On'],
        message: 'Select at least one feature',
      })
    }
  })

type FormValues = z.infer<typeof schema>

export type SaveSubscriptionPackageInput = {
  id?: string
  title: string
  description: string
  price: number
  duration: string
  paymentType: PaymentType
  features: Array<{
    name?: string
    description: string
    limit: number | null
    isUnlimited: boolean
  }>
}

interface AddEditPackageModalProps {
  open: boolean
  onClose: () => void
  mode: 'create' | 'edit'
  pkg: AdminSubscriptionPackage | null
  onSave: (payload: SaveSubscriptionPackageInput) => void
}

const defaults: FormValues = {
  title: '',
  description: '',
  price: 49.99,
  duration: 'monthly',
  paymentType: 'Monthly',
  p0On: true,
  p1On: false,
  p2On: false,
}

export function AddEditPackageModal({
  open,
  onClose,
  mode,
  pkg,
  onSave,
}: AddEditPackageModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaults,
  })

  const paymentType = watch('paymentType')
  const duration = watch('duration')

  const applyFeatureSelection = (index: 0 | 1 | 2, checked: boolean) => {
    const current = [watch('p0On'), watch('p1On'), watch('p2On')]
    current[index] = checked

    const highestSelected = current[2] ? 2 : current[1] ? 1 : current[0] ? 0 : -1
    const normalized = [
      highestSelected >= 0,
      highestSelected >= 1,
      highestSelected >= 2,
    ] as const

    setValue('p0On', normalized[0], { shouldValidate: true })
    setValue('p1On', normalized[1], { shouldValidate: true })
    setValue('p2On', normalized[2], { shouldValidate: true })
  }

  useEffect(() => {
    if (!open) return
    if (mode === 'edit' && pkg) {
      const has3 = pkg.features?.some((f) => String(f.description).includes('1-3')) ?? false
      const has6 = pkg.features?.some((f) => String(f.description).includes('4-6')) ?? false
      const has7 = pkg.features?.some((f) => String(f.description).includes('7 plus')) ?? false

      const dur = String(pkg.duration ?? '').toLowerCase()
      const normalizedDuration: DurationValue =
        dur === 'monthly' || dur === '1 month'
          ? 'monthly'
          : dur === '3 months' || dur === '3 month'
            ? '3 months'
            : dur === '6 months' || dur === '6 month'
              ? '6 months'
              : dur === '1 year' || dur === 'yearly' || dur === '12 months'
                ? '1 year'
                : defaults.duration

      reset({
        title: pkg.title,
        description: pkg.description,
        price: pkg.price,
        duration: normalizedDuration,
        paymentType: (pkg.paymentType as PaymentType) ?? 'Monthly',
        p0On: has3 || (!has3 && !has6 && !has7),
        p1On: has6,
        p2On: has7,
      })
    } else {
      reset(defaults)
    }
  }, [open, mode, pkg, reset])

  const onSubmit = (data: FormValues) => {
    const features: SaveSubscriptionPackageInput['features'] = []

    if (data.p0On) {
      features.push({
        name: '1-3 properties',
        description: '1-3 properties',
        limit: 3,
        isUnlimited: false,
      })
    }
    if (data.p1On) {
      features.push({
        name: '4-6 properties',
        description: '4-6 properties',
        limit: 6,
        isUnlimited: false,
      })
    }
    if (data.p2On) {
      features.push({
        name: '7 plus properties',
        description: '7 plus properties',
        limit: null,
        isUnlimited: true,
      })
    }

    onSave({
      id: mode === 'edit' && pkg ? pkg.id : undefined,
      title: data.title.trim(),
      description: data.description.trim(),
      price: data.price,
      duration: data.duration.trim(),
      paymentType: data.paymentType,
      features,
    })
    toast({
      variant: 'success',
      title: mode === 'create' ? 'Package created' : 'Package updated',
    })
    onClose()
  }

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title={mode === 'create' ? 'Create subscription package' : 'Edit subscription package'}
      size="lg"
      className="bg-white rounded-2xl"
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 pt-2 max-h-[70vh] overflow-y-auto pr-1 scrollbar-thin"
      >
        <FormInput label="Title" required {...register('title')} error={errors.title?.message} />
        <FormInput
          label="Description"
          required
          {...register('description')}
          error={errors.description?.message}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <FormInput
            label="Price"
            type="number"
            step="0.01"
            min={0}
            required
            {...register('price')}
            error={errors.price?.message}
          />
          <FormSelect
            label="Duration"
            name="duration"
            value={duration}
            options={[...DURATION_OPTIONS]}
            onChange={(v) => setValue('duration', v as DurationValue, { shouldValidate: true })}
            placeholder="Select duration"
            required
            error={errors.duration?.message}
          />
        </div>

        <FormSelect
          label="Payment type"
          name="paymentType"
          value={paymentType}
          options={[...PAYMENT_TYPE_OPTIONS]}
          onChange={(v) => setValue('paymentType', v as PaymentType, { shouldValidate: true })}
          placeholder="Select payment type"
          required
          error={errors.paymentType?.message}
        />

        <div className="pt-2">
          <p className="text-sm font-medium text-slate-800">Features</p>
         
          {errors.p0On?.message ? (
            <p className="text-xs text-destructive mt-1">{errors.p0On.message}</p>
          ) : null}
        </div>

        <div className="space-y-2 rounded-lg border border-slate-200 p-3">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              {...register('p0On', {
                onChange: (e) => applyFeatureSelection(0, e.target.checked),
              })}
            />
            <span>
              1-3 properties 
            </span>
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              {...register('p1On', {
                onChange: (e) => applyFeatureSelection(1, e.target.checked),
              })}
            />
            <span>
              4-6 properties 
            </span>
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              {...register('p2On', {
                onChange: (e) => applyFeatureSelection(2, e.target.checked),
              })}
            />
            <span>
              7 plus properties{' '}
             
            </span>
          </label>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" className="bg-[#6BBF2D] hover:bg-[#5aad26] text-white">
            {mode === 'create' ? 'Create' : 'Save'}
          </Button>
        </div>
      </form>
    </ModalWrapper>
  )
}
