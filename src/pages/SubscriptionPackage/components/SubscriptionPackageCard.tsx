import { Check, Pencil, Trash2 } from 'lucide-react'
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
          {pkg.title}
        </span>
        <span className="text-xs font-medium text-muted-foreground">
          {pkg.paymentType} · {pkg.duration}
        </span>
        {pkg.status && (
          <span className="text-xs font-semibold text-[#0C5822]">({pkg.status})</span>
        )}
      </div>

      <div className="mt-5">
        <p className="text-3xl font-bold text-slate-900 tabular-nums">
          {formatCurrency(pkg.price, 'USD')}
        </p>
        <p className="text-sm text-muted-foreground line-clamp-2">{pkg.description}</p>
      </div>

      <ul className="mt-6 flex flex-1 flex-col gap-3 text-sm text-slate-700">
        {(pkg.features ?? []).map((f, i) => {
          return (
            <li key={`${pkg.id}-${i}`} className="flex items-center gap-2">
              <Check className="h-4 w-4 shrink-0 text-[#6BBF2D]" strokeWidth={2.5} />
              <span>
                {f.name ? <span className="font-medium">{f.name}: </span> : null}
                {f.description}
                <span className="text-muted-foreground">
                  {' '}
                  · {f.isUnlimited ? 'Unlimited' : `Limit ${f.limit ?? 0}`}
                </span>
              </span>
            </li>
          )
        })}
      </ul>

      <div className="mt-8 flex gap-2 mt-10 justify-end">
        <Button
          type="button"
          variant="outline"
          className=" rounded-xl border-[#6BBF2D] text-[#0C5822] hover:bg-[#CEF8DA] bg-primary text-white"
          onClick={() => onEdit(pkg)}
        >
          <Pencil className="h-4 w-4 mr-2" />
          Edit
        </Button>
        <Button
          type="button"
          variant="outline"
          className="rounded-xl text-white border-destructive/30 bg-destructive"
          onClick={() => onDelete(pkg)}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </Button>
      </div>
    </div>
  )
}
