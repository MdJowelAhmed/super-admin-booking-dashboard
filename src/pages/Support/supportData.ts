export type SupportMessageSender = 'guest' | 'owner'

export interface SupportMessage {
  id: string
  sender: SupportMessageSender
  text: string
  time: string // e.g. 10:30 AM
}

export interface SupportConversation {
  id: string
  guestName: string
  guestAvatarUrl?: string
  propertyName: string
  lastMessage: string
  lastSeenLabel: string // e.g. 2 min ago
  unreadCount: number
  messages: SupportMessage[]
}

export const mockConversations: SupportConversation[] = [
  {
    id: 'c-1',
    guestName: 'Zabia Ferdousi',
    propertyName: 'Beachfront Villa',
    lastMessage: 'Thank you ! Looking forward to our stay.',
    lastSeenLabel: '2 min ago',
    unreadCount: 2,
    messages: [
      { id: 'm1', sender: 'guest', text: "Hi! I'm interested in booking your Beachfront Villa for next month.", time: '10:30 AM' },
      { id: 'm2', sender: 'owner', text: 'Hello! Thank you for your interest. The villa is available for those dates. Would you like to know more about the amenities?', time: '10:30 AM' },
      { id: 'm3', sender: 'guest', text: 'Yes, please! Also, is it close to the beach?', time: '10:30 AM' },
      { id: 'm4', sender: 'owner', text: 'The villa is directly on the beach with private access. It has 4 bedrooms, 3 bathrooms, a full kitchen, and a pool. We also provide beach chairs and umbrellas.', time: '10:30 AM' },
      { id: 'm5', sender: 'guest', text: 'That sounds perfect! What time is check-in?', time: '10:30 AM' },
      { id: 'm6', sender: 'owner', text: 'Check-in is at 3:00 PM and check-out is at 11:00 AM. I can arrange early check-in if needed.', time: '10:30 AM' },
    ],
  },
  {
    id: 'c-2',
    guestName: 'Mohammad Shakil',
    propertyName: 'Beachfront Villa',
    lastMessage: 'Can you share parking details?',
    lastSeenLabel: '8 min ago',
    unreadCount: 0,
    messages: [
      { id: 'm1', sender: 'guest', text: 'Can you share parking details?', time: '10:12 AM' },
      { id: 'm2', sender: 'owner', text: 'Sure—there is free on-site parking for two cars.', time: '10:13 AM' },
    ],
  },
  {
    id: 'c-3',
    guestName: 'Emily Davis',
    propertyName: 'Ocean View Apartment',
    lastMessage: 'Is late checkout possible?',
    lastSeenLabel: '1 hr ago',
    unreadCount: 1,
    messages: [
      { id: 'm1', sender: 'guest', text: 'Is late checkout possible?', time: '09:05 AM' },
    ],
  },
]

