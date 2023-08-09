import { HomeIcon } from '@heroicons/react/outline'
import { MediaRenderer } from '@thirdweb-dev/react'
import { NextPage } from 'next'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import getAvatar from '@/lib/getAvatar'
import usePublication from '@/lib/lens-protocol/usePublication'
import {
  CauseMetadataBuilder,
  InvalidMetadataException,
  isPost,
  PostTags
} from '@/lib/metadata'
import Custom404 from '@/pages/404'

import { GridItemTwelve, GridLayout } from '../GridLayout'
import BookmarkButton from '../Shared/BookmarkButton'
import FollowButton from '../Shared/FollowButton'
import Progress from '../Shared/Progress'
import { Button } from '../UI/Button'
import { Card } from '../UI/Card'
import { Spinner } from '../UI/Spinner'
import SEO from '../utils/SEO'

const CausePage: NextPage = () => {
  const { t } = useTranslation('common', { keyPrefix: 'components.causes' })
  const { t: e } = useTranslation('common', { keyPrefix: 'errors' })
  const { data, loading, fetch, error } = usePublication()
  const {
    query: { id },
    isReady
  } = useRouter()

  const [wrongPostType, setWrongPostType] = useState(false)

  const cause = useMemo(() => {
    if (!data) return
    if (!isPost(data)) {
      setWrongPostType(true)
      return
    }

    try {
      return new CauseMetadataBuilder(data).build()
    } catch (e) {
      if (e instanceof InvalidMetadataException) {
        setWrongPostType(true)
      }
    }
    return ''
  }, [data])

  useEffect(() => {
    if (isReady && id) {
      fetch({ publicationId: Array.isArray(id) ? '' : id })
    }
  }, [id, isReady])

  const WrongPost = () => {
    return (
      <div className="py-10 text-center">
        <h1 className="mb-4 text-3xl font-bold" suppressHydrationWarning>
          {e('Incorrect publication type')}
        </h1>
        <div className="mb-4" suppressHydrationWarning>
          {t('incorrect-url')}
        </div>
        <Link href="/">
          <Button
            className="flex mx-auto item-center"
            size="lg"
            icon={<HomeIcon className="w-4 h-4" />}
          >
            <div suppressHydrationWarning>{t('go-home')}</div>
          </Button>
        </Link>
      </div>
    )
  }

  const Body = () => {
    if (!cause || !data || !isPost(data)) return <Spinner />

    return wrongPostType ? (
      <WrongPost></WrongPost>
    ) : (
      <div className="p-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <BookmarkButton
              publicationId={cause.post_id}
              postTag={PostTags.Bookmark.Cause}
            />
            <div className="text-5xl font-bold text-black dark:text-white p-2 bg-purple-300 dark:bg-indigo-950 rounded-lg">
              {cause.name}
            </div>
            <div className="text-3xl text-gray-400 font-bold pl-5">
              -{cause.category}
            </div>
          </div>
        </div>
        <div className="flex flex-row">
          <div className=" w-2/3">
            <div className="flex space-x-3 items-center mt-8">
              <div className="flex flex-row">
                <FollowButton followId={cause.from.id} size="lg" />
                <div className="ml-5 mt-1 text-xl">
                  Status: Accepting Donations
                </div>
              </div>
            </div>

            {cause.imageUrl && (
              <div>
                <MediaRenderer
                  key="attachment"
                  className="object-cover h-50 rounded-lg border-[3px] border-black margin mb-[20px]"
                  src={cause.imageUrl}
                  alt={'image attachment'}
                />
              </div>
            )}
            <div className="flex flex-row items-center m-2">
              <img
                className=" w-8 h-8 mr-2 rounded-full"
                src={getAvatar(cause.from)}
                alt="Rounded avatar"
              />
              <div className="text-xl font-semibold text-gray-600 dark:text-white">
                {cause.from.handle} is organizing this fundraiser
              </div>
            </div>
            <div className="mt-10 text-3xl font-bold ">About Organization:</div>

            <div className="pt-6 pb-4 mr-10 text-xl font-semibold text-gray-600 dark:text-white">
              dolor sit amet, consectetur adipiscing elit. Donec purus tellus,
              condimentum sit amet quam at, placerat cursus nulla. Etiam ex
              nibh, maximus ut egestas quis, gravida sit amet orci. Maecenas
              interdum est eget blandit venenatis. Aenean vulputate semper. quam
              at, placerat cursus nulla. Etiam ex nibh, maximus ut egestas quis,
              gravida sit amet orci. quam at, placerat cursus nulla. Etiam ex
              nibh, maximus ut egestas quis, gravida sit amet orci.
            </div>

            <Button size="lg" className="mr-10">
              Donate
            </Button>
            <Button size="lg" className="mr-10 ml-56 ">
              Share
            </Button>

            <div className="text-3xl font-semibold text-gray-800 dark:text-white mt-10">
              Organizer
            </div>
            <div className="flex flex-row">
              <div className="text-2xl font-semibold text-gray-600 dark:text-white">
                {cause.from.handle}
                <div className="text-xl">Calgary, AB</div>
              </div>
            </div>
            <button className="  mt-6 relative inline-flex items-center justify-center p-0.5 mb-2 mr-2 overflow-hidden text-sm font-medium text-gray-900 dark:text-white rounded-lg group bg-gradient-to-br from-purple-600 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800">
              <span className="relative w-32 px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
                Contact
              </span>
            </button>
          </div>
          <div className="py-10 shadow-xl w-1/3 bg-slate-100 dark:bg-indigo-950 rounded-md">
            <div className="flex items-center">
              <div className="text-2xl font-bold text-purple-500 dark:text-white sm:text-7xl pl-10 pr-3">
                ${88}
              </div>
              <div className="text-xl font-bold text-black dark:text-white sm:text-xl mt-8">
                VHR raised out of {100}
              </div>
            </div>

            <Progress
              progress={88}
              total={100}
              className="mt-10 mb-10 ml-5 mr-5 p-1"
            />
            <div className="font-semibold text-2xl ">
              <Button size="lg" className="relative h-12 w-5/6 mr-10 ml-8">
                Donate Now
              </Button>
              <Button size="lg" className="mr-10 mt-5 h-12 w-5/6 ml-8">
                Share
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <SEO title="Project • BCharity VMS" />
      <GridLayout>
        <GridItemTwelve>
          <Card>
            {loading ? (
              <center className="p-20">
                <Spinner />
              </center>
            ) : error || data === undefined ? (
              <Custom404 />
            ) : (
              <Body />
            )}
          </Card>
        </GridItemTwelve>
      </GridLayout>
    </>
  )
}

export default CausePage
