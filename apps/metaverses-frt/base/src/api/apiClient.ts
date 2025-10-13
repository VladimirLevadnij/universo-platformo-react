import { createAuthClient } from '@universo/auth-frt'

const apiClient = createAuthClient({ baseURL: '/api/v1' })

apiClient.defaults.headers.common['Content-Type'] = 'application/json'
apiClient.defaults.headers.common['x-request-from'] = 'internal'

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error?.response?.status === 401 && typeof window !== 'undefined') {
            const isAuthRoute = window.location.pathname.startsWith('/auth')
            if (!isAuthRoute) {
                window.location.href = '/auth'
            }
        }
        return Promise.reject(error)
    }
)

export default apiClient
