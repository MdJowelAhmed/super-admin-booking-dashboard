import { Check, X } from 'lucide-react'
import { ModalWrapper } from '@/components/common'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/cn'
import { formatCurrency } from '@/utils/formatters'
import { PACKAGE_TIERS, type PackageTier } from '../subscriptionData'

interface BuyPackageModalProps {
  open: boolean
  onClose: () => void
  onSelectPackage: (tier: PackageTier) => void
}

export function BuyPackageModal({ open, onClose, onSelectPackage }: BuyPackageModalProps) {
  return (
    <ModalWrapper
      open={open}
      onClose={onClose}
      title="Subscription Packages"
      size="xl"
      className="sm:max-w-5xl bg-white"
    >
      <div className="grid gap-4 sm:grid-cols-3 pt-2">
        {PACKAGE_TIERS.map((tier) => (
          <div
            key={tier.id}
            className={cn(
              'flex flex-col rounded-2xl border border-sky-100/80 p-5 shadow-sm',
              'bg-gradient-to-b from-sky-50 via-white to-white'
            )}
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[#6BBF2D] px-3 py-1 text-xs font-semibold text-white">
                {tier.badge}
              </span>
              {tier.mostPopular && (
                <span className="text-xs font-semibold text-[#0C5822]">(Most Popular)</span>
              )}
            </div>

            <div className="mt-5">
              <p className="text-3xl font-bold text-slate-900 tabular-nums">
                {formatCurrency(tier.price, 'USD')}
              </p>
              <p className="text-sm text-muted-foreground">{tier.billingLabel}</p>
            </div>

            <ul className="mt-6 flex flex-col gap-3 text-sm text-slate-700">
              {tier.featureLabels.map((label, i) => {
                const ok = tier.features[i]
                return (
                  <li key={label} className="flex items-center gap-2">
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

            <Button
              type="button"
              className="mt-auto w-full rounded-xl bg-[#6BBF2D] hover:bg-[#5aad26] text-white mt-10"
              onClick={() => {
                onSelectPackage(tier)
                onClose()
              }}
            >
              Get Started
            </Button>
          </div>
        ))}
      </div>
    </ModalWrapper>
  )
}
