import { baseApi } from '../baseurl'

export interface SubscriptionUserRef {
    _id: string
    name: string
    email: string
    role?: string
}

export interface SubscriptionPackageRef {
    _id: string
    title: string
    description?: string
    paymentType?: string
}

export type SubscriptionApiStatus = 'active' | 'canceled' | 'cancelled' | 'expired' | string

export interface SubscriptionDoc {
    _id: string
    price: number
    userId?: SubscriptionUserRef
    package?: SubscriptionPackageRef
    trxId?: string
    status: SubscriptionApiStatus
    currentPeriodStart?: string
    currentPeriodEnd?: string
    createdAt: string
    updatedAt: string
}

export interface SubscriptionListMeta {
    page: number
    limit: number
    total: number
    totalPages: number
}

export interface SubscriptionListResponse {
    success: boolean
    message: string
    statusCode?: number
    data: {
        data: SubscriptionDoc[]
        meta: SubscriptionListMeta
    }
}

export interface GetSubscriptionUsersParams {
    page: number
    limit: number
}

const subscriptionUserApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getSubscriptionUsers: builder.query<
            SubscriptionListResponse,
            GetSubscriptionUsersParams
        >({
            query: ({ page, limit }) => ({
                url: '/subscriptions',
                method: 'GET',
                params: {
                    page,
                    limit,
                },
            }),
            providesTags: ['Subscription'],
        }),

    }),
})

export const {
    useGetSubscriptionUsersQuery,
} = subscriptionUserApi
