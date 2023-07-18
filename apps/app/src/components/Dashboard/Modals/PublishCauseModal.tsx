import {
  Erc20Fragment,
  MetadataAttributeInput,
  PublicationMainFocus,
  PublicationMetadataDisplayTypes,
  PublicationMetadataV2Input
} from '@lens-protocol/client'
import { ProfileFragment as Profile } from '@lens-protocol/client'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { v4 } from 'uuid'

import GradientModal from '@/components/Shared/Modal/GradientModal'
import { Form } from '@/components/UI/Form'
import { Input } from '@/components/UI/Input'
import { Spinner } from '@/components/UI/Spinner'
import { TextArea } from '@/components/UI/TextArea'
import { APP_NAME, DEFAULT_COLLECT_TOKEN } from '@/constants'
import getTokenImage from '@/lib/getTokenImage'
import getUserLocale from '@/lib/getUserLocale'
import checkAuth from '@/lib/lens-protocol/checkAuth'
import createPost from '@/lib/lens-protocol/createPost'
import useEnabledCurrencies from '@/lib/lens-protocol/useEnabledCurrencies'

import Error from './Error'

interface IPublishCauseModalProps {
  open: boolean
  onClose: (shouldRefetch: boolean) => void
  publisher: Profile | null
}

interface IFormProps {
  causeName: string
  category: string
  currency: string
  contribution: string
  goal: string
  recipient: string
  description: string
}

const PublishCauseModal: React.FC<IPublishCauseModalProps> = ({
  open,
  onClose,
  publisher
}) => {
  const { t } = useTranslation('common')
  const [isPending, setIsPending] = useState<boolean>(false)

  const [error, setError] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string>('')

  const [selectedCurrency, setSelectedCurrency] = useState<string>(
    DEFAULT_COLLECT_TOKEN
  )
  const [selectedCurrencySymbol, setSelectedCurrencySymbol] =
    useState<string>('WMATIC')

  const { data: currencyData } = useEnabledCurrencies(publisher?.ownedBy)

  const form = useForm<IFormProps>()

  const {
    handleSubmit,
    reset,
    register,
    formState: { errors }
  } = form

  const onCancel = () => {
    reset()
    onClose(false)
  }

  const onSubmit = async (data: IFormProps) => {
    setError(false)
    setIsPending(true)
    console.log('test')

    if (!publisher) {
      setErrorMessage('No publisher provided')
      setError(true)
      setIsPending(false)
      return
    }

    const attributes: MetadataAttributeInput[] = [
      {
        traitType: 'type',
        displayType: PublicationMetadataDisplayTypes.String,
        value: 'ORG_PUBLISH_CAUSE'
      },
      {
        traitType: 'cause_id',
        displayType: PublicationMetadataDisplayTypes.String,
        value: v4()
      },
      {
        traitType: 'cause_name',
        displayType: PublicationMetadataDisplayTypes.String,
        value: data.causeName
      },
      {
        traitType: 'currency',
        displayType: PublicationMetadataDisplayTypes.String,
        value: selectedCurrency
      },
      {
        traitType: 'contribution',
        displayType: PublicationMetadataDisplayTypes.String,
        value: data.contribution
      },
      {
        traitType: 'goal',
        displayType: PublicationMetadataDisplayTypes.String,
        value: data.goal
      },
      {
        traitType: 'recipient',
        displayType: PublicationMetadataDisplayTypes.String,
        value: data.recipient
      },
      {
        traitType: 'description',
        displayType: PublicationMetadataDisplayTypes.String,
        value: data.description
      }
    ]

    const metadata: PublicationMetadataV2Input = {
      version: '2.0.0',
      metadata_id: v4(),
      content: '#ORG_PUBLISH_CAUSE',
      locale: getUserLocale(),
      tags: ['ORG_PUBLISH_CAUSE'],
      mainContentFocus: PublicationMainFocus.TextOnly,
      name: `ORG_PUBLISH_CAUSE by ${publisher?.handle}`,
      attributes,
      appId: APP_NAME
    }

    try {
      setIsPending(true)

      await checkAuth(publisher.ownedBy)

      await createPost(publisher, metadata)
    } catch (e: any) {
      setErrorMessage(e.message)
      setError(true)
    }
    setIsPending(false)
  }

  return (
    <GradientModal
      title={'Publish New Cause'}
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
              label="Cause name"
              placeholder="Medical internship"
              error={!!errors.causeName?.type}
              {...register('causeName', { required: true })}
            />
            <Input
              label="Category"
              placeholder="Healthcare"
              error={!!errors.category?.type}
              {...register('category', { required: true })}
            />
            <div>
              <div className="label">{t('Select currency')}</div>
              <select
                className="w-full bg-white rounded-xl border border-gray-300 outline-none dark:bg-gray-800 disabled:bg-gray-500 disabled:bg-opacity-20 disabled:opacity-60 dark:border-gray-700/80 focus:border-brand-500 focus:ring-brand-400"
                onChange={(e) => {
                  const currency = e.target.value.split('-')
                  setSelectedCurrency(currency[0])
                  setSelectedCurrencySymbol(currency[1])
                }}
              >
                {currencyData?.map((currency: Erc20Fragment) => (
                  <option
                    key={currency.address}
                    value={`${currency.address}-${currency.symbol}`}
                  >
                    {currency.name}
                  </option>
                ))}
              </select>
            </div>
            <Input
              label={t('Contribution')}
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
              placeholder="5"
              {...register('contribution', { required: true })}
            />
            <Input
              label={t('Funding goal')}
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
              placeholder="420"
              {...register('goal', { required: true })}
            />
            <Input
              label={t('Recipient')}
              type="text"
              placeholder="0x3A5bd...5e3"
              {...register('recipient', { required: true })}
            />
            <TextArea
              label="Description"
              placeholder="Tell us more about this cause"
              error={!!errors.description?.type}
              {...register('description', { required: true })}
            />
            {/* <Input
              label="Date(s)"
              type="date"
              placeholder="yyyy-mm-dd"
              error={!!errors.dates?.type}
              {...register('dates', { required: true })}
            />
            <Input
              label="Expected number of hours"
              placeholder="5"
              error={!!errors.numHours?.type}
              {...register('numHours', { required: true })}
            />
             */}
          </Form>
        ) : (
          <Spinner />
        )}

        {error && (
          <Error
            message={`An error occured: ${errorMessage}. Please try again.`}
          />
        )}
      </div>
    </GradientModal>
  )
}

export default PublishCauseModal