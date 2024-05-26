import { Asset, assetClassMap, markets } from '@/config'
import ReserveOracle from '@/contracts/ReserveOracle.json'
import SpotOracle from '@/contracts/SpotOracle.json'
import useAccountInfo from '@/hooks/useAccountInfo'
import { API_METHOD, callApi } from '@/utils/backend'
import { WAD } from '@/utils/number'
import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import { Abi } from 'viem'
import { mainnet, useNetwork } from 'wagmi'
import { useApp } from './AppProvider'

// for both collateral and lender assets
// exchange rate is used for displaying values in units
// marketPrice may be necessary later
export type AssetValueData = {
  exchangeRate: bigint // [wad] ETH per asset from reserve oracle
  marketPriceInLenderAsset?: bigint // [wad] amount per asset from spot oracle denominated in lender asset
}

export type AssetApy = {
  [asset in Asset]: number | null // the estimated annual percentage of the yield calculated from the change in its staking yield
}

export type AssetValue = {
  [asset in Asset]?: AssetValueData | null
}

export type AssetValueContextProps = {
  dollarPerEth: bigint | null
  assetValue: AssetValue | null
  assetApy: AssetApy | null
}

const AssetValueContext = createContext<AssetValueContextProps>({
  dollarPerEth: null,
  assetValue: null,
  assetApy: null,
})

const initialAssetApy: Record<Asset, null> = {
  wstETH: null,
  weETH: null,
  ezETH: null,
  rsETH: null,
  rswETH: null,
}

export const AssetValueProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  // TODO: implement dollar per ETH here
  const [dollarPerEth, setDollarPerEth] = useState<bigint | null>(null)
  const [assetValue, setAssetValue] = useState<AssetValue | null>(null)
  const [assetApy, setAssetApy] = useState<AssetApy | null>(null)
  const requestPending = useRef<boolean>(false)

  const { publicClient: client } = useApp()
  const { address } = useAccountInfo()

  const { chain: returnedChain } = useNetwork()
  const chain = returnedChain === undefined ? mainnet : returnedChain

  useEffect(() => {
    setAllAssetValues()
    setAllAssetApy()
  }, [client, address, chain]) // TODO: when should this trigger or retrigger

  const setAllAssetValues = async () => {
    try {
      const assetValue: AssetValue | null = await fetchAllAssetValues()
      setAssetValue(assetValue)
    } catch (e) {
      return
    }
  }

  const getAllApys = async (): Promise<Partial<AssetApy>> => {
    requestPending.current = true
    const apyResponse = await callApi('v1/bigbrother/apy', API_METHOD.GET, {})
    requestPending.current = false
    return await apyResponse.json()
  }

  const setAllAssetApy = async () => {
    // initialize values with null
    const allAssetApys: Partial<AssetApy> = {}
    try {
      if (requestPending.current) return
      const apys = await getAllApys()

      for (const asset in apys) {
        allAssetApys[asset as Asset] = apys[asset as Asset]
      }

      setAssetApy(allAssetApys as AssetApy)
    } catch (e) {
      return
    }
  }

  const fetchAllAssetValues = async (): Promise<AssetValue | null> => {
    // build multicall contracts array
    // loop through all marketIds for collateral and lender assets
    // for collateral assets, call the reserve oracle
    // for lender assets, call its own

    // TODO: refactor to generalize the process for making this hook
    // work with every new asset we add
    if (client === null) {
      return null
    }

    const contracts = []

    const marketsCount = Object.keys(markets[chain.id]).length
    for (let i = 0; i < marketsCount; i++) {
      const collateralAddr = markets[chain.id][i].collateralAsset

      const lenderAsset = markets[chain.id][i].lenderAsset

      const collateralAssetCallData = {
        abi: ReserveOracle.abi as Abi,
        address: markets[chain.id][i].reserveOracle,
        functionName: 'getProtocolExchangeRate',
      }

      const lenderAssetCallData =
        assetClassMap[lenderAsset]?.getExchangeRateCallData()

      const collateralMarketPriceInLenderAssetCallData = {
        abi: SpotOracle.abi as Abi,
        address: markets[chain.id][i].spotOracle,
        functionName: 'getPrice',
      }

      contracts.push(collateralAssetCallData)
      contracts.push(lenderAssetCallData)
      contracts.push(collateralMarketPriceInLenderAssetCallData)
    }

    let results: any
    try {
      results = await client?.multicall({
        contracts: contracts,
      })

      // loop through all collateral assets in each market
      // if lenderAsset or collateral asset overlaps, it should
      // just overwrite or not replace any info.
      // loop through each assets and configure assetValue
      const resultsPerMarket = 3
      const assetValue: AssetValue = {}
      for (
        let i = 0;
        i < marketsCount * resultsPerMarket;
        i += resultsPerMarket
      ) {
        const marketId = Math.floor(i / resultsPerMarket)
        const collateralAsset = markets[chain.id][marketId].collateralAsset
        const lenderAsset = markets[chain.id][marketId].lenderAsset

        const exchangeRateInLenderAsset = results[i].result as bigint
        const lenderAssetExchangeRate = results[i + 1].result as bigint
        const spotPriceInLenderAsset = results[i + 2].result as bigint

        const exchangeRateInEth =
          (exchangeRateInLenderAsset * lenderAssetExchangeRate) / WAD

        assetValue[collateralAsset] = {
          exchangeRate: exchangeRateInEth,
          marketPriceInLenderAsset: spotPriceInLenderAsset,
        }

        assetValue[lenderAsset] = {
          exchangeRate: lenderAssetExchangeRate,
        }
      }

      // const wstEthPerWeEth = results[0].result as bigint
      // const ethPerWstEth = results[1].result as bigint
      // const wstEthPerWeEthSpotPrice = results[2].result as bigint

      // // ethPerWeEth = wstEthPerWeEth * ethPerWstEth
      // const ethPerWeEth = wstEthPerWeEth * ethPerWstEth / WAD

      // // TODO: Generalize to all assets in configs
      // const assetValue: AssetValue = {
      //     'weETH': {
      //         exchangeRate: ethPerWeEth,
      //         marketPriceInLenderAsset: wstEthPerWeEthSpotPrice
      //     },
      //     'wstETH': {
      //         exchangeRate: ethPerWstEth
      //     }
      // }
      return assetValue
    } catch (e) {
      const error = new Error('fetchAllAssetValues error')
      error.cause = e // Attach the original error
      throw error
    }
  }

  return (
    <AssetValueContext.Provider
      value={{
        dollarPerEth: dollarPerEth,
        assetValue: assetValue,
        assetApy: assetApy,
      }}
    >
      {children}
    </AssetValueContext.Provider>
  )
}

export const useAssetValue = () =>
  useContext<AssetValueContextProps>(AssetValueContext)
