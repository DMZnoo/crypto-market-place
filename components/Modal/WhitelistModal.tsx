import { markets } from '@/config'
import { useApp } from '@/contexts/AppProvider'
import {
  FetchWhitelistStatus,
  WhitelistInfos,
} from '@/contexts/WhitelistProvider'
import { useEffect } from 'react'
import { mainnet, useNetwork } from 'wagmi'

type WhitelistModalProps = {
  whitelistInfos: WhitelistInfos
  whitelistStatus: FetchWhitelistStatus
  marketId: number
  type: 'Borrow' | 'Lend'
}

enum WhitelistMessage {
  BorrowerTrue = 'You are a whitelisted borrower',
  BorrowerFalse = 'You are not a whitelisted borrower',
  LenderTrue = 'You are a whitelisted lender',
  LenderFalse = 'You are not a whitelisted lender',
  Error = 'Failed to fetch whitelist.',
  Loading = 'Fetching your whitelist eligibility...',
}

type Style = {
  borderColor: string
  bgColor: string
}

const WhitelistModal = ({
  whitelistInfos,
  whitelistStatus,
  marketId,
  type,
}: WhitelistModalProps) => {
  const {
    addSuccess,
    addLoading,
    addWarning,
    removeSuccess,
    removeLoading,
    removeWarning,
    removeError,
    errors,
    loading,
  } = useApp()

  const { chain: returnedChain } = useNetwork()
  const chain = returnedChain === undefined ? mainnet : returnedChain

  useEffect(() => {
    const suffix = ` in the ${markets[chain.id][marketId].collateralAsset}/${
      markets[chain.id][marketId].lenderAsset
    } market!`
    const borrowerTrueMessage = WhitelistMessage.BorrowerTrue + suffix
    const lenderTrueMessage = WhitelistMessage.LenderTrue + suffix
    const borrowerFalseMessage = WhitelistMessage.BorrowerFalse + suffix
    const lenderFalseMessage = WhitelistMessage.LenderFalse + suffix

    if (whitelistStatus === 'Error') {
      addWarning(WhitelistMessage.Error)
    } else if (whitelistStatus === 'Loading') {
      // when loading, remove all other whitelist alerts
      // removeWarning(WhitelistMessage.Error)
      // removeSuccess(WhitelistMessage.BorrowerTrue)
      // removeSuccess(WhitelistMessage.LenderTrue)
      // removeWarning(borrowerFalseMessage)
      // removeWarning(lenderFalseMessage)

      addLoading(WhitelistMessage.Loading)
    } else {
      removeLoading(WhitelistMessage.Loading)
      if (
        whitelistInfos === null ||
        whitelistInfos[marketId] === null ||
        whitelistInfos[marketId] === undefined
      ) {
        return
      }

      if (type === 'Borrow') {
        if (whitelistInfos[marketId]!.isBorrower) {
          addSuccess(borrowerTrueMessage)
        } else {
          addWarning(borrowerFalseMessage)
        }
      } else if (type === 'Lend') {
        if (whitelistInfos[marketId]!.isLender) {
          addSuccess(lenderTrueMessage)
        } else {
          addWarning(lenderFalseMessage)
        }
      }
    }
  }, [whitelistInfos, whitelistStatus, marketId, type, chain])

  return <></>
}
export default WhitelistModal
