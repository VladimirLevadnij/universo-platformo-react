// Universo Platformo | Publication API Service
// Service for interacting with the publication backend API

import axios from 'axios'
import { publishARJSProject } from '../api/updlApi'
import { arjsExporter, MarkerType } from '../miniapps/arjs/ARJSExporter'

/**
 * Get available exporters for UPDL flows
 * @returns List of available exporters
 */
export async function getExporters(): Promise<ExporterInfo[]> {
    try {
        const response = await fetch('/api/v1/publish/exporters')

        if (!response.ok) {
            throw new Error(`Failed to get exporters: ${response.statusText}`)
        }

        const data = await response.json()
        return data.exporters
    } catch (error) {
        console.error('Error fetching exporters:', error)
        throw error
    }
}

/**
 * Publish a flow using the specified exporter
 * @param flowId ID of the flow to publish
 * @param exporterId ID of the exporter to use
 * @param options Publication options
 * @returns Publication result
 */
export async function publishFlow(flowId: string, exporterId: string, options: Record<string, any> = {}): Promise<PublishResult> {
    try {
        const response = await fetch('/api/v1/publish', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                flowId,
                exporterId,
                options
            })
        })

        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || `Failed to publish: ${response.statusText}`)
        }

        return await response.json()
    } catch (error) {
        console.error('Error publishing flow:', error)
        throw error
    }
}

/**
 * Get available markers for AR.js
 * @returns List of available markers
 */
export async function getARJSMarkers(): Promise<MarkerInfo[]> {
    try {
        const response = await fetch('/api/v1/publish/arjs/markers')

        if (!response.ok) {
            throw new Error(`Failed to get AR.js markers: ${response.statusText}`)
        }

        return await response.json()
    } catch (error) {
        console.error('Error fetching AR.js markers:', error)
        throw error
    }
}

/**
 * Get chatflow by ID
 * @param id - ID of the chatflow
 * @param unikId - ID of the Unik the chatflow belongs to
 */
export const getChatflow = async (id: string, unikId?: string) => {
    // Если unikId не передан, попробуем извлечь его из URL
    if (!unikId && typeof window !== 'undefined') {
        const urlIds = getCurrentUrlIds()
        if (urlIds.unikId) {
            console.log('[getChatflow] No unikId provided, using unikId from URL:', urlIds.unikId)
            unikId = urlIds.unikId
        }
    }

    if (!unikId) {
        console.error('[getChatflow] Critical error: unikId is still missing after attempt to get from URL')
        throw new Error('Unik ID is required to fetch chatflow')
    }

    // Новый endpoint с unikId
    const endpoint = `/api/v1/uniks/${unikId}/chatflows/${id}`
    console.log('[getChatflow] (FIXED) Fetching chatflow using endpoint:', endpoint, 'unikId:', unikId)
    try {
        // Используем safeRequest
        const result = await safeRequest(endpoint)
        console.log('[getChatflow] (FIXED) Successfully got chatflow:', result?.name)
        return result
    } catch (error: any) {
        console.error(`[getChatflow] (FIXED) Error fetching chatflow from ${endpoint}:`, error)
        throw error
    }
}

/**
 * Получает токен аутентификации из localStorage
 * @returns объект с заголовками для запросов, содержащими токен
 */
export const getAuthHeaders = (): Record<string, string> => {
    try {
        // Попытка получить токен из localStorage
        const token = localStorage.getItem('supabase.auth.token')
        if (!token) {
            console.log('[getAuthHeaders] No auth token found in localStorage')
            return {}
        }

        try {
            const authData = JSON.parse(token)
            const accessToken = authData?.currentSession?.access_token

            if (accessToken) {
                console.log('[getAuthHeaders] Auth token found, adding to headers')
                return {
                    Authorization: `Bearer ${accessToken}`
                }
            }
        } catch (parseError) {
            console.error('[getAuthHeaders] Failed to parse auth token:', parseError)
        }

        return {}
    } catch (error) {
        console.error('[getAuthHeaders] Error accessing localStorage:', error)
        return {}
    }
}

/**
 * Универсальная функция для безопасного выполнения запросов к API
 * Обрабатывает различные типы ошибок и варианты ответов
 */
export const safeRequest = async (url: string, options?: RequestInit) => {
    console.log(`[safeRequest] Making request to ${url}`)

    try {
        // Получаем токен авторизации из localStorage
        const authHeaders = getAuthHeaders()

        // Делаем запрос с использованием fetch API
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                ...authHeaders,
                ...(options?.headers || {})
            }
        })

        console.log(`[safeRequest] Response status:`, response.status)

        // Проверяем тип содержимого ответа
        const contentType = response.headers.get('content-type') || ''
        console.log(`[safeRequest] Content-Type:`, contentType)

        // Если статус не успешный, выбрасываем ошибку с подробностями
        if (!response.ok) {
            const errorText = await response.text()
            console.error(`[safeRequest] Error response (${response.status}):`, errorText?.substring(0, 300))

            // Попытка извлечь сообщение об ошибке из JSON ответа
            let errorMessage = `Request failed with status ${response.status}`
            try {
                if (errorText && (errorText.startsWith('{') || errorText.startsWith('['))) {
                    const errorJson = JSON.parse(errorText)
                    errorMessage = errorJson.error || errorJson.message || errorText
                } else {
                    errorMessage = errorText || errorMessage
                }
            } catch (parseError) {
                console.warn(`[safeRequest] Failed to parse error response as JSON:`, parseError)
            }

            throw new Error(errorMessage)
        }

        // Если это JSON, парсим его
        if (contentType.includes('application/json')) {
            try {
                const jsonData = await response.json()
                console.log(
                    `[safeRequest] Parsed JSON response successfully`,
                    typeof jsonData === 'object' ? `with keys: ${Object.keys(jsonData).join(', ')}` : ''
                )
                return jsonData
            } catch (parseError) {
                console.error(`[safeRequest] Error parsing JSON response:`, parseError)
                throw new Error(`Failed to parse JSON response: ${parseError}`)
            }
        }

        // Если это текст, возвращаем его
        const textData = await response.text()
        console.log(`[safeRequest] Received text response, length: ${textData.length}`)

        // Пытаемся распарсить как JSON, если это выглядит как JSON
        if (textData.trim().startsWith('{') || textData.trim().startsWith('[')) {
            try {
                const jsonFromText = JSON.parse(textData)
                console.log(
                    `[safeRequest] Successfully parsed text as JSON`,
                    typeof jsonFromText === 'object' ? `with keys: ${Object.keys(jsonFromText).join(', ')}` : ''
                )
                return jsonFromText
            } catch (jsonError) {
                console.log(`[safeRequest] Text is not valid JSON, returning as is`)
                console.log(`[safeRequest] First 200 chars of response: ${textData.substring(0, 200)}...`)
            }
        } else {
            console.log(`[safeRequest] Response is plain text, first 200 chars: ${textData.substring(0, 200)}...`)
        }

        return textData
    } catch (error) {
        console.error(`[safeRequest] Request error:`, error)
        throw error
    }
}

/**
 * Publish an AR.js flow
 * @param flowId Flow ID to publish
 * @param options Publishing options
 * @returns Publication result
 */
export const publishARJSFlow = async (flowId: string, options: any = {}) => {
    console.log('📢 [publishARJSFlow] Called with flowId:', flowId, 'options:', options)

    // Universo Platformo | Проверяем наличие unikId в options
    if (!options.unikId && typeof window !== 'undefined') {
        const urlIds = getCurrentUrlIds()
        if (urlIds.unikId) {
            console.log('📢 [publishARJSFlow] No unikId provided in options, using from URL:', urlIds.unikId)
            options.unikId = urlIds.unikId
        }
    }

    if (!options.unikId) {
        console.error('📢 [publishARJSFlow] Critical error: No unikId available in options or URL')
        return {
            success: false,
            error: 'Missing unikId, cannot publish AR.js project'
        }
    }

    try {
        // Получаем необходимые данные для публикации
        let flowData = null
        let htmlContent = null

        try {
            // Пытаемся получить данные о flow через API
            console.log('📢 [publishARJSFlow] Attempting to fetch chatflow data using unikId:', options.unikId)

            try {
                flowData = await getChatflow(flowId, options.unikId)
                console.log('📢 [publishARJSFlow] Successfully fetched flowData:', flowData?.name)
            } catch (fetchError) {
                console.warn('📢 [publishARJSFlow] Failed to fetch chatflow data via API, using direct parameters:', fetchError)

                // Создаем минимальный flowData на основе переданных параметров
                flowData = {
                    id: flowId,
                    name: options.title || 'AR.js Experience',
                    description: options.description || 'Created with Universo Platformo',
                    flowData: options.flowData || '{"nodes":[],"edges":[]}',
                    deployed: true,
                    isPublic: options.isPublic !== undefined ? options.isPublic : true,
                    updatedAt: new Date().toISOString()
                }
            }

            // Динамически импортируем экспортер и генератор HTML
            const { ARJSExporter } = await import('../miniapps/arjs/ARJSExporter')
            const { generateARJSHTMLLocally } = await import('../api/updlApi')

            // Создаем экземпляр экспортера
            const exporter = new ARJSExporter()

            // Определяем правильные настройки маркера
            let markerTypeToUse: 'pattern' | 'barcode' | 'custom' = 'pattern' // значение по умолчанию
            let markerValueToUse = options.marker || 'hiro'

            if (options.markerType === 'preset') {
                markerTypeToUse = 'pattern'
                markerValueToUse = options.marker || 'hiro'
            } else if (options.markerType === 'pattern') {
                markerTypeToUse = 'pattern'
                markerValueToUse = options.marker || ''
            } else if (options.markerType === 'barcode') {
                markerTypeToUse = 'barcode'
                markerValueToUse = options.marker || '0'
            } else if (options.markerType === 'custom') {
                markerTypeToUse = 'custom'
                markerValueToUse = options.marker || ''
            }

            // Генерируем HTML
            try {
                htmlContent = exporter.generateHTML(flowData, {
                    title: options.title || flowData.name || 'AR.js Experience',
                    markerType: markerTypeToUse,
                    markerValue: markerValueToUse
                })
                console.log('📢 [publishARJSFlow] Successfully generated HTML, length:', htmlContent.length)
            } catch (htmlError) {
                console.error('📢 [publishARJSFlow] Error generating HTML with exporter:', htmlError)

                // Пробуем создать HTML с помощью функции из updlApi
                htmlContent = generateARJSHTMLLocally(flowData, {
                    title: options.title || flowData.name,
                    markerType: options.markerType,
                    markerValue: options.marker
                })
                console.log('📢 [publishARJSFlow] Generated fallback HTML with generateARJSHTMLLocally')
            }
        } catch (processError) {
            console.error('📢 [publishARJSFlow] Error processing flow data:', processError)

            // Создаем базовый HTML с красным кубом в случае ошибки
            htmlContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>${options.title || 'AR.js Experience'}</title>
                    <script src="https://aframe.io/releases/1.6.0/aframe.min.js"></script>
                    <script src="https://raw.githack.com/AR-js-org/AR.js/master/aframe/build/aframe-ar.js"></script>
                </head>
                <body style="margin: 0; overflow: hidden;">
                    <a-scene embedded arjs>
                        <a-marker preset="hiro">
                            <a-box position="0 0.5 0" material="color: #FF0000;" scale="1 1 1"></a-box>
                        </a-marker>
                        <a-entity camera></a-entity>
                    </a-scene>
                    <!-- Fallback generated due to error while processing flow data -->
                </body>
                </html>
            `
            console.log('📢 [publishARJSFlow] Created basic fallback HTML')
        }

        // Подготавливаем данные для публикации
        const requestData = {
            sceneId: flowId,
            title: options.title || flowData?.name || 'AR.js Experience',
            html: htmlContent,
            markerType: options.markerType || 'preset',
            markerValue: options.marker || 'hiro',
            isPublic: options.isPublic !== undefined ? options.isPublic : true,
            unikId: options.unikId
        }

        console.log('📢 [publishARJSFlow] About to make API call with data:', {
            sceneId: requestData.sceneId,
            title: requestData.title,
            markerType: requestData.markerType,
            markerValue: requestData.markerValue,
            isPublic: requestData.isPublic,
            unikId: requestData.unikId,
            htmlLength: requestData.html ? requestData.html.length : 0
        })

        // Вызываем API для публикации
        try {
            const { publishARJSProject } = await import('../api/updlApi')
            const publishResult = await publishARJSProject(requestData)
            console.log('📢 [publishARJSFlow] Publish API call successful, result:', publishResult)

            return {
                success: true,
                publishId: publishResult.publishId || publishResult.id,
                id: publishResult.id || publishResult.publishId,
                publishedUrl: publishResult.publishedUrl || publishResult.url,
                url: publishResult.url || publishResult.publishedUrl,
                title: publishResult.title || options.title,
                createdAt: publishResult.createdAt || new Date().toISOString(),
                dataUrl: publishResult.dataUrl
            }
        } catch (apiError) {
            console.error('📢 [publishARJSFlow] Error calling publishARJSProject API:', apiError)

            // Создаем dataUrl для прямого открытия в браузере
            const dataUrl = `data:text/html;charset=utf-8,${encodeURIComponent(htmlContent || '')}`

            // Генерируем ID для локальной публикации
            const localId = `local-${Date.now()}-${Math.floor(Math.random() * 1000)}`

            // Возвращаем результат с dataUrl
            return {
                success: false,
                error: `API error: ${apiError instanceof Error ? apiError.message : 'Unknown API error'}`,
                publishId: localId,
                id: localId,
                publishedUrl: `#local-${localId}`,
                url: `#local-${localId}`,
                title: options.title || 'Local AR.js Preview',
                createdAt: new Date().toISOString(),
                dataUrl: dataUrl
            }
        }
    } catch (error) {
        console.error('📢 [publishARJSFlow] Error publishing AR.js flow:', error)

        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred during AR.js publication',
            publishId: `error-${Date.now()}`,
            id: `error-${Date.now()}`,
            publishedUrl: '',
            url: '',
            title: options.title || 'Error in AR.js Publication',
            createdAt: new Date().toISOString()
        }
    }
}

// Interface definitions

/**
 * Information about an exporter
 */
export interface ExporterInfo {
    id: string
    name: string
    description: string
    features: string[]
    iconUrl?: string
}

/**
 * Result of a publication operation
 */
export interface PublishResult {
    /**
     * Indicates if publishing was successful
     */
    success: boolean

    /**
     * URL where the published content can be accessed
     * Only present when success is true
     */
    publishedUrl: string

    /**
     * Error message if publishing failed
     * Only present when success is false
     */
    error?: string

    /**
     * Additional metadata about the publishing operation
     */
    metadata?: Record<string, any>

    /**
     * Original API response fields (for backward compatibility)
     */
    id: string
    url: string
    title?: string
}

/**
 * Information about an AR marker
 */
export interface MarkerInfo {
    id: string
    name: string
    description?: string
    imageUrl?: string
}

// Universo Platformo | Утилита для анализа URL и извлечения параметров

/**
 * Извлекает unikId и chatflowId из URL
 * @param url - URL для анализа
 * @returns объект с извлеченными unikId и chatflowId
 */
export const extractIdsFromUrl = (url: string) => {
    // Регулярное выражение для поиска /uniks/{unikId}/chatflows/{id}
    const pattern = /\/uniks\/([^\/]+)\/chatflows\/([^\/]+)/
    const match = url.match(pattern)

    if (match && match.length >= 3) {
        return {
            unikId: match[1],
            chatflowId: match[2]
        }
    }

    return {
        unikId: null,
        chatflowId: null
    }
}

/**
 * Проверяет текущий URL и пытается получить unikId и chatflowId из него
 * @returns объект с извлеченными unikId и chatflowId из текущего URL
 */
export const getCurrentUrlIds = () => {
    if (typeof window !== 'undefined') {
        return extractIdsFromUrl(window.location.href)
    }
    return {
        unikId: null,
        chatflowId: null
    }
}

/**
 * Преобразует URL из /chatflows/:id в /uniks/:unikId/chatflows/:id
 * если он не содержит unikId, используя переданный unikId
 * @param url - URL для проверки и корректировки
 * @param unikId - unikId для вставки, если он отсутствует
 * @returns скорректированный URL
 */
export const ensureUnikIdInUrl = (url: string, unikId: string) => {
    if (!url || !unikId) return url

    // Проверяем, содержит ли URL уже unikId
    if (url.includes(`/uniks/${unikId}/`)) {
        return url
    }

    // Корректируем URL без unikId
    const chatflowsPattern = /\/chatflows\/([^\/]+)/
    const match = url.match(chatflowsPattern)

    if (match && match.length >= 2) {
        const chatflowId = match[1]
        // Заменяем старый URL на новый с unikId
        return url.replace(`/chatflows/${chatflowId}`, `/uniks/${unikId}/chatflows/${chatflowId}`)
    }

    return url
}
