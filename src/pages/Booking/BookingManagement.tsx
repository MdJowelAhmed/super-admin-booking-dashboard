import { useState } from 'react'
import { BookingStatCard } from './BookingStatCard'
import { BookingTable } from './BookingTable'
// import { AddBookingModal } from './components/AddBookingModal'
import { BookingDetailsModal } from './components/BookingDetailsModal'
import type { Booking } from '@/types'

const BookingManagement = () => {
  // const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)

  // const handleAddBooking = () => {
  //   setIsAddModalOpen(true)
  // }

  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking)
    setIsDetailsModalOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <BookingStatCard />

      {/* Bookings Table */}
      <BookingTable
        // onAddBooking={handleAddBooking}
        onViewDetails={handleViewDetails}
      />

      {/* Add Booking Modal */}
      {/* <AddBookingModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      /> */}

      {/* Booking Details Modal */}
      <BookingDetailsModal
        open={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false)
          setSelectedBooking(null)
        }}
        booking={selectedBooking}
      />
    </div>
  )
}

export default BookingManagement