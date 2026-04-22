import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MoreHorizontal, Eye, Edit, Ban, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ConfirmDialog } from '@/components/common'
import { useUpdateUserStatusMutation } from '@/redux/api/userApi'
import type { User } from '@/types'
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
  return 'Something went wrong.'
}

interface UserActionMenuProps {
  user: User
}

export function UserActionMenu({ user }: UserActionMenuProps) {
  const navigate = useNavigate()
  const [updateStatus, { isLoading }] = useUpdateUserStatusMutation()
  const [showBlockDialog, setShowBlockDialog] = useState(false)

  const displayName =
    user.rawName?.trim() ||
    `${user.firstName} ${user.lastName}`.trim() ||
    user.email

  const handleView = () => {
    navigate(`/users/${user.id}`)
  }

  const handleEdit = () => {
    toast({
      title: 'Edit User',
      description: `Editing ${displayName}`,
    })
  }

  const handleActivate = async () => {
    try {
      await updateStatus({
        id: user.id,
        body: { status: 'active' },
      }).unwrap()
      toast({
        title: 'User activated',
        description: `${displayName} is now active.`,
      })
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Update failed',
        description: getErrorMessage(err),
      })
    }
  }

  const handleBlockConfirm = async () => {
    try {
      await updateStatus({
        id: user.id,
        body: { status: 'blocked' },
      }).unwrap()
      setShowBlockDialog(false)
      toast({
        title: 'User blocked',
        description: `${displayName} has been blocked.`,
        variant: 'destructive',
      })
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Update failed',
        description: getErrorMessage(err),
      })
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleView}>
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Edit User
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {user.status === 'blocked' ? (
            <DropdownMenuItem onClick={handleActivate}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Activate User
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={() => setShowBlockDialog(true)}>
              <Ban className="h-4 w-4 mr-2" />
              Block User
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDialog
        open={showBlockDialog}
        onClose={() => setShowBlockDialog(false)}
        onConfirm={handleBlockConfirm}
        title="Block User"
        description={`Block ${displayName}? They will no longer be able to access the platform.`}
        confirmText="Block User"
        variant="warning"
        isLoading={isLoading}
      />
    </>
  )
}
