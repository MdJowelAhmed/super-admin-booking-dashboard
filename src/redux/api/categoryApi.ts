import { baseApi } from '../baseurl'
import type { Category, CategoryType } from '@/types'

export interface CategoryApiDoc {
    _id: string
    name: string
    type: string
    createdAt: string
    updatedAt: string
    __v?: number
}

export interface CategoryListResponse {
    success: boolean
    message: string
    statusCode?: number
    data: CategoryApiDoc[]
}

export interface GetCategoriesParams {
    type?: CategoryType
}

export interface CategoryPayload {
    name: string
    type: CategoryType
}

export function mapCategoryFromApi(doc: CategoryApiDoc): Category {
    const t = doc.type?.toLowerCase()
    const type: CategoryType = t === 'amenities' ? 'amenities' : 'category'
    return {
        id: doc._id,
        name: doc.name,
        type,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
    }
}

const categoryApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getCategories: builder.query<
            CategoryListResponse,
            GetCategoriesParams | undefined
        >({
            query: (params) => ({
                url: '/categories',
                method: 'GET',
                params: params?.type ? { type: params.type } : {},
            }),
            providesTags: ['Category'],
        }),

        addCategory: builder.mutation<CategoryListResponse, CategoryPayload>({
            query: (body) => ({
                url: '/categories/create',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Category'],
        }),

        updateCategory: builder.mutation<
            CategoryListResponse,
            { id: string } & CategoryPayload
        >({
            query: ({ id, ...body }) => ({
                url: `/categories/${id}`,
                method: 'PATCH',
                body,
            }),
            invalidatesTags: ['Category'],
        }),

        deleteCategory: builder.mutation<unknown, string>({
            query: (id) => ({
                url: `/categories/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Category'],
        }),
    }),
})

export const {
    useGetCategoriesQuery,
    useAddCategoryMutation,
    useUpdateCategoryMutation,
    useDeleteCategoryMutation,
} = categoryApi
