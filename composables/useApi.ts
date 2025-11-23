import { useI18n } from 'vue-i18n'

export const useApi = () => {
    const config = useRuntimeConfig()
    const { locale } = useI18n()

    const getHeaders = (): Record<string, string> => {
        return {
            'Accept': 'application/json',
            'Accept-Language': locale.value,
            'company': 'conseil'
        }
    }

    const get = async <T>(endpoint: string) => {
        const response = await fetch(`${config.public.apiBaseUrl}${endpoint}`, {
            headers: getHeaders()
        })
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }
        return response.json() as Promise<T>
    }

    const post = async <T>(endpoint: string, data: FormData | object) => {
        const headers = getHeaders()
        if (!(data instanceof FormData)) {
            headers['Content-Type'] = 'application/json'
        }

        const response = await fetch(`${config.public.apiBaseUrl}${endpoint}`, {
            method: 'POST',
            headers,
            body: data instanceof FormData ? data : JSON.stringify(data)
        })

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }
        return response.json() as Promise<T>
    }

    const put = async <T>(endpoint: string, data: FormData | object) => {
        const headers = getHeaders()
        if (!(data instanceof FormData)) {
            headers['Content-Type'] = 'application/json'
        }

        const response = await fetch(`${config.public.apiBaseUrl}${endpoint}`, {
            method: 'PUT',
            headers,
            body: data instanceof FormData ? data : JSON.stringify(data)
        })

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }
        return response.json() as Promise<T>
    }

    const remove = async (endpoint: string) => {
        const response = await fetch(`${config.public.apiBaseUrl}${endpoint}`, {
            method: 'DELETE',
            headers: getHeaders()
        })

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }
        return response.json()
    }

    return {
        get,
        post,
        put,
        remove,
        getHeaders
    }
}