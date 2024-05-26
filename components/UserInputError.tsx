import { markets } from '@/config'
import { useAssetValue } from '@/contexts/AssetValueProvider'
import { useMarkets } from '@/contexts/MarketsProvider'
import { UserPositionInfo } from '@/hooks/useUserPositionInfo'
import { Tabs } from '@/pages/borrow'
import { WAD, strToBigInt } from '@/utils/number'
import { useEffect, useState } from 'react'
import { mainnet, useNetwork } from 'wagmi'
import AlertComponent from './AlertComponent'
export class CustomError extends Error {
  data: any
  constructor(message: string, data: any) {
    super(message)
    this.data = data
  }
}

export type UserInputErrorType = {
  message: string
  borderRed: {
    topAmountInput?: boolean
    bottomAmountInput?: boolean
    leverageSliderInput?: boolean
  }
  borderYellow?: {
    topAmountInput?: boolean
    leverageSliderInput?: boolean
  }
}

/**
 * Create Position
 * - newTotalCollateral
 * - newTotalDebt
 * Manage Position
 */
export type UserInputErrorProps = {
  marketId: number
  errors: UserInputErrorType[] | null
  setErrors: (error: UserInputErrorType[] | null) => void
  selectedTab: Tabs
  // only for deposit / repay & withdraw tabs
  depositInput?: bigint
  withdrawInput?: bigint
  // borrowInput: bigint // TODO: no borrow yet
  repayInput?: bigint
  // only for create tab
  beforeLeverageDepositInput?: bigint
  // debtToPayBack: bigint | null

  // userIlkInfo: any // wallet balances
  // asset: Asset
  // lenderPoolInfo: LenderPoolInfo | null
  currUserPositionInfo: UserPositionInfo | null
  newUserPositionInfo: UserPositionInfo | null
  // ilkMaxLTVInfo: any
  // ilkDustInfo: IlkInfo | null
  newTotalCollateral: bigint | null
  newTotalDebt: bigint | null
}
/**
 * User input component error cases
 * Create Tab
 * -
 */

/**
 * User input component error cases
 * Create Tab
 * - Deposit is greater than the balance. Consider reducing your deposit amount.
 *      - Red borders on amount input component
 * - Not enough lender liquidity in the ion pool. Consider reducing your deposit amount or the leverage multiplier.
 *      - Red borders on first input component, leverage multiplier,
 * - Resulting LTV is higher than the maximum LTV.
 *      - Red borders on first input component, leverage multiplier
 * - Resulting Debt is lower than the minimum debt requirement. Consider increasing your leverage multiplier.
 *      - Red borders on leverage multiplier
 * Leverage Tab
 * - Borrow amount is greater than your available borrowing power. Consider reducing your borrow amount.
 *      - Red borders on first input component, leverage multiplier
 * - Not enough lender liquidity in the pool. Consider reducing your borrow amount or the leverage multiplier.
 * Deleverage Tab
 * - Repay amount is greater than your total debt. Consider fully closing your position or reducing the repay amount.
 *      - Red borders on first input component and leverage multiplier
 * Borrow Tab
 * - Deposit amount is greater than your asset balance. Consider decreasing the deposit amount.
 *      - Red borders on first input component.
 * - The resulting LTV is higher than the maximum LTV. Consider decreasing the borrow amount or increasing the deposit amount.
 *      - Red borders on first and second input component.
 * Repay & Withdraw Tab
 * - Repay amount is greater than your total debt. Consider fully closing your position or reducing the repay amount.
 *      - Red borders on first input component.
 * - Withdraw amount is greater than your total deposits. Consider fully closing your position or reducing the withdraw amount.
 *      - Red borders on second input component.
 * - The resulting LTV is higher than the maximum LTV. Consider increasing the repay amount or decreasing the withdraw amount.
 *      - Red borders on first input component and second input component.
 *
 * @returns an Error object with a message string that defines which components should be bordered in red.
 */
const UserInputError: React.FC<UserInputErrorProps> = ({
  marketId,
  errors,
  setErrors,
  selectedTab,
  depositInput,
  withdrawInput,
  repayInput,
  beforeLeverageDepositInput,
  currUserPositionInfo,
  newUserPositionInfo,
  newTotalCollateral,
  newTotalDebt,
}) => {
  const [open, setOpen] = useState(false)

  // TODO: use the context here for information
  const { chain: returnedChain } = useNetwork()
  const chain = returnedChain === undefined ? mainnet : returnedChain
  const { marketData, userData } = useMarkets()
  const { assetValue } = useAssetValue()

  /**
   * debtQuantity / collateralQuantity * collateralSpotPrice = debt / collateral denominated in lender asset
   */
  const calculateLTV = (): bigint => {
    if (
      marketId === null ||
      userData === null ||
      userData[marketId] === null ||
      assetValue === null ||
      newTotalCollateral === null ||
      newTotalDebt === null
    )
      return BigInt(0)
    const userVaultCollateral = userData[marketId]!.userVaultInfo.collateral
    const userVaultDebt = userData[marketId]!.userVaultInfo.debt

    const collateralAsset = markets[chain.id][marketId].collateralAsset
    const collateralSpotPrice =
      assetValue[collateralAsset]!.marketPriceInLenderAsset!

    const newTotalCollateralValue =
      (newTotalCollateral * collateralSpotPrice) / WAD
    if (newTotalCollateralValue === BigInt(0)) {
      return BigInt(0)
    }

    const ltv = (newTotalDebt * WAD) / newTotalCollateralValue

    return ltv
  }

  const checkErrors = (): UserInputErrorType[] | null => {
    let error: UserInputErrorType = { message: '', borderRed: {} }
    let errors: UserInputErrorType[] = []

    if (
      marketId === null ||
      marketData === null ||
      marketData[marketId] === null ||
      userData === null ||
      userData[marketId] === null ||
      currUserPositionInfo === null ||
      newUserPositionInfo === null ||
      newTotalDebt === null
    )
      return null

    const userWalletCollateralBalance =
      userData[marketId]!.userWalletInfo.collateralTokenBalance
    const userWalletDebtTokenBalance =
      userData[marketId]!.userWalletInfo.debtTokenBalance

    const userVaultCollateral = userData[marketId]!.userVaultInfo.collateral
    const userVaultDebt = userData[marketId]!.userVaultInfo.debt

    const availableLenderLiquidity =
      marketData[marketId]!.lenderPoolInfo.liquidity

    const maxLTV = marketData[marketId]!.paramsInfo.maxLtv.toString()
    const maxLTVBigInt = strToBigInt(maxLTV, 18)

    // debt in wstETH / (collateral quantity * collateral spot price)
    const ltv = calculateLTV()

    const dust = marketData[marketId]!.paramsInfo.dust

    const changeInDebtQuantity =
      newTotalDebt > userVaultDebt
        ? newTotalDebt - userVaultDebt
        : userVaultDebt - newTotalDebt

    // Add your logic to check for errors based on the selected tab
    // For example, in the Earn tab:
    if (selectedTab === 'Earn') {
      if (beforeLeverageDepositInput === undefined) {
        return null
      }
      if (beforeLeverageDepositInput > userWalletCollateralBalance) {
        errors.push({
          message:
            'Deposit is greater than the balance. Consider reducing your deposit amount!',
          borderRed: {
            topAmountInput: true,
          },
        })
      }
      if (changeInDebtQuantity > availableLenderLiquidity) {
        errors.push({
          message:
            'Not enough lender liquidity in the pool. Consider reducing your deposit amount or the leverage multiplier!',
          borderRed: {
            topAmountInput: true,
            leverageSliderInput: true,
          },
        })
      }
      if (ltv > maxLTVBigInt) {
        errors.push({
          message:
            'Resulting LTV is higher than the maximum LTV. Consider decreasing the leverage multiplier or increasing the deposit amount!',
          borderRed: {
            topAmountInput: true,
            leverageSliderInput: true,
          },
        })
      }

      if (newTotalDebt < dust && beforeLeverageDepositInput !== BigInt(0)) {
        errors.push({
          message:
            'Resulting Debt is lower than the minimum debt requirement. Consider increasing your leverage multiplier!',
          borderRed: {
            leverageSliderInput: true,
          },
        })
      }
      if (beforeLeverageDepositInput === BigInt(0)) {
        errors.push({
          message: 'Input your deposit amount!',
          borderRed: {
            topAmountInput: false,
          },
          borderYellow: {
            topAmountInput: true,
          },
        })
      }
    } else if (selectedTab === 'Leverage') {
      if (ltv > maxLTVBigInt) {
        errors.push({
          message:
            'Borrow amount is greater than your available borrowing power. Consider reducing your leverage amount!',
          borderRed: {
            topAmountInput: true,
            leverageSliderInput: true,
          },
        })
      }
      if (changeInDebtQuantity > availableLenderLiquidity) {
        errors.push({
          message:
            'Not enough lender liquidity in the pool. Consider reducing your borrow amount or the leverage multiplier!',
          borderRed: {
            topAmountInput: true,
            leverageSliderInput: true,
          },
        })
      }
    } else if (selectedTab === 'Deleverage') {
      if (changeInDebtQuantity > userVaultDebt) {
        errors.push({
          message:
            'Repay amount is greater than your total debt. Consider fully closing your position or reducing the repay amount!',
          borderRed: {
            topAmountInput: true,
            leverageSliderInput: true,
          },
        })
      }
    } else if (selectedTab === 'Deposit') {
      if (depositInput === undefined) {
        return null
      }
      if (depositInput > userWalletCollateralBalance) {
        errors.push({
          message:
            'Deposit amount is greater than your asset balance. Consider decreasing the deposit amount.',
          borderRed: {
            topAmountInput: true,
          },
        })
      }
      // if (ltv > maxLTVBigInt) {
      //     errors.push({
      //         message: "The resulting LTV is higher than the maximum LTV. Consider increasing the repay amount or decreasing the withdraw amount.",
      //         borderRed: {
      //             topAmountInput: true,
      //             leverageSliderInput: true
      //         }
      //     })
      // }
    } else if (selectedTab === 'Repay') {
      if (repayInput === undefined || withdrawInput === undefined) {
        return null
      }
      if (repayInput > userVaultDebt) {
        errors.push({
          message:
            'Repay amount is greater than your total debt. Consider fully closing your position or reducing the repay amount!',
          borderRed: {
            topAmountInput: true,
          },
        })
      }
      if (repayInput > userWalletDebtTokenBalance) {
        errors.push({
          message:
            'Repay amount is greater than your WETH balance. Consider decreasing the repay amount or obtaining more WETH!',
          borderRed: {
            topAmountInput: true,
          },
        })
      }
      if (withdrawInput > userVaultCollateral) {
        errors.push({
          message:
            'Withdraw amount is greater than your total deposits. Consider fully closing your position or reducing the withdraw amount!',
          borderRed: {
            bottomAmountInput: true,
          },
        })
      }
      if (ltv > maxLTVBigInt) {
        errors.push({
          message:
            'The resulting LTV is higher than the maximum LTV. Consider increasing the repay amount or decreasing the withdraw amount!',
          borderRed: {
            topAmountInput: true,
            bottomAmountInput: true,
          },
        })
      }
    }

    if (errors.length == 0) {
      return null
    } else {
      return errors
    }
  }

  // Run the checkErrors function to get the current errors
  useEffect(() => {
    const errors = checkErrors()
    setErrors(errors)
  }, [
    selectedTab,
    depositInput,
    withdrawInput,
    repayInput,
    beforeLeverageDepositInput,
    currUserPositionInfo,
    newUserPositionInfo,
    newTotalCollateral,
    newTotalDebt,
  ])

  return (
    <>
      {
        // error !== null && (
        //     <div className="bg-red-100 text-red-500 border-2 border-red-400 rounded-md p-4 mt-6">
        //         {error.message && <p style={{ color: 'red' }}>{error.message}</p>}
        //     </div>
        // )
        errors !== null && errors.length > 0 && (
          <>
            <div className="flex flex-col mt-2">
              <AlertComponent
                showIcon={false}
                warnings={
                  new Set([...Object.values(errors).map((e) => e.message)])
                }
              />
            </div>
          </>
        )
      }
    </>
  )
}

export default UserInputError
