// WhitelistContext.tsx
import { markets } from '@/config'
import Whitelist from '@/contracts/Whitelist.json'
import useAccountInfo from '@/hooks/useAccountInfo'
import { API_METHOD, callApi } from '@/utils/backend'
import { ReactNode, createContext, useContext, useState } from 'react'
import { Abi } from 'viem'
import { mainnet, useNetwork } from 'wagmi'
import { useApp } from './AppProvider'

export type WhitelistInfos = { [marketId: string]: WhitelistInfo | null } | null

interface WhitelistInfo {
  isBorrower: boolean
  isLender: boolean
  borrowerProof: string[]
  lenderProof: string[]
}

interface WhitelistContextProps {
  whitelistInfos: WhitelistInfos
  fetchWhitelistStatus: (accountAddress: string, marketId: number) => void
  status: FetchWhitelistStatus
}

type WhitelistEnabled = {
  [marketId: number]: {
    borrow: boolean
    lend: boolean
  }
}

export type FetchWhitelistStatus = 'Idle' | 'Loading' | 'Error' | 'Success'

const WhitelistContext = createContext<WhitelistContextProps>({
  whitelistInfos: null,
  fetchWhitelistStatus: () => {},
  status: 'Idle',
})

/**
 * If the market's on-chain merkle roots are zero, this means that the market's
 * whitelist is disabled.
 * If merkle root is zero, the proof should simply be a empty byte32 array.
 * If the market's whitelist is diabled, it should not show whitelist information on the UI.
 * @param
 * @returns
 */
export const WhitelistProvider = ({ children }: { children: ReactNode }) => {
  const [whitelistEnabled, setWhitelistEnabled] =
    useState<WhitelistEnabled | null>(null)
  const [whitelistInfos, setWhitelistInfos] = useState<WhitelistInfos>(null)
  const [status, setStatus] = useState<FetchWhitelistStatus>('Idle')
  const { address } = useAccountInfo()
  const { chain: returnedChain } = useNetwork()
  const chain = returnedChain === undefined ? mainnet : returnedChain
  const { publicClient: client } = useApp()

  const checkWhitelistEnabled = async (
    marketId: number
  ): Promise<[boolean, boolean] | null> => {
    if (client === null) return null
    const market = markets[chain.id][marketId]
    let results: any

    try {
      results = await client.multicall({
        contracts: [
          {
            abi: Whitelist.abi as Abi,
            address: market.whitelist as `0x${string}`,
            functionName: 'lendersRoot',
          },
          {
            abi: Whitelist.abi as Abi,
            address: market.whitelist as `0x${string}`,
            functionName: 'borrowersRoot',
            args: [0],
          },
        ],
      })
    } catch (e) {
      console.error(e)
      return null
    }
    if (!results) return null

    const lenderRoot = results[0].result as bigint
    const borrowersRoot = results[1].result as bigint

    if (!lenderRoot || !borrowersRoot) return null

    // whitelist is enabled if the root is not zero
    return [
      BigInt(lenderRoot) !== BigInt(0),
      BigInt(borrowersRoot) !== BigInt(0),
    ]
  }

  const fetchWhitelistStatus = async (
    accountAddress: string,
    marketId: number
  ) => {
    if (accountAddress === '') {
      return
    }

    const ionPool = markets[chain.id][marketId].ionPool

    const whitelistEnabled = await checkWhitelistEnabled(marketId)
    if (whitelistEnabled === null) {
      setStatus('Error')
      return // query failed
    }
    if (!whitelistEnabled[0] && !whitelistEnabled[1]) {
      // empty proofs
      const whitelistStatus: WhitelistInfo = {
        isBorrower: true,
        isLender: true,
        borrowerProof: [],
        lenderProof: [],
      }

      const newWhitelistInfos: WhitelistInfos = {
        ...whitelistInfos,
        [marketId.toString()]: whitelistStatus,
      }
      setStatus('Success')
      setWhitelistInfos(newWhitelistInfos)
      return // whitelist disabled for this market
    }

    // NOTE: For now, this code assumes that borrow and lend whitelist
    // will either be both disabled or enabled together.
    // If they're not both disabled, both proofs are
    setStatus('Loading')

    try {
      const borrowerResponse = await callApi(
        'v1/bigbrother/whitelist',
        API_METHOD.GET,
        {
          address: accountAddress,
          contract_address: ionPool,
          is_borrower: 'true',
        }
      )
      const lenderResponse = await callApi(
        'v1/bigbrother/whitelist',
        API_METHOD.GET,
        {
          address: accountAddress,
          contract_address: ionPool,
          is_borrower: 'false',
        }
      )

      // early returns for invalid responses
      if (borrowerResponse.status !== 200 || lenderResponse.status !== 200) {
        setStatus('Error')
        return
      }

      const borrowerJson = await borrowerResponse.json()
      const lenderJson = await lenderResponse.json()

      const isBorrower = borrowerJson.result
      const isLender = lenderJson.result
      const borrowerProof: string[] = isBorrower ? borrowerJson.proof : []
      let lenderProof: string[] = isLender ? lenderJson.proof : []

      const whitelistStatus: WhitelistInfo = {
        isBorrower: isBorrower,
        isLender: isLender,
        borrowerProof: borrowerProof,
        lenderProof: lenderProof,
      }

      const newWhitelistInfos: WhitelistInfos = {
        ...whitelistInfos,
        [marketId.toString()]: whitelistStatus,
      }
      setStatus('Success')
      setWhitelistInfos(newWhitelistInfos)
    } catch (e) {
      setWhitelistInfos(null)
      // TODO: display this value on the whitelist banner
      setStatus('Error')
    }
  }

  return (
    <WhitelistContext.Provider
      value={{
        fetchWhitelistStatus,
        whitelistInfos,
        status,
      }}
    >
      {children}
    </WhitelistContext.Provider>
  )
}

export const useWhitelist = () =>
  useContext<WhitelistContextProps>(WhitelistContext)
