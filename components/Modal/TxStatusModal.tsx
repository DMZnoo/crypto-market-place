import React from 'react'

import { TxStatusError, TxStatusType } from '@/hooks/useTransaction'
// import { Loading } from '../../libs/icons/src/lib/icons';
import Loading from '@/components/common/Loading'

type TxStatusProps = {
  status: TxStatusType
  message: string | TxStatusError
}

const TxStatusModal: React.FC<TxStatusProps> = ({ status, message }) => {
  let content

  if (status === 'Loading' && typeof message === 'string') {
    content = (
      <div className="fixed bottom-5 left-5 bg-white dark:bg-dark-primary-600 border dark:border-ebony text-black dark:text-white flex items-center p-3 rounded-md shadow-lg z-50">
        {status === 'Loading' && (
          <>
            {/* <Loading className="mr-3 scale-[140%] -mt-1" /> */}
            <Loading className="pr-1" />
          </>
        )}
        {message}
      </div>
    )
  }

  return <>{content}</>
}

export default TxStatusModal
