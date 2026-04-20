import { useAppSelector } from '@/redux/hooks'
import { RoleBadge } from '@/components/common/RoleBadge'

export function UserRoleIndicator() {
  const { user } = useAppSelector((state) => state.auth)

  if (!user) return null

  return (
    <div className="flex flex-col gap-1 rounded-lg border bg-muted/50 px-3 py-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-muted-foreground">Logged in as</span>
        <RoleBadge role={user.role} />
      </div>
    </div>
  )
}
