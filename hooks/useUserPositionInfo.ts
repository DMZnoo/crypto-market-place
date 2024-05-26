import { markets } from '@/config'
import { useAssetValue } from '@/contexts/AssetValueProvider'
import { useMarkets } from '@/contexts/MarketsProvider'
import { WAD, formatBigInt } from '@/utils/number'
import { useEffect, useState } from 'react'
import { mainnet, useNetwork } from 'wagmi'

// can be formatted in a desired way to be displayed
// asset values are denominated in ETH
export type UserPositionInfo = {
  // leverage info
  capital: {
    myCapital: bigint
    borrowedCapital: bigint
    totalCapital: bigint
    myCapitalInETH: bigint
    borrowedCapitalInETH: bigint
    totalCapitalInETH: bigint
  }
  leverage: {
    minLeverageMultiplier: number
    currLeverageMultiplier: number
    maxLeverageMultiplier: number
  }
  borrowingPower: {
    currUsedBorrowingPower: bigint
    currUsedBorrowingPowerPerc: number
    maxBorrowingPower: bigint
  }
  yield: {
    annualStakingYield: number
    annualBorrowRate: number
    leveragedStakingYield: number

    annualStakingYieldAmt: bigint
    annualBorrowRateAmt: bigint
    annualProfitsAmt: bigint
  }
  vault: {
    collateral: bigint // in asset denomination, not in ETH
    debt: bigint
    ltv: number
    liquidationExchangeRate: bigint
  }
}

// raw value inputs
export type UserPositionProps = {
  marketId: number
  totalDeposits: bigint | null // in collateral asset amount
  totalBorrows: bigint | null // in ETH
}

export const getDollarPerEth = () => {}

const useUserPositionInfo = (props: UserPositionProps) => {
  const [userPositionInfo, setUserPositionInfo] =
    useState<UserPositionInfo | null>(null)
  const { marketData } = useMarkets()
  const { assetValue, assetApy } = useAssetValue()
  const { chain: returnedChain } = useNetwork()
  const chain = returnedChain === undefined ? mainnet : returnedChain

  // update values only when user input changes
  useEffect(() => {
    const userPositionInfo = calcUserPositionInfo(props)
    setUserPositionInfo(userPositionInfo)
  }, [
    marketData,
    assetValue,
    assetApy,
    props.totalBorrows,
    props.totalDeposits,
  ])

  /**
   * Calculate information about the user's current position.
   */
  const calcUserPositionInfo = (
    props: UserPositionProps
  ): UserPositionInfo | null => {
    if (
      marketData === null ||
      assetValue === null ||
      assetApy === null ||
      props.totalBorrows === null ||
      props.totalDeposits === null
    ) {
      return null
    }

    return calcPositionDetails(props)
  }

  /**
   * Calculates everything from market params, totalCapital and borrowedCapital.
   * Collateral asset is first converted to be denominated in the lender asset terms using
   * the market price, and both the collateral asset and the lender assets are
   * converted to be in ETH terms using the exchange rate.
   * @param props
   * @returns
   */
  const calcPositionDetails = (
    props: UserPositionProps
  ): UserPositionInfo | null => {
    // converting asset quantity to ETH values
    const collateralAsset = markets[chain.id][props.marketId].collateralAsset
    const collateralExchangeRate = assetValue![collateralAsset]!.exchangeRate
    const collateralPrice =
      assetValue![collateralAsset]?.marketPriceInLenderAsset!

    const lenderAsset = markets[chain.id][props.marketId].lenderAsset
    const lenderAssetExchangeRate = assetValue![lenderAsset]!.exchangeRate

    const maxLtv = marketData![props.marketId]!.paramsInfo.maxLtv

    const annualProtocolBorrowRate =
      marketData![props.marketId]!.rateInfo.annualBorrowRate
    const annualCollateralYieldRate = assetApy![collateralAsset]
    // const annualCollateralYieldRate = marketData![props.marketId]!.rateInfo.annualCollateralYield
    const annualLenderAssetYieldRate = assetApy![lenderAsset]

    // TODO: when this throws null, it doesn't rerender
    if (
      annualCollateralYieldRate === null ||
      annualLenderAssetYieldRate === null
    )
      return null

    // annualBorrowRate is (1 + annualProtocolBorrowRate) * (1 + annualLenderAssetYieldRate) - 1
    const annualNetBorrowRate =
      (1 + annualProtocolBorrowRate) * (1 + annualLenderAssetYieldRate / 100) -
      1

    const annualBorrowRate = annualNetBorrowRate

    const liquidationthreshold =
      marketData![props.marketId]!.paramsInfo.liquidationThreshold

    const totalCapital = (props.totalDeposits! * collateralPrice) / WAD
    const borrowedCapital = props.totalBorrows!

    const myCapital = totalCapital - borrowedCapital

    const minLeverageMultiplier = 1
    const maxLeverageMultiplier = Number((1 / (1 - maxLtv)).toFixed(2))

    let currLeverageMultiplierBigInt
    let currLeverageMultiplier = 1
    if (myCapital == BigInt(0)) {
      currLeverageMultiplierBigInt = BigInt(1e18)
    } else {
      currLeverageMultiplierBigInt = (totalCapital * BigInt(1e18)) / myCapital
      currLeverageMultiplier = Number(currLeverageMultiplierBigInt) / 1e18
    }

    const bigIntMaxLeverageMultiplier = BigInt(maxLeverageMultiplier * 100) // 2 precision
    // maximum amount that you can borrow given current capital
    const maxBorrowingPower =
      (myCapital * bigIntMaxLeverageMultiplier) / BigInt(100) - myCapital
    const currUsedBorrowingPower = borrowedCapital

    //
    const currUsedBorrowingPowerPerc =
      maxBorrowingPower === BigInt(0)
        ? 0
        : 100 *
          Number(
            formatBigInt((borrowedCapital * WAD) / maxBorrowingPower, 18, 2)
          )
    const annualStakingYield = annualCollateralYieldRate / 100

    // const annualStakingYieldAmt = 1
    const annualBorrowRateAmt =
      (BigInt(annualBorrowRate * 1e27) * borrowedCapital) / BigInt(1e27)

    const annualStakingYieldAmt =
      (BigInt(annualStakingYield * 1e27) * totalCapital) / BigInt(1e27)

    const annualProfitsAmt = annualStakingYieldAmt - annualBorrowRateAmt

    const leveragedStakingYield =
      Number(myCapital) > 0
        ? (Number(annualProfitsAmt) / Number(myCapital)) * 100
        : 0

    // ltv = debt in weth / (collateralAmount * exchange rate)
    // TODO: Do we want to display n/a or 0 for ltv when divide by zero
    const ltv =
      totalCapital === BigInt(0)
        ? 0
        : Number((borrowedCapital * BigInt(1e18)) / totalCapital) / 1e18

    // liquidationThreshold = debt in weth / (collateralAmount * liquidationExchangeRate)
    // liquidationExchangeRate = debt in weth / liquidationThreshold / collateralAmount
    // liquidationThreshold is in decimal form
    let liquidationExchangeRate: bigint = BigInt(0)
    if (totalCapital !== BigInt(0)) {
      liquidationExchangeRate =
        (((borrowedCapital * WAD * BigInt('100')) /
          (BigInt(liquidationthreshold * 100) * WAD)) *
          WAD) /
        totalCapital
    }

    const myCapitalInETH = (myCapital * lenderAssetExchangeRate) / WAD
    const borrowedCapitalInETH =
      (borrowedCapital * lenderAssetExchangeRate) / WAD
    const totalCapitalInETH = (totalCapital * lenderAssetExchangeRate) / WAD

    const userPositionInfo: UserPositionInfo = {
      capital: {
        myCapital: myCapital,
        borrowedCapital: borrowedCapital,
        totalCapital: totalCapital,
        myCapitalInETH: myCapitalInETH,
        borrowedCapitalInETH: borrowedCapitalInETH,
        totalCapitalInETH: totalCapitalInETH,
      },
      leverage: {
        minLeverageMultiplier: minLeverageMultiplier,
        currLeverageMultiplier: currLeverageMultiplier,
        maxLeverageMultiplier: maxLeverageMultiplier,
      },
      borrowingPower: {
        currUsedBorrowingPower: currUsedBorrowingPower,
        currUsedBorrowingPowerPerc: currUsedBorrowingPowerPerc,
        maxBorrowingPower: maxBorrowingPower,
      },
      yield: {
        annualStakingYield: annualStakingYield,
        annualBorrowRate: annualBorrowRate,
        leveragedStakingYield: leveragedStakingYield,
        annualStakingYieldAmt: annualStakingYieldAmt,
        annualBorrowRateAmt: annualBorrowRateAmt,
        annualProfitsAmt: annualProfitsAmt,
      },
      vault: {
        collateral: props.totalDeposits!,
        debt: props.totalBorrows!,
        ltv: ltv,
        liquidationExchangeRate: liquidationExchangeRate,
      },
    }

    return userPositionInfo
  }
  // [
  //   props.annualBorrowRate,
  //   props.annualStakingYieldRate,
  //   props.ltv,
  //   props.totalBorrows,
  //   props.totalDeposits,
  //   props.exchangeRate
  // ])

  // calculated values TODO: useMemo

  return {
    userPositionInfo,
  }
}

export default useUserPositionInfo
