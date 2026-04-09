import { Edit, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ControllerAccount } from '../controllerData'

interface ControllerRowActionsProps {
  row: ControllerAccount
  onEdit: (row: ControllerAccount) => void
  onDelete: (row: ControllerAccount) => void
}

export function ControllerRowActions({
  row,
  onEdit,
  onDelete,
}: ControllerRowActionsProps) {
  return (
    <div className="flex items-center justify-end gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="text-[#0C5822] border-none"
        onClick={() => onEdit(row)}
      >
        <Edit className="h-4 w-4 mr-1.5" />
        Edit
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="border-none text-destructive hover:bg-destructive/10"
        onClick={() => onDelete(row)}
      >
        <Trash2 className="h-4 w-4 mr-1.5" />
        Delete
      </Button>
    </div>
  )
}
