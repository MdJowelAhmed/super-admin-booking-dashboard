import { baseApi } from '../baseurl'
import { imageUrl } from '@/components/common/imageUrl'
import type { AppSliderItem } from '@/types/appSlider'

/** Raw banner document from GET /banners */
export interface Banner {
    _id: string
    name: string
    type: string
    buttonText?: string
    image?: string
    createdAt: string
    updatedAt: string
}

export interface AppSliderListResponse {
    success: boolean
    message: string
    statusCode?: number
    data: Banner[]
    meta: {
        page: number
        limit: number
        total: number
        totalPage: number
    }
}

export interface GetBannersParams {
    page?: number
    limit?: number
}

/** JSON string field `data` for multipart banner create/update */
export interface BannerDataPayload {
    name: string
    buttonText: string
    /** Backend expects values like "Host" | "Business" */
    type: string
}

export function buildBannerFormData(
    data: BannerDataPayload,
    imageFile?: File | null
): FormData {
    const formData = new FormData()
    formData.append('data', JSON.stringify(data))
    if (imageFile) {
        formData.append('image', imageFile)
    }
    return formData
}

export function apiTypeFromTarget(target: 'host' | 'business'): string {
    return target === 'host' ? 'Host' : 'Business'
}

export function mapBannerToSliderRow(
    banner: Banner,
    index: number,
    page: number,
    limit: number
): AppSliderItem {
    const displayIndex = (page - 1) * limit + index + 1
    const rawPath = banner.image?.trim() ?? ''
    return {
        id: banner._id,
        displaySerial: `#${displayIndex}`,
        imageUrl: rawPath ? imageUrl(rawPath) : '',
        createdAt: banner.createdAt,
        updatedAt: banner.updatedAt,
        userEmail: '',
        name: banner.name,
        buttonLabel: banner.buttonText?.trim() ? banner.buttonText : '—',
        targetType:
            banner.type?.toLowerCase() === 'host' ? 'host' : 'business',
    }
}

const controllerApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getControllers: builder.query<ControllerListResponse, GetControllersParams | void>({
            query: (params) => {
                const search = new URLSearchParams()
                if (params?.page != null) search.set('page', String(params.page))
                if (params?.limit != null) search.set('limit', String(params.limit))
                const q = search.toString()
                return {
                    url: q ? `/banners?${q}` : '/banners',
                    method: 'GET',
                }
            },
            providesTags: ['Controller'],
        }),

        addController: builder.mutation<unknown, FormData>({
            query: (formData) => ({
                url: '/banners/',
                method: 'POST',
                body: formData,
            }),
            invalidatesTags: ['Controller'],
        }),

        updateController: builder.mutation<
            unknown,
            { id: string; formData: FormData }
        >({
            query: ({ id, formData }) => ({
                url: `/banners/${id}`,
                method: 'PATCH',
                body: formData,
            }),
            invalidatesTags: ['Controller'],
        }),

        deleteController: builder.mutation<unknown, string>({
            query: (id) => ({
                url: `/banners/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Controller'],
        }),
    }),
})

export const {
    useGetAppSliderQuery,
    useAddAppSliderMutation,
    useUpdateAppSliderMutation,
    useDeleteAppSliderMutation,
} = controllerApi
