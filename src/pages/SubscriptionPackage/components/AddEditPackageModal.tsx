import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ModalWrapper, FormInput } from '@/components/common'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from '@/utils/toast'
import type { AdminSubscriptionPackage } from '../subscriptionPackageData'

const schema = z.object({
  name: z.string().min(1, 'Package name is required'),
  price: z.coerce.number().positive('Price must be greater than 0'),
  billingLabel: z.string().min(1, 'Billing label is required'),
  mostPopular: z.boolean(),
  f0Label: z.string().min(1, 'Feature 1 text is required'),
  f1Label: z.string().min(1, 'Feature 2 text is required'),
  f2Label: z.string().min(1, 'Feature 3 text is required'),
  f0On: z.boolean(),
  f1On: z.boolean(),
  f2On: z.boolean(),
})

type FormValues = z.infer<typeof schema>

export type SaveSubscriptionPackageInput = {
  id?: string
  name: string
  price: number
  billingLabel: string
  mostPopular: boolean
  featureLabels: [string, string, string]
  features: [boolean, boolean, boolean]
}

interface AddEditPackageModalProps {
  open: boolean
  onClose: () => void
  mode: 'create' | 'edit'
  pkg: AdminSubscriptionPackage | null
  onSave: (payload: SaveSubscriptionPackageInput) => void
}

const defaults: FormValues = {
  name: '',
  price: 37,
  billingLabel: 'Per Year',
  mostPopular: false,
  f0Label: '1-3 properties',
  f1Label: '4-6 properties',
  f2Label: '7 plus properties',
  f0On: true,
  f1On: false,
  f2On: false,
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
    control,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: defaults,
  })

  useEffect(() => {
    if (!open) return
    if (mode === 'edit' && pkg) {
      reset({
        name: pkg.name,
        price: pkg.price,
        billingLabel: pkg.billingLabel,
        mostPopular: pkg.mostPopular,
        f0Label: pkg.featureLabels[0],
        f1Label: pkg.featureLabels[1],
        f2Label: pkg.featureLabels[2],
        f0On: pkg.features[0],
        f1On: pkg.features[1],
        f2On: pkg.features[2],
      })
    } else {
      reset(defaults)
    }
  }, [open, mode, pkg, reset])

  const onSubmit = (data: FormValues) => {
    onSave({
      id: mode === 'edit' && pkg ? pkg.id : undefined,
      name: data.name.trim(),
      price: data.price,
      billingLabel: data.billingLabel.trim(),
      mostPopular: data.mostPopular,
      featureLabels: [
        data.f0Label.trim(),
        data.f1Label.trim(),
        data.f2Label.trim(),
      ],
      features: [data.f0On, data.f1On, data.f2On],
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
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 pt-2 max-h-[70vh] overflow-y-auto pr-1 scrollbar-thin"
      >
        <FormInput label="Package name" required {...register('name')} error={errors.name?.message} />
        <div className="grid gap-4 sm:grid-cols-2">
          <FormInput
            label="Price (USD)"
            type="number"
            step="0.01"
            min={0}
            required
            {...register('price')}
            error={errors.price?.message}
          />
          <FormInput
            label="Billing label"
            placeholder="Per Year"
            required
            {...register('billingLabel')}
            error={errors.billingLabel?.message}
          />
        </div>

        <Controller
          name="mostPopular"
          control={control}
          render={({ field }) => (
            <div className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2">
              <div>
                <Label htmlFor="most-popular">Most popular</Label>
                <p className="text-xs text-muted-foreground">Show badge on this package</p>
              </div>
              <Switch id="most-popular" checked={field.value} onCheckedChange={field.onChange} />
            </div>
          )}
        />

        <p className="text-sm font-medium text-slate-800 pt-2">Features (up to 3)</p>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:gap-3">
          <div className="flex-1">
            <FormInput label="Feature 1" {...register('f0Label')} error={errors.f0Label?.message} />
          </div>
          <Controller
            name="f0On"
            control={control}
            render={({ field }) => (
              <label className="flex items-center gap-2 text-sm pb-2 sm:pb-3 shrink-0 cursor-pointer">
                <Checkbox
                  checked={field.value}
                  onCheckedChange={(v) => field.onChange(v === true)}
                />
                Included
              </label>
            )}
          />
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:gap-3">
          <div className="flex-1">
            <FormInput label="Feature 2" {...register('f1Label')} error={errors.f1Label?.message} />
          </div>
          <Controller
            name="f1On"
            control={control}
            render={({ field }) => (
              <label className="flex items-center gap-2 text-sm pb-2 sm:pb-3 shrink-0 cursor-pointer">
                <Checkbox
                  checked={field.value}
                  onCheckedChange={(v) => field.onChange(v === true)}
                />
                Included
              </label>
            )}
          />
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:gap-3">
          <div className="flex-1">
            <FormInput label="Feature 3" {...register('f2Label')} error={errors.f2Label?.message} />
          </div>
          <Controller
            name="f2On"
            control={control}
            render={({ field }) => (
              <label className="flex items-center gap-2 text-sm pb-2 sm:pb-3 shrink-0 cursor-pointer">
                <Checkbox
                  checked={field.value}
                  onCheckedChange={(v) => field.onChange(v === true)}
                />
                Included
              </label>
            )}
          />
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
