import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ModalWrapper, FormInput, FormSelect } from '@/components/common'
import { Button } from '@/components/ui/button'
import { toast } from '@/utils/toast'
import type { ControllerRole } from '../controllerData'
import type { SelectOption } from '@/types'

const ROLE_OPTIONS: SelectOption[] = [
  { value: 'host', label: 'Host' },
  { value: 'business', label: 'Business' },
]

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Enter a valid email'),
  phone: z.string().min(1, 'Phone is required'),
  password: z.string().optional(),
  role: z.enum(['host', 'business']),
})

type FormValues = z.infer<typeof schema>

interface AddControllerModalProps {
  open: boolean
  onClose: () => void
  defaultRole: ControllerRole
  onSave: (payload: {
    name: string
    email: string
    phone: string
    password: string
    role: ControllerRole
  }) => void
}

export function AddControllerModal({
  open,
  onClose,
  defaultRole,
  onSave,
}: AddControllerModalProps) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      role: defaultRole,
    },
  })

  useEffect(() => {
    if (!open) return
    reset({
      name: '',
      email: '',
      phone: '',
      password: '',
      role: defaultRole,
    })
  }, [open, reset, defaultRole])

  const onSubmit = (data: FormValues) => {
    onSave({
      name: data.name.trim(),
      email: data.email.trim(),
      phone: data.phone.trim(),
      password: (data.password ?? '').trim(),
      role: data.role,
    })
    toast({ variant: 'success', title: 'Controller added (accepted)' })
    onClose()
  }

  return (
    <ModalWrapper open={open} onClose={onClose} title="Add controller" size="md" className="max-w-xl bg-white">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
        <FormInput label="Name" required {...register('name')} error={errors.name?.message} />
        <FormInput
          label="Email"
          type="email"
          required
          {...register('email')}
          error={errors.email?.message}
        />
        <FormInput label="Phone" required {...register('phone')} error={errors.phone?.message} />
        <FormInput
          label="Password"
          placeholder="Optional (demo only)"
          type="password"
          {...register('password')}
          error={errors.password?.message}
        />
        <Controller
          name="role"
          control={control}
          render={({ field }) => (
            <FormSelect
              label="Role"
              required
              value={field.value}
              options={ROLE_OPTIONS}
              onChange={(v) => field.onChange(v as ControllerRole)}
              error={errors.role?.message}
            />
          )}
        />

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" className="bg-[#6BBF2D] hover:bg-[#5aad26] text-white">
            Add
          </Button>
        </div>
      </form>
    </ModalWrapper>
  )
}

