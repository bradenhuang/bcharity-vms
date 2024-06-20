import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { Card } from '@/components/UI'
import { getAvatar, VolunteerData } from '@/lib/lens-protocol'

import { getFormattedDate } from './VolunteerManagement'

/**
 * Properties of {@link VolunteerDataCard}
 */
export interface VolunteerDataCardProps {
  /**
   * Volunteer data to display
   */
  vol: VolunteerData
}

/**
 * Component that displays a styled card for an individual volunteer.
 */
const VolunteerDataCard: React.FC<VolunteerDataCardProps> = ({ vol }) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'components.dashboard.organization.management.all'
  })

  const { t: e } = useTranslation('common', { keyPrefix: 'errors' })

  const location = useMemo(() => {
    return vol.profile?.metadata?.attributes?.find(
      (attr) => attr.key === 'location'
    )?.value
  }, [vol])

  return (
    <Card className="pt-10 pl-10 pr-10 justify-center">
      <div
        className="justify-center font-black text-3xl py-4"
        suppressHydrationWarning
      >
        {t('volunteer-information')}
      </div>

      <div className="justify-start flex">
        <div className="text-violet-500">
          {vol.profile.handle?.fullHandle ?? vol.profile.id}&nbsp;
        </div>
      </div>
      <div className="flex">
        {(vol.profile.metadata
          ? vol.profile.metadata.coverPicture !== undefined
          : false) && (
          <img
            className="rounded-sm py-3"
            src={getAvatar(vol.profile)}
            alt="Rounded avatar"
            style={{ width: '100px', height: 'auto' }}
          />
        )}
        <div className="flex justify-between py-3 pl-5">
          <div className="text-violet-500" suppressHydrationWarning>
            {t('bio')}&nbsp;
          </div>
          <p>
            {vol.profile.metadata ? vol.profile.metadata.bio : 'No bio yet.'}
          </p>
        </div>
      </div>
      <div className="flex">
        <div className="text-violet-500" suppressHydrationWarning>
          {t('location')}&nbsp;
        </div>
        <p>{location ?? ''}</p>

        {/* placeholder */}
      </div>
      <div className="flex">
        <div className="text-violet-500" suppressHydrationWarning>
          {t('date-joined')}&nbsp;
        </div>
        <p>{getFormattedDate(vol.dateJoined)}</p>
      </div>

      <div className="text-violet-500 pb-2" suppressHydrationWarning>
        {t('active')}
      </div>
      <div>
        {vol.currentOpportunities.map((o) => (
          <div
            key={o.id}
            className="flex items-center space-x-1 justify-between bg-brand-300 text-black rounded-md p-1"
          >
            <p>{o.startDate}</p>
            <p>{o.name}</p>
            <p>{o.hoursPerWeek} VHR</p>
          </div>
        ))}
      </div>
      <div className="text-violet-500 pb-2" suppressHydrationWarning>
        {t('completed')}
      </div>
      <div>
        {vol.completedOpportunities.map((o) => (
          <div
            key={o.post_id}
            className="flex items-center justify-between bg-brand-300 rounded-sm"
          >
            <p>{o.createdAt}</p>
            <p>{o.opportunity.name}</p>
            <p>{o.hoursToVerify} VHR</p>
          </div>
        ))}
      </div>
    </Card>
  )
}

export default VolunteerDataCard
