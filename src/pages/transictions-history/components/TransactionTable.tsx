import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Eye } from 'lucide-react'
import { cn } from '@/utils/cn'
import type { Transaction } from '@/types'
import { formatDate } from '@/utils/formatters'

interface TransactionTableProps {
  transactions: Transaction[]
  onView: (transaction: Transaction) => void
}

export function TransactionTable({
  transactions,
  onView,
}: TransactionTableProps) {
  const formatMoney = (t: Transaction) => {
    const currency = (t.currency ?? 'USD').toUpperCase()
    const symbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : `${currency} `
    return `${symbol}${t.amount.toFixed(2)}`
  }

  return (
    <div className="w-full overflow-auto">
      <table className="w-full min-w-[1100px]">
        <thead>
          <tr className="bg-primary text-white">
            <th className="px-6 py-4 text-left text-sm font-bold">Booking ID</th>
            <th className="px-6 py-4 text-left text-sm font-bold">User Name</th>
            <th className="px-6 py-4 text-left text-sm font-bold">Contact</th>
            <th className="px-6 py-4 text-left text-sm font-bold">Selected Room</th>
            <th className="px-6 py-4 text-left text-sm font-bold">Check in Date</th>
            <th className="px-6 py-4 text-left text-sm font-bold">Check out Date</th>
            <th className="px-6 py-4 text-left text-sm font-bold">Price</th>
            <th className="px-6 py-4 text-left text-sm font-bold">Status</th>
            <th className="px-6 py-4 text-right text-sm font-bold">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {transactions.length === 0 ? (
            <tr>
              <td
                colSpan={9}
                className="px-6 py-8 text-center text-gray-500"
              >
                No transactions found
              </td>
            </tr>
          ) : (
            transactions.map((transaction, index) => (
              <motion.tr
                key={transaction.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * index }}
                className="hover:bg-gray-50 transition-colors"
              >
                {/* Booking ID Column */}
                <td className="px-6 py-4">
                  <span
                    onClick={() => onView(transaction)}
                    className="text-sm font-medium text-blue-600 underline cursor-pointer hover:text-blue-700"
                  >
                    {transaction.bookingId ?? transaction.transactionId}
                  </span>
                </td>

                {/* User Name Column */}
                <td className="px-6 py-4">
                  <span className="text-sm text-slate-700">
                    {transaction.userName}
                  </span>
                </td>

                {/* Contact Column */}
                <td className="px-6 py-4">
                  <span className="text-sm text-slate-700">
                    {transaction.email}
                  </span>
                </td>

                {/* Selected Room Column */}
                <td className="px-6 py-4">
                  <span className="text-sm text-slate-700">
                    {transaction.selectedRoom ?? '—'}
                  </span>
                </td>

                {/* Check-in Date Column */}
                <td className="px-6 py-4">
                  <span className="text-sm text-slate-700">
                    {formatDate(transaction.checkInDate ?? transaction.date, 'dd MMM, yyyy')}
                  </span>
                </td>

                {/* Check-out Date Column */}
                <td className="px-6 py-4">
                  <span className="text-sm text-slate-700">
                    {formatDate(transaction.checkOutDate ?? transaction.date, 'dd MMM, yyyy')}
                  </span>
                </td>

                {/* Price Column */}
                <td className="px-6 py-4">
                  <span className="text-sm font-semibold text-slate-800">
                    {formatMoney(transaction)}
                  </span>
                </td>

                {/* Status Column */}
                <td className="px-6 py-4">
                  <span
                    className={cn(
                      'inline-flex items-center px-3 py-1 w-[90px] justify-center text-center rounded-sm text-xs font-medium',
                      transaction.status === 'Paid' || transaction.status === 'Completed'
                        ? 'bg-green-100 text-green-800'
                        : transaction.status === 'Pending'
                        ? 'bg-orange-100 text-orange-800'
                        : transaction.status === 'Refunded'
                        ? 'bg-purple-100 text-purple-800'
                        : transaction.status === 'Failed'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    )}
                  >
                    {transaction.status}
                  </span>
                </td>

                {/* Actions Column */}
                <td className="px-6 py-4">
                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onView(transaction)}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
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

