import { baseApi } from "../baseurl";


interface LoginResponse {
    success: boolean;
    message: string;
    data?: {
        accessToken?: string;
        refreshToken?: string;
    };
}

interface LoginCredentials {
    email: string;
    password: string;
}

interface ChangePasswordPayload {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

interface ChangePasswordResponse {
    success: boolean;
    message: string;
}

interface VerifyEmailPayload {
    email: string;
    oneTimeCode: number ;
}

interface VerifyEmailResponse {
    success: boolean;
    message: string;
    data: {
        verifyToken: string;
    };
}

interface ResetPasswordPayload {
    newPassword: string;
    confirmPassword: string;
}

interface ResetPasswordResponse {
    success: boolean;
    message: string;
}

interface GetMyProfileResponse {
    success: boolean;
    message: string;
    data: {
        _id: string;
        name: string;
        email: string;
        role: string;
        profileImage?: string;
        status: string;
        isVerified: boolean;
        isPhoneVerified: boolean;
        isEmailVerified: boolean;
        isDeleted: boolean;
        authProviders: string[];
        createdAt: string;
        updatedAt: string;
        __v: number;
    };
}

interface UpdateMyProfileResponse {
    success: boolean;
    message: string;
    data: GetMyProfileResponse['data'];
}

export interface UpdateMyProfilePayload {
    name?: string;
    profileImage?: File | null;
}

const authApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        login: builder.mutation<LoginResponse, LoginCredentials>({
            query: (credentials) => ({
                url: '/auth/login',
                method: 'POST',
                body: credentials,
            }),
            invalidatesTags: ['Auth'],
        }),
        register: builder.mutation({
            query: (credentials) => ({
                url: '/auth/register',
                method: 'POST',
                body: credentials,
            }),
            invalidatesTags: ['Auth'],
        }),
        logout: builder.mutation({
            query: () => ({
                url: '/auth/logout',
                method: 'POST',
            }),
            invalidatesTags: ['Auth'],
        }),
        getCurrentUser: builder.query({
            query: () => ({
                url: '/auth/current-user',
                method: 'GET',
            }),
            providesTags: ['Auth'],
        }),
        changePassword: builder.mutation<ChangePasswordResponse, ChangePasswordPayload>({
            query: (credentials) => ({
                url: '/auth/change-password',
                method: 'POST',
                body: credentials,
            }),
            invalidatesTags: ['Auth'],
        }),
        forgotPassword: builder.mutation({
            query: (credentials) => ({
                url: '/auth/forget-password',
                method: 'POST',
                body: credentials,
            }),
            invalidatesTags: ['Auth'],
        }),
        resentOtp: builder.mutation({
            query: (credentials) => ({
                url: '/auth/resend-otp',
                method: 'POST',
                body: credentials,
            }),
            invalidatesTags: ['Auth'],
        }),
        verifyEmail: builder.mutation<VerifyEmailResponse, VerifyEmailPayload>({
            query: (credentials) => ({
                url: '/auth/verify-otp',
                method: 'POST',
                body: credentials,
            }),
            async onQueryStarted(_arg, { queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled;
                    const token = data?.data?.verifyToken;
                    // Safely store verifyToken into localStorage for reset-password
                    if (token) {
                        try {
                            if (typeof localStorage !== 'undefined') {
                                localStorage.setItem('verifyToken', token);
                            }
                        } catch {
                            // ignore storage errors
                        }
                    }
                } catch {
                    // ignore errors; normal RTK Query error handling will apply
                }
            },
            invalidatesTags: ['Auth'],
        }),
        resetPassword: builder.mutation<ResetPasswordResponse, ResetPasswordPayload>({
            query: (credentials) => {
                // Read verifyToken that was returned from verify-email
                let verifyToken: string | null = null;
                try {
                    verifyToken = typeof localStorage !== 'undefined'
                        ? localStorage.getItem('verifyToken')
                        : null;
                } catch {
                    verifyToken = null;
                }

                const headers: Record<string, string> = {};
                if (verifyToken) {
                    // Backend expects verifyToken in headers during reset
                    // Send both forms for compatibility.
                    headers.Token = verifyToken;
                    headers.Authorization = `Bearer ${verifyToken}`;
                }

                return {
                    url: '/auth/reset-password',
                    method: 'POST',
                    body: credentials,
                    headers,
                };
            },
            invalidatesTags: ['Auth'],
        }),

        getMyProfile: builder.query<GetMyProfileResponse, void>({
            query: () => ({
                url: '/users/profile',
                method: 'GET',
            }),
            providesTags: ['Auth'],
        }),

        updateMyProfile: builder.mutation<UpdateMyProfileResponse, UpdateMyProfilePayload>({
            query: ({ name, profileImage }) => {
                const formData = new FormData();

                if (name) {
                    formData.append('name', name);
                }

                if (profileImage) {
                    formData.append('profileImage', profileImage);
                }

                return {
                    url: '/users/profile',
                    method: 'PATCH',
                    body: formData,
                };
            },
            invalidatesTags: ['Auth'],
        }),


    }),

})

export const {
    useLoginMutation,
    useRegisterMutation,
    useLogoutMutation,
    useGetCurrentUserQuery,
    useChangePasswordMutation,
    useForgotPasswordMutation,
    useVerifyEmailMutation,
    useResetPasswordMutation,
    useResentOtpMutation,
    useGetMyProfileQuery,
    useUpdateMyProfileMutation,
 } =
    authApi