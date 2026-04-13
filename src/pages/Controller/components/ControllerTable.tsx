import { motion } from 'framer-motion'
import { cn } from '@/utils/cn'
import { formatDate } from '@/utils/formatters'
import { getRoleDisplayName } from '@/utils/roleHelpers'
import type { ControllerAccount, ControllerRole } from '../controllerData'
import { ControllerRowActions } from './ControllerRowActions'

function RolePill({ role }: { role: ControllerRole }) {
  const isHost = role === 'host'
  return (
    <span
      className={cn(
        'inline-flex rounded-full border px-3 py-0.5 text-xs font-medium',
        isHost
          ? 'border-purple-300 bg-purple-50 text-purple-900'
          : 'border-blue-300 bg-blue-50 text-blue-900'
      )}
    >
      {getRoleDisplayName(role)}
    </span>
  )
}

interface ControllerTableProps {
  rows: ControllerAccount[]
  onDetails: (row: ControllerAccount) => void
  onAccept: (row: ControllerAccount) => void
  onReject: (row: ControllerAccount) => void
}

function StatusPill({ status }: { status: ControllerAccount['status'] }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full border px-3 py-0.5 text-xs font-medium capitalize',
        status === 'accepted'
          ? 'bg-[#E7F6D5] border-[#6BBF2D] text-[#2E6A0D]'
          : status === 'rejected'
            ? 'bg-red-50 border-red-300 text-red-800'
            : 'bg-orange-50 border-orange-300 text-orange-800'
      )}
    >
      {status}
    </span>
  )
}

export function ControllerTable({ rows, onDetails, onAccept, onReject }: ControllerTableProps) {
  return (
    <div className="w-full overflow-auto">
      <table className="w-full min-w-[920px]">
        <thead>
          <tr className="bg-primary text-white">
            <th className="px-6 py-4 text-left text-sm font-bold">Name</th>
            <th className="px-6 py-4 text-left text-sm font-bold">Email</th>
            <th className="px-6 py-4 text-left text-sm font-bold">Phone</th>
            <th className="px-6 py-4 text-left text-sm font-bold">Role</th>
            <th className="px-6 py-4 text-left text-sm font-bold">Status</th>
            <th className="px-6 py-4 text-left text-sm font-bold">Created</th>
            <th className="px-6 py-4 text-right text-sm font-bold w-[200px]" aria-label="Actions" >Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {rows.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                No controllers yet. Add one to get started.
              </td>
            </tr>
          ) : (
            rows.map((row, index) => (
              <motion.tr
                key={row.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * index }}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4 text-sm font-medium text-slate-800">{row.name}</td>
                <td className="px-6 py-4 text-sm text-slate-700">{row.email}</td>
                <td className="px-6 py-4 text-sm text-slate-700">{row.phone}</td>
                <td className="px-6 py-4">
                  <RolePill role={row.role} />
                </td>
                <td className="px-6 py-4">
                  <StatusPill status={row.status} />
                </td>
                <td className="px-6 py-4 text-sm text-slate-700">
                  {formatDate(row.createdAt, 'dd MMM, yyyy')}
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-end">
                    <ControllerRowActions
                      row={row}
                      onDetails={onDetails}
                      onAccept={onAccept}
                      onReject={onReject}
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
