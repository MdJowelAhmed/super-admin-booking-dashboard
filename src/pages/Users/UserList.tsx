import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
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
import { UserActionMenu } from './components/UserActionMenu'
import { useUrlParams } from '@/hooks/useUrlState'
import { USER_ROLES, USER_STATUSES } from '@/utils/constants'
import { formatDate, getInitials } from '@/utils/formatters'
import type { User, TableColumn } from '@/types'
import { motion } from 'framer-motion'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  mapUserManagementDocToUser,
  useGetUsersQuery,
  type ApiUserRoleFilter,
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

  const columns: TableColumn<User>[] = useMemo(
    () => [
      {
        key: 'name',
        label: 'User',
        sortable: true,
        render: (_, user) => (
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarImage src={user.avatar} alt="" />
              <AvatarFallback>
                {getInitials(user.firstName, user.lastName || user.email)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">
                {user.rawName?.trim()
                  ? user.rawName
                  : `${user.firstName} ${user.lastName}`.trim()}
              </p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
        ),
      },
      {
        key: 'phone',
        label: 'Phone',
        render: (value) => (
          <span className="text-muted-foreground">{value as string}</span>
        ),
      },
      {
        key: 'role',
        label: 'Role',
        sortable: true,
        render: (value) => <StatusBadge status={value as string} type="role" />,
      },
      {
        key: 'status',
        label: 'Status',
        sortable: true,
        render: (value) => <StatusBadge status={value as string} />,
      },
      {
        key: 'createdAt',
        label: 'Joined',
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

  const listBusy = isLoading || isFetching

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
            <CardTitle>Users</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Manage users, roles, and account status
            </p>
            {isError && (
              <p className="text-sm text-destructive mt-2">{getErrorMessage(error)}</p>
            )}
          </div>
          <Button type="button">
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
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

          <DataTable
            columns={columns}
            data={filteredRows}
            isLoading={listBusy}
            rowKeyExtractor={(row) => row.id}
            onRowClick={handleRowClick}
            actions={(user) => <UserActionMenu user={user} />}
            emptyMessage="No users on this page. Try another role filter or page."
          />

          <Pagination
            currentPage={Math.min(page, totalPages)}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={limit}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleLimitChange}
          />
        </CardContent>
      </Card>
    </motion.div>
  )
}
