import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { Transaction, TransactionFilters, TransactionStatus, PaginationState } from '@/types'
import { DEFAULT_PAGINATION } from '@/utils/constants'

// Mock data for demonstration (matches UI screenshot)
const mockTransactions: Transaction[] = Array.from({ length: 14 }).map((_, idx) => {
  const statuses: Transaction['status'][] = ['Paid', 'Refunded', 'Pending', 'Paid', 'Paid']
  const status = statuses[idx % statuses.length]
  const bookingId = '#101010'
  const now = new Date('2026-03-12T10:00:00Z')
  const createdAt = new Date(now.getTime() + idx * 60_000).toISOString()
  const updatedAt = createdAt

  return {
    id: String(idx + 1),
    transactionId: bookingId,
    bookingId,
    date: '2026-03-12',
    userName: 'Zabia Ferdousi',
    email: 'Zabiaferdousi@gmail.com',
    selectedRoom: 'Standard Room',
    checkInDate: '2026-03-12',
    checkOutDate: '2026-03-16',
    amount: 180,
    currency: 'USD',
    status,
    paymentMethod: 'Credit Card',
    description: 'Room booking payment',
    createdAt,
    updatedAt,
  }
  
})

interface TransactionState {
  list: Transaction[]
  filteredList: Transaction[]
  filters: TransactionFilters
  pagination: PaginationState
  isLoading: boolean
  error: string | null
}

const initialState: TransactionState = {
  list: mockTransactions,
  filteredList: mockTransactions,
  filters: {
    search: '',
    status: 'all',
  },
  pagination: {
    ...DEFAULT_PAGINATION,
    total: mockTransactions.length,
    totalPages: Math.ceil(mockTransactions.length / DEFAULT_PAGINATION.limit),
  },
  isLoading: false,
  error: null,
}

const transactionSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    setTransactions: (state, action: PayloadAction<Transaction[]>) => {
      state.list = action.payload
      state.filteredList = action.payload
      state.pagination.total = action.payload.length
      state.pagination.totalPages = Math.ceil(
        action.payload.length / state.pagination.limit
      )
    },
    setFilters: (state, action: PayloadAction<Partial<TransactionFilters>>) => {
      state.filters = { ...state.filters, ...action.payload }
      
      // Apply filters
      let filtered = [...state.list]
      
      // Search filter
      if (state.filters.search) {
        const searchLower = state.filters.search.toLowerCase()
        filtered = filtered.filter(
          (transaction) =>
            transaction.transactionId.toLowerCase().includes(searchLower) ||
            (transaction.bookingId ?? '').toLowerCase().includes(searchLower) ||
            transaction.userName.toLowerCase().includes(searchLower) ||
            transaction.email.toLowerCase().includes(searchLower) ||
            (transaction.selectedRoom ?? '').toLowerCase().includes(searchLower)
        )
      }
      
      // Status filter
      if (state.filters.status !== 'all') {
        filtered = filtered.filter((transaction) => transaction.status === state.filters.status)
      }
      
      state.filteredList = filtered
      state.pagination.total = filtered.length
      state.pagination.totalPages = Math.ceil(
        filtered.length / state.pagination.limit
      )
      state.pagination.page = 1
    },
    clearFilters: (state) => {
      state.filters = { search: '', status: 'all' }
      state.filteredList = state.list
      state.pagination.total = state.list.length
      state.pagination.totalPages = Math.ceil(
        state.list.length / state.pagination.limit
      )
      state.pagination.page = 1
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.pagination.page = action.payload
    },
    setLimit: (state, action: PayloadAction<number>) => {
      state.pagination.limit = action.payload
      state.pagination.totalPages = Math.ceil(
        state.filteredList.length / action.payload
      )
      state.pagination.page = 1
    },
    setTransactionStatus: (
      state,
      action: PayloadAction<{ id: string; status: TransactionStatus }>
    ) => {
      const { id, status } = action.payload

      const transaction = state.list.find((t) => t.id === id)
      if (transaction) {
        transaction.status = status
        transaction.updatedAt = new Date().toISOString()
      }

      const filteredTransaction = state.filteredList.find((t) => t.id === id)
      if (filteredTransaction) {
        filteredTransaction.status = status
        filteredTransaction.updatedAt = new Date().toISOString()
      }
    },
    addTransaction: (state, action: PayloadAction<Transaction>) => {
      state.list.unshift(action.payload)
      state.filteredList.unshift(action.payload)
      state.pagination.total = state.list.length
      state.pagination.totalPages = Math.ceil(
        state.list.length / state.pagination.limit
      )
    },
    updateTransaction: (state, action: PayloadAction<Transaction>) => {
      const index = state.list.findIndex((transaction) => transaction.id === action.payload.id)
      if (index !== -1) {
        state.list[index] = { ...action.payload, updatedAt: new Date().toISOString() }
      }
      const filteredIndex = state.filteredList.findIndex((transaction) => transaction.id === action.payload.id)
      if (filteredIndex !== -1) {
        state.filteredList[filteredIndex] = { ...action.payload, updatedAt: new Date().toISOString() }
      }
    },
    deleteTransaction: (state, action: PayloadAction<string>) => {
      state.list = state.list.filter((transaction) => transaction.id !== action.payload)
      state.filteredList = state.filteredList.filter((transaction) => transaction.id !== action.payload)
      state.pagination.total = state.list.length
      state.pagination.totalPages = Math.ceil(
        state.list.length / state.pagination.limit
      )
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
  },
})

export const {
  setTransactions,
  setFilters,
  clearFilters,
  setPage,
  setLimit,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  setLoading,
  setError,
  setTransactionStatus,
} = transactionSlice.actions

export default transactionSlice.reducer

