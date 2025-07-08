// Universo Platformo | AR.js Publisher
// React component for publishing AR.js experiences using streaming mode

import React, { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { getCurrentUrlIds, ARJSPublishApi, ChatflowsApi } from '../../api'

// Universo Platformo | Simple demo mode toggle - set to true to enable demo features
const DEMO_MODE = false

// MUI components
import {
    Box,
    Typography,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Switch,
    FormControlLabel,
    Card,
    CardContent,
    CircularProgress,
    Alert,
    Snackbar,
    FormHelperText,
    Grid
} from '@mui/material'

// Icons
import { IconCopy, IconDownload, IconQrcode } from '@tabler/icons-react'

// Import common components
import GenerationModeSelect from '../../components/GenerationModeSelect'
// CRITICAL: This component is responsible for displaying the publication link
import PublicationLink from '../../components/PublicationLink'
import TemplateSelect from '../../components/TemplateSelect'

// QR Code component (optional dependency)
let QRCode
try {
    QRCode = require('qrcode.react')
} catch (e) {
    // QRCode component will be undefined if package not available
}

/**
 * AR.js Publisher Component
 * Supports streaming generation of AR.js content
 */
const ARJSPublisher = ({ flow, unikId, onPublish, onCancel, initialConfig }) => {
    const { t } = useTranslation('publish')
    // Universo Platformo | reference to latest flow.id
    const flowIdRef = useRef(flow?.id)
    useEffect(() => {
        flowIdRef.current = flow?.id
    }, [flow?.id])

    // CRITICAL DEBUG: Diagnose flow.id undefined issue
    useEffect(() => {
        console.log('🔍 [ARJSPublisher] FLOW DEBUG:', {
            flowExists: !!flow,
            flowId: flow?.id,
            flowKeys: flow ? Object.keys(flow) : 'no flow',
            flowValue: flow,
            flowType: typeof flow
        })
    }, [flow])

    // State for project title
    const [projectTitle, setProjectTitle] = useState(flow?.name || '')
    // State for marker type
    const [markerType, setMarkerType] = useState('preset')
    // State for marker value
    const [markerValue, setMarkerValue] = useState('hiro')
    // State for loading indicator
    const [loading, setLoading] = useState(false)
    // State for published URL
    const [publishedUrl, setPublishedUrl] = useState('')
    // State for publishing status
    const [isPublishing, setIsPublishing] = useState(false)
    // State for public toggle
    const [isPublic, setIsPublic] = useState(false)
    // State for error message
    const [error, setError] = useState(null)
    // State for snackbar
    const [snackbar, setSnackbar] = useState({ open: false, message: '' })
    // State for generation mode
    const [generationMode, setGenerationMode] = useState('streaming') // Only streaming generation
    // Universo Platformo | State for template type in demo mode
    const [templateType, setTemplateType] = useState('quiz')
    // Universo Platformo | State for settings loading
    const [settingsLoading, setSettingsLoading] = useState(true)

    // Universo Platformo | NEW: State for library configuration
    const [arjsVersion, setArjsVersion] = useState('3.4.7')
    const [arjsSource, setArjsSource] = useState('official')
    const [aframeVersion, setAframeVersion] = useState('1.7.1')
    const [aframeSource, setAframeSource] = useState('official')

    // Universo Platformo | Function to save current settings
    const saveCurrentSettings = async () => {
        // Universo Platformo | always save with the latest flow.id
        const currentFlowId = flowIdRef.current
        if (!currentFlowId || DEMO_MODE || settingsLoading) {
            return
        }

        try {
            await ChatflowsApi.saveSettings(currentFlowId, {
                isPublic: isPublic,
                projectTitle: projectTitle,
                markerType: markerType,
                markerValue: markerValue,
                templateId: templateType,
                generationMode: generationMode,
                templateType: templateType,
                // NEW: Include library configuration
                libraryConfig: {
                    arjs: { version: arjsVersion, source: arjsSource },
                    aframe: { version: aframeVersion, source: aframeSource }
                }
            })
            console.log('ARJSPublisher: Settings auto-saved') // Simple console.log instead of debugLog
        } catch (error) {
            console.error('📱 [ARJSPublisher] Error auto-saving settings:', error)
            // Don't show error to user for auto-save to avoid interrupting UX
        }
    }

    // Universo Platformo | Auto-save settings when parameters change
    useEffect(() => {
        if (!settingsLoading) {
            const debounceTimeout = setTimeout(() => {
                saveCurrentSettings()
            }, 1000) // Debounce to avoid too frequent saves

            return () => clearTimeout(debounceTimeout)
        }
    }, [
        projectTitle,
        markerType,
        markerValue,
        generationMode,
        arjsVersion,
        arjsSource,
        aframeVersion,
        aframeSource,
        settingsLoading,
        flow?.id
    ]) // Universo Platformo | re-run when flow changes

    // Universo Platformo | Load saved settings when component mounts
    useEffect(() => {
        const loadSavedSettings = async () => {
            if (!flow?.id || DEMO_MODE) {
                setSettingsLoading(false)
                return
            }

            try {
                setSettingsLoading(true)
                console.log('ARJSPublisher: Loading saved settings for flow', flow.id) // Simple console.log

                const savedSettings = await ChatflowsApi.loadSettings(flow.id)

                if (savedSettings) {
                    console.log('ARJSPublisher: Restored settings', savedSettings) // Simple console.log
                    setIsPublic(savedSettings.isPublic || false)
                    setProjectTitle(savedSettings.projectTitle || flow?.name || '')
                    setMarkerType(savedSettings.markerType || 'preset')
                    setMarkerValue(savedSettings.markerValue || 'hiro')
                    setGenerationMode(savedSettings.generationMode || 'streaming')
                    setTemplateType(savedSettings.templateType || 'quiz')

                    // NEW: Load library configuration
                    if (savedSettings.libraryConfig) {
                        setArjsVersion(savedSettings.libraryConfig.arjs?.version || '3.4.7')
                        setArjsSource(savedSettings.libraryConfig.arjs?.source || 'official')
                        setAframeVersion(savedSettings.libraryConfig.aframe?.version || '1.7.1')
                        setAframeSource(savedSettings.libraryConfig.aframe?.source || 'official')
                    }

                    // If settings indicate it's public, generate URL
                    if (savedSettings.isPublic && savedSettings.generationMode === 'streaming') {
                        // For streaming mode, generate URL immediately since content is generated on-demand
                        const fullPublicUrl = `${window.location.origin}/p/${flow.id}`
                        setPublishedUrl(fullPublicUrl)
                    }
                } else {
                    console.log('ARJSPublisher: No saved settings found, using defaults') // Simple console.log
                }
            } catch (error) {
                console.error('📱 [ARJSPublisher] Error loading settings:', error)
                setError('Failed to load saved settings')
            } finally {
                setSettingsLoading(false)
            }
        }

        loadSavedSettings()
    }, [flow?.id])

    // Initialize with flow data when component mounts
    useEffect(() => {
        if (flow && !settingsLoading) {
            setProjectTitle((prev) => prev || flow.name || 'AR.js Experience')
        }
    }, [flow, settingsLoading])

    /**
     * Handle marker type change
     */
    const handleMarkerTypeChange = (event) => {
        setMarkerType(event.target.value)
    }

    /**
     * Handle marker value change
     */
    const handleMarkerValueChange = (event) => {
        setMarkerValue(event.target.value)
    }

    /**
     * Handle template type change (for demo mode)
     */
    const handleTemplateTypeChange = (templateId) => {
        setTemplateType(templateId)
    }

    /**
     * NEW: Handle AR.js version change
     */
    const handleArjsVersionChange = (event) => {
        setArjsVersion(event.target.value)
    }

    /**
     * NEW: Handle AR.js source change
     */
    const handleArjsSourceChange = (event) => {
        setArjsSource(event.target.value)
    }

    /**
     * NEW: Handle A-Frame version change
     */
    const handleAframeVersionChange = (event) => {
        setAframeVersion(event.target.value)
    }

    /**
     * NEW: Handle A-Frame source change
     */
    const handleAframeSourceChange = (event) => {
        setAframeSource(event.target.value)
    }

    /**
     * Handle public/private toggle and publication process
     */
    const handlePublicChange = async (value) => {
        // CRITICAL: Check for flow.id before proceeding
        if (!flow?.id) {
            console.error('🚨 [ARJSPublisher] Cannot proceed: flow.id is undefined', { flow })
            setError('Ошибка: идентификатор потока не найден. Пожалуйста, сохраните поток и попробуйте снова.')
            setIsPublic(false)
            return
        }

        setIsPublic(value)

        // If public toggle is off, reset the URL and save settings
        if (!value) {
            setPublishedUrl('')

            // Universo Platformo | Save settings with isPublic: false
            if (!DEMO_MODE && flow?.id) {
                try {
                    await ChatflowsApi.saveSettings(flow.id, {
                        isPublic: false,
                        projectTitle: projectTitle,
                        markerType: markerType,
                        markerValue: markerValue,
                        templateId: templateType,
                        generationMode: generationMode,
                        templateType: templateType,
                        // NEW: Include library configuration
                        libraryConfig: {
                            arjs: { version: arjsVersion, source: arjsSource },
                            aframe: { version: aframeVersion, source: aframeSource }
                        }
                    })
                    console.log('ARJSPublisher: Settings saved with isPublic: false') // Simple console.log instead of debugLog
                } catch (error) {
                    console.error('📱 [ARJSPublisher] Error saving settings:', error)
                    setError('Failed to save settings')
                }
            }
            return
        }

        // Universo Platformo | Special handling for demo mode
        if (DEMO_MODE) {
            setLoading(true)
            // Simulate request delay in demo mode
            setTimeout(() => {
                setPublishedUrl('https://plano.universo.pro/') // Demo URL for demo mode
                setSnackbar({ open: true, message: t('success.published') })
                setLoading(false)
            }, 1000)
            return
        }

        // Only streaming mode is supported
        if (generationMode !== 'streaming') {
            setError('Unsupported generation mode: ' + generationMode)
            return
        }

        console.log('ARJSPublisher.handlePublicChange: Publishing in STREAMING mode for flow', flow.id) // Simple console.log instead of debugLog

        setIsPublishing(true)
        setError(null)

        try {
            // Universo Platformo | First save AR.js settings with isPublic: true
            await ChatflowsApi.saveSettings(flow.id, {
                isPublic: true,
                projectTitle: projectTitle,
                markerType: markerType,
                markerValue: markerValue,
                templateId: templateType,
                generationMode: generationMode,
                templateType: templateType,
                // NEW: Include library configuration
                libraryConfig: {
                    arjs: { version: arjsVersion, source: arjsSource },
                    aframe: { version: aframeVersion, source: aframeSource }
                }
            })
            console.log('ARJSPublisher: Settings saved with isPublic: true') // Simple console.log instead of debugLog

            // Use API client for AR.js publication
            // Additional safety check before API call
            if (!flow.id) {
                throw new Error('Идентификатор потока отсутствует')
            }

            const publishResult = await ARJSPublishApi.publishARJS({
                chatflowId: flow.id,
                generationMode: 'streaming',
                isPublic: true,
                projectName: projectTitle,
                flowData: {
                    flowId: flow.id,
                    projectTitle: projectTitle,
                    markerType: markerType,
                    markerValue: markerValue,
                    templateId: templateType,
                    // NEW: Include library configuration
                    libraryConfig: {
                        arjs: { version: arjsVersion, source: arjsSource },
                        aframe: { version: aframeVersion, source: aframeSource }
                    }
                }
            })

            // Validate publicationId before forming URL
            if (!publishResult?.publicationId) {
                throw new Error('Не получен идентификатор публикации от сервера')
            }

            // Form local link with consideration for demo mode
            const fullPublicUrl = DEMO_MODE ? 'https://plano.universo.pro/' : `${window.location.origin}/p/${publishResult.publicationId}`
            setPublishedUrl(fullPublicUrl)
            setSnackbar({ open: true, message: t('success.published') })

            if (onPublish) {
                onPublish({ ...publishResult, publishedUrl: fullPublicUrl })
            }
        } catch (error) {
            console.error('📱 [ARJSPublisher.handlePublicChange] Error during publication:', error)
            setError(error instanceof Error ? error.message : 'Unknown error occurred during publication')
            setIsPublic(false) // Reset toggle in case of error
        } finally {
            setIsPublishing(false)
        }
    }

    /**
     * Handle copy URL button click
     */
    const handleCopyUrl = (url) => {
        navigator.clipboard
            .writeText(url)
            .then(() => {
                setSnackbar({ open: true, message: t('success.copied') })
            })
            .catch((error) => {
                console.error('Failed to copy:', error)
            })
    }

    /**
     * Get marker image URL
     */
    const getMarkerImage = () => {
        // Currently only standard markers are supported
        if (markerType === 'preset') {
            return `https://raw.githubusercontent.com/AR-js-org/AR.js/master/data/images/${markerValue}.png`
        }
        return ''
    }

    /**
     * Handle snackbar close
     */
    const handleSnackbarClose = () => {
        setSnackbar({
            ...snackbar,
            open: false
        })
    }

    const handleError = (message, errorObj) => {
        console.error(message, errorObj)
        setError(errorObj instanceof Error ? errorObj.message : String(errorObj || message))
    }

    // Main interface content
    return (
        <Box sx={{ width: '100%' }}>
            <Typography variant='h4' gutterBottom>
                {t('technologies.arjs')}
            </Typography>
            <Typography variant='body2' color='text.secondary' paragraph>
                {t('technologies.arjsDescription')}
            </Typography>

            {/* Main Content - Scrollable Page */}
            <Card variant='outlined' sx={{ mb: 3 }}>
                <CardContent>
                    <Box sx={{ position: 'relative' }}>
                        {/* Universo Platformo | Settings loading indicator */}
                        {settingsLoading && (
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    minHeight: '200px',
                                    flexDirection: 'column',
                                    gap: 2
                                }}
                            >
                                <CircularProgress />
                                <Typography variant='body2' color='text.secondary'>
                                    Загрузка сохраненных настроек...
                                </Typography>
                            </Box>
                        )}

                        {/* Main interface - shown only when settings are loaded */}
                        {!settingsLoading && (
                            <>
                                {loading && (
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            right: 0,
                                            bottom: 0,
                                            backgroundColor: 'rgba(255, 255, 255, 0.7)',
                                            zIndex: 10
                                        }}
                                    >
                                        <CircularProgress />
                                    </Box>
                                )}

                                {/* Project Title Input */}
                                <TextField
                                    label={t('project.title')}
                                    value={projectTitle}
                                    onChange={(e) => setProjectTitle(e.target.value)}
                                    fullWidth
                                    margin='normal'
                                    variant='outlined'
                                />

                                {/* Generation Mode Selector */}
                                <GenerationModeSelect
                                    value={generationMode}
                                    onChange={setGenerationMode}
                                    disabled={!!publishedUrl}
                                    technology='arjs'
                                />

                                {/* Template Selection */}
                                <TemplateSelect
                                    selectedTemplate={templateType}
                                    onTemplateChange={setTemplateType}
                                    disabled={!!publishedUrl}
                                    technology='arjs'
                                />

                                {/* Type of Marker */}
                                <FormControl fullWidth variant='outlined' margin='normal'>
                                    <InputLabel>{t('marker.type')}</InputLabel>
                                    <Select
                                        value={markerType}
                                        onChange={handleMarkerTypeChange}
                                        label={t('marker.type')}
                                        disabled={!!publishedUrl}
                                    >
                                        <MenuItem value='preset'>{t('marker.standard')}</MenuItem>
                                    </Select>
                                </FormControl>

                                {/* Marker Selection */}
                                {markerType === 'preset' && (
                                    <FormControl fullWidth variant='outlined' margin='normal'>
                                        <InputLabel>{t('marker.presetLabel')}</InputLabel>
                                        <Select
                                            value={markerValue}
                                            onChange={handleMarkerValueChange}
                                            label={t('marker.presetLabel')}
                                            disabled={!!publishedUrl}
                                        >
                                            <MenuItem value='hiro'>{t('marker.hiro')}</MenuItem>
                                        </Select>
                                    </FormControl>
                                )}

                                {/* NEW: Library Configuration Section */}
                                <Box sx={{ mt: 3, mb: 2 }}>
                                    <Typography variant='subtitle2' gutterBottom>
                                        Настройки библиотек
                                    </Typography>

                                    {/* AR.js Configuration */}
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant='body2' color='text.secondary' gutterBottom>
                                            AR.js
                                        </Typography>
                                        <Grid container spacing={2}>
                                            <Grid item xs={6}>
                                                <FormControl fullWidth size='small'>
                                                    <InputLabel>Версия</InputLabel>
                                                    <Select
                                                        value={arjsVersion}
                                                        onChange={handleArjsVersionChange}
                                                        label='Версия'
                                                        disabled={!!publishedUrl}
                                                    >
                                                        <MenuItem value='3.4.7'>3.4.7</MenuItem>
                                                    </Select>
                                                </FormControl>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <FormControl fullWidth size='small'>
                                                    <InputLabel>Сервер</InputLabel>
                                                    <Select
                                                        value={arjsSource}
                                                        onChange={handleArjsSourceChange}
                                                        label='Сервер'
                                                        disabled={!!publishedUrl}
                                                    >
                                                        <MenuItem value='official'>Официальный сервер</MenuItem>
                                                        <MenuItem value='kiberplano'>Сервер Kiberplano</MenuItem>
                                                    </Select>
                                                </FormControl>
                                            </Grid>
                                        </Grid>
                                    </Box>

                                    {/* A-Frame Configuration */}
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant='body2' color='text.secondary' gutterBottom>
                                            A-Frame
                                        </Typography>
                                        <Grid container spacing={2}>
                                            <Grid item xs={6}>
                                                <FormControl fullWidth size='small'>
                                                    <InputLabel>Версия</InputLabel>
                                                    <Select
                                                        value={aframeVersion}
                                                        onChange={handleAframeVersionChange}
                                                        label='Версия'
                                                        disabled={!!publishedUrl}
                                                    >
                                                        <MenuItem value='1.7.1'>1.7.1</MenuItem>
                                                    </Select>
                                                </FormControl>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <FormControl fullWidth size='small'>
                                                    <InputLabel>Сервер</InputLabel>
                                                    <Select
                                                        value={aframeSource}
                                                        onChange={handleAframeSourceChange}
                                                        label='Сервер'
                                                        disabled={!!publishedUrl}
                                                    >
                                                        <MenuItem value='official'>Официальный сервер</MenuItem>
                                                        <MenuItem value='kiberplano'>Сервер Kiberplano</MenuItem>
                                                    </Select>
                                                </FormControl>
                                            </Grid>
                                        </Grid>
                                    </Box>
                                </Box>

                                {/* Marker Preview */}
                                <Box sx={{ textAlign: 'center', my: 2 }}>
                                    <Typography variant='body2' color='text.secondary' gutterBottom>
                                        {t('preview.title')}
                                    </Typography>
                                    {markerType === 'preset' && markerValue && (
                                        <Box
                                            component='img'
                                            src={getMarkerImage()}
                                            alt={t('marker.alt')}
                                            sx={{ maxWidth: '200px', border: '1px solid #eee' }}
                                        />
                                    )}
                                    <Typography variant='caption' display='block' sx={{ mt: 1 }}>
                                        {t('marker.instruction')}
                                    </Typography>
                                </Box>

                                {/* Universo Platformo | Make Public Toggle with loading indicator */}
                                <Box sx={{ my: 3, width: '100%' }}>
                                    <FormControl fullWidth variant='outlined'>
                                        <FormControlLabel
                                            control={
                                                <Box
                                                    sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        width: '100%',
                                                        justifyContent: 'space-between'
                                                    }}
                                                >
                                                    <Switch
                                                        checked={isPublic}
                                                        onChange={(e) => handlePublicChange(e.target.checked)}
                                                        disabled={!!isPublishing}
                                                        color='primary'
                                                    />
                                                    {isPublishing && <CircularProgress size={20} sx={{ ml: 2 }} />}
                                                </Box>
                                            }
                                            label={t('configuration.makePublic')}
                                            sx={{
                                                width: '100%',
                                                margin: 0,
                                                '& .MuiFormControlLabel-label': {
                                                    width: '100%',
                                                    flexGrow: 1
                                                }
                                            }}
                                            labelPlacement='start'
                                        />
                                    </FormControl>
                                    <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
                                        {t('configuration.description')}
                                    </Typography>
                                </Box>

                                {/* Public link display */}
                                {publishedUrl && (
                                    <Box sx={{ my: 3 }}>
                                        <Typography variant='subtitle1' gutterBottom>
                                            {t('arjs.publishedUrl')}:
                                        </Typography>
                                        <PublicationLink url={publishedUrl} onCopy={handleCopyUrl} />

                                        {/* Universo Platformo | QR Code if available */}
                                        {QRCode && (
                                            <Box sx={{ textAlign: 'center', my: 2 }}>
                                                <Typography variant='body2' gutterBottom>
                                                    Сканируйте QR-код для доступа с мобильного устройства:
                                                </Typography>
                                                <Box sx={{ display: 'inline-block', p: 1, bgcolor: 'white', borderRadius: 1 }}>
                                                    <QRCode value={publishedUrl} size={180} />
                                                </Box>
                                            </Box>
                                        )}

                                        <Box sx={{ mt: 3 }}>
                                            <Typography variant='body2' gutterBottom>
                                                Инструкция по использованию:
                                            </Typography>
                                            <Box sx={{ textAlign: 'left', pl: 2 }}>
                                                <Typography variant='body2' component='div'>
                                                    <ol>
                                                        <li>Откройте URL на устройстве с камерой</li>
                                                        <li>Разрешите доступ к камере</li>
                                                        <li>
                                                            Наведите камеру на маркер {markerType === 'preset' ? `"${markerValue}"` : ''}
                                                        </li>
                                                        <li>Дождитесь появления 3D объекта</li>
                                                    </ol>
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Box>
                                )}

                                {/* Error display */}
                                {error && (
                                    <Alert severity='error' sx={{ my: 2 }}>
                                        {error}
                                    </Alert>
                                )}
                            </>
                        )}
                    </Box>
                </CardContent>
            </Card>

            {/* Snackbar for notifications */}
            <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleSnackbarClose} message={snackbar.message} />
        </Box>
    )
}

export { ARJSPublisher }
export default ARJSPublisher
