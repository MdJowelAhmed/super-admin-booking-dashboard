import { useMemo, useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  SearchInput,
  FilterDropdown,
  DataTable,
  Pagination,
  StatusBadge,
} from '@/components/common'
import { CategoryActionMenu } from './components/CategoryActionMenu'
import { AddEditCategoryModal } from './AddEditCategoryModal'
import { DeleteCategoryModal } from './DeleteCategoryModal'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { setSelectedCategory } from '@/redux/slices/categorySlice'
import { useUrlParams } from '@/hooks/useUrlState'
import { CATEGORY_TYPE_FILTER_OPTIONS } from '@/utils/constants'
import { formatDate } from '@/utils/formatters'
import type { Category, CategoryType, TableColumn } from '@/types'
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

  const columns: TableColumn<Category>[] = useMemo(
    () => [
      {
        key: 'name',
        label: 'Name',
        sortable: true,
        render: (_, category) => (
          <p className="font-medium">{category.name}</p>
        ),
      },
      {
        key: 'type',
        label: 'Type',
        sortable: true,
        render: (value) => (
          <StatusBadge status={value as string} />
        ),
      },
      {
        key: 'createdAt',
        label: 'Created',
        sortable: true,
        render: (value) => (
          <span className="text-muted-foreground">
            {formatDate(value as string)}
          </span>
        ),
      },
      {
        key: 'updatedAt',
        label: 'Updated',
        sortable: true,
        render: (value) => (
          <span className="text-muted-foreground">
            {formatDate(value as string)}
          </span>
        ),
      },
    ],
    []
  )

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>Categories</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Manage listing categories and amenities
            </p>
          </div>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <SearchInput
              value={search}
              onChange={handleSearch}
              placeholder="Search by name..."
              className="sm:w-80"
            />
            <FilterDropdown
              value={typeFilter}
              options={CATEGORY_TYPE_FILTER_OPTIONS}
              onChange={handleTypeFilter}
              placeholder="Type"
            />
          </div>

          <DataTable
            columns={columns}
            data={paginatedData}
            isLoading={tableBusy}
            rowKeyExtractor={(row) => row.id}
            actions={(category) => (
              <CategoryActionMenu
                category={category}
                onEdit={() => handleEdit(category)}
                onDelete={() => handleDelete(category)}
              />
            )}
            emptyMessage="No categories found. Try adjusting filters or add a new one."
          />

          <Pagination
            currentPage={page}
            totalPages={Math.max(1, Math.ceil(filteredList.length / limit))}
            totalItems={filteredList.length}
            itemsPerPage={limit}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleLimitChange}
          />
        </CardContent>
      </Card>

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
