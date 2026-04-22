import { baseApi } from '../baseurl'
import { imageUrl } from '@/components/common/imageUrl'
import type { User, UserRole, UserStatus } from '@/types'

/** Values for `?role=` on GET /user-managements */
export type ApiUserRoleFilter = 'HOST' | 'USER' | 'SERVICE'

export interface UserOnlineStatus {
    isOnline: boolean
    lastSeen: string
    lastHeartbeat: string
}

export interface UserLocation {
    type: string
    coordinates: number[]
    _id?: string
}

export interface UserManagementDoc {
    _id: string
    name: string
    role: string
    email: string
    phone?: string
    countryCode?: string
    image?: string
    status: string
    isVerified?: boolean
    isDeleted?: boolean
    stripeCustomerId?: string
    createdAt: string
    updatedAt: string
    onlineStatus?: UserOnlineStatus
    location?: UserLocation
}

export interface UserListResponse {
    success: boolean
    message: string
    statusCode?: number
    data: UserManagementDoc[]
    meta: {
        page: number
        limit: number
        total: number
        totalPage: number
    }
}

export interface GetUsersParams {
    page: number
    limit: number
    /** When omitted or `all`, role query param is not sent */
    role?: ApiUserRoleFilter | 'all'
}

export interface UpdateUserStatusBody {
    status: 'active' | 'blocked'
}

export interface UserManagementSingleResponse {
    success: boolean
    message?: string
    statusCode?: number
    data: UserManagementDoc
}

export function mapUserManagementDocToUser(doc: UserManagementDoc): User {
    const raw = (doc.name ?? '').trim()
    const parts = raw.split(/\s+/).filter(Boolean)
    const firstName = parts[0] ?? '—'
    const lastName = parts.slice(1).join(' ')

    const phoneDisplay =
        [doc.countryCode, doc.phone].filter(Boolean).join(' ').trim() ||
        doc.phone ||
        '—'

    const st = doc.status?.toLowerCase()
    const status: UserStatus =
        st === 'blocked'
            ? 'blocked'
            : st === 'pending'
              ? 'pending'
              : st === 'inactive'
                ? 'inactive'
                : 'active'

    const coords = doc.location?.coordinates
    const locationSummary =
        coords && coords.length >= 2
            ? `${coords[1]}, ${coords[0]}`
            : undefined

    return {
        id: doc._id,
        firstName,
        lastName,
        email: doc.email,
        phone: phoneDisplay,
        avatar: doc.image?.trim() ? imageUrl(doc.image) : undefined,
        role: doc.role as UserRole,
        status,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
        countryCode: doc.countryCode,
        isOnline: doc.onlineStatus?.isOnline,
        lastSeen: doc.onlineStatus?.lastSeen,
        rawName: raw,
        locationSummary,
        isVerified: doc.isVerified,
        stripeCustomerId: doc.stripeCustomerId,
    }
}

const userApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getUsers: builder.query<UserListResponse, GetUsersParams>({
            query: ({ page, limit, role }) => ({
                url: '/user-managements',
                method: 'GET',
                params: {
                    page,
                    limit,
                    ...(role && role !== 'all' ? { role } : {}),
                },
            }),
            providesTags: ['User'],
        }),

        getUserManagement: builder.query<UserManagementSingleResponse, string>({
            query: (id) => ({
                url: `/user-managements/${id}`,
                method: 'GET',
            }),
            providesTags: (_r, _e, id) => [{ type: 'User', id }],
        }),

        updateUserStatus: builder.mutation<
            unknown,
            { id: string; body: UpdateUserStatusBody }
        >({
            query: ({ id, body }) => ({
                url: `/user-managements/status/${id}`,
                method: 'PATCH',
                body,
            }),
            invalidatesTags: ['User'],
        }),
    }),
})

export const {
    useGetUsersQuery,
    useGetUserManagementQuery,
    useUpdateUserStatusMutation,
} = userApi
