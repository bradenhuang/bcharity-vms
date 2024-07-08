import { ProfileFragment as Profile } from '@lens-protocol/client'
import { TextOnlyMetadata } from '@lens-protocol/metadata'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import GradientModal from '@/components/Shared/Modal/GradientModal'
import { Form } from '@/components/UI/Form'
import { Input } from '@/components/UI/Input'
import { Spinner } from '@/components/UI/Spinner'
import { checkAuth, useCreatePost } from '@/lib/lens-protocol'
import { buildMetadata, GoalMetadataRecord, PostTags } from '@/lib/metadata'
import { MetadataVersion } from '@/lib/types'

import Error from './Error'

export interface IPublishGoalFormProps {
  goal: string
  goalDate: string
}

export const emptyPublishFormData: IPublishGoalFormProps = {
  goal: '',
  goalDate: ''
}

/**
 * Properties of {@link GoalModal}
 */
export interface IPublishGoalModalProps {
  /**
   * Whether the modal is open
   */
  open: boolean
  /**
   * Function to run when the modal is closed
   * @returns
   */
  onClose: (shouldRefetch: boolean) => void
  /**
   * Lens profile fragment of the publisher of the post
   */
  publisher: Profile | null
}

/**
 * Component that displays a popup modal for setting a cause goal, wraps a {@link GradientModal}.
 *
 * Goals are set by publishing posts using the {@link useCreatePost} hook and the metadata tag
 * {@link PostTags.OrgPublish.Goal}. The goal value is stored as a custom metadata attribute in
 * the goal post, and is read by querying the latest goal post from a user.
 *
 * Used in {@link components.Dashboard.OrganizationDashboard.OrganizationCauses}
 */
const GoalModal: React.FC<IPublishGoalModalProps> = ({
  open,
  onClose,
  publisher
}) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'components.dashboard.modals.goal'
  })
  const { t: e } = useTranslation('common', { keyPrefix: 'errors' })

  const { createPost } = useCreatePost()

  const [isPending, setIsPending] = useState<boolean>(false)
  const [error, setError] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string>('')

  const form = useForm<IPublishGoalFormProps>()

  const {
    handleSubmit,
    reset,
    register,
    formState: { errors }
  } = form

  const onCancel = () => {
    console.log('Form cancelled')
    reset()
    onClose(false)
  }

  const onSubmit = async (data: IPublishGoalFormProps) => {
    setError(false)
    setIsPending(true)

    if (!publisher) {
      setErrorMessage(e('profile-null'))
      setError(true)
      setIsPending(false)
      return
    }

    const metadata: TextOnlyMetadata = buildMetadata<GoalMetadataRecord>(
      publisher,
      [PostTags.OrgPublish.Goal],
      {
        ...data,
        version: MetadataVersion.GoalMetadataVersion['1.0.0'],
        type: PostTags.OrgPublish.Goal
      }
    )

    try {
      checkAuth(publisher.ownedBy?.address, publisher.id)
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

  return (
    <GradientModal
      title={t('title')}
      open={open}
      onCancel={onCancel}
      onSubmit={handleSubmit(onSubmit)}
      submitDisabled={isPending}
    >
      <div className="mx-12">
        {!isPending ? (
          <Form form={form} onSubmit={() => handleSubmit(onSubmit)()}>
            <Input
              label={t('goal')}
              type="number"
              placeholder="100"
              step="0.1"
              min="0.1"
              error={!!errors.goal?.type}
              {...register('goal', {
                required: true,
                pattern: {
                  value: /^(?!0*[.,]0*$|[.,]0*$|0*$)\d+[,.]?\d{0,1}$/,
                  message: t('goal-error')
                }
              })}
            />

            <Input
              label={t('date')}
              type="date"
              placeholder="yyyy-mm-dd"
              {...register('goalDate', {})}
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

export default GoalModal
