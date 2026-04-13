import { Check, Eye, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ControllerAccount } from '../controllerData'

interface ControllerRowActionsProps {
  row: ControllerAccount
  onDetails: (row: ControllerAccount) => void
  onAccept: (row: ControllerAccount) => void
  onReject: (row: ControllerAccount) => void
}

export function ControllerRowActions({
  row,
  onDetails,
  onAccept,
  onReject,
}: ControllerRowActionsProps) {
  const canDecide = row.status === 'pending'
  return (
    <div className="flex items-center justify-end gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="border-none text-slate-700 hover:bg-slate-100"
        onClick={() => onDetails(row)}
      >
        <Eye className="h-4 w-4 mr-1.5" />
        Details
      </Button>
      {canDecide && (
        <>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="border-none text-[#0C5822] hover:bg-[#E7F6D5]"
            onClick={() => onAccept(row)}
          >
            <Check className="h-4 w-4 mr-1.5" />
            Accept
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="border-none text-destructive hover:bg-destructive/10"
            onClick={() => onReject(row)}
          >
            <X className="h-4 w-4 mr-1.5" />
            Reject
          </Button>
        </>
      )}
    </div>
  )
}
