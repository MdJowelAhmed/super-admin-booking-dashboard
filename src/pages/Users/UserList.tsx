import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CardContent } from '@/components/ui/card'
import { SearchInput, FilterDropdown, Pagination, ConfirmDialog } from '@/components/common'
import { UserTable } from './components/UserTable'
import { useUrlParams } from '@/hooks/useUrlState'
import { USER_ROLES, USER_STATUSES } from '@/utils/constants'
import type { User } from '@/types'
import { motion } from 'framer-motion'
import {
  mapUserManagementDocToUser,
  useGetUsersQuery,
  type ApiUserRoleFilter,
  useUpdateUserStatusMutation,
} from '@/redux/api/userApi'

function getErrorMessage(err: unknown): string {
  if (
    err &&
    typeof err === 'object' &&
    'data' in err &&
    err.data &&
    typeof err.data === 'object' &&
    'message' in err.data &&
    typeof (err.data as { message: unknown }).message === 'string'
  ) {
    return (err.data as { message: string }).message
  }
  if (err instanceof Error) return err.message
  return 'Failed to load users.'
}

export default function UserList() {
  const navigate = useNavigate()
  const { getParam, getNumberParam, setParam, setParams } = useUrlParams()

  const search = getParam('search', '')
  const status = getParam('status', 'all')
  const role = getParam('role', 'all') as 'all' | ApiUserRoleFilter
  const page = getNumberParam('page', 1)
  const limit = getNumberParam('limit', 10)

  const { data, isLoading, isFetching, isError, error } = useGetUsersQuery({
    page,
    limit,
    role: role === 'all' ? 'all' : role,
  })

  const [updateStatus, { isLoading: isUpdating }] = useUpdateUserStatusMutation()
  const [blockTarget, setBlockTarget] = useState<User | null>(null)

  const rows = useMemo(
    () => (data?.data ?? []).map(mapUserManagementDocToUser),
    [data?.data]
  )

  const filteredRows = useMemo(() => {
    let r = rows
    if (search.trim()) {
      const q = search.toLowerCase()
      r = r.filter(
        (u) =>
          `${u.firstName} ${u.lastName}`.toLowerCase().includes(q) ||
          (u.rawName?.toLowerCase().includes(q) ?? false) ||
          u.email.toLowerCase().includes(q) ||
          u.phone.toLowerCase().includes(q)
      )
    }
    if (status !== 'all') {
      r = r.filter((u) => u.status === status)
    }
    return r
  }, [rows, search, status])

  const meta = data?.meta
  const totalItems = meta?.total ?? 0
  const totalPages = Math.max(1, meta?.totalPage ?? 1)

  const handleSearch = (value: string) => {
    setParams({ search: value, page: 1 })
  }

  const handleStatusFilter = (value: string) => {
    setParams({ status: value, page: 1 })
  }

  const handleRoleFilter = (value: string) => {
    setParams({ role: value, page: 1 })
  }

  const handlePageChange = (newPage: number) => {
    setParam('page', newPage)
  }

  const handleLimitChange = (newLimit: number) => {
    setParams({ limit: newLimit, page: 1 })
  }

  const handleRowClick = (user: User) => {
    navigate(`/users/${user.id}`)
  }

  const handleToggleStatus = (user: User) => {
    if (user.status === 'blocked') {
      updateStatus({ id: user.id, body: { status: 'active' } })
        .unwrap()
        .catch(() => null)
      return
    }
    setBlockTarget(user)
  }

  const confirmBlock = async () => {
    if (!blockTarget) return
    await updateStatus({ id: blockTarget.id, body: { status: 'blocked' } }).unwrap()
    setBlockTarget(null)
  }

  const listBusy = isLoading || isFetching

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="bg-white border-0 shadow-sm rounded-2xl">
       

        <CardContent className="p-0">
          <div className="flex flex-col sm:flex-row gap-4 px-6 pb-4 pt-8 justify-end">
            <SearchInput
              value={search}
              onChange={handleSearch}
              placeholder="Search by name, email, phone…"
              className="sm:w-80"
            />
            <div className="flex flex-wrap gap-3">
              <FilterDropdown
                value={status}
                options={USER_STATUSES}
                onChange={handleStatusFilter}
                placeholder="All Status"
              />
              <FilterDropdown
                value={role}
                options={USER_ROLES}
                onChange={handleRoleFilter}
                placeholder="All Roles"
              />
            </div>
          </div>

          <UserTable
            users={filteredRows}
            page={page}
            limit={limit}
            isLoading={listBusy}
            isUpdating={isUpdating}
            onView={handleRowClick}
            onToggleStatus={handleToggleStatus}
          />

          <div className="border-t border-gray-100 px-6 py-4">
            <Pagination
              currentPage={Math.min(page, totalPages)}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={limit}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleLimitChange}
            />
          </div>
        </CardContent>
      </div>

      <ConfirmDialog
        open={!!blockTarget}
        onClose={() => setBlockTarget(null)}
        onConfirm={confirmBlock}
        title="Block user?"
        description={
          blockTarget
            ? `Block ${blockTarget.rawName?.trim() || blockTarget.email}? They will no longer be able to access the platform.`
            : ''
        }
        confirmText="Block"
        variant="warning"
        isLoading={isUpdating}
      />
    </motion.div>
  )
}
