import { baseApi } from '../baseurl'

/** Query param sent to list endpoint; HOST = Host tab, SERVICE = Business tab */
export type ApiBusinessRoleType = 'HOST' | 'SERVICE'

export interface BusinessRequestOwner {
    _id: string
    name: string
    email: string
    image?: string
    isVerified?: boolean
}

export interface BusinessRequestDoc {
    _id: string
    ownerId: BusinessRequestOwner | string
    name: string
    location: string
    cityState: string
    zipCode: string
    description: string
    phoneNumber: string
    officeAddress: string
    email: string
    website: string
    image?: string
    roleType: string
    status: string
    createdAt: string
    updatedAt: string
}

export interface BusinessRequestsListResponse {
    success: boolean
    message: string
    statusCode?: number
    data: BusinessRequestDoc[]
    meta: {
        page: number
        limit: number
        total: number
        totalPage: number
    }
}

export interface GetBusinessRequestsParams {
    page: number
    limit: number
    roleType: ApiBusinessRoleType
}

export interface UpdateBusinessRequestStatusBody {
    status: 'approved' | 'rejected'
}

const controllerApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getBusinessRequests: builder.query<
            BusinessRequestsListResponse,
            GetBusinessRequestsParams
        >({
            query: ({ page, limit, roleType }) => ({
                url: '/business/requests',
                method: 'GET',
                params: { page, limit, roleType },
            }),
            providesTags: ['Controller'],
        }),

        updateBusinessRequestStatus: builder.mutation<
            unknown,
            { id: string; body: UpdateBusinessRequestStatusBody }
        >({
            query: ({ id, body }) => ({
                url: `/business/update-status/${id}`,
                method: 'PATCH',
                body,
            }),
            invalidatesTags: ['Controller'],
        }),
    }),
})

export const {
    useGetBusinessRequestsQuery,
    useUpdateBusinessRequestStatusMutation,
} = controllerApi
