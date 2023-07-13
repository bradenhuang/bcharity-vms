import { Disclosure } from '@headlessui/react'
import { MenuIcon, XIcon } from '@heroicons/react/outline'
import { Inter } from '@next/font/google'
import clsx from 'clsx'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { FC, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useAppPersistStore } from '@/store/app'

import TranslateButton from '../TranslateButton'
import MenuItems from './MenuItems'

const inter500 = Inter({
  subsets: ['latin'],
  weight: ['500']
})

const inter700 = Inter({
  subsets: ['latin'],
  weight: ['700']
})

const Navbar: FC = () => {
  const { t } = useTranslation('common')
  const { isAuthenticated, currentUser } = useAppPersistStore()
  const [auth, setAuth] = useState<boolean>(false)

  useEffect(() => {
    if (isAuthenticated && currentUser) {
      setAuth(true)
    } else {
      setAuth(false)
    }
  }, [currentUser, isAuthenticated])

  interface NavItemProps {
    url: string
    name: string
    current: boolean
  }

  const NavItem = ({ url, name, current }: NavItemProps) => {
    return (
      <Link href={url} aria-current={current ? 'page' : undefined}>
        <Disclosure.Button
          className={clsx(
            'text-lg p-3 rounded-lg hover:bg-gray-100 tracking-wider w-full md:px-3',
            {
              'text-purple-500 bg-white': current,
              'text-black': !current
            },
            `${inter500.className}`
          )}
        >
          {name}
        </Disclosure.Button>
      </Link>
    )
  }

  const NavItems = () => {
    const { pathname } = useRouter()

    return (
      <>
        <NavItem
          url="/causes"
          name={t('CAUSES')}
          current={pathname == '/causes'}
        />

        <NavItem
          url="/volunteers"
          name={t('VOLUNTEERS')}
          current={pathname == '/volunteers'}
        />

        <NavItem
          url="/organizations"
          name={t('ORGANIZATIONS')}
          current={pathname == '/organizations'}
        />

        {auth && (
          <NavItem
            url="/dashboard"
            name={t('DASHBOARD')}
            current={pathname == '/dashboard'}
          />
        )}
      </>
    )
  }

  return (
    <Disclosure
      as="header"
      className="divider sticky top-0 z-10 w-full bg-white bg-opacity-80 dark:bg-black"
    >
      {({ open }) => (
        <>
          <div className="container mx-auto max-w-screen-xl px-5">
            <div className="relative flex h-14 items-center justify-between sm:h-16">
              <div className="flex items-center justify-start">
                <Disclosure.Button className="inline-flex items-center justify-center rounded-md text-gray-500 focus:outline-none md:hidden">
                  {open ? (
                    <XIcon className="block w-6 h-6" aria-hidden="true" />
                  ) : (
                    <MenuIcon className="block w-6 h-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
                <Link href="/" className="hidden md:block">
                  <div className="inline-flex flex-grow justify-between items-center font-bold">
                    <div className="text-3xl font-black">
                      <img
                        className="mx-5 h-10 w-10"
                        src="/logo.jpg"
                        alt="Logo"
                      />
                    </div>
                    <span
                      className={`mt-1 text-2xl text-violet-800 tracking-wider ${inter500.className}`}
                    >
                      BCharity
                    </span>
                  </div>
                </Link>
                <div className="hidden sm:ml-6 md:block">
                  <div className="flex items-center space-x-4">
                    <NavItems />
                  </div>
                </div>
              </div>
              <Link href="/" className={clsx('md:hidden')}>
                <div className="inline-flex flex-grow justify-between items-center font-bold">
                  <div className="text-3xl font-black">
                    <img
                      className="mx-5 h-10 w-10"
                      src="/logo.jpg"
                      alt="Logo"
                    />
                  </div>
                  <span
                    className={`mt-1 text-2xl text-violet-800 tracking-wider ${inter500.className}`}
                  >
                    BCharity
                  </span>
                </div>
              </Link>
              <div className="flex items-center gap-4">
                <TranslateButton />
                <MenuItems />
              </div>
            </div>
          </div>

          <Disclosure.Panel className="md:hidden">
            <div className="m-3">
              <NavItems />
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  )
}

export default Navbar
