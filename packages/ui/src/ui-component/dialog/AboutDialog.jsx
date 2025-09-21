import { createPortal } from 'react-dom'
import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { Dialog, DialogContent, DialogTitle, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Paper } from '@mui/material'
import moment from 'moment'
import axios from 'axios'
import { baseURL } from '@/store/constant'
import { useAuth } from '@/utils/authProvider'
import { useTranslation } from 'react-i18next'

const AboutDialog = ({ show, onCancel }) => {
    const portalElement = document.getElementById('portal')
    const { t } = useTranslation()
    const { client } = useAuth()

    const [data, setData] = useState({})

    useEffect(() => {
        if (show) {
            const latestReleaseReq = axios.get('https://api.github.com/repos/FlowiseAI/Flowise/releases/latest')
            const currentVersionReq = client.get('version')

            Promise.all([latestReleaseReq, currentVersionReq])
                .then(([latestReleaseData, currentVersionData]) => {
                    const finalData = {
                        ...latestReleaseData.data,
                        currentVersion: currentVersionData.data.version
                    }
                    setData(finalData)
                })
                .catch((error) => {
                    console.error('Error fetching data:', error)
                })
        }

    }, [show, client])

    const component = show ? (
        <Dialog
            onClose={onCancel}
            open={show}
            fullWidth
            maxWidth='sm'
            aria-labelledby='alert-dialog-title'
            aria-describedby='alert-dialog-description'
        >
            <DialogTitle sx={{ fontSize: '1rem' }} id='alert-dialog-title'>
                {t('dialog.about.title')}
            </DialogTitle>
            <DialogContent>
                {data && (
                    <TableContainer component={Paper}>
                        <Table aria-label='simple table'>
                            <TableHead>
                                <TableRow>
                                    <TableCell>{t('dialog.about.currentVersion')}</TableCell>
                                    <TableCell>{t('dialog.about.latestVersion')}</TableCell>
                                    <TableCell>{t('dialog.about.publishedAt')}</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                    <TableCell component='th' scope='row'>
                                        {data.currentVersion}
                                    </TableCell>
                                    <TableCell component='th' scope='row'>
                                        <a target='_blank' rel='noreferrer' href={data.html_url}>
                                            {data.name}
                                        </a>
                                    </TableCell>
                                    <TableCell>{moment(data.published_at).fromNow()}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </DialogContent>
        </Dialog>
    ) : null

    return createPortal(component, portalElement)
}

AboutDialog.propTypes = {
    show: PropTypes.bool,
    onCancel: PropTypes.func
}

export default AboutDialog
