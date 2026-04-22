import { Edit, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Category } from '@/types'

interface CategoryActionMenuProps {
  category: Category
  onEdit: () => void
  onDelete: () => void
}

export function CategoryActionMenu({
  category,
  onEdit,
  onDelete,
}: CategoryActionMenuProps) {
  return (
    <div className="flex  items-center justify-end gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onEdit}
        aria-label={`Edit ${category.name}`}
      >
        <Edit className="h-4 w-4 sm:mr-1.5" />
        <span className="hidden sm:inline">Edit</span>
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="text-destructive border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
        onClick={onDelete}
        aria-label={`Delete ${category.name}`}
      >
        <Trash2 className="h-4 w-4 sm:mr-1.5" />
        <span className="hidden sm:inline">Delete</span>
      </Button>
    </div>
  )
}
