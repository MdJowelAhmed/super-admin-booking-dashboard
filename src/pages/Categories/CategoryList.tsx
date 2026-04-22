import { useMemo, useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SearchInput, FilterDropdown, Pagination } from '@/components/common'
import { CategoryTable } from './components/CategoryTable'
import { AddEditCategoryModal } from './AddEditCategoryModal'
import { DeleteCategoryModal } from './DeleteCategoryModal'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { setSelectedCategory } from '@/redux/slices/categorySlice'
import { useUrlParams } from '@/hooks/useUrlState'
import { CATEGORY_TYPE_FILTER_OPTIONS } from '@/utils/constants'
import type { Category, CategoryType } from '@/types'
import { motion } from 'framer-motion'
import {
  mapCategoryFromApi,
  useGetCategoriesQuery,
} from '@/redux/api/categoryApi'

export default function CategoryList() {
  const dispatch = useAppDispatch()
  const { selectedCategory } = useAppSelector((state) => state.categories)

  const { getParam, getNumberParam, setParam, setParams } = useUrlParams()

  const search = getParam('search', '')
  const typeFilter = getParam('type', 'all') as CategoryType | 'all'
  const page = getNumberParam('page', 1)
  const limit = getNumberParam('limit', 10)

  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const { data, isLoading, isFetching } = useGetCategoriesQuery(
    typeFilter === 'all' ? undefined : { type: typeFilter }
  )

  const list = useMemo(
    () => (data?.data ?? []).map(mapCategoryFromApi),
    [data?.data]
  )

  const filteredList = useMemo(() => {
    if (!search.trim()) return list
    const q = search.toLowerCase()
    return list.filter((c) => c.name.toLowerCase().includes(q))
  }, [list, search])

  useEffect(() => {
    if (page > 1 && filteredList.length === 0 && !isLoading) {
      setParam('page', 1)
    }
  }, [page, filteredList.length, isLoading, setParam])

  const paginatedData = useMemo(() => {
    const start = (page - 1) * limit
    return filteredList.slice(start, start + limit)
  }, [filteredList, page, limit])

  const handleSearch = (value: string) => {
    setParams({ search: value, page: 1 })
  }

  const handleTypeFilter = (value: string) => {
    setParams({ type: value, page: 1 })
  }

  const handlePageChange = (newPage: number) => {
    setParam('page', newPage)
  }

  const handleLimitChange = (newLimit: number) => {
    setParams({ limit: newLimit, page: 1 })
  }

  const handleEdit = (category: Category) => {
    dispatch(setSelectedCategory(category))
    setShowEditModal(true)
  }

  const handleDelete = (category: Category) => {
    dispatch(setSelectedCategory(category))
    setShowDeleteModal(true)
  }

  const tableBusy = isLoading || isFetching
  const totalPages = Math.max(1, Math.ceil(filteredList.length / limit))

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="bg-white border-0 shadow-sm rounded-2xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between p-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#2d2d2d] md:text-3xl">
              Categories
            </h1>
            <p className="mt-1 text-sm text-muted-foreground md:text-base">
              Manage listing categories and amenities for your properties.
            </p>
          </div>

          <Button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="rounded-md bg-primary hover:bg-[#5aad26] text-white shrink-0 gap-2"
          >
            <Plus className="h-5 w-5" />
            Add Category
          </Button>
        </div>

        <CardContent className="p-0">
          <div className="flex flex-col sm:flex-row gap-4 px-6 pb-4">
            <SearchInput
              value={search}
              onChange={handleSearch}
              placeholder="Search by name..."
              className="sm:w-80 sm:flex-initial"
            />
            <FilterDropdown
              value={typeFilter}
              options={CATEGORY_TYPE_FILTER_OPTIONS}
              onChange={handleTypeFilter}
              placeholder="Type"
              className="sm:w-48"
            />
          </div>

          <CategoryTable
            categories={paginatedData}
            page={page}
            limit={limit}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isLoading={tableBusy}
          />

          <div className="px-6 py-4 border-t border-gray-100">
            <Pagination
              currentPage={Math.min(page, totalPages)}
              totalPages={totalPages}
              totalItems={filteredList.length}
              itemsPerPage={limit}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleLimitChange}
            />
          </div>
        </CardContent>
      </div>

      <AddEditCategoryModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        mode="add"
      />

      {selectedCategory && (
        <AddEditCategoryModal
          open={showEditModal}
          onClose={() => {
            setShowEditModal(false)
            dispatch(setSelectedCategory(null))
          }}
          mode="edit"
          category={selectedCategory}
        />
      )}

      {selectedCategory && (
        <DeleteCategoryModal
          open={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false)
            dispatch(setSelectedCategory(null))
          }}
          category={selectedCategory}
        />
      )}
    </motion.div>
  )
}
