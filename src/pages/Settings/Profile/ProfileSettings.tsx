import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Camera } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { FormInput, FormTextarea } from '@/components/common'
import { imageUrl } from '@/components/common/imageUrl'
import { toast } from '@/utils/toast'
import { motion } from 'framer-motion'
import {
  useGetMyProfileQuery,
  useUpdateMyProfileMutation,
  type MyProfileEntity,
} from '@/redux/api/authApi'

const profileSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  phone: z.string().min(7, 'Please enter a valid phone number'),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
})

type ProfileFormData = z.infer<typeof profileSchema>

const FALLBACK_AVATAR =
  'https://api.dicebear.com/7.x/avataaars/svg?seed=profile'

function splitFullName(full: string): { firstName: string; lastName: string } {
  const t = (full ?? '').trim()
  if (!t) return { firstName: '', lastName: '' }
  const space = t.indexOf(' ')
  if (space === -1) return { firstName: t, lastName: '' }
  return { firstName: t.slice(0, space), lastName: t.slice(space + 1).trim() }
}

function profileToFormDefaults(p: MyProfileEntity): ProfileFormData {
  const { firstName, lastName } = splitFullName(p.name)
  return {
    firstName,
    lastName,
    email: p.email,
    phone: p.phone ?? '',
    address: p.address ?? '',
    city: p.city ?? '',
    country: p.country ?? '',
    bio: p.bio ?? '',
  }
}

/** Full profile document inside JSON `data` field; new photo is sent only as multipart `image` (omit image keys in JSON so the file is applied). */
function formToProfileDataJson(
  server: MyProfileEntity | undefined,
  form: ProfileFormData,
  options?: { sendingNewImageFile?: boolean }
): Record<string, unknown> {
  const fullName = `${form.firstName} ${form.lastName}`.trim()
  if (!server) {
    return {
      name: fullName,
      email: form.email,
      phone: form.phone,
      address: form.address ?? '',
      city: form.city ?? '',
      country: form.country ?? '',
      bio: form.bio ?? '',
    }
  }
  const payload: Record<string, unknown> = {
    _id: server._id,
    name: fullName,
    email: form.email,
    phone: form.phone,
    address: form.address ?? '',
    city: form.city ?? '',
    country: form.country ?? '',
    bio: form.bio ?? '',
    role: server.role,
    status: server.status,
    isVerified: server.isVerified,
    isPhoneVerified: server.isPhoneVerified,
    isEmailVerified: server.isEmailVerified,
    isDeleted: server.isDeleted,
    authProviders: server.authProviders,
    createdAt: server.createdAt,
    updatedAt: server.updatedAt,
    __v: server.__v,
  }
  if (!options?.sendingNewImageFile) {
    if (server.image != null && server.image !== '') {
      payload.image = server.image
    }
    if (server.profileImage != null && server.profileImage !== '') {
      payload.profileImage = server.profileImage
    }
  }
  return payload
}

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

function initials(first: string, last: string): string {
  const a = first.charAt(0).toUpperCase()
  const b = last.charAt(0).toUpperCase()
  if (a && b) return `${a}${b}`
  if (a) return a + (first.charAt(1) || '').toUpperCase()
  return 'U'
}

export default function ProfileSettings() {
  const { data, isLoading, isError, error, refetch } = useGetMyProfileQuery()
  const [updateProfile, { isLoading: isSaving }] = useUpdateMyProfileMutation()


  const profile = data?.data
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      country: '',
      bio: '',
    },
  })

  useEffect(() => {
    if (!imageFile) {
      setPreviewUrl(null)
      return
    }
    const url = URL.createObjectURL(imageFile)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [imageFile])

  useEffect(() => {
    if (!profile) return
    reset(profileToFormDefaults(profile))
    setImageFile(null)
  }, [profile, reset])

  const serverPhoto =
    profile?.image?.trim() || profile?.profileImage?.trim() || ''
  const avatarSrc =
    previewUrl ||
    (serverPhoto ? imageUrl(serverPhoto) : '') ||
    FALLBACK_AVATAR

  const { firstName: fn0, lastName: ln0 } = profile
    ? splitFullName(profile.name)
    : { firstName: '', lastName: '' }
  const fallbackLetters = profile ? initials(fn0, ln0) : 'U'

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setImageFile(file)
    e.target.value = ''
  }

  const handleCancel = () => {
    if (profile) {
      reset(profileToFormDefaults(profile))
    }
    setImageFile(null)
  }

  const onSubmit = async (form: ProfileFormData) => {
    try {
      const json = formToProfileDataJson(profile, form, {
        sendingNewImageFile: !!imageFile,
      })
      await updateProfile({
        data: json,
        image: imageFile ?? undefined,
      }).unwrap()

      toast({
        title: 'Profile updated',
        description: 'Your profile has been saved successfully.',
      })
      setImageFile(null)
      refetch()
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Update failed',
        description: getErrorMessage(err),
      })
    }
  }

  if (isLoading && !profile) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center text-sm text-muted-foreground">
        Loading profile…
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 max-w-4xl mx-auto"
    >
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            Update your personal information and profile picture.
          </CardDescription>
          {isError && (
            <p className="text-sm text-destructive pt-2">{getErrorMessage(error)}</p>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div className="flex items-center gap-6">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage
                    key={avatarSrc}
                    src={avatarSrc}
                    alt=""
                  />
                  <AvatarFallback>{fallbackLetters}</AvatarFallback>
                </Avatar>
                <label
                  htmlFor="avatar-upload"
                  className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary flex items-center justify-center cursor-pointer hover:bg-primary/90 transition-colors"
                >
                  <Camera className="h-4 w-4 text-primary-foreground" />
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </label>
              </div>
              <div>
                <h3 className="font-semibold">Profile Picture</h3>
                <p className="text-sm text-muted-foreground">
                  JPG, PNG or WebP. Max size recommended 5MB.
                </p>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="font-semibold">Personal Information</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormInput
                  label="First Name"
                  placeholder="Enter first name"
                  error={errors.firstName?.message}
                  required
                  {...register('firstName')}
                />
                <FormInput
                  label="Last Name"
                  placeholder="Enter last name"
                  error={errors.lastName?.message}
                  required
                  {...register('lastName')}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormInput
                  label="Email"
                  type="email"
                  placeholder="Enter email"
                  error={errors.email?.message}
                  required
                  {...register('email')}
                />
                <FormInput
                  label="Phone"
                  placeholder="Enter phone number"
                  error={errors.phone?.message}
                  required
                  {...register('phone')}
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="font-semibold">Address</h3>
              <FormInput
                label="Street Address"
                placeholder="Enter street address"
                error={errors.address?.message}
                {...register('address')}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <FormInput
                  label="City"
                  placeholder="Enter city"
                  error={errors.city?.message}
                  {...register('city')}
                />
                <FormInput
                  label="Country"
                  placeholder="Enter country"
                  error={errors.country?.message}
                  {...register('country')}
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="font-semibold">Bio</h3>
              <FormTextarea
                label="About you"
                placeholder="Short bio (optional)"
                error={errors.bio?.message}
                rows={4}
                {...register('bio')}
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={handleCancel} disabled={isSaving}>
                Cancel
              </Button>
              <Button type="submit" isLoading={isSaving}>
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}
