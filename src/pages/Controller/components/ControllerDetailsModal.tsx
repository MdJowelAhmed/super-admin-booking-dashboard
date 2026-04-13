import { ModalWrapper } from '@/components/common'
import { Button } from '@/components/ui/button'
import { cn } from '@/utils/cn'
import type { ControllerAccount } from '../controllerData'

function Field({ label, value }: { label: string; value?: string }) {
  return (
    <div className="grid grid-cols-1 gap-1 sm:grid-cols-3 sm:gap-3 py-2">
      <div className="text-sm font-medium text-slate-700">{label}</div>
      <div className="text-sm text-slate-800 sm:col-span-2 break-words">
        {value && value.trim().length ? value : '—'}
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: ControllerAccount['status'] }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-medium capitalize',
        status === 'accepted'
          ? 'bg-[#E7F6D5] border-[#6BBF2D] text-[#2E6A0D]'
          : status === 'rejected'
            ? 'bg-red-50 border-red-300 text-red-800'
            : 'bg-orange-50 border-orange-300 text-orange-800'
      )}
    >
      {status}
    </span>
  )
}

interface ControllerDetailsModalProps {
  open: boolean
  onClose: () => void
  row: ControllerAccount | null
  onAccept: (row: ControllerAccount) => void
  onReject: (row: ControllerAccount) => void
}

export function ControllerDetailsModal({
  open,
  onClose,
  row,
  onAccept,
  onReject,
}: ControllerDetailsModalProps) {
  const canDecide = row?.status === 'pending'

  return (
    <ModalWrapper open={open} onClose={onClose} title="Controller details" size="lg">
      {!row ? null : (
        <div className="space-y-4 pt-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-lg font-semibold text-slate-900">{row.name}</p>
              <p className="text-sm text-muted-foreground">{row.email}</p>
            </div>
            <StatusBadge status={row.status} />
          </div>

          <div className="rounded-xl border border-slate-200 bg-white px-4 py-2">
            <Field label="Role" value={row.role} />
            <Field label="Business name" value={row.businessName} />
            <Field label="Contact" value={row.contact ?? row.phone} />
            <Field label="Phone" value={row.phone} />
            <Field label="Location" value={row.location} />
            <Field label="Address" value={row.address} />
            <Field label="Office address" value={row.officeAddress} />
            <Field label="City" value={row.city} />
            <Field label="Zip code" value={row.zipCode} />
            <Field label="Created at" value={row.createdAt} />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Close
            </Button>
            {canDecide && (
              <>
                <Button
                  type="button"
                  className="bg-[#6BBF2D] hover:bg-[#5aad26] text-white"
                  onClick={() => onAccept(row)}
                >
                  Accept
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="border-destructive/30 text-destructive hover:bg-destructive/10"
                  onClick={() => onReject(row)}
                >
                  Reject
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </ModalWrapper>
  )
}

