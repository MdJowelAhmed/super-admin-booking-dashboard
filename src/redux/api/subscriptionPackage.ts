import { baseApi } from '../baseurl'

export type PaymentType = 'Monthly' | 'Quarterly' | 'Half-Yearly' | 'Yearly'

export interface PackageFeatureApi {
    name?: string
    description: string
    limit: number | null
    isUnlimited: boolean
}

export interface SubscriptionPackageApiDoc {
    _id: string
    title: string
    description: string
    price: number
    priceId?: string
    productId?: string
    duration: string
    paymentType: PaymentType | string
    features: PackageFeatureApi[]
    subscriptionType?: string
    status?: string
    isDeleted?: boolean
    createdAt: string
    updatedAt: string
}

export interface SubscriptionPackageListResponse {
    success: boolean
    message: string
    statusCode?: number
    data: SubscriptionPackageApiDoc[]
    meta?: {
        page: number
        limit: number
        total: number
        totalPage: number
    }
}

export interface GetSubscriptionPackagesParams {
    page?: number
    limit?: number
}

export interface SubscriptionPackagePayload {
    title: string
    description: string
    price: number
    duration: string
    paymentType: PaymentType
    features: Array<{
        description: string
        limit: number | null
        isUnlimited: boolean
        name?: string
    }>
}

const subscriptionPackageApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getSubscriptionPackages: builder.query<
            SubscriptionPackageListResponse,
            GetSubscriptionPackagesParams | void
        >({
            query: (params) => ({
                url: '/packages',
                method: 'GET',
                params: params ? { page: params.page, limit: params.limit } : {},
            }),
            providesTags: ['SubscriptionPackage'],
        }),

        addSubscriptionPackage: builder.mutation<unknown, SubscriptionPackagePayload>({
            query: (body) => ({
                url: '/packages/create',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['SubscriptionPackage'],
        }),

        updateSubscriptionPackage: builder.mutation<
            unknown,
            { id: string } & SubscriptionPackagePayload
        >({
            query: ({ id, ...body }) => ({
                url: `/packages/update/${id}`,
                method: 'PATCH',
                body,
            }),
            invalidatesTags: ['SubscriptionPackage'],
        }),

        deleteSubscriptionPackage: builder.mutation<unknown, string>({
            query: (id) => ({
                url: `/packages/delete/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['SubscriptionPackage'],
        }),
    }),
})

export const {
    useGetSubscriptionPackagesQuery,
    useAddSubscriptionPackageMutation,
    useUpdateSubscriptionPackageMutation,
    useDeleteSubscriptionPackageMutation,
} = subscriptionPackageApi
