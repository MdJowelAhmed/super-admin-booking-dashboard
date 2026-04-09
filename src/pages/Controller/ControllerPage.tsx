import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CardContent } from '@/components/ui/card'
import { Pagination } from '@/components/common/Pagination'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { useUrlNumber } from '@/hooks/useUrlState'
import { mockControllers, type ControllerAccount } from './controllerData'
import { ControllerTable } from './components/ControllerTable'
import { AddEditControllerModal } from './components/AddEditControllerModal'

export default function ControllerPage() {
  const [page, setPage] = useUrlNumber('page', 1)
  const [limit, setLimit] = useUrlNumber('limit', 10)

  const [rows, setRows] = useState<ControllerAccount[]>(mockControllers)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [editing, setEditing] = useState<ControllerAccount | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ControllerAccount | null>(null)

  const totalItems = rows.length
  const totalPages = Math.max(1, Math.ceil(totalItems / limit))

  const pageItems = useMemo(() => {
    const start = (page - 1) * limit
    return rows.slice(start, start + limit)
  }, [rows, page, limit])

  const openCreate = () => {
    setModalMode('create')
    setEditing(null)
    setModalOpen(true)
  }

  const openEdit = (row: ControllerAccount) => {
    setModalMode('edit')
    setEditing(row)
    setModalOpen(true)
  }

  const handleSave = (payload: {
    name: string
    email: string
    phone: string
    password: string
    role: ControllerAccount['role']
  }) => {
    if (modalMode === 'create') {
      setRows((prev) => [
        {
          id: crypto.randomUUID(),
          name: payload.name,
          email: payload.email,
          phone: payload.phone,
          password: payload.password,
          role: payload.role,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ])
    } else if (editing) {
      setRows((prev) =>
        prev.map((r) =>
          r.id === editing.id
            ? {
                ...r,
                name: payload.name,
                email: payload.email,
                phone: payload.phone,
                password: payload.password,
                role: payload.role,
              }
            : r
        )
      )
    }
  }

  const confirmDelete = () => {
    if (!deleteTarget) return
    setRows((prev) => prev.filter((r) => r.id !== deleteTarget.id))
    setDeleteTarget(null)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="rounded-2xl border-0 bg-white shadow-sm">
        <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#2d2d2d] md:text-3xl">
              Controller
            </h1>
            <p className="mt-1 text-sm text-muted-foreground md:text-base">
              Add and manage host and business accounts for your platform
            </p>
          </div>
          <Button
            type="button"
            onClick={openCreate}
            className="shrink-0 gap-2 rounded-md  text-white hover:bg-[#5aad26]"
          >
            <Plus className="h-5 w-5" />
            Add New Controller
          </Button>
        </div>

        <CardContent className="p-0">
          <ControllerTable rows={pageItems} onEdit={openEdit} onDelete={setDeleteTarget} />
          <div className="border-t border-gray-100 px-6 py-4">
            <Pagination
              currentPage={Math.min(page, totalPages)}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={limit}
              onPageChange={setPage}
              onItemsPerPageChange={(n) => {
                setLimit(n)
                setPage(1)
              }}
            />
          </div>
        </CardContent>
      </div>

      <AddEditControllerModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setEditing(null)
        }}
        mode={modalMode}
        controller={editing}
        onSave={handleSave}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete controller"
        description={
          deleteTarget
            ? `Remove ${deleteTarget.name} (${deleteTarget.email})? This cannot be undone.`
            : ''
        }
        confirmText="Delete"
      />
    </motion.div>
  )
}
