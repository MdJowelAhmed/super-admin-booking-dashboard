export type ControllerRole = 'host' | 'business'

export interface ControllerAccount {
  id: string
  name: string
  email: string
  phone: string
  /** Stored for demo; never shown in the table */
  password: string
  role: ControllerRole
  createdAt: string
}

export const mockControllers: ControllerAccount[] = [
  {
    id: '1',
    name: 'Alex Morgan',
    email: 'alex.host@example.com',
    phone: '+1 555 0101',
    password: 'changeme',
    role: 'host',
    createdAt: '2026-03-01T10:00:00.000Z',
  },
  {
    id: '2',
    name: 'Jamie Lee',
    email: 'jamie.biz@example.com',
    phone: '+1 555 0102',
    password: 'changeme',
    role: 'business',
    createdAt: '2026-03-15T14:30:00.000Z',
  },
]
