import { useDispatch } from 'react-redux'
import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { enqueueSnackbar as enqueueSnackbarAction, closeSnackbar as closeSnackbarAction, SET_CANVAS } from '@flowise/store'
import { useTranslation } from '@universo/i18n'

// material-ui
import { Typography, Box, Button, FormControl, ListItem, ListItemAvatar, ListItemText, MenuItem, Select } from '@mui/material'
import { IconX } from '@tabler/icons-react'

// Project import
import CredentialInputHandler from '../dialogs/CredentialInputHandler'
import { TooltipWithParser } from '../tooltip/TooltipWithParser'
import { SwitchInput } from '../switch/Switch'
import { Input } from '../input/Input'
import { StyledButton } from '../button/StyledButton'
import { Dropdown } from '../dropdown/Dropdown'
import openAISVG from '../../assets/images/openai.svg'
import assemblyAIPng from '../../assets/images/assemblyai.png'
import localAiPng from '../../assets/images/localai.png'
import azureSvg from '../../assets/images/azure_openai.svg'
import groqPng from '../../assets/images/groq.png'

// store
import useNotifier from '@flowise/template-mui/hooks/useNotifier'

// API
import { api } from '@universo/api-client'
import resolveCanvasContext from '../utils/resolveCanvasContext'

// If implementing a new provider, this must be updated in
// components/src/speechToText.ts as well
const SpeechToTextType = {
    OPENAI_WHISPER: 'openAIWhisper',
    ASSEMBLYAI_TRANSCRIBE: 'assemblyAiTranscribe',
    LOCALAI_STT: 'localAISTT',
    AZURE_COGNITIVE: 'azureCognitive',
    GROQ_WHISPER: 'groqWhisper'
}

// Weird quirk - the key must match the name property value.
const getSpeechToTextProviders = (t) => ({
    [SpeechToTextType.OPENAI_WHISPER]: {
        label: t('speechToText.providers.openai'),
        name: SpeechToTextType.OPENAI_WHISPER,
        icon: openAISVG,
        url: 'https://platform.openai.com/docs/guides/speech-to-text',
        inputs: [
            {
                label: t('speechToText.labels.credential'),
                name: 'credential',
                type: 'credential',
                credentialNames: ['openAIApi']
            },
            {
                label: t('speechToText.labels.language'),
                name: 'language',
                type: 'string',
                description: t('speechToText.labels.languageDescription'),
                placeholder: 'en',
                optional: true
            },
            {
                label: t('speechToText.labels.prompt'),
                name: 'prompt',
                type: 'string',
                rows: 4,
                description: t('speechToText.labels.promptDescription'),
                optional: true
            },
            {
                label: t('speechToText.labels.temperature'),
                name: 'temperature',
                type: 'number',
                step: 0.1,
                description: t('speechToText.labels.temperatureDescription'),
                optional: true
            }
        ]
    },
    [SpeechToTextType.ASSEMBLYAI_TRANSCRIBE]: {
        label: t('speechToText.providers.assemblyai'),
        name: SpeechToTextType.ASSEMBLYAI_TRANSCRIBE,
        icon: assemblyAIPng,
        url: 'https://www.assemblyai.com/',
        inputs: [
            {
                label: t('speechToText.labels.credential'),
                name: 'credential',
                type: 'credential',
                credentialNames: ['assemblyAIApi']
            }
        ]
    },
    [SpeechToTextType.LOCALAI_STT]: {
        label: t('speechToText.providers.localai'),
        name: SpeechToTextType.LOCALAI_STT,
        icon: localAiPng,
        url: 'https://localai.io/features/audio-to-text/',
        inputs: [
            {
                label: t('speechToText.labels.credential'),
                name: 'credential',
                type: 'credential',
                credentialNames: ['localAIApi']
            },
            {
                label: t('speechToText.labels.baseUrl'),
                name: 'baseUrl',
                type: 'string',
                description: t('speechToText.labels.baseUrlDescription')
            },
            {
                label: t('speechToText.labels.language'),
                name: 'language',
                type: 'string',
                description: t('speechToText.labels.languageDescription'),
                placeholder: 'en',
                optional: true
            },
            {
                label: t('speechToText.labels.model'),
                name: 'model',
                type: 'string',
                description: t('speechToText.labels.modelDescription'),
                placeholder: 'whisper-1',
                optional: true
            },
            {
                label: t('speechToText.labels.prompt'),
                name: 'prompt',
                type: 'string',
                rows: 4,
                description: t('speechToText.labels.promptDescription'),
                optional: true
            },
            {
                label: t('speechToText.labels.temperature'),
                name: 'temperature',
                type: 'number',
                step: 0.1,
                description: t('speechToText.labels.temperatureDescription'),
                optional: true
            }
        ]
    },
    [SpeechToTextType.AZURE_COGNITIVE]: {
        label: t('speechToText.providers.azure'),
        name: SpeechToTextType.AZURE_COGNITIVE,
        icon: azureSvg,
        url: 'https://azure.microsoft.com/en-us/products/cognitive-services/speech-services',
        inputs: [
            {
                label: t('speechToText.labels.credential'),
                name: 'credential',
                type: 'credential',
                credentialNames: ['azureCognitiveServices']
            },
            {
                label: t('speechToText.labels.language'),
                name: 'language',
                type: 'string',
                description: t('speechToText.labels.azureLanguageDescription'),
                placeholder: 'en-US',
                optional: true
            },
            {
                label: t('speechToText.labels.profanityFilter'),
                name: 'profanityFilterMode',
                type: 'options',
                description: t('speechToText.labels.profanityFilterDescription'),
                options: [
                    {
                        label: t('speechToText.labels.profanityOptions.none'),
                        name: 'None'
                    },
                    {
                        label: t('speechToText.labels.profanityOptions.masked'),
                        name: 'Masked'
                    },
                    {
                        label: t('speechToText.labels.profanityOptions.removed'),
                        name: 'Removed'
                    }
                ],
                default: 'Masked',
                optional: true
            },
            {
                label: t('speechToText.labels.audioChannels'),
                name: 'channels',
                type: 'string',
                description: t('speechToText.labels.audioChannelsDescription'),
                placeholder: '0,1',
                default: '0,1'
            }
        ]
    },
    [SpeechToTextType.GROQ_WHISPER]: {
        label: t('speechToText.providers.groq'),
        name: SpeechToTextType.GROQ_WHISPER,
        icon: groqPng,
        url: 'https://console.groq.com/',
        inputs: [
            {
                label: t('speechToText.labels.model'),
                name: 'model',
                type: 'string',
                description: t('speechToText.labels.modelDescription'),
                placeholder: 'whisper-large-v3',
                optional: true
            },
            {
                label: t('speechToText.labels.credential'),
                name: 'credential',
                type: 'credential',
                credentialNames: ['groqApi']
            },
            {
                label: t('speechToText.labels.language'),
                name: 'language',
                type: 'string',
                description: t('speechToText.labels.languageDescription'),
                placeholder: 'en',
                optional: true
            },
            {
                label: t('speechToText.labels.temperature'),
                name: 'temperature',
                type: 'number',
                step: 0.1,
                description: t('speechToText.labels.temperatureDescription'),
                optional: true
            }
        ]
    }
})

const SpeechToText = ({ dialogProps }) => {
    const { t } = useTranslation()
    const speechToTextProviders = getSpeechToTextProviders(t)
    const dispatch = useDispatch()

    const { canvas, canvasId, spaceId, unikId } = resolveCanvasContext(dialogProps, { requireCanvasId: false })

    useNotifier()

    const enqueueSnackbar = (...args) => dispatch(enqueueSnackbarAction(...args))
    const closeSnackbar = (...args) => dispatch(closeSnackbarAction(...args))

    const [speechToText, setSpeechToText] = useState({})
    const [chatbotConfig, setChatbotConfig] = useState({})
    const [selectedProvider, setSelectedProvider] = useState('none')

    const onSave = async () => {
        if (!canvasId || !unikId) {
            enqueueSnackbar({
                message: t('speechToText.missingCanvas'),
                options: {
                    key: new Date().getTime() + Math.random(),
                    variant: 'error'
                }
            })
            return
        }
        const updatedSpeechToText = selectedProvider !== 'none' ? setValue(true, selectedProvider, 'status') : speechToText
        try {
            const nextConfig = { ...chatbotConfig, speechToText: updatedSpeechToText }
            const saveResp = await api.canvases.updateCanvas(
                unikId,
                canvasId,
                {
                    chatbotConfig: JSON.stringify(nextConfig)
                },
                { spaceId }
            )
            if (saveResp.data) {
                enqueueSnackbar({
                    message: t('speechToText.configSaved'),
                    options: {
                        key: new Date().getTime() + Math.random(),
                        variant: 'success',
                        action: (key) => (
                            <Button style={{ color: 'white' }} onClick={() => closeSnackbar(key)}>
                                <IconX />
                            </Button>
                        )
                    }
                })
                dispatch({ type: SET_CANVAS, canvas: saveResp.data })
                setChatbotConfig(nextConfig)
            }
        } catch (error) {
            const errorMessage = typeof error?.response?.data === 'object' ? error?.response?.data?.message : error?.response?.data
            enqueueSnackbar({
                message: `${t('speechToText.failedToSave')}: ${errorMessage}`,
                options: {
                    key: new Date().getTime() + Math.random(),
                    variant: 'error',
                    persist: true,
                    action: (key) => (
                        <Button style={{ color: 'white' }} onClick={() => closeSnackbar(key)}>
                            <IconX />
                        </Button>
                    )
                }
            })
        }
    }

    const setValue = (value, providerName, inputParamName) => {
        let newVal = {}
        if (!Object.prototype.hasOwnProperty.call(speechToText, providerName)) {
            newVal = { ...speechToText, [providerName]: {} }
        } else {
            newVal = { ...speechToText }
        }

        newVal[providerName][inputParamName] = value
        if (inputParamName === 'status' && value === true) {
            // ensure that the others are turned off
            Object.keys(speechToTextProviders).forEach((key) => {
                const provider = speechToTextProviders[key]
                if (provider.name !== providerName) {
                    newVal[provider.name] = { ...speechToText[provider.name], status: false }
                }
            })
            if (providerName !== 'none' && newVal['none']) {
                newVal['none'].status = false
            }
        }
        setSpeechToText(newVal)
        return newVal
    }

    const handleProviderChange = (event) => {
        setSelectedProvider(event.target.value)
    }

    useEffect(() => {
        if (canvas) {
            try {
                let config = {}
                if (canvas.chatbotConfig) {
                    config = JSON.parse(canvas.chatbotConfig) || {}
                }
                if (!config.speechToText && canvas.speechToText) {
                    config.speechToText = JSON.parse(canvas.speechToText)
                }
                setChatbotConfig(config)

                if (config.speechToText) {
                    const nextSpeechToText = config.speechToText
                    let provider = 'none'
                    Object.keys(speechToTextProviders).forEach((key) => {
                        const providerConfig = nextSpeechToText[key]
                        if (providerConfig && providerConfig.status) {
                            provider = key
                        }
                    })
                    setSelectedProvider(provider)
                    setSpeechToText(nextSpeechToText)
                } else {
                    setSelectedProvider('none')
                    setSpeechToText({})
                }
            } catch (e) {
                setChatbotConfig({})
                setSpeechToText({})
                setSelectedProvider('none')
                console.error(e)
            }
        }

        return () => {
            setSpeechToText({})
            setSelectedProvider('none')
        }
    }, [canvas, speechToTextProviders])

    return (
        <>
            <Box fullWidth sx={{ mb: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography>{t('speechToText.providersTitle')}</Typography>
                <FormControl fullWidth>
                    <Select size='small' value={selectedProvider} onChange={handleProviderChange}>
                        <MenuItem value='none'>{t('speechToText.labels.none')}</MenuItem>
                        {Object.values(speechToTextProviders).map((provider) => (
                            <MenuItem key={provider.name} value={provider.name}>
                                {provider.label}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>
            {selectedProvider !== 'none' && (
                <>
                    <ListItem sx={{ mt: 3 }} alignItems='center'>
                        <ListItemAvatar>
                            <div
                                style={{
                                    width: 50,
                                    height: 50,
                                    borderRadius: '50%',
                                    backgroundColor: 'white'
                                }}
                            >
                                <img
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        padding: 10,
                                        objectFit: 'contain'
                                    }}
                                    alt='AI'
                                    src={speechToTextProviders[selectedProvider].icon}
                                />
                            </div>
                        </ListItemAvatar>
                        <ListItemText
                            sx={{ ml: 1 }}
                            primary={speechToTextProviders[selectedProvider].label}
                            secondary={
                                <a target='_blank' rel='noreferrer' href={speechToTextProviders[selectedProvider].url}>
                                    {speechToTextProviders[selectedProvider].url}
                                </a>
                            }
                        />
                    </ListItem>
                    {speechToTextProviders[selectedProvider].inputs.map((inputParam, index) => (
                        <Box key={index} sx={{ p: 2 }}>
                            <div style={{ display: 'flex', flexDirection: 'row' }}>
                                <Typography>
                                    {inputParam.label}
                                    {!inputParam.optional && <span style={{ color: 'red' }}>&nbsp;*</span>}
                                    {inputParam.description && (
                                        <TooltipWithParser style={{ marginLeft: 10 }} title={inputParam.description} />
                                    )}
                                </Typography>
                            </div>
                            {inputParam.type === 'credential' && (
                                <CredentialInputHandler
                                    key={speechToText[selectedProvider]?.credentialId}
                                    data={
                                        speechToText[selectedProvider]?.credentialId
                                            ? { credential: speechToText[selectedProvider].credentialId }
                                            : {}
                                    }
                                    inputParam={inputParam}
                                    onSelect={(newValue) => setValue(newValue, selectedProvider, 'credentialId')}
                                />
                            )}
                            {inputParam.type === 'boolean' && (
                                <SwitchInput
                                    onChange={(newValue) => setValue(newValue, selectedProvider, inputParam.name)}
                                    value={
                                        speechToText[selectedProvider]
                                            ? speechToText[selectedProvider][inputParam.name]
                                            : inputParam.default ?? false
                                    }
                                />
                            )}
                            {(inputParam.type === 'string' || inputParam.type === 'password' || inputParam.type === 'number') && (
                                <Input
                                    inputParam={inputParam}
                                    onChange={(newValue) => setValue(newValue, selectedProvider, inputParam.name)}
                                    value={
                                        speechToText[selectedProvider]
                                            ? speechToText[selectedProvider][inputParam.name]
                                            : inputParam.default ?? ''
                                    }
                                />
                            )}

                            {inputParam.type === 'options' && (
                                <Dropdown
                                    name={inputParam.name}
                                    options={inputParam.options}
                                    onSelect={(newValue) => setValue(newValue, selectedProvider, inputParam.name)}
                                    value={
                                        speechToText[selectedProvider]
                                            ? speechToText[selectedProvider][inputParam.name]
                                            : inputParam.default ?? 'choose an option'
                                    }
                                />
                            )}
                        </Box>
                    ))}
                </>
            )}
            <StyledButton
                style={{ marginBottom: 10, marginTop: 10 }}
                disabled={selectedProvider !== 'none' && !speechToText[selectedProvider]?.credentialId}
                variant='contained'
                onClick={onSave}
            >
                {t('common.save')}
            </StyledButton>
        </>
    )
}

SpeechToText.propTypes = {
    dialogProps: PropTypes.object
}

export default SpeechToText
