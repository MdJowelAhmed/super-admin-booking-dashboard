import { Check, X, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/cn'
import { formatCurrency } from '@/utils/formatters'
import type { AdminSubscriptionPackage } from '../subscriptionPackageData'

interface SubscriptionPackageCardProps {
  pkg: AdminSubscriptionPackage
  onEdit: (pkg: AdminSubscriptionPackage) => void
  onDelete: (pkg: AdminSubscriptionPackage) => void
}

export function SubscriptionPackageCard({
  pkg,
  onEdit,
  onDelete,
}: SubscriptionPackageCardProps) {
  return (
    <div
      className={cn(
        'flex flex-col rounded-2xl border border-sky-100/80 p-5 shadow-sm',
        'bg-gradient-to-b from-sky-50 via-white to-white'
      )}
    >
      <div className="flex flex-wrap items-center gap-2 min-h-[28px]">
        <span className="rounded-full bg-[#6BBF2D] px-3 py-1 text-xs font-semibold text-white">
          {pkg.name}
        </span>
        {pkg.mostPopular && (
          <span className="text-xs font-semibold text-[#0C5822]">(Most Popular)</span>
        )}
      </div>

      <div className="mt-5">
        <p className="text-3xl font-bold text-slate-900 tabular-nums">
          {formatCurrency(pkg.price, 'USD')}
        </p>
        <p className="text-sm text-muted-foreground">{pkg.billingLabel}</p>
      </div>

      <ul className="mt-6 flex flex-1 flex-col gap-3 text-sm text-slate-700">
        {pkg.featureLabels.map((label, i) => {
          const ok = pkg.features[i]
          return (
            <li key={`${pkg.id}-${i}`} className="flex items-center gap-2">
              {ok ? (
                <Check className="h-4 w-4 shrink-0 text-[#6BBF2D]" strokeWidth={2.5} />
              ) : (
                <X className="h-4 w-4 shrink-0 text-slate-400" strokeWidth={2} />
              )}
              <span className={cn(!ok && 'text-slate-400')}>{label}</span>
            </li>
          )
        })}
      </ul>

      <div className="mt-8 flex gap-2">
        <Button
          type="button"
          variant="outline"
          className="flex-1 rounded-xl border-[#6BBF2D] text-[#0C5822] hover:bg-[#CEF8DA]"
          onClick={() => onEdit(pkg)}
        >
          <Pencil className="h-4 w-4 mr-2" />
          Edit
        </Button>
        <Button
          type="button"
          variant="outline"
          className="rounded-xl text-destructive border-destructive/30 hover:bg-destructive/10"
          onClick={() => onDelete(pkg)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
