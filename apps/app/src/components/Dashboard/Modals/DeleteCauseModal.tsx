import {
  AnyPublicationFragment,
  Erc20Fragment,
  ProfileFragment
} from '@lens-protocol/client'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import FormDropdown from '@/components/Shared/FormDropdown'
import GradientModal from '@/components/Shared/Modal/GradientModal'
import DisabledLocationDropdowns from '@/components/UI/DisabledLocationDropdowns'
import { FileInput } from '@/components/UI/FileInput'
import { Input } from '@/components/UI/Input'
import { Spinner } from '@/components/UI/Spinner'
import { TextArea } from '@/components/UI/TextArea'
import getTokenImage from '@/lib/getTokenImage'
import { checkAuth, lensClient } from '@/lib/lens-protocol'
import {
  CauseMetadata,
  CauseMetadataBuilder,
  InvalidMetadataException,
  isPost
} from '@/lib/metadata'
import { logIgnoreWarning } from '@/lib/metadata/get/logIgnoreWarning'

import Error from './Error'
import { IPublishCauseFormProps } from './PublishCauseModal'

/**
 * Properties of {@link DeleteCauseModal}
 */
export interface IDeleteCauseModalProps {
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
   * Post ID of the post being deleted
   */
  id: string
  /**
   * Lens profile fragment of the publisher of the post
   */
  publisher: ProfileFragment | null
  /**
   * Default post values displayed in the form
   */
  values: IPublishCauseFormProps
  /**
   * List of the posts to be deleted
   */
  postData: AnyPublicationFragment[]
  /**
   * Information about the token used in the cause post
   */
  currencyData: Erc20Fragment[] | undefined
}

/**
 * Component that displays a popup modal for deleting a cause post, wraps a {@link GradientModal}.
 *
 * Because publications in Lens cannot be completely deleted, "deleting" a publication means hiding
 * it {@link https://docs.lens.xyz/docs/hide-publication}.
 *
 * Used in {@link components.Dashboard.OrganizationDashboard.OrganizationCauses}
 */
const DeleteCauseModal: React.FC<IDeleteCauseModalProps> = ({
  open,
  onClose,
  id,
  publisher,
  values,
  postData,
  currencyData
}) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'components.dashboard.modals.delete-cause'
  })
  const { t: e } = useTranslation('common', { keyPrefix: 'errors' })
  const [publicationIds, setPublicationIds] = useState<string[]>([])

  const [pending, setPending] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const selectedCurrencySymbol =
    currencyData?.find((c) => c.name === values.currency)?.symbol ?? 'WMATIC'

  useEffect(() => {
    const ids = postData
      .filter(isPost)
      .map((post) => {
        try {
          return new CauseMetadataBuilder(post).build()
        } catch (e) {
          logIgnoreWarning(post, e as InvalidMetadataException)
          return null
        }
      })
      .filter((o): o is CauseMetadata => o !== null && o.id === id)
      .map((p) => p.post_id)

    setPublicationIds(ids)
  }, [id, postData])

  const onCancel = () => {
    setErrorMessage('')
    onClose(false)
  }

  const onSubmit = () => {
    setErrorMessage('')
    setPending(false)

    if (!publisher) {
      setErrorMessage(e('profile-null'))
      setPending(false)
      return
    }

    checkAuth(publisher.ownedBy.address)
      .then(() =>
        Promise.all(
          publicationIds.map((id) => lensClient().publication.hide({ for: id }))
        )
      )
      .then((res) => {
        res.map((r) => {
          if (r.isFailure()) {
            throw r.error.message
          }
        })
      })
      .then(() => {
        onClose(true)
      })
      .catch((e) => {
        setErrorMessage(e.message)
      })
      .finally(() => {
        setPending(false)
      })
  }
  return (
    <GradientModal
      title={t('title')}
      open={open}
      onCancel={onCancel}
      onSubmit={onSubmit}
      submitDisabled={pending}
    >
      <div className="mx-12">
        {!pending ? (
          <>
            <Input label={t('name')} defaultValue={values.name} disabled />

            <Input
              label={t('category')}
              defaultValue={values.category}
              disabled
            />

            <FormDropdown
              disabled
              label={t('selected-currency')}
              options={currencyData?.map((c) => c.name) ?? []}
              defaultValue={
                currencyData?.find((c) => c.name === values.currency)?.name ??
                ''
              }
            />

            <Input
              disabled
              label={t('contribution')}
              type="number"
              step="0.0001"
              min="0"
              max="100000"
              value={values.contribution}
              prefix={
                <img
                  className="w-6 h-6"
                  height={24}
                  width={24}
                  src={getTokenImage(selectedCurrencySymbol)}
                  alt={selectedCurrencySymbol}
                />
              }
            />
            <DisabledLocationDropdowns
              country={values.country}
              province={values.province}
              city={values.city}
            />
            <Input
              disabled
              label={t('goal')}
              type="number"
              step="0.0001"
              min="0"
              max="100000"
              prefix={
                <img
                  className="w-6 h-6"
                  height={24}
                  width={24}
                  src={getTokenImage(selectedCurrencySymbol)}
                  alt={selectedCurrencySymbol}
                />
              }
              value={values.goal}
            />
            <Input label={t('recipient')} value={values.recipient} disabled />
            <TextArea
              label={t('description')}
              value={values.description}
              disabled
            />
            <FileInput
              defaultImageIPFS={values.imageUrl ?? ''}
              label={t('image')}
              accept="image/*"
              disabled
            />
          </>
        ) : (
          <Spinner />
        )}

        {!!errorMessage && (
          <Error
            message={`${e('generic-front')}${errorMessage}${e('generic-back')}`}
          />
        )}
      </div>
    </GradientModal>
  )
}

export default DeleteCauseModal
