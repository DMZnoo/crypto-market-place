import { markets, tokenAddresses } from '@/config'
import GemJoin from '@/contracts/GemJoin.json'
import InterestModule from '@/contracts/InterestRateModule.json'
import IonPool from '@/contracts/IonPool.json'
import Liquidation from '@/contracts/Liquidation.json'
import ReserveOracle from '@/contracts/ReserveOracle.json'
import SpotOracle from '@/contracts/SpotOracle.json'
import YieldOracle from '@/contracts/YieldOracle.json'
import useAccountInfo from '@/hooks/useAccountInfo'
import {
  convertPrecision,
  perSecondToAnnualRate,
  perSecondToAnnualRatePerc,
} from '@/utils/number'
import bn from 'bignumber.js'
import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react'
import { Abi } from 'viem'
import { erc20ABI, mainnet, useNetwork } from 'wagmi'
import { useApp } from './AppProvider'

// Information specific to each market
// Does not require wallet connection
export type MarketInfo = {
  tvlInfo: TVLInfo
  oracleInfo: OracleInfo
  paramsInfo: ParamsInfo
  lenderPoolInfo: LenderPoolInfo
  rateInfo: RateInfo
}

export type TVLInfo = {
  totalDebtAmount: bigint // denominated in lender asset [wad]
  totalCollateralAmount: bigint // denominated in collateral asset [wad]
}

export type OracleInfo = {
  spotPrice: bigint // [wad]
  exchangeRate: bigint // [wad]
}

export type ParamsInfo = {
  maxLtv: number // [decimal]
  liquidationThreshold: number // [decimal]
  debtCeiling: bigint // [wad]
  dust: bigint // [wad]
}

export type LenderPoolInfo = {
  supplyCap: bigint // wethSupplyCap(), the supply cap for lenders [wad]
  debt: bigint // debt(), includes unbacked debt and all ilk debt [wad]
  totalSupply: bigint // totalSupply(), total claimable lender deposits [wad]
  liquidity: bigint // weth(), available liquidity [wad]
}

export type RateInfo = {
  annualCollateralYield: number // staking yield of the collateral [decimal]
  annualBorrowRate: number // interest rate charged by protocol (not accounting for growing debt asset value) [decimal]
  annualLenderAssetYield: number // [decimal]
  reserveFactor: number // [decimal]
  annualMinimumBaseRate: number
  annualMinimumKinkRate: number
  annualAdjustedBaseRate: number
  annualMinimumAboveKinkSlope: number
  adjustedProfitMargin: number
  optimalUtilizationRate: number
  annualAdjustedAboveKinkSlope: number
  // annualLenderAssetYield: number // staking yield of the lender asset queried through an off-chain api [decimal]
}

// Information specific to each market AND the user
// Requires wallet connection
export type UserInfo = {
  userVaultInfo: UserVaultInfo
  userWalletInfo: UserWalletInfo
  userLendInfo: UserLendInfo
}

export type UserVaultInfo = {
  collateral: bigint // [wad] in pure asset amount
  debt: bigint // [wad] in pure asset amount
  normalizedDebt: bigint // [wad] from contract
  rate: bigint // [ray] from contract
}

export type UserLendInfo = {
  totalSupplied: bigint // [wad]
}

export type UserWalletInfo = {
  collateralTokenBalance: bigint // [wad]
  debtTokenBalance: bigint // [wad]
}

export type MarketsContextProps = {
  marketData: { [marketId: string]: MarketInfo | null } | null
  userData: { [marketId: string]: UserInfo | null } | null
  trigger: boolean
  setTrigger: React.Dispatch<React.SetStateAction<boolean>>
}

const MarketsContext = createContext<MarketsContextProps>({
  marketData: null,
  userData: null,
  trigger: true,
  setTrigger: () => {},
})

export const MarketsProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [marketInfo, setMarketInfo] = useState<{
    [marketId: string]: MarketInfo | null
  } | null>(null)
  const [userInfo, setUserInfo] = useState<{
    [marketId: string]: UserInfo | null
  } | null>(null)

  const { loading, publicClient: client, walletClient: walletClient } = useApp()
  const { signer, address } = useAccountInfo()

  const { chain: returnedChain } = useNetwork()
  const chain = returnedChain === undefined ? mainnet : returnedChain

  const [trigger, setTrigger] = useState<boolean>(true)

  useEffect(() => {
    // get MarketInfo for all marketIDs
    setAllMarketInfo()
    setAllUserInfo()
  }, [loading, client, address, trigger])

  const setAllUserInfo = async () => {
    if (client == null) {
      return
    }
    const marketsCount = Object.keys(markets[chain.id]).length
    let userData: { [marketId: string]: UserInfo | null } = {}
    for (let i = 0; i < marketsCount; i++) {
      userData[i.toString()] = await fetchUserInfo(i)
    }
    setUserInfo(userData)
  }

  const fetchUserInfo = async (marketId: number): Promise<UserInfo | null> => {
    if (client == null || address == null || address == '') {
      return null
    }
    const market = markets[chain.id][marketId]
    let results: any

    const collateralTokenAddress = tokenAddresses[market.collateralAsset]
    const lenderTokenAddress = tokenAddresses[market.lenderAsset]

    try {
      results = await client.multicall({
        contracts: [
          {
            abi: erc20ABI as Abi,
            address: collateralTokenAddress as `0x${string}`,
            functionName: 'balanceOf',
            args: [address],
          },
          {
            abi: erc20ABI as Abi,
            address: lenderTokenAddress as `0x${string}`,
            functionName: 'balanceOf',
            args: [address],
          },
          {
            abi: IonPool.abi as Abi,
            address: market.ionPool as `0x${string}`,
            functionName: 'vault',
            args: [0, address],
          },
          {
            abi: IonPool.abi as Abi,
            address: market.ionPool as `0x${string}`,
            functionName: 'rate',
            args: [0],
          },
          {
            abi: IonPool.abi as Abi,
            address: market.ionPool as `0x${string}`,
            functionName: 'balanceOf',
            args: [address],
          },
        ],
      })
    } catch (e) {
      console.error(e)
    }

    const collateralAssetBalance = results[0].result as bigint
    const lenderAssetBalance = results[1].result as bigint

    const collateralAmount = results[2].result[0] // collateral
    const normalizedDebtAmount = results[2].result[1] as bigint // normalizedDebt
    const rate = results[3].result as bigint
    const rewardTokenBalance = results[4].result as bigint

    const debt = BigInt(
      convertPrecision((normalizedDebtAmount * rate).toString(), 45, 18)
    )
    const userVaultInfo: UserVaultInfo = {
      collateral: collateralAmount,
      debt: debt,
      normalizedDebt: normalizedDebtAmount,
      rate: rate,
    }
    const userLendInfo: UserLendInfo = {
      totalSupplied: rewardTokenBalance,
    }
    const userWalletInfo: UserWalletInfo = {
      collateralTokenBalance: collateralAssetBalance,
      debtTokenBalance: lenderAssetBalance,
    }
    const userInfo: UserInfo = {
      userVaultInfo: userVaultInfo,
      userWalletInfo: userWalletInfo,
      userLendInfo: userLendInfo,
    }

    return userInfo
  }

  // get market info for all marketId
  const setAllMarketInfo = async () => {
    if (client == null) {
      return
    }
    const marketsCount = Object.keys(markets[chain.id]).length
    let marketsState: { [marketId: string]: MarketInfo | null } = {}
    for (let i = 0; i < marketsCount; i++) {
      marketsState[i.toString()] = await fetchMarketInfo(i)
    }
    setMarketInfo(marketsState)
  }

  /**
   * Offchain query for retrieving annual lender asset yield.
   */
  const fetchLenderAssetYield = async () => {
    // TODO: Lender APY = (1 + borrowRate) * (1 + lenderAssetStakingYield) - 1
  }

  // get market info for a single marketId
  const fetchMarketInfo = async (
    marketId: number
  ): Promise<MarketInfo | null> => {
    if (client == null) {
      return null
    }
    const market = markets[chain.id][marketId]

    let results: any

    try {
      results = await client.multicall({
        contracts: [
          {
            abi: SpotOracle.abi as Abi,
            address: market.spotOracle as `0x${string}`,
            functionName: 'LTV',
          },
          {
            abi: IonPool.abi as Abi,
            address: market.ionPool as `0x${string}`,
            functionName: 'debtCeiling',
            args: [0],
          },
          {
            abi: Liquidation.abi as Abi,
            address: market.liquidation as `0x${string}`,
            functionName: 'LIQUIDATION_THRESHOLD',
          },
          {
            abi: SpotOracle.abi as Abi,
            address: market.spotOracle as `0x${string}`,
            functionName: 'getPrice',
          },
          {
            abi: ReserveOracle.abi as Abi,
            address: market.reserveOracle as `0x${string}`,
            functionName: 'getProtocolExchangeRate',
          },
          // Lender Pool Info
          {
            abi: IonPool.abi as Abi,
            address: market.ionPool as `0x${string}`,
            functionName: 'wethSupplyCap',
          },
          {
            abi: IonPool.abi as Abi,
            address: market.ionPool as `0x${string}`,
            functionName: 'debt',
          },
          {
            abi: IonPool.abi as Abi,
            address: market.ionPool as `0x${string}`,
            functionName: 'totalSupply',
          },
          {
            abi: IonPool.abi as Abi,
            address: market.ionPool as `0x${string}`,
            functionName: 'weth',
          },
          {
            abi: IonPool.abi as Abi,
            address: market.ionPool as `0x${string}`,
            functionName: 'dust',
            args: [0],
          },
          // RateInfo
          {
            abi: IonPool.abi as Abi,
            address: market.ionPool as `0x${string}`,
            functionName: 'getCurrentBorrowRate',
            args: [0],
          }, // returns (borrowRate, reserveFactor)
          {
            abi: YieldOracle.abi as Abi,
            address: market.yieldOracle as `0x${string}`,
            functionName: 'apys',
            args: [0],
          },
          // TVLInfo
          {
            abi: IonPool.abi as Abi,
            address: market.ionPool as `0x${string}`,
            functionName: 'totalNormalizedDebt',
            args: [0],
          },
          {
            abi: IonPool.abi as Abi,
            address: market.ionPool as `0x${string}`,
            functionName: 'rate',
            args: [0],
          },
          {
            abi: GemJoin.abi as Abi,
            address: market.gemJoin as `0x${string}`,
            functionName: 'totalGem',
          },
          {
            abi: InterestModule.abi as Abi,
            address: market.interestRate as `0x${string}`,
            functionName: 'unpackCollateralConfig',
            args: [0],
          },
        ],
      })
    } catch (e) {}

    // TODO: fetch supplyCap from storage slot since it was unexposed
    // generalize this for multiple markets later
    let supplyCap: bigint = BigInt(0)
    try {
      const data = (await client.getStorageAt({
        address: market.ionPool as `0x${string}`,
        slot: '0xceba3d526b4d5afd91d1b752bf1fd37917c20a6daf576bcb41dd1c57c1f67e09' as `0x${string}`,
      })) as string
      supplyCap = BigInt(data) // [wad] denominated in lender asset
    } catch (e) {
      console.error(e)
    }

    const RAY: bigint = BigInt('1000000000000000000000000000')

    const maxLtv = Number((Number(results[0].result) / 1e27).toFixed(2)) // [ray] to [decimal]

    const debtCeilingRad = (results[1].result as bigint).toString()
    const debtCeiling = convertPrecision(debtCeilingRad, 45, 18)

    const liquidationThresholdRay = results[2].result as bigint
    const liquidationThreshold = Number(
      (Number(results[2].result) / 1e27).toFixed(2)
    )

    const spotPrice = results[3].result as bigint
    const exchangeRate = results[4].result as bigint

    // Don't use supplyCap as wethSupplyCap function is not exposed
    // const supplyCap = results[5].result as bigint

    const debtRad = (results[6].result as bigint).toString()
    const debt = convertPrecision(debtRad, 45, 18)

    const totalSupply = results[7].result as bigint
    const weth = results[8].result as bigint

    const dustRad = (results[9].result as bigint).toString()
    const dust = convertPrecision(dustRad, 45, 18)

    const currentBorrowRate = results[10].result[0] as bigint
    const reserveFactor = results[10].result[1] as bigint
    const annualCollateralYieldBigInt = results[11].result as bigint

    const totalNormalizedDebt = results[12].result as bigint
    const rate = results[13].result as bigint
    const totalDebtRad = (totalNormalizedDebt * rate).toString()
    const totalDebt = convertPrecision(totalDebtRad, 45, 18)

    const totalGem = results[14].result as bigint
    const ilkInterestInfo = results[15].result

    const annualAdjustedBaseRate = perSecondToAnnualRatePerc(
      ilkInterestInfo['adjustedBaseRate'],
      27,
      4
    ) // (new Decimal(data['adjustedBaseRate'].toString())).dividedBy(new Decimal(1e27)).add(1).pow(31540000).sub(1).mul(100).toFixed(2)
    const annualMinimumBaseRate = perSecondToAnnualRatePerc(
      ilkInterestInfo['minimumBaseRate'],
      27,
      4
    ) // (new Decimal(data['minimumBaseRate'].toString())).dividedBy(new Decimal(1e27)).add(1).pow(31540000).sub(1).mul(100).toFixed(2)

    const adjustedProfitMargin = perSecondToAnnualRatePerc(
      ilkInterestInfo['adjustedProfitMargin'],
      27,
      4
    ) // (new Decimal(data['adjustedProfitMargin'].toString())).dividedBy(new Decimal(1e27)).add(1).pow(31540000).sub(1).mul(100).toFixed(2)
    const optimalUtilizationRate = new bn(
      ilkInterestInfo['optimalUtilizationRate']
    )
      .dividedBy(new bn(1e2))
      .toNumber()
    const annualMinimumKinkRate = perSecondToAnnualRatePerc(
      ilkInterestInfo['minimumKinkRate'],
      27,
      4
    )
    // The value returned is per second * 100
    const annualMinimumAboveKinkSlope = perSecondToAnnualRatePerc(
      ilkInterestInfo['minimumAboveKinkSlope'] / BigInt(100),
      27,
      4
    )
    const annualAdjustedAboveKinkSlope = perSecondToAnnualRatePerc(
      ilkInterestInfo['adjustedAboveKinkSlope'],
      27,
      4
    )

    const annualBorrowRate = perSecondToAnnualRate(currentBorrowRate, 27, 4)
    const annualCollateralYield = Number(annualCollateralYieldBigInt) / 1e8

    // Set state

    const tvlInfo: TVLInfo = {
      totalDebtAmount: BigInt(totalDebt),
      totalCollateralAmount: totalGem,
    }

    const oracleInfo: OracleInfo = {
      spotPrice: spotPrice,
      exchangeRate: exchangeRate,
    }
    const paramsInfo: ParamsInfo = {
      maxLtv: maxLtv,
      debtCeiling: BigInt(debtCeiling),
      liquidationThreshold: liquidationThreshold,
      dust: BigInt(dust),
    }
    const lenderPoolInfo: LenderPoolInfo = {
      supplyCap: supplyCap,
      debt: BigInt(debt),
      totalSupply: totalSupply,
      liquidity: weth,
    }

    const rateInfo: RateInfo = {
      annualCollateralYield: annualCollateralYield,
      annualBorrowRate: Number(annualBorrowRate),
      annualLenderAssetYield: 0, // TODO: lender asset yield needs to be tracked
      reserveFactor: Number(reserveFactor), // TODO: is this the correct reserveFactor
      annualMinimumBaseRate: Number(annualMinimumBaseRate),
      annualMinimumKinkRate: Number(annualMinimumKinkRate),
      annualAdjustedBaseRate: Number(annualAdjustedBaseRate),
      annualMinimumAboveKinkSlope: Number(annualMinimumAboveKinkSlope),
      annualAdjustedAboveKinkSlope: Number(annualAdjustedAboveKinkSlope),
      adjustedProfitMargin: Number(adjustedProfitMargin),
      optimalUtilizationRate: Number(optimalUtilizationRate),
    }

    const marketInfo: MarketInfo = {
      tvlInfo: tvlInfo,
      oracleInfo: oracleInfo,
      paramsInfo: paramsInfo,
      lenderPoolInfo: lenderPoolInfo,
      rateInfo: rateInfo,
    }

    return marketInfo
  }

  return (
    <MarketsContext.Provider
      value={{
        marketData: marketInfo,
        userData: userInfo,
        trigger: trigger,
        setTrigger: setTrigger,
      }}
    >
      {children}
    </MarketsContext.Provider>
  )
}

export const useMarkets = () => useContext<MarketsContextProps>(MarketsContext)
