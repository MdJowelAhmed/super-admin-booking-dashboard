import { baseApi } from '../baseurl'

export type DashboardStatChangeType = 'increase' | 'decrease'

export interface DashboardStatMetric {
    value: number
    change: number
    changeType: DashboardStatChangeType
}

export interface DashboardStatsData {
    totalUsers: DashboardStatMetric
    totalHosts: DashboardStatMetric
    totalBusiness: DashboardStatMetric
    totalRevenue: DashboardStatMetric
}

export interface DashboardStatsResponse {
    success: boolean
    message: string
    statusCode?: number
    data: DashboardStatsData
}

export interface DashboardPlatformMonthRow {
    month: string
    users: number
    hosts: number
    businesses: number
}

export interface DashboardPlatformResponse {
    success: boolean
    message: string
    statusCode?: number
    data: DashboardPlatformMonthRow[]
}

export interface GetDashboardPlatformParams {
    year: string
}

const dashboardOverviewApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getDashboardOverviewStats: builder.query<DashboardStatsResponse, void>({
            query: () => '/dashboard/admin-stats',
            providesTags: ['Dashboard'],
        }),
        getDashboardOverviewPlatform: builder.query<
            DashboardPlatformResponse,
            GetDashboardPlatformParams
        >({
            query: ({ year }) => ({
                url: '/dashboard/admin-platform-overview',
                params: { year },
            }),
            providesTags: ['Dashboard'],
        }),
    }),
})

export const {
    useGetDashboardOverviewStatsQuery,
    useGetDashboardOverviewPlatformQuery,
} = dashboardOverviewApi
