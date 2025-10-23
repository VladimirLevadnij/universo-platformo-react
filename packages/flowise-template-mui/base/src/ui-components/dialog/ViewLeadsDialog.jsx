import { createPortal } from 'react-dom'
import { useDispatch } from 'react-redux'
import { useState, useEffect, forwardRef } from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'
import { useTranslation } from '@universo/i18n/hooks'

// material-ui
import {
    Button,
    ListItemButton,
    Dialog,
    DialogContent,
    DialogTitle,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Stack,
    Box,
    OutlinedInput
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { IconFileExport, IconSearch } from '@tabler/icons-react'
import leadsEmptySVG from '../../assets/images/leads_empty.svg'

// store
import { HIDE_CANVAS_DIALOG, SHOW_CANVAS_DIALOG } from '@flowise/store'

// API
import useApi from '../../hooks/useApi.js'
import { api } from '@universo/api-client'
const leadsApi = api.leads
import resolveCanvasContext from '../utils/resolveCanvasContext'

// CSS stub: chatmessage/ChatMessage.css
import 'react-datepicker/dist/react-datepicker.css'

const DatePickerCustomInput = forwardRef(function DatePickerCustomInput({ value, onClick }, ref) {
    return (
        <ListItemButton style={{ borderRadius: 15, border: '1px solid #e0e0e0' }} onClick={onClick} ref={ref}>
            {value}
        </ListItemButton>
    )
})

DatePickerCustomInput.propTypes = {
    value: PropTypes.string,
    onClick: PropTypes.func
}

const ViewLeadsDialog = ({ show, dialogProps, onCancel }) => {
    const { canvas, canvasId } = resolveCanvasContext(dialogProps, { requireCanvasId: false })
    const portalElement = document.getElementById('portal')
    const dispatch = useDispatch()
    const theme = useTheme()
    const { t } = useTranslation()

    const [leads, setLeads] = useState([])
    const [search, setSearch] = useState('')
    const getLeadsApi = useApi(leadsApi.getCanvasLeads)

    const onSearchChange = (event) => {
        setSearch(event.target.value)
    }

    function filterLeads(data) {
        return (
            data.name.toLowerCase().indexOf(search.toLowerCase()) > -1 ||
            (data.email && data.email.toLowerCase().indexOf(search.toLowerCase()) > -1) ||
            (data.phone && data.phone.toLowerCase().indexOf(search.toLowerCase()) > -1)
        )
    }

    const exportMessages = async () => {
        const exportData = {
            leads
        }
        const dataStr = JSON.stringify(exportData, null, 2)
        //const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr)
        const blob = new Blob([dataStr], { type: 'application/json' })
        const dataUri = URL.createObjectURL(blob)

        const exportFileDefaultName = `${canvasId || 'canvas'}-leads.json`

        let linkElement = document.createElement('a')
        linkElement.setAttribute('href', dataUri)
        linkElement.setAttribute('download', exportFileDefaultName)
        linkElement.click()
    }

    useEffect(() => {
        if (getLeadsApi.data) {
            setLeads(getLeadsApi.data)
        }
    }, [getLeadsApi.data])

    useEffect(() => {
        if (canvasId) {
            getLeadsApi.request(canvasId)
        }

        return () => {
            setLeads([])
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [canvasId])

    useEffect(() => {
        if (show) dispatch({ type: SHOW_CANVAS_DIALOG })
        else dispatch({ type: HIDE_CANVAS_DIALOG })
        return () => dispatch({ type: HIDE_CANVAS_DIALOG })
    }, [show, dispatch])

    const component = show ? (
        <Dialog
            onClose={onCancel}
            open={show}
            fullWidth
            maxWidth={leads && leads.length == 0 ? 'md' : 'lg'}
            aria-labelledby='alert-dialog-title'
            aria-describedby='alert-dialog-description'
        >
            <DialogTitle sx={{ fontSize: '1rem' }} id='alert-dialog-title'>
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                    {dialogProps.title}
                    <OutlinedInput
                        size='small'
                        sx={{
                            ml: 3,
                            width: '280px',
                            height: '100%',
                            display: { xs: 'none', sm: 'flex' },
                            borderRadius: 2,
                            '& .MuiOutlinedInput-notchedOutline': {
                                borderRadius: 2
                            }
                        }}
                        variant='outlined'
                        placeholder={t('dialog.viewLeads.searchPlaceholder')}
                        onChange={onSearchChange}
                        startAdornment={
                            <Box
                                sx={{
                                    color: theme.palette.grey[400],
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    mr: 1
                                }}
                            >
                                <IconSearch style={{ color: 'inherit', width: 16, height: 16 }} />
                            </Box>
                        }
                        type='search'
                    />
                    <div style={{ flex: 1 }} />
                    {leads && leads.length > 0 && (
                        <Button variant='outlined' onClick={() => exportMessages()} startIcon={<IconFileExport />}>
                            {t('dialog.viewLeads.export')}
                        </Button>
                    )}
                </div>
            </DialogTitle>
            <DialogContent>
                {leads && leads.length == 0 && (
                    <Stack sx={{ alignItems: 'center', justifyContent: 'center', width: '100%' }} flexDirection='column'>
                        <Box sx={{ p: 5, height: 'auto' }}>
                            <img style={{ objectFit: 'cover', height: '20vh', width: 'auto' }} src={leadsEmptySVG} alt='msgEmptySVG' />
                        </Box>
                        <div>{t('dialog.viewLeads.noLeads')}</div>
                    </Stack>
                )}
                {leads && leads.length > 0 && (
                    <TableContainer component={Paper}>
                        <Table sx={{ minWidth: 650 }} aria-label='simple table'>
                            <TableHead>
                                <TableRow>
                                    <TableCell>{t('dialog.viewLeads.name')}</TableCell>
                                    <TableCell>{t('dialog.viewLeads.email')}</TableCell>
                                    <TableCell>{t('dialog.viewLeads.phone')}</TableCell>
                                    <TableCell>{t('dialog.viewLeads.createdDate')}</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {leads.filter(filterLeads).map((lead, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{lead.name}</TableCell>
                                        <TableCell>{lead.email}</TableCell>
                                        <TableCell>{lead.phone}</TableCell>
                                        <TableCell>{moment(lead.createdDate).format('MMMM Do, YYYY')}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </DialogContent>
        </Dialog>
    ) : null

    return createPortal(component, portalElement)
}

ViewLeadsDialog.propTypes = {
    show: PropTypes.bool,
    dialogProps: PropTypes.object,
    onCancel: PropTypes.func
}

export default ViewLeadsDialog
