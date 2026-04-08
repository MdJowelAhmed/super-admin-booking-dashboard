import { useMemo, useState } from 'react'
import { ModalWrapper } from '@/components/common'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAppDispatch } from '@/redux/hooks'
import { updateBookingPaymentStatus } from '@/redux/slices/bookingSlice'
import type { Booking } from '@/types'
import { toast } from '@/utils/toast'

const PAYMENT_STATUS_OPTIONS: Array<Booking['paymentStatus']> = [
  'Paid',
  'Pending',
  'Refunded',
]

interface StatusUpdateModalProps {
  open: boolean
  onClose: () => void
  booking: Booking | null
}

export function StatusUpdateModal({ open, onClose, booking }: StatusUpdateModalProps) {
  const dispatch = useAppDispatch()
  const [value, setValue] = useState<Booking['paymentStatus']>('Pending')

  const initialValue = useMemo<Booking['paymentStatus']>(() => {
    return booking?.paymentStatus ?? 'Pending'
  }, [booking])

  if (!booking) return null

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setValue(initialValue)
    } else {
      onClose()
    }
  }

  const handleSave = () => {
    dispatch(updateBookingPaymentStatus({ id: booking.id, paymentStatus: value }))
    toast({
      title: 'Status updated',
      description: `Booking payment status changed to ${value}.`,
      variant: 'success',
    })
    onClose()
  }

  return (
    <ModalWrapper
      open={open}
      onClose={() => handleOpenChange(false)}
      title="Update Status"
      description={`Booking ID: ${booking.id}`}
      size="sm"
      className="bg-white"
    >
      <div className="space-y-5">
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-800">Select status</p>
          <Select value={value} onValueChange={(v) => setValue(v as Booking['paymentStatus'])}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {PAYMENT_STATUS_OPTIONS.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            className="bg-green-600 hover:bg-green-700 text-white"
            disabled={value === booking.paymentStatus}
          >
            Update
          </Button>
        </div>
      </div>
    </ModalWrapper>
  )
}

