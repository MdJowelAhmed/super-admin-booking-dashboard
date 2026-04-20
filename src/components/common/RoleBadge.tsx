import { Badge } from '@/components/ui/badge'
import { Shield } from 'lucide-react'
import { cn } from '@/utils/cn'
import { UserRole } from '@/types/roles'
import { getRoleDisplayName } from '@/utils/roleHelpers'

interface RoleBadgeProps {
  role: string
  className?: string
  showIcon?: boolean
}

export function RoleBadge({ role, className, showIcon = true }: RoleBadgeProps) {
  const variant = role === UserRole.SUPER_ADMIN ? 'admin' : 'unknown'

  return (
    <Badge
      variant="outline"
      className={cn(
        'gap-1 font-medium border-0',
        variant === 'admin' &&
          'bg-amber-100 text-amber-900 hover:bg-amber-200/90',
        variant === 'unknown' && 'bg-gray-100 text-gray-800 hover:bg-gray-200/90',
        className
      )}
    >
      {showIcon &&
        (variant === 'admin' ? <Shield className="h-3 w-3" /> : null)}
      {getRoleDisplayName(role)}
    </Badge>
  )
}
