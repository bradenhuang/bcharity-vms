import { PencilIcon } from '@heroicons/react/outline'
import { ProfileFragment } from '@lens-protocol/client'
import { signMessage, signTypedData } from '@wagmi/core'
import { FC, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useConfig } from 'wagmi'
import { polygon, polygonMumbai } from 'wagmi/chains'

import { Button } from '@/components/UI/Button'
import { ErrorMessage } from '@/components/UI/ErrorMessage'
import { Form } from '@/components/UI/Form'
import { Input } from '@/components/UI/Input'
import { Spinner } from '@/components/UI/Spinner'
import { IS_MAINNET } from '@/constants'
import { getSignature, lensClient } from '@/lib/lens-protocol'

interface FormProps {
  contractAddress: string
  tokenId: string
}

/**
 * Properties of {@link NFTPicture}
 */
export interface NFTPictureProps {
  /**
   * Profile to set the profile picture of
   */
  profile: ProfileFragment | undefined
}

/**
 * Component that lets the user select a NFT as a profile picture
 *
 * Uses {@link https://docs.lens.xyz/docs/nft-ownership-challenge | ownershipChallenge} to sign
 * the NFT transaction, and {@link https://docs.lens.xyz/docs/create-set-profile-image-uri-typed-data | createSetProfileImageURITypedData}
 * to set the profile picture.
 */
const NFTPicture: FC<NFTPictureProps> = ({ profile }) => {
  const form = useForm<FormProps>()
  const {
    handleSubmit,
    register,
    formState: { errors }
  } = form

  const { t } = useTranslation('common', {
    keyPrefix: 'components.settings.home.nft-picture'
  })
  const [chainId, setChainId] = useState<number>(
    IS_MAINNET ? polygon.id : polygonMumbai.id
  )

  const [error, setError] = useState<Error>()
  const [isLoading, setIsLoading] = useState<boolean>()
  const config = useConfig()
  const setAvatar = async (contractAddress: string, tokenId: string) => {
    setIsLoading(true)
    try {
      const result = await lensClient().nfts.fetchGalleries({
        for: profile?.id ?? '',
        nfts: [
          {
            tokenId,
            contractAddress,
            chainId
          }
        ]
      })

      const _signature = await signMessage({
        config: config,
        parameters: { message: result.name }
      })

      const typedDataResult =
        await lensClient().profile.createSetProfileMetadataTypedData({
          nftData: {
            id: result.unwrap().id,
            signature: _signature
          }
        })

      const signature = await signTypedData(
        config,
        getSignature(typedDataResult.unwrap().typedData)
      )

      const broadcastResult = await lensClient().transaction.broadcastOnchain({
        id: typedDataResult.unwrap().id,
        signature: signature
      })

      return broadcastResult
    } catch (e) {
      if (e instanceof Error) {
        setError(e)
      }
    }
    setIsLoading(false)
  }
  
  return (
    <Form
      form={form}
      className="space-y-4"
      onSubmit={() => {
        handleSubmit((data) => {
          setAvatar(data.contractAddress, data.tokenId)
        })
      }}
    >
      {error && (
        <ErrorMessage
          className="mb-3"
          title={t('transaction-failed')}
          error={error}
        />
      )}
      <div>
        <div className="label" suppressHydrationWarning>
          {t('chain')}
        </div>
        <div>
          <select
            className="w-full bg-white rounded-xl border border-gray-300 outline-none dark:bg-gray-800 disabled:bg-gray-500 disabled:bg-opacity-20 disabled:opacity-60 dark:border-gray-700/80 focus:border-brand-500 focus:ring-brand-400"
            onChange={(e) => setChainId(parseInt(e.target.value))}
            value={chainId}
          >
            <option value={IS_MAINNET ? polygon.id : polygonMumbai.id}>
              {IS_MAINNET ? 'Polygon' : 'Mumbai'}
            </option>
          </select>
        </div>
      </div>
      <Input
        suppressHydrationWarning
        label={t('contract-address')}
        type="text"
        placeholder="0x277f5959e22f94d5bd4c2cc0a77c4c71f31da3ac"
        error={!!errors.contractAddress?.type}
        value={
          profile?.metadata?.picture?.__typename === 'NftImage'
            ? profile?.metadata?.picture?.collection?.address
            : undefined
        }
        {...register('contractAddress', {
          required: true,
          pattern: {
            value: /^0x[a-fA-F0-9]{40}$/,
            message: t('invalid-address')
          }
        })}
      />
      <Input
        suppressHydrationWarning
        label={t('token-id')}
        type="text"
        placeholder="1"
        error={!!errors.tokenId?.type}
        value={
          profile?.metadata?.picture?.__typename === 'NftImage'
            ? profile?.metadata?.picture?.tokenId
            : undefined
        }
        {...(register('tokenId'),
        {
          required: true
        })}
      />

      <div className="flex flex-col space-y-2">
        <Button
          className="ml-auto"
          type="submit"
          disabled={isLoading}
          icon={
            isLoading ? (
              <Spinner size="xs" />
            ) : (
              <PencilIcon className="w-4 h-4" />
            )
          }
        >
          {t('save')}
        </Button>
      </div>
    </Form>
  )
}

export default NFTPicture
