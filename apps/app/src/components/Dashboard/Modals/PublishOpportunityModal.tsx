import { ProfileFragment as Profile } from '@lens-protocol/client'
import { useStorageUpload } from '@thirdweb-dev/react'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { v4 } from 'uuid'

import GradientModal from '@/components/Shared/Modal/GradientModal'
import { FileInput } from '@/components/UI/FileInput'
import { Form } from '@/components/UI/Form'
import { Input } from '@/components/UI/Input'
import { Spinner } from '@/components/UI/Spinner'
import { TextArea } from '@/components/UI/TextArea'
import { checkAuth, useCreatePost } from '@/lib/lens-protocol'
import {
  buildMetadata,
  OpportunityMetadataRecord,
  PostTags
} from '@/lib/metadata'
import { MetadataVersion } from '@/lib/types'
import validImageExtension from '@/lib/validImageExtension'

import Error from './Error'

export interface IPublishOpportunityFormProps {
  name: string
  startDate: string
  endDate: string
  hoursPerWeek: string
  category: string
  website: string
  description: string
  imageUrl: string
  applicationRequired: boolean
}

export const emptyPublishFormData: IPublishOpportunityFormProps = {
  name: '',
  startDate: '',
  endDate: '',
  hoursPerWeek: '',
  category: '',
  website: '',
  description: '',
  imageUrl: '',
  applicationRequired: false
}

interface IPublishOpportunityModalProps {
  open: boolean
  onClose: (shouldRefetch: boolean) => void
  publisher: Profile | null
}

const PublishOpportunityModal: React.FC<IPublishOpportunityModalProps> = ({
  open,
  onClose,
  publisher
}) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'components.dashboard.modals.publish-opportunity'
  })
  const { t: e } = useTranslation('common', { keyPrefix: 'errors' })

  const { createPost } = useCreatePost()

  const { mutateAsync: upload } = useStorageUpload()

  const [endDateDisabled, setEndDateDisabled] = useState<boolean>(true)
  const [isPending, setIsPending] = useState<boolean>(false)
  const [error, setError] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [image, setImage] = useState<File | null>(null)
  const [isChecked, setIsChecked] = useState(false)
  const form = useForm<IPublishOpportunityFormProps>()

  const {
    handleSubmit,
    reset,
    resetField,
    register,
    clearErrors,
    watch,
    formState: { errors }
  } = form

  const currentFormData = watch()

  const validUrl = (url: string) => {
    try {
      new URL(url)
      return true
    } catch (e) {
      return false
    }
  }

  const handleCheckboxChange = () => {
    setIsChecked(!isChecked)
  }

  const onCancel = () => {
    clearErrors()
    reset()
    setError(false)
    setErrorMessage('')
    onClose(false)
  }

  const onSubmit = async (formData: IPublishOpportunityFormProps) => {
    setError(false)
    setIsPending(true)

    if (!publisher) {
      setErrorMessage(e('profile-null'))
      setError(true)
      setIsPending(false)
      return
    }

    try {
      const imageUrl = image ? (await upload({ data: [image] }))[0] : ''

      const publishTag = isChecked
        ? PostTags.OrgPublish.Opportunity
        : PostTags.OrgPublish.OpportunityDraft

      const { applicationRequired, ...rest } = formData
      const metadata = buildMetadata<OpportunityMetadataRecord>(
        publisher,
        [publishTag],
        {
          version: MetadataVersion.OpportunityMetadataVersion['1.0.2'],
          type: publishTag,
          id: v4(),
          ...rest,
          applicationRequired: applicationRequired ? 'true' : 'false',
          imageUrl
        }
      )

      await checkAuth(publisher.ownedBy)
      await createPost({
        profileId: publisher.id,
        metadata
      })

      reset()
      onClose(true)
    } catch (e: any) {
      setErrorMessage(e.message)
      setError(true)
    }
    setIsPending(false)
  }

  const [minDate, setMinDate] = useState<string>(
    new Date().toLocaleDateString()
  )

  return (
    <GradientModal
      title={t('title')}
      open={open}
      onCancel={onCancel}
      onSubmit={handleSubmit((data) => onSubmit(data))}
      submitDisabled={isPending}
    >
      <div className="mx-12">
        {!isPending ? (
          <Form
            form={form}
            onSubmit={() => handleSubmit((data) => onSubmit(data))}
          >
            <Input
              suppressHydrationWarning
              label={t('name')}
              placeholder={t('name-placeholder')}
              error={!!errors.name?.type}
              {...register('name', {
                required: true,
                maxLength: 100
              })}
            />

            <Input
              label={t('start-date')}
              type="date"
              placeholder="yyyy-mm-dd"
              min={new Date().toLocaleDateString()}
              error={!!errors.startDate?.type}
              {...register('startDate', {
                required: true
              })}
              onChange={(e) => {
                if (
                  Date.parse(form.getValues('endDate')) <
                  Date.parse(e.target.value)
                ) {
                  resetField('endDate')
                }
                setMinDate(e.target.value)
              }}
            />
            <Input
              label={t('end-date')}
              type="endDate"
              placeholder="yyyy-mm-dd"
              disabled={!endDateDisabled}
              min={minDate}
              error={!!errors.endDate?.type}
              {...register('endDate', {})}
              onChange={(e) => {
                if (e.target.value === 'on') {
                  resetField('endDate')
                  setEndDateDisabled(!endDateDisabled)
                }
              }}
            />
            <Input
              label={t('hours')}
              placeholder="5.5"
              error={!!errors.hoursPerWeek?.type}
              {...register('hoursPerWeek', {
                required: true,
                pattern: {
                  value: /^(?!0*[.,]0*$|[.,]0*$|0*$)\d+[,.]?\d{0,1}$/,
                  message: t('hours-invalid')
                }
              })}
            />
            <Input
              suppressHydrationWarning
              label={t('category')}
              placeholder={t('category-placeholder')}
              error={!!errors.category?.type}
              {...register('category', { required: true, maxLength: 40 })}
            />
            <Input
              label={t('website')}
              placeholder="https://ecssen.ca/opportunity-link"
              error={!!errors.website?.type}
              {...register('website', {
                validate: (url) => {
                  return url == '' || validUrl(url) || t('website-invalid')
                }
              })}
            />
            <TextArea
              label={t('description')}
              placeholder={t('description-placeholder')}
              error={!!errors.description?.type}
              {...register('description', { required: true, maxLength: 250 })}
            />

            <div className="flex-row space-x-96">
              <label
                style={{
                  display: 'inline-block',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: '15px',
                  marginBottom: '15px'
                }}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={handleCheckboxChange}
                  style={{
                    appearance: 'none',
                    backgroundColor: isChecked ? 'purple' : 'transparent',
                    border: '1px solid grey',
                    width: '25px',
                    height: '25px'
                  }}
                />
                <span style={{ marginLeft: '12px' }} suppressHydrationWarning>
                  {t('publish-now')}
                </span>
              </label>
              <label
                style={{
                  display: 'inline-block',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: '15px',
                  marginBottom: '15px'
                }}
              >
                <input
                  type="checkbox"
                  {...register('applicationRequired')}
                  style={{
                    appearance: 'none',
                    backgroundColor: currentFormData.applicationRequired
                      ? 'purple'
                      : 'transparent',
                    border: '1px solid grey',
                    width: '25px',
                    height: '25px'
                  }}
                />
                <span style={{ marginLeft: '12px' }} suppressHydrationWarning>
                  {t('registration-required')}
                </span>
              </label>
            </div>

            <FileInput
              label={t('image')}
              accept="image/*"
              onChange={(event) => {
                const selectedFile = event.target.files?.[0]
                setError(false)

                if (selectedFile && validImageExtension(selectedFile.name)) {
                  setImage(selectedFile)
                } else {
                  setError(true)
                  setErrorMessage(e('invalid-file-format'))
                }
              }}
            />
          </Form>
        ) : (
          <Spinner />
        )}

        {error && (
          <Error
            message={`${e('generic-front')}${errorMessage}${e('generic-back')}`}
          />
        )}
      </div>
    </GradientModal>
  )
}

export default PublishOpportunityModal
