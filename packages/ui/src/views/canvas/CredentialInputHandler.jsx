import PropTypes from 'prop-types'
import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

// material-ui
import { IconButton } from '@mui/material'
import { IconEdit } from '@tabler/icons-react'

// project import
import { AsyncDropdown } from '@/ui-component/dropdown/AsyncDropdown'
import AddEditCredentialDialog from '@/views/credentials/AddEditCredentialDialog'
import CredentialListDialog from '@/views/credentials/CredentialListDialog'

// API
import credentialsApi from '@/api/credentials'
import { useAuth } from '@/hooks/useAuth'
import { FLOWISE_CREDENTIAL_ID } from '@/store/constant'

// ===========================|| CredentialInputHandler ||=========================== //

const CredentialInputHandler = ({ inputParam, data, onSelect, disabled = false }) => {
    const ref = useRef(null)
    const { unikId } = useParams()
    const { t } = useTranslation('canvas')
    const [credentialId, setCredentialId] = useState(data?.credential || (data?.inputs && data.inputs[FLOWISE_CREDENTIAL_ID]) || '')
    const [showCredentialListDialog, setShowCredentialListDialog] = useState(false)
    const [credentialListDialogProps, setCredentialListDialogProps] = useState({})
    const [showSpecificCredentialDialog, setShowSpecificCredentialDialog] = useState(false)
    const [specificCredentialDialogProps, setSpecificCredentialDialogProps] = useState({})
    const [reloadTimestamp, setReloadTimestamp] = useState(Date.now().toString())
    const { hasPermission } = useAuth()

    const editCredential = (credentialId) => {
        const dialogProp = {
            type: 'EDIT',
            cancelButtonName: t('canvas.common.cancel'),
            confirmButtonName: t('canvas.common.save'),
            credentialId,
            unikId
        }
        setSpecificCredentialDialogProps(dialogProp)
        setShowSpecificCredentialDialog(true)
    }

    const addAsyncOption = async () => {
        try {
            let names = ''
            if (inputParam.credentialNames.length > 1) {
                names = inputParam.credentialNames.join('&')
            } else {
                names = inputParam.credentialNames[0]
            }
            const componentCredentialsResp = await credentialsApi.getSpecificComponentCredential(names)
            if (componentCredentialsResp.data) {
                if (Array.isArray(componentCredentialsResp.data)) {
                    const dialogProp = {
                        title: t('canvas.credentials.addNew'),
                        componentsCredentials: componentCredentialsResp.data
                    }
                    setCredentialListDialogProps(dialogProp)
                    setShowCredentialListDialog(true)
                } else {
                    const dialogProp = {
                        type: 'ADD',
                        cancelButtonName: t('canvas.common.cancel'),
                        confirmButtonName: t('canvas.common.add'),
                        credentialComponent: componentCredentialsResp.data,
                        unikId
                    }
                    setSpecificCredentialDialogProps(dialogProp)
                    setShowSpecificCredentialDialog(true)
                }
            }
        } catch (error) {
            console.error(error)
        }
    }

    const onConfirmAsyncOption = (selectedCredentialId = '') => {
        setCredentialId(selectedCredentialId)
        setReloadTimestamp(Date.now().toString())
        setSpecificCredentialDialogProps({})
        setShowSpecificCredentialDialog(false)
        onSelect(selectedCredentialId)
    }

    const onCredentialSelected = (credentialComponent) => {
        setShowCredentialListDialog(false)
        const dialogProp = {
            type: 'ADD',
            cancelButtonName: t('canvas.common.cancel'),
            confirmButtonName: t('canvas.common.add'),
            credentialComponent,
            unikId
        }
        setSpecificCredentialDialogProps(dialogProp)
        setShowSpecificCredentialDialog(true)
    }

    useEffect(() => {
        setCredentialId(data?.credential || (data?.inputs && data.inputs[FLOWISE_CREDENTIAL_ID]) || '')
    }, [data])

    return (
        <div ref={ref}>
            {inputParam && (
                <>
                    {inputParam.type === 'credential' && (
                        <div key={reloadTimestamp} style={{ display: 'flex', flexDirection: 'row' }}>
                            <AsyncDropdown
                                disabled={disabled}
                                name={inputParam.name}
                                nodeData={data}
                                value={credentialId ?? t('canvas.credentials.chooseAnOption')}
                                isCreateNewOption={hasPermission('credentials:create')}
                                credentialNames={inputParam.credentialNames}
                                onSelect={(newValue) => {
                                    setCredentialId(newValue)
                                    onSelect(newValue)
                                }}
                                onCreateNew={() => addAsyncOption(inputParam.name)}
                                unikId={unikId}
                            />
                            {credentialId && hasPermission('credentials:update') && (
                                <IconButton title={t('canvas.common.edit')} color='primary' size='small' onClick={() => editCredential(credentialId)}>
                                    <IconEdit />
                                </IconButton>
                            )}
                        </div>
                    )}
                </>
            )}
            {showSpecificCredentialDialog && (
                <AddEditCredentialDialog
                    show={showSpecificCredentialDialog}
                    dialogProps={specificCredentialDialogProps}
                    onCancel={() => setShowSpecificCredentialDialog(false)}
                    onConfirm={onConfirmAsyncOption}
                ></AddEditCredentialDialog>
            )}
            {showCredentialListDialog && (
                <CredentialListDialog
                    show={showCredentialListDialog}
                    dialogProps={credentialListDialogProps}
                    onCancel={() => setShowCredentialListDialog(false)}
                    onCredentialSelected={onCredentialSelected}
                ></CredentialListDialog>
            )}
        </div>
    )
}

CredentialInputHandler.propTypes = {
    inputParam: PropTypes.object,
    data: PropTypes.object,
    onSelect: PropTypes.func,
    disabled: PropTypes.bool
}

export default CredentialInputHandler
