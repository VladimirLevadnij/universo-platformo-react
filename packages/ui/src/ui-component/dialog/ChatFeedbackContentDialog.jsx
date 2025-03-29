import { useCallback, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'

// material-ui
import { Button, Dialog, DialogContent, DialogTitle, DialogActions, Box, OutlinedInput } from '@mui/material'
import { useState } from 'react'

// Project import
import { StyledButton } from '@/ui-component/button/StyledButton'

// store
import { HIDE_CANVAS_DIALOG, SHOW_CANVAS_DIALOG } from '@/store/actions'

const ChatFeedbackContentDialog = ({ show, onCancel, onConfirm }) => {
    const portalElement = document.getElementById('portal')
    const dispatch = useDispatch()
    const { t } = useTranslation()

    const [feedbackContent, setFeedbackContent] = useState('')

    const onChange = useCallback((e) => setFeedbackContent(e.target.value), [setFeedbackContent])

    const onSave = () => {
        onConfirm(feedbackContent)
    }

    useEffect(() => {
        if (show) dispatch({ type: SHOW_CANVAS_DIALOG })
        else dispatch({ type: HIDE_CANVAS_DIALOG })
        return () => {
            dispatch({ type: HIDE_CANVAS_DIALOG })
            setFeedbackContent('')
        }
    }, [show, dispatch])

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
                {t('dialog.chatFeedback.provideFeedback')}
            </DialogTitle>
            <DialogContent>
                <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <OutlinedInput
                        // eslint-disable-next-line
                        autoFocus
                        id='feedbackContentInput'
                        multiline={true}
                        name='feedbackContentInput'
                        onChange={onChange}
                        placeholder={t('dialog.chatFeedback.feedbackPlaceholder')}
                        rows={4}
                        value={feedbackContent}
                        sx={{ width: '100%' }}
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onCancel}>{t('common.cancel')}</Button>
                <StyledButton variant='contained' onClick={onSave}>
                    {t('dialog.chatFeedback.submitFeedback')}
                </StyledButton>
            </DialogActions>
        </Dialog>
    ) : null

    return createPortal(component, portalElement)
}

export default ChatFeedbackContentDialog
