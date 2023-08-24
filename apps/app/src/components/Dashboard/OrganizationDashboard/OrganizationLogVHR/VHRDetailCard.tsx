import { LinkIcon } from '@heroicons/react/outline'
import Link from 'next/link'
import React from 'react'
import { useTranslation } from 'react-i18next'

import { LogVhrRequestMetadata } from '@/lib/metadata'

interface IVHRDetailCardProps {
  value: LogVhrRequestMetadata
}

const VHRDetailCard: React.FC<IVHRDetailCardProps> = ({ value }) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'components.dashboard.organization.log-vhr.detail-card'
  })

  return (
    <div className="flex h-72 bg-brand-200 dark:bg-Card shadow-md shadow-black px-4 py-3 rounded-md mt-8">
      <div className="flex flex-col flex-grow w-0">
        <Link href={`/p/volunteer/${value.from.handle}`} target="_blank">
          <div className="flex">
            <LinkIcon className="w-6 inline mr-4 shrink-0" />
            <p className="text-black dark:text-teal-100 font-semibold text-lg whitespace-nowrap text-ellipsis overflow-hidden">
              {value.from.handle}
            </p>
          </div>
          <p className="ml-10 text-fuchsia-700">{value.from.id}</p>
        </Link>
        <Link href={`/volunteer/${value.opportunity.post_id}`} target="_blank">
          <div className="flex">
            <LinkIcon className="w-6 inline mr-4 shrink-0" />
            <p className="text-black dark:text-teal-100 font-semibold text-lg whitespace-nowrap text-ellipsis overflow-hidden">
              {value.opportunity.name}
            </p>
          </div>
          <p className="ml-10 text-fuchsia-700">{value.opportunity.id}</p>
        </Link>
        <div className="flex justify-between font-semibold text-lg mt-4">
          <p className="mr-4">
            {value.opportunity.startDate} - {value.opportunity.endDate}
          </p>
          <p className="whitespace-nowrap text-ellipsis">
            {value.hoursToVerify} VHR
          </p>
        </div>
        <p className="mt-auto" suppressHydrationWarning>
          {t('request-made')} {value.createdAt}
        </p>
      </div>
      <p className="ml-10 overflow-scroll flex-grow w-0">{value.comments}</p>
    </div>
  )
}

export default VHRDetailCard
