import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ModalWrapper, FormInput, FormSelect } from '@/components/common'
import { Button } from '@/components/ui/button'
import { toast } from '@/utils/toast'
import type { ControllerAccount, ControllerRole } from '../controllerData'
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

interface AddEditControllerModalProps {
  open: boolean
  onClose: () => void
  mode: 'create' | 'edit'
  controller: ControllerAccount | null
  onSave: (payload: {
    name: string
    email: string
    phone: string
    password: string
    role: ControllerRole
  }) => void
}

export function AddEditControllerModal({
  open,
  onClose,
  mode,
  controller,
  onSave,
}: AddEditControllerModalProps) {
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
      role: 'host',
    },
  })

  useEffect(() => {
    if (!open) return
    if (mode === 'edit' && controller) {
      reset({
        name: controller.name,
        email: controller.email,
        phone: controller.phone,
        password: '',
        role: controller.role,
      })
    } else {
      reset({
        name: '',
        email: '',
        phone: '',
        password: '',
        role: 'host',
      })
    }
  }, [open, mode, controller, reset])

  const onSubmit = (data: FormValues) => {
    const pwd = data.password?.trim() ?? ''
    if (mode === 'create') {
      if (pwd.length < 6) {
        toast({
          variant: 'destructive',
          title: 'Password must be at least 6 characters',
        })
        return
      }
      onSave({
        name: data.name.trim(),
        email: data.email.trim(),
        phone: data.phone.trim(),
        password: pwd,
        role: data.role,
      })
    } else if (controller) {
      const nextPassword = pwd.length >= 6 ? pwd : controller.password
      if (pwd.length > 0 && pwd.length < 6) {
        toast({
          variant: 'destructive',
          title: 'Password must be at least 6 characters or leave blank',
        })
        return
      }
      onSave({
        name: data.name.trim(),
        email: data.email.trim(),
        phone: data.phone.trim(),
        password: nextPassword,
        role: data.role,
      })
    }

    toast({
      variant: 'success',
      title: mode === 'create' ? 'Controller added' : 'Controller updated',
    })
    onClose()
  }

  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title={mode === 'create' ? 'Add controller' : 'Edit controller'}
      size="md"
      className="bg-white rounded-2xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
        <FormInput
          label="Name"
          required
          {...register('name')}
          error={errors.name?.message}
        />
        <FormInput
          label="Email"
          type="email"
          required
          {...register('email')}
          error={errors.email?.message}
        />
        <FormInput
          label="Phone"
          required
          {...register('phone')}
          error={errors.phone?.message}
        />
        <FormInput
          label="Password"
          type="password"
          autoComplete="new-password"
          placeholder={mode === 'edit' ? 'Leave blank to keep current' : undefined}
          {...register('password')}
          error={errors.password?.message}
          helperText={
            mode === 'edit'
              ? 'Leave blank to keep the existing password.'
              : 'Minimum 6 characters.'
          }
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
              onChange={field.onChange}
              error={errors.role?.message}
            />
          )}
        />
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" className="bg-[#6BBF2D] hover:bg-[#5aad26] text-white">
            {mode === 'create' ? 'Add' : 'Save'}
          </Button>
        </div>
      </form>
    </ModalWrapper>
  )
}
