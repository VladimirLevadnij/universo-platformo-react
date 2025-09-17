// Universo Platformo | Analytics page for quiz lead data
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { enqueueSnackbar as enqueueSnackbarAction, closeSnackbar as closeSnackbarAction } from '@/store/actions'
import moment from 'moment'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

// material-ui
import { styled } from '@mui/material/styles'
import { tableCellClasses } from '@mui/material/TableCell'
import {
    Button,
    Box,
    Skeleton,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
    Card,
    CardContent,
    Grid,
    useTheme,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert
} from '@mui/material'

// project imports
import MainCard from '@/ui-component/cards/MainCard'
import ViewHeader from '@/layout/MainLayout/ViewHeader'
import ErrorBoundary from '@/ErrorBoundary'

// API
import leadsApi from '@/api/lead'
import chatflowsApi from '@/api/chatflows' // legacy (may be removed later)
import { spacesApi } from '@universo/spaces-frt'

// ==============================|| Internal Helpers (extracted for clarity & testability) ||============================== //
// Normalize various potential server response shapes to a spaces array
function normalizeSpacesResponse(raw) {
    if (Array.isArray(raw)) return raw
    if (raw?.data?.spaces && Array.isArray(raw.data.spaces)) return raw.data.spaces
    if (raw?.spaces && Array.isArray(raw.spaces)) return raw.spaces
    return []
}

// Resolve lead points with backward compatibility (points field preferred, fallback to numeric phone)
function resolveLeadPoints(lead) {
    if (typeof lead?.points === 'number') return lead.points
    if (lead?.phone) {
        const pts = parseInt(lead.phone, 10)
        if (!isNaN(pts)) return pts
    }
    return 0
}

// Hooks
import useApi from '@/hooks/useApi'

// utils
import useNotifier from '@/utils/useNotifier'

// Icons
import { IconChartBar, IconUsers, IconTrophy, IconCalendar } from '@tabler/icons-react'
import AnalyticsEmptySVG from '@/assets/images/leads_empty.svg'

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    borderColor: theme.palette.grey[900] + 25,
    padding: '6px 16px',

    [`&.${tableCellClasses.head}`]: {
        color: theme.palette.grey[900]
    },
    [`&.${tableCellClasses.body}`]: {
        fontSize: 14,
        height: 64
    }
}))

const StyledTableRow = styled(TableRow)(() => ({
    // hide last border
    '&:last-child td, &:last-child th': {
        border: 0
    }
}))

// ==============================|| Analytics ||============================== //

const Analytics = () => {
    const theme = useTheme()
    const customization = useSelector((state) => state.customization)
    const dispatch = useDispatch()
    const { unikId } = useParams()
    const { t } = useTranslation(['analytics'])
    useNotifier()

    const enqueueSnackbar = (...args) => dispatch(enqueueSnackbarAction(...args))
    const closeSnackbar = (...args) => dispatch(closeSnackbarAction(...args))

    const [isLoading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [leads, setLeads] = useState([])
    const [analytics, setAnalytics] = useState({
        totalLeads: 0,
        averagePoints: 0,
        maxPoints: 0,
        totalPoints: 0
    })

    // Universo Platformo | Space & Canvas selection state (replaces single chatflow selector)
    const [spaces, setSpaces] = useState([])
    const [selectedSpaceId, setSelectedSpaceId] = useState('')
    const [canvases, setCanvases] = useState([])
    const [selectedCanvasId, setSelectedCanvasId] = useState('')
    const [spacesLoading, setSpacesLoading] = useState(true)
    const [canvasesLoading, setCanvasesLoading] = useState(false)

    const getAllLeadsApi = useApi(() => leadsApi.getAllLeads(selectedCanvasId))
    const getSpacesApi = useApi(() => spacesApi.getSpaces(unikId))
    const getCanvasesApi = useApi(() => (selectedSpaceId ? spacesApi.getCanvases(unikId, selectedSpaceId) : null))

    const [search, setSearch] = useState('')
    const onSearchChange = (event) => {
        setSearch(event.target.value)
    }

    function filterLeads(data) {
        return data.name?.toLowerCase().indexOf(search.toLowerCase()) > -1 || data.email?.toLowerCase().indexOf(search.toLowerCase()) > -1
    }

    // Universo Platformo | Calculate analytics from leads data
    const calculateAnalytics = (leadsData) => {
        if (!leadsData || leadsData.length === 0) {
            return {
                totalLeads: 0,
                averagePoints: 0,
                maxPoints: 0,
                totalPoints: 0
            }
        }

        // Use points field with fallback to phone for backward compatibility
        const validLeads = leadsData.filter((lead) => 
            lead.points !== undefined || (lead.phone && !isNaN(parseInt(lead.phone)))
        )
        const points = validLeads.map((lead) => 
            lead.points !== undefined ? lead.points : (parseInt(lead.phone) || 0)
        )

        return {
            totalLeads: leadsData.length,
            averagePoints: points.length > 0 ? Math.round((points.reduce((a, b) => a + b, 0) / points.length) * 100) / 100 : 0,
            maxPoints: points.length > 0 ? Math.max(...points) : 0,
            totalPoints: points.reduce((a, b) => a + b, 0)
        }
    }

    // Universo Platformo | Handle chatflow selection
    const resetAnalyticsState = () => {
        setLoading(true)
        setLeads([])
        setAnalytics({ totalLeads: 0, averagePoints: 0, maxPoints: 0, totalPoints: 0 })
    }

    const handleSpaceChange = (event) => {
        const spaceId = event.target.value
        setSelectedSpaceId(spaceId)
        setSelectedCanvasId('')
        setCanvases([])
        resetAnalyticsState()
    }

    const handleCanvasChange = (event) => {
        const canvasId = event.target.value
        setSelectedCanvasId(canvasId)
        resetAnalyticsState()
    }

    const onConfirm = () => {
        if (selectedCanvasId) {
            getAllLeadsApi.request()
        }
    }

    const onCancel = () => {
        setLoading(false)
    }

    // Load chatflows on component mount
    // Load spaces on mount
    useEffect(() => {
        getSpacesApi.request()
    }, [])

    // Load leads when chatflow is selected
    // Load canvases whenever space changes
    useEffect(() => {
        if (selectedSpaceId) {
            setCanvasesLoading(true)
            getCanvasesApi.request()
        }
    }, [selectedSpaceId])

    // Load leads whenever canvas changes
    useEffect(() => {
        if (selectedCanvasId) {
            getAllLeadsApi.request()
        }
    }, [selectedCanvasId])

    useEffect(() => {
        if (getAllLeadsApi.data) {
            try {
                const leadsData = getAllLeadsApi.data
                setLeads(leadsData)
                setAnalytics(calculateAnalytics(leadsData))
                setLoading(false)
            } catch (error) {
                console.error('[Analytics] Error processing leads data:', error)
                setError(error)
                setLoading(false)
            }
        }
    }, [getAllLeadsApi.data])

    useEffect(() => {
        if (getAllLeadsApi.error) {
            console.error('[Analytics] Error loading leads:', getAllLeadsApi.error)
            setError(getAllLeadsApi.error)
            setLoading(false)
        }
    }, [getAllLeadsApi.error])

    // Handle chatflows loading
    // Spaces loaded
    useEffect(() => {
        if (getSpacesApi.data) {
            try {
                const raw = getSpacesApi.data
                const extracted = normalizeSpacesResponse(raw)
                setSpaces(extracted)
                setSpacesLoading(false)
                if (extracted.length > 0 && !selectedSpaceId) {
                    setSelectedSpaceId(extracted[0].id)
                }
            } catch (error) {
                console.error('[Analytics] Error processing spaces data:', error)
                setSpacesLoading(false)
            }
        }
    }, [getSpacesApi.data])

    useEffect(() => {
        if (getSpacesApi.error) {
            console.error('[Analytics] Error loading spaces:', getSpacesApi.error)
            setSpacesLoading(false)
        }
    }, [getSpacesApi.error])

    // Canvases loaded
    useEffect(() => {
        if (getCanvasesApi.data) {
            try {
                const canvasesData = getCanvasesApi.data
                setCanvases(canvasesData)
                setCanvasesLoading(false)
                if (canvasesData.length > 0 && !selectedCanvasId) {
                    setSelectedCanvasId(canvasesData[0].id)
                }
            } catch (error) {
                console.error('[Analytics] Error processing canvases data:', error)
                setCanvasesLoading(false)
            }
        }
    }, [getCanvasesApi.data])

    useEffect(() => {
        if (getCanvasesApi.error) {
            console.error('[Analytics] Error loading canvases:', getCanvasesApi.error)
            setCanvasesLoading(false)
        }
    }, [getCanvasesApi.error])

    return (
        <>
            <MainCard sx={{ p: 2 }}>
                <Stack flexDirection='column' sx={{ gap: 3 }}>
                    <ViewHeader
                        onSearchChange={onSearchChange}
                        search={search}
                        searchPlaceholder={t('searchPlaceholder')}
                        title={t('title')}
                    />

                    {/* Universo Platformo | Space & Canvas Selectors */}
                    <Box sx={{ mb: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <FormControl fullWidth>
                            <InputLabel id='space-select-label'>{t('selectSpace')}</InputLabel>
                            <Select
                                labelId='space-select-label'
                                id='space-select'
                                value={selectedSpaceId}
                                label={t('selectSpace')}
                                onChange={handleSpaceChange}
                                disabled={spacesLoading}
                            >
                                {spaces.map((space) => (
                                    <MenuItem key={space.id} value={space.id}>
                                        {space.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl fullWidth disabled={!selectedSpaceId || canvasesLoading}>
                            <InputLabel id='canvas-select-label'>{t('selectCanvas')}</InputLabel>
                            <Select
                                labelId='canvas-select-label'
                                id='canvas-select'
                                value={selectedCanvasId}
                                label={t('selectCanvas')}
                                onChange={handleCanvasChange}
                                disabled={!selectedSpaceId || canvasesLoading}
                            >
                                {canvases.map((canvas) => (
                                    <MenuItem key={canvas.id} value={canvas.id}>
                                        {canvas.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        {spaces.length === 0 && !spacesLoading && (
                            <Alert severity='info'>
                                {t('noQuizzesFound')}
                            </Alert>
                        )}
                    </Box>

                    {/* Universo Platformo | Analytics Cards */}
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6} md={3}>
                            <Card>
                                <CardContent>
                                    <Box display='flex' alignItems='center' gap={2}>
                                        <IconUsers size={40} color={theme.palette.primary.main} />
                                        <Box>
                                            <Typography variant='h4'>{analytics.totalLeads}</Typography>
                                            <Typography variant='body2' color='textSecondary'>
                                                {t('metrics.totalParticipants')}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid item xs={12} sm={6} md={3}>
                            <Card>
                                <CardContent>
                                    <Box display='flex' alignItems='center' gap={2}>
                                        <IconTrophy size={40} color={theme.palette.warning.main} />
                                        <Box>
                                            <Typography variant='h4'>{analytics.averagePoints}</Typography>
                                            <Typography variant='body2' color='textSecondary'>
                                                {t('metrics.averageScore')}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid item xs={12} sm={6} md={3}>
                            <Card>
                                <CardContent>
                                    <Box display='flex' alignItems='center' gap={2}>
                                        <IconChartBar size={40} color={theme.palette.success.main} />
                                        <Box>
                                            <Typography variant='h4'>{analytics.maxPoints}</Typography>
                                            <Typography variant='body2' color='textSecondary'>
                                                {t('metrics.maxScore')}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid item xs={12} sm={6} md={3}>
                            <Card>
                                <CardContent>
                                    <Box display='flex' alignItems='center' gap={2}>
                                        <IconCalendar size={40} color={theme.palette.info.main} />
                                        <Box>
                                            <Typography variant='h4'>{analytics.totalPoints}</Typography>
                                            <Typography variant='body2' color='textSecondary'>
                                                {t('metrics.totalPoints')}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>

                    {/* Universo Platformo | Leads Table */}
                    {!selectedCanvasId ? (
                        <Stack sx={{ alignItems: 'center', justifyContent: 'center' }} flexDirection='column'>
                            <Box sx={{ p: 2, height: 'auto' }}>
                                <img
                                    style={{ objectFit: 'cover', height: '20vh', width: 'auto' }}
                                    src={AnalyticsEmptySVG}
                                    alt='AnalyticsEmptySVG'
                                />
                            </Box>
                            <Typography variant='h6' color='textSecondary'>
                                {t('selectQuizToView')}
                            </Typography>
                        </Stack>
                    ) : isLoading ? (
                        <Box display='flex' flexDirection='column' alignItems='center'>
                            <Skeleton variant='text' />
                            <Skeleton variant='text' />
                            <Skeleton variant='text' />
                        </Box>
                    ) : (
                        <Stack sx={{ alignItems: 'center', justifyContent: 'center' }} flexDirection='column'>
                            {leads?.length <= 0 ? (
                                <Stack sx={{ alignItems: 'center', justifyContent: 'center' }} flexDirection='column'>
                                    <Box sx={{ p: 2, height: 'auto' }}>
                                        <img
                                            style={{ objectFit: 'cover', height: '20vh', width: 'auto' }}
                                            src={AnalyticsEmptySVG}
                                            alt='AnalyticsEmptySVG'
                                        />
                                    </Box>
                                    <Typography variant='h6' color='textSecondary'>
                                        {t('noDataAvailable')}
                                    </Typography>
                                </Stack>
                            ) : (
                                <TableContainer component={Paper}>
                                    <Table sx={{ minWidth: 650 }} size='small' aria-label='analytics table'>
                                        <TableHead>
                                            <TableRow>
                                                <StyledTableCell>{t('table.name')}</StyledTableCell>
                                                <StyledTableCell>{t('table.email')}</StyledTableCell>
                                                <StyledTableCell>{t('table.phone')}</StyledTableCell>
                                                <StyledTableCell>{t('table.points')}</StyledTableCell>
                                                <StyledTableCell>{t('table.completionDate')}</StyledTableCell>
                                                <StyledTableCell>{t('table.chatflowId')}</StyledTableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {leads?.filter(filterLeads)?.map((row, index) => (
                                                <StyledTableRow key={index}>
                                                    <StyledTableCell>
                                                        <Typography variant='body1'>{row.name || t('table.notSpecified')}</Typography>
                                                    </StyledTableCell>
                                                    <StyledTableCell>
                                                        <Typography variant='body1'>{row.email || t('table.notSpecified')}</Typography>
                                                    </StyledTableCell>
                                                    <StyledTableCell>
                                                        <Typography variant='body1'>
                                                            {row.phone || t('table.notSpecified')}
                                                        </Typography>
                                                    </StyledTableCell>
                                                    <StyledTableCell>
                                                        <Typography
                                                            variant='body1'
                                                            sx={{
                                                                fontWeight: 'bold',
                                                                color: theme.palette.primary.main
                                                            }}
                                                        >
                                                            {resolveLeadPoints(row)}
                                                        </Typography>
                                                    </StyledTableCell>
                                                    <StyledTableCell>
                                                        <Typography variant='body2'>
                                                            {moment(row.createdDate).format('DD.MM.YYYY HH:mm')}
                                                        </Typography>
                                                    </StyledTableCell>
                                                    <StyledTableCell>
                                                        <Typography variant='body2' sx={{ fontFamily: 'monospace' }}>
                                                            {row.chatflowid?.substring(0, 8)}...
                                                        </Typography>
                                                    </StyledTableCell>
                                                </StyledTableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}
                        </Stack>
                    )}
                </Stack>
            </MainCard>
        </>
    )
}

export default Analytics
