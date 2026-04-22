import { motion } from 'framer-motion'
import { cn } from '@/utils/cn'
import type { Category } from '@/types'
import { formatDate } from '@/utils/formatters'
import { CategoryActionMenu } from './CategoryActionMenu'

function CategoryTypePill({ type }: { type: Category['type'] }) {
  const isAmenities = type === 'amenities'
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-medium capitalize',
        isAmenities
          ? 'bg-amber-50 border-amber-200 text-amber-900'
          : 'bg-emerald-50 border-emerald-200 text-emerald-900'
      )}
    >
      {isAmenities ? 'Amenities' : 'Category'}
    </span>
  )
}

interface CategoryTableProps {
  categories: Category[]
  page: number
  limit: number
  onEdit: (category: Category) => void
  onDelete: (category: Category) => void
  isLoading?: boolean
}

export function CategoryTable({
  categories,
  page,
  limit,
  onEdit,
  onDelete,
  isLoading,
}: CategoryTableProps) {
  if (isLoading && categories.length === 0) {
    return (
      <div className="px-6 py-12 text-center text-sm text-muted-foreground">
        Loading categories…
      </div>
    )
  }

  return (
    <div className="w-full overflow-auto">
      <table className="w-full min-w-[800px]">
        <thead>
          <tr className="bg-primary text-white">
            <th className="px-6 py-4 text-left text-sm font-bold">S.No</th>
            <th className="px-6 py-4 text-left text-sm font-bold">Name</th>
            <th className="px-6 py-4 text-left text-sm font-bold">Type</th>
            <th className="px-6 py-4 text-left text-sm font-bold">Created</th>
            <th className="px-6 py-4 text-left text-sm font-bold">Updated</th>
            <th
              className="px-6 py-4 text-right text-sm font-bold w-[200px]"
              aria-label="Row actions"
            />
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {categories.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                No categories found. Try adjusting filters or add a new one.
              </td>
            </tr>
          ) : (
            categories.map((category, index) => (
              <motion.tr
                key={category.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * index }}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4">
                  <span className="text-sm font-medium text-slate-700">
                    #{(page - 1) * limit + index + 1}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-slate-700 font-medium">
                    {category.name}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <CategoryTypePill type={category.type} />
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-slate-600">
                    {formatDate(category.createdAt)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-slate-600">
                    {formatDate(category.updatedAt)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-end">
                    <CategoryActionMenu
                      category={category}
                      onEdit={() => onEdit(category)}
                      onDelete={() => onDelete(category)}
                    />
                  </div>
                </td>
              </motion.tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
