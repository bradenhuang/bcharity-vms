import SEO from '@components/utils/SEO'
import {
  ExplorePublicationsOrderByType,
  ProfileFragment,
  PublicationsRequest,
  PublicationType
} from '@lens-protocol/client'
import { NextPage } from 'next'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { lensClient, useExplorePublications } from '@/lib/lens-protocol'
import { getOpportunityMetadata, PostTags } from '@/lib/metadata'

import Error from '../Dashboard/Modals/Error'
import { GridItemSix, GridLayout } from '../GridLayout'
import OrganizationCard from '../Organizations/OrganizationCard'
import Divider from '../Shared/Divider'
import { Spinner } from '../UI/Spinner'
import VolunteerCard from '../Volunteers/VolunteerCard'

const Home: NextPage = () => {
  const { t } = useTranslation('common')
  const {
    data,
    error: exploreError,
    loading
  } = useExplorePublications(
    {
      orderBy: ExplorePublicationsOrderByType.Latest,
      where: {
        metadata: {
          tags: {
            oneOf: [PostTags.OrgPublish.Opportunity]
          }
        }
      }
    },
    true
  )

  const [otherError, setOtherError] = useState(false)

  const posts = useMemo(
    () =>
      getOpportunityMetadata(data).filter(
        (post) => post.type !== PostTags.OrgPublish.OpportunityDraft
      ),
    [data]
  )

  const [profiles, setProfiles] = useState<ProfileFragment[]>([])
  const [postings, setPostings] = useState<number[]>([])

  useEffect(() => {
    const uniqueIds: Set<string> = new Set()

    posts.forEach((post) => uniqueIds.add(post.from.id))

    if (uniqueIds.size > 0)
      lensClient()
        .profile.fetchAll({ where: { profileIds: Array.from(uniqueIds) } })
        .then((res) => setProfiles(res.items))
        .catch((err) => {
          console.log(err)
          setOtherError(true)
        })
  }, [posts])

  const generateRequest = (profileId: string) => {
    const param: PublicationsRequest = {
      where: {
        actedBy: profileId,
        publicationTypes: [PublicationType.Post],
        metadata: {
          tags: {
            oneOf: [PostTags.OrgPublish.Cause, PostTags.OrgPublish.Opportunity]
          }
        }
      }
    }

    return lensClient()
      .publication.fetchAll(param)
      .then((result) => result.items.filter((res) => !res.isHidden).length)
  }

  useEffect(() => {
    Promise.all(profiles.map((profile) => generateRequest(profile.id)))
      .then((lengths) => setPostings(lengths))
      .catch((err) => {
        setOtherError(true)
        console.log(err)
      })
  }, [profiles])

  return (
    <>
      <SEO title="Home • BCharity VMS" />
      <div className="my-8">
        {(exploreError || otherError) && (
          <Error message="Something went wrong. Please try again " />
        )}
        <div className="my-4">
          {loading ? (
            <div className="flex justify-center p-5">
              <Spinner />
            </div>
          ) : (
            <GridLayout>
              <GridItemSix>
                <div className="mx-auto">
                  <h1 className="text-2xl font-bold" suppressHydrationWarning>
                    {t('components.organizations.title')}
                  </h1>
                  <Divider className="w-full" />
                  <div className="flex flex-col max-h-screen overflow-auto">
                    {profiles.map((profile, index) => (
                      <div key={profile.id} className="my-2 mx-6">
                        <OrganizationCard
                          profile={profile}
                          postings={postings[index]}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </GridItemSix>
              <GridItemSix>
                <div className="mx-auto">
                  <h1 className=" text-2xl font-bold" suppressHydrationWarning>
                    {t('components.volunteers.title')}
                  </h1>
                  <Divider className="w-full" />
                  <div className="flex flex-col max-h-screen overflow-auto">
                    {posts.map((post) => (
                      <div key={post.id} className="my-2 mx-6">
                        <VolunteerCard post={post} />
                      </div>
                    ))}
                  </div>
                </div>
              </GridItemSix>
            </GridLayout>
          )}
        </div>
      </div>
    </>
  )
}

export default Home
