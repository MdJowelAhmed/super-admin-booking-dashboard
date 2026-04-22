import type { BusinessRequestDoc } from '@/redux/api/controllerApi'

export type ControllerRole = 'host' | 'business'

export type ControllerAccountStatus = 'pending' | 'approved' | 'rejected'

export interface ControllerAccount {
  id: string
  /** Business / listing name */
  name: string
  email: string
  phone: string
  password?: string
  role: ControllerRole
  status: ControllerAccountStatus
  createdAt: string
  updatedAt?: string
  contact?: string
  location?: string
  address?: string
  officeAddress?: string
  city?: string
  zipCode?: string
  businessName?: string
  description?: string
  website?: string
  image?: string
  ownerName?: string
  ownerEmail?: string
}

function normalizeApiStatus(s: string): ControllerAccountStatus {
  const v = s?.toLowerCase()
  if (v === 'approved' || v === 'accepted') return 'approved'
  if (v === 'rejected') return 'rejected'
  return 'pending'
}

/** Map API document to UI row. `roleType` HOST → host tab; SERVICE (or non-HOST) → business tab. */
export function mapBusinessRequestToAccount(doc: BusinessRequestDoc): ControllerAccount {
  const role: ControllerRole =
    String(doc.roleType).toUpperCase() === 'HOST' ? 'host' : 'business'
  const owner =
    doc.ownerId && typeof doc.ownerId === 'object' ? doc.ownerId : null

  return {
    id: doc._id,
    name: doc.name,
    email: doc.email,
    phone: doc.phoneNumber,
    role,
    status: normalizeApiStatus(doc.status),
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    contact: doc.phoneNumber,
    location: doc.location,
    address: doc.officeAddress,
    officeAddress: doc.officeAddress,
    city: doc.cityState,
    zipCode: doc.zipCode,
    businessName: doc.name,
    description: doc.description,
    website: doc.website,
    image: doc.image,
    ownerName: owner?.name,
    ownerEmail: owner?.email,
  }
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
    status: 'approved',
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
