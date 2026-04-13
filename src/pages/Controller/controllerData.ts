export type ControllerRole = 'host' | 'business'

export type ControllerAccountStatus = 'pending' | 'accepted' | 'rejected'

export interface ControllerAccount {
  id: string
  name: string
  email: string
  phone: string
  /** Stored for demo; never shown in the table */
  password: string
  role: ControllerRole
  status: ControllerAccountStatus
  createdAt: string
  // Extra details for the details modal (demo fields)
  contact?: string
  location?: string
  address?: string
  officeAddress?: string
  city?: string
  zipCode?: string
  businessName?: string
}

export const mockControllers: ControllerAccount[] = [
  {
    id: '1',
    name: 'Alex Morgan',
    email: 'alex.host@example.com',
    phone: '+1 555 0101',
    password: 'changeme',
    role: 'host',
    status: 'pending',
    createdAt: '2026-03-01T10:00:00.000Z',
    contact: '+1 555 0101',
    location: 'Downtown',
    address: '123 Main Street',
    city: 'New York',
    zipCode: '10001',
  },
  {
    id: '2',
    name: 'Jamie Lee',
    email: 'jamie.biz@example.com',
    phone: '+1 555 0102',
    password: 'changeme',
    role: 'business',
    status: 'accepted',
    createdAt: '2026-03-15T14:30:00.000Z',
    businessName: 'Jamie Auto Care',
    contact: '+1 555 0102',
    officeAddress: '200 Market Road, Suite 12',
    city: 'Austin',
    zipCode: '73301',
    location: 'Central',
    address: 'Service Bay #3',
  },
]
