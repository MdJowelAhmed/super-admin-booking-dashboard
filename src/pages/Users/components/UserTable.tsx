import { motion } from 'framer-motion'
import { cn } from '@/utils/cn'
import { formatDate, getInitials } from '@/utils/formatters'
import { StatusBadge } from '@/components/common'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Ban, CheckCircle, Eye } from 'lucide-react'
import type { User } from '@/types'

interface UserTableProps {
  users: User[]
  page: number
  limit: number
  isLoading?: boolean
  onView: (user: User) => void
  onToggleStatus: (user: User) => void
  isUpdating?: boolean
}

export function UserTable({
  users,
  page,
  limit,
  isLoading,
  onView,
  onToggleStatus,
  isUpdating,
}: UserTableProps) {
  if (isLoading && users.length === 0) {
    return (
      <div className="px-6 py-12 text-center text-sm text-muted-foreground">
        Loading users…
      </div>
    )
  }

  return (
    <div className="w-full overflow-auto">
      <table className="w-full min-w-[980px]">
        <thead>
          <tr className="bg-primary text-white">
            <th className="px-6 py-4 text-left text-sm font-bold">S.No</th>
            <th className="px-6 py-4 text-left text-sm font-bold">User</th>
            <th className="px-6 py-4 text-left text-sm font-bold">Phone</th>
            <th className="px-6 py-4 text-left text-sm font-bold">Role</th>
            <th className="px-6 py-4 text-left text-sm font-bold">Status</th>
            <th className="px-6 py-4 text-left text-sm font-bold">Joined</th>
            <th
              className="px-6 py-4 text-right text-sm font-bold w-[260px]"
              aria-label="Row actions"
            />
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {users.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                No users found.
              </td>
            </tr>
          ) : (
            users.map((user, index) => {
              const name =
                user.rawName?.trim() ||
                `${user.firstName} ${user.lastName}`.trim() ||
                user.email
              const isBlocked = user.status === 'blocked'
              return (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * index }}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-slate-700">
                      #{(page - 1) * limit + index + 1}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={user.avatar} alt="" />
                        <AvatarFallback>
                          {getInitials(user.firstName, user.lastName || user.email)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">
                          {name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-700">{user.phone}</span>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={user.role} type="role" />
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={user.status} />
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-700">
                      {formatDate(user.createdAt)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="border-none text-slate-700 hover:bg-slate-100"
                        onClick={() => onView(user)}
                      >
                        <Eye className="h-4 w-4 mr-1.5" />
                        Details
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={isUpdating}
                        className={cn(
                          'border-none',
                          isBlocked
                            ? 'text-[#0C5822] hover:bg-[#E7F6D5]'
                            : 'text-destructive hover:bg-destructive/10'
                        )}
                        onClick={() => onToggleStatus(user)}
                      >
                        {isBlocked ? (
                          <>
                            <CheckCircle className="h-4 w-4 mr-1.5" />
                            Activate
                          </>
                        ) : (
                          <>
                            <Ban className="h-4 w-4 mr-1.5" />
                            Block
                          </>
                        )}
                      </Button>
                    </div>
                  </td>
                </motion.tr>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  )
}

