import SwitchNetwork from '@components/Shared/SwitchNetwork'
import { Button } from '@components/UI/Button'
import { XCircleIcon } from '@heroicons/react/solid'
import { ProfileFragment as Profile } from '@lens-protocol/client'
import { signMessage } from '@wagmi/core'
import clsx from 'clsx'
import React, { Dispatch, FC, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAppPersistStore, useAppStore } from 'src/store/app'
import {
  Connector,
  useAccount,
  useConnect,
  useDisconnect,
  useNetwork
} from 'wagmi'
import { InjectedConnector } from 'wagmi/connectors/injected'

import { CHAIN_ID } from '@/constants'
import getWalletLogo from '@/lib/getWalletLogo'
import { getProfilesOwnedBy, lensClient } from '@/lib/lens-protocol'
import Logger from '@/lib/logger'

/**
 * Properties of {@link WalletSelector}
 */
export interface WalletSelectorProps {
  /**
   * Dispatch to set store value for has connected state
   */
  setHasConnected: Dispatch<boolean>
  /**
   * Dispatch to set store value for has profile state
   */
  setHasProfile: Dispatch<boolean>
}

/**
 * A component to connect wallet addresses through services such as
 * {@link https://metamask.io/ | Metamask} and {@link https://walletconnect.com/ | WalletConnect}
 */
const WalletSelector: FC<WalletSelectorProps> = ({
  setHasConnected,
  setHasProfile
}) => {
  const { setProfiles } = useAppStore()
  const { setIsAuthenticated, setCurrentUser } = useAppPersistStore()

  const { chain } = useNetwork()

  const [mounted, setMounted] = useState(false)

  const { isConnected, connector: activeConnector } = useAccount()
  const { disconnectAsync } = useDisconnect()

  const { connectors, connectAsync } = useConnect()
  const [loginError, setLoginError] = useState<boolean>(false)
  const [loginErrorMessage, setLoginErrorMessage] = useState<string>('')
  const [profiles, _setProfiles] = useState<Profile[]>()

  const { t } = useTranslation('common', {
    keyPrefix: 'components.shared.navbar.login.wallet-selector'
  })
  const { t: e } = useTranslation('common', { keyPrefix: 'errors' })

  const onConnect = async (connector: Connector) => {
    try {
      const account = await connectAsync({ connector })
      if (account) {
        setHasConnected(true)
      }
    } catch (error) {
      Logger.warn('[Sign Error]', error)
    }
  }

  const onLoginClick = async (connector: Connector) => {
    if (isConnected) {
      await disconnectAsync()
    }

    const { connector: connect } = await connectAsync({ connector })

    if (connect instanceof InjectedConnector) {
      try {
        setLoginError(false)

        const walletClient = await connect.getWalletClient()
        const address = walletClient.account.address

        const challenge = await lensClient().authentication.generateChallenge(
          address
        )
        const signature = await signMessage({ message: challenge })

        await lensClient().authentication.authenticate(address, signature)

        if (await lensClient().authentication.isAuthenticated()) {
          const profiles = await getProfilesOwnedBy(address)
          _setProfiles(profiles)
        } else {
          setLoginErrorMessage(e('profiles'))
          setLoginError(true)
        }
      } catch (e: any) {
        setLoginErrorMessage(e.message)
        setLoginError(true)
      }
    }
  }

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (profiles) {
      if (profiles.length === 0) {
        setHasProfile(false)
      } else {
        setIsAuthenticated(true)
        setProfiles(profiles)
        setCurrentUser(profiles[0])
      }
    }
  }, [profiles, setCurrentUser, setHasProfile, setIsAuthenticated, setProfiles])

  return activeConnector?.id ? (
    <div className="space-y-3">
      {chain?.id === CHAIN_ID ? (
        <Button
          size="lg"
          icon={
            <img
              className="mr-1 w-5 h-5"
              height={20}
              width={20}
              src="/lens.png"
              alt="Lens Logo"
            />
          }
          onClick={() => onLoginClick(activeConnector)}
        >
          {t('sign-in')}
        </Button>
      ) : (
        <SwitchNetwork />
      )}
      {loginError && (
        <div className="flex items-center space-x-1 font-bold text-red-500">
          <XCircleIcon className="w-5 h-5" />
          <div>{loginErrorMessage}</div>
        </div>
      )}
    </div>
  ) : (
    <div className="space-y-3">
      {connectors.map((connector) => {
        return (
          <button
            type="button"
            key={connector.id}
            className={clsx(
              {
                'hover:bg-gray-100 dark:hover:bg-gray-700':
                  connector.id !== activeConnector?.id
              },
              'w-full flex items-center space-x-2.5 justify-center px-4 py-3 overflow-hidden rounded-xl border dark:border-gray-700/80 outline-none'
            )}
            onClick={() => onConnect(connector)}
            disabled={
              mounted
                ? !connector.ready || connector.id === activeConnector?.id
                : false
            }
          >
            <span
              className="flex justify-between items-center w-full"
              suppressHydrationWarning
            >
              {mounted
                ? connector.id === 'injected'
                  ? t('browser')
                  : connector.name
                : connector.name}
              {mounted ? !connector.ready && ' (unsupported)' : ''}
            </span>
            <img
              src={getWalletLogo(connector.name)}
              draggable={false}
              className="w-6 h-6"
              height={24}
              width={24}
              alt={connector.id}
            />
          </button>
        )
      })}
    </div>
  )
}

export default WalletSelector
