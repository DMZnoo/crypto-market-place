import { Asset, DEBOUNCE_TIME, markets } from '@/config'
import { useApp } from '@/contexts/AppProvider'
import { useAssetValue } from '@/contexts/AssetValueProvider'
import { useMarkets } from '@/contexts/MarketsProvider'
import { useTheme } from '@/contexts/ThemeProvider'
import { useWhitelist } from '@/contexts/WhitelistProvider'
import useAccountInfo from '@/hooks/useAccountInfo'
import { HandleSendTransaction } from '@/hooks/useTransaction'
import { UserPositionInfo } from '@/hooks/useUserPositionInfo'
import { WeEth, WstEth } from '@/libs/icons/src/lib/icons'
import { WAD, formatBigInt, strToBigInt } from '@/utils/number'
import { IonHandlerBase } from '@/utils/strategies/IonHandlerBase'
import { classNames } from '@/utils/util'
import { Tab } from '@headlessui/react'
import { debounce } from 'lodash'
import { useEffect, useRef, useState } from 'react'
import { mainnet, useNetwork } from 'wagmi'
import AmountInput from '../AmountInput'
import UserInputError, { UserInputErrorType } from '../UserInputError'
import Button from '../common/Button'
import Card from '../common/Card'

interface IAddRemoveCapitalPositionCard {
  marketId: number
  asset: Asset
  currUserPositionInfo: UserPositionInfo | null
  newUserPositionInfo: UserPositionInfo | null
  leverageMultiplierTarget: number | null
  localLeverageMultiplierTarget: number | null
  resultingCollateralAmount: bigint | null
  resultingBorrowAmount: bigint | null
  setLeverageMultiplierTarget: (val: number) => void
  setLocalLeverageMultiplierTarget: (val: number) => void
  setResultingBorrowAmount: (val: bigint) => void
  setResultingCollateralAmount: (val: bigint) => void
  handleSendTransaction: HandleSendTransaction
  newTotalCollateral: bigint | null
  newTotalDebt: bigint | null
  setNewTotalCollateral: any
  setNewTotalDebt: any
  showResultingInfo: boolean
}
const enum Fields {
  Deposit = 'Deposit',
  Repay = 'Repay',
  Withdraw = 'Withdraw',
}
const enum Tabs {
  Deposit = 'Deposit',
  RepayAndWithdraw = 'Repay & Withdraw',
}

const tabsArray = [Tabs.Deposit, Tabs.RepayAndWithdraw]

const AddRemoveCapitalPositionCard = ({
  marketId,
  asset,
  currUserPositionInfo,
  newUserPositionInfo,
  leverageMultiplierTarget,
  resultingCollateralAmount,
  resultingBorrowAmount,
  localLeverageMultiplierTarget,
  setResultingBorrowAmount,
  setResultingCollateralAmount,
  setLeverageMultiplierTarget,
  setLocalLeverageMultiplierTarget,
  handleSendTransaction,
  newTotalCollateral,
  newTotalDebt,
  setNewTotalCollateral,
  setNewTotalDebt,
  showResultingInfo,
}: IAddRemoveCapitalPositionCard) => {
  const [submitTxButtonLoading, setSubmitTxButtonLoading] =
    useState<boolean>(false)
  const [closePositionButtonLoading, setClosePositionButtonLoading] =
    useState<boolean>(false)

  const [userInputError, setUserInputError] = useState<
    UserInputErrorType[] | null
  >(null)
  const [depositAmt, setDepositAmt] = useState<string>('0')
  const [repayAmt, setRepayAmt] = useState<string>('0')
  const [withdrawAmt, setWithdrawAmt] = useState<string>('0')
  const [leveragedDepositAmt, setLeveragedDepositAmt] = useState<bigint>(
    BigInt(0)
  )
  // for all Tabs
  const [resultingWalletCollateral, setResultingWalletCollateral] = useState<
    bigint | null
  >(null)
  const [resultingWalletWeth, setResultingWalletWeth] = useState<bigint | null>(
    null
  )
  const [debtToPayBack, setDebtToPayBack] = useState<bigint | null>(BigInt(0)) // without slippage
  const [selectedTab, setSelectedTab] = useState<Tabs>(Tabs.Deposit)

  const [localRepayAmt, setLocalRepayAmt] = useState(repayAmt)
  const [localWithdrawAmt, setLocalWithdrawAmt] = useState(withdrawAmt)

  const [isTyping, setIsTyping] = useState<boolean>(false)
  const [slippagePerc, setSlippagePerc] = useState<number>(0.01)
  const updatingRef = useRef<'user' | 'program'>('program')

  const { marketData, userData } = useMarkets()
  const { chain: returnedChain } = useNetwork()
  const chain = returnedChain === undefined ? mainnet : returnedChain
  const { address } = useAccountInfo()
  const { publicClient, walletClient } = useApp()
  const { whitelistInfos } = useWhitelist()

  // the strategy class instance
  const [ionHandlerBase, setIonHandlerBase] = useState<IonHandlerBase | null>(
    null
  )

  const { assetValue } = useAssetValue()

  const reset = () => {
    if (userData === null || userData[marketId] === null) return

    setDepositAmt('0')
    setRepayAmt('0')
    setWithdrawAmt('0')
    const currCollateral =
      userData[marketId]?.userVaultInfo.collateral ?? BigInt(0)
    const currDebt = userData[marketId]?.userVaultInfo.debt ?? BigInt(0)
    setNewTotalCollateral(currCollateral)
    setNewTotalDebt(currDebt)
  }
  /**
   * Reset all inputs when deposit and repay & withdraw tabs change
   */
  useEffect(() => {
    reset()
  }, [selectedTab])

  useEffect(() => {
    if (
      address === null ||
      marketId === null ||
      walletClient === null ||
      handleSendTransaction === null ||
      userData === null ||
      userData[marketId] === null
    )
      return

    const ionHandlerBase = new IonHandlerBase(
      address,
      marketId,
      chain.id,
      walletClient,
      userData[marketId]!.userVaultInfo,
      handleSendTransaction
    )
    setIonHandlerBase(ionHandlerBase)
  }, [address, marketId, walletClient, handleSendTransaction, userData])

  const { theme } = useTheme()

  /**
   * Update newTotalCollateral and newTotalDebt based on input amounts
   * deposit input changes newTotalCollateral
   * repay input changes newTotalDebt
   * withdraw input change newTotalCollateral
   */
  useEffect(() => {
    if (userData === null || userData[marketId] === null) return

    const currCollateral =
      userData[marketId]?.userVaultInfo.collateral ?? BigInt(0)
    if (selectedTab === Tabs.Deposit) {
      const depositAmtBigInt = strToBigInt(depositAmt, 18)
      const newTotalCollateralToSet = currCollateral + depositAmtBigInt
      setNewTotalCollateral(newTotalCollateralToSet)
    } else if (selectedTab === Tabs.RepayAndWithdraw) {
      const currDebt = userData[marketId]?.userVaultInfo.debt ?? BigInt(0)
      const debtDecrease = strToBigInt(repayAmt, 18)
      const newTotalDebtToSet = currDebt - debtDecrease

      const collateralDecrease = strToBigInt(withdrawAmt, 18)
      const newTotalCollateralToSet = currCollateral - collateralDecrease

      setNewTotalDebt(newTotalDebtToSet)
      setNewTotalCollateral(newTotalCollateralToSet)
    }
  }, [depositAmt, repayAmt, withdrawAmt])

  useEffect(() => {
    const textInput = document.getElementById('leverage-text-input')
    if (textInput) {
      textInput.textContent = '0'
    }
  }, [selectedTab])

  useEffect(() => {
    const textInput = document.getElementById('leverage-text-input')
    if (textInput) {
      textInput.textContent = String(leverageMultiplierTarget)
    }
  }, [leverageMultiplierTarget])

  const handleDeposit = async () => {
    const depositAmtBigInt = strToBigInt(depositAmt, 18)

    if (whitelistInfos === null) return false
    const proof: string[] = whitelistInfos[marketId]?.borrowerProof ?? []

    if (ionHandlerBase === null) {
      return
    }
    await ionHandlerBase.depositAndBorrow(depositAmtBigInt, BigInt(0), proof)
    setSubmitTxButtonLoading(false)
    reset()
  }
  // if repay amount is equal to fullrepay, then use the
  // `fullRepayAndWithdraw` function
  // else, use normal repayAndWithdraw
  const handleRepayAndWithdraw = async () => {
    const withdrawAmtBigInt = strToBigInt(withdrawAmt, 18)
    const repayAmtBigInt = strToBigInt(repayAmt, 18)
    if (
      userData === null ||
      userData[marketId] === null ||
      ionHandlerBase === null
    )
      return
    if (repayAmtBigInt === userData[marketId]!.userVaultInfo.debt) {
      // full repay, withdraw specified
      await ionHandlerBase.repayFullAndWithdraw(withdrawAmtBigInt)
    } else {
      await ionHandlerBase.repayAndWithdraw(repayAmtBigInt, withdrawAmtBigInt)
    }
    setSubmitTxButtonLoading(false)
    reset()
  }

  /**
   * For Earn/Leverage/Deleverage Tab
   */
  const handleDepositButton = async () => {
    if (selectedTab === 'Deposit') {
      handleDeposit()
    } else if (selectedTab === 'Repay & Withdraw') {
      // if repay amount is equal to fullrepay, then use the
      // `fullRepayAndWithdraw` function
      // else, use normal repayAndWithdraw
      handleRepayAndWithdraw()
    }
  }

  /**
   * Fully repay all debt and withdraw all collateral
   */
  const handleClosePositionButton = async () => {
    if (
      userData === null ||
      userData[marketId] === null ||
      ionHandlerBase === null
    ) {
      return
    }

    const currCollateralAmt = userData[marketId]!.userVaultInfo.collateral
    const fullWithdrawAmount = currCollateralAmt

    await ionHandlerBase.repayFullAndWithdraw(fullWithdrawAmount)
    setClosePositionButtonLoading(false)
    reset()
  }

  const debouncedLeverageMultiplierTarget = debounce((value: number) => {
    setIsTyping(false)
    updatingRef.current = 'user'
    setLeverageMultiplierTarget(value)
  }, DEBOUNCE_TIME)

  // TODO: delete?
  // /**
  //  * Show 'after' info, advanced details, and resulting position info
  //  * if the user is done typing and the strategy data is finished loading.
  //  * Also only set true when all variables have loaded.
  //  */
  // const showResultingInfo = (): boolean => {
  //   if (
  //     depositAmt !== null &&
  //     userIlkInfo !== null &&
  //     userVaultInfo !== null &&
  //     // resultingWalletCollateral !== null &&
  //     // resultingWalletWeth !== null &&
  //     // resultingBorrowAmount !== null &&
  //     // resultingCollateralAmount !== null &&
  //     isTyping === false &&
  //     currUserPositionInfo !== null &&
  //     newUserPositionInfo !== null
  //     // TODO: add strategy null value check here
  //   ) {
  //     return true
  //   } else {
  //     return false
  //   }
  // }

  // returns the max value for deposit or repay and withdraw
  // deposit -> total collateral token balance
  // repay -> min(full repay amount, total lender token balance)
  // withdraw ->
  //  1. Changes based on the repay input
  //  2. total collateral that can be withdrawn to get to max LTV
  //  2.
  const getInputMax = (field: Fields): bigint => {
    // current balance
    if (
      userData === null ||
      userData[marketId] === null ||
      marketData === null ||
      assetValue === null ||
      chain === undefined
    ) {
      return BigInt(0)
    }

    const totalDebt = userData[marketId]!.userVaultInfo.debt
    const maxLTV = marketData[marketId]!.paramsInfo.maxLtv

    if (field === Fields.Deposit) {
      const collateralTokenBalance =
        userData[marketId]!.userWalletInfo.collateralTokenBalance
      return collateralTokenBalance
    }
    if (field === Fields.Repay) {
      const maxRepayAmount = userData[marketId]!.userVaultInfo.debt
      return maxRepayAmount
    }
    if (field === Fields.Withdraw) {
      // debtAfterRepay = debtAmount - repayamount
      // debtAfterRepay / (currCollateral - withdrawAmount) = maxLTV
      // debtAfterRepay / maxLTV = currCollateral - withdrawAmount
      // debtAfterRepay / maxLTV - currCollateral = - withdrawAmount
      // currCollateral - debtAfterRepay / maxLTV / spotPrice = withdrawAmount

      const repayAmtBigInt = strToBigInt(repayAmt, 18) // [wad]
      const currCollateralAmt = userData[marketId]!.userVaultInfo.collateral

      if (repayAmtBigInt === userData[marketId]!.userVaultInfo.debt) {
        return currCollateralAmt
      }

      const collateralAsset = markets[chain.id][marketId].collateralAsset
      const collateralSpotPrice =
        assetValue[collateralAsset]!.marketPriceInLenderAsset!

      const maxLTVBigInt = strToBigInt(maxLTV.toString(), 18) // [wad]

      const debtAfterRepay = totalDebt - repayAmtBigInt
      const divided =
        (((debtAfterRepay * WAD) / maxLTVBigInt) * WAD) / collateralSpotPrice
      const maxWithdrawAmount = currCollateralAmt - divided
      return maxWithdrawAmount - BigInt(100) // TODO: Get exact rounding error required to not violate LTV
    } else {
      return BigInt(0)
    }
  }

  /**
   * Returns values for maximum possible values for the top input component
   * @returns bigint for pure value and string to specify units
   */
  // const getInputMax = (selected: string): [bigint, string] => {
  //   let maxBigInt = BigInt(0)
  //   let maxString = ''
  //   if (currUserPositionInfo !== null && userIlkInfo !== null) {
  //     if (selected === 'Deposit') {
  //       if (userIlkInfo[asset] != null) {
  //         maxBigInt = userIlkInfo[asset]
  //         maxString = formatBigInt(maxBigInt, 18, 4) + ' ' + asset.toString()
  //       }
  //     } else if (selected === 'Repay') {
  //       maxBigInt = currUserPositionInfo.capital.borrowedCapital
  //       maxString = formatBigInt(maxBigInt, 18, 4) + ' ETH'
  //     } else {
  //       if (
  //         currUserPositionInfo !== null &&
  //         newUserPositionInfo !== null &&
  //         ilkMaxLTVInfo !== null &&
  //         collateralExchangeRate !== null
  //       ) {
  //         const maxLtv: number = parseFloat(
  //           (ilkMaxLTVInfo[asset] * 0.9).toFixed(2)
  //         )
  //         // withdraw amount
  //         // calculate assuming that repay amount may be non-zero
  //         // new total debt / [(curr total collateral - max withdraw amount) * exchange rate]  = LTV
  //         // max withdraw amount = curr total collateral - new total debt / LTV / exchange rate
  //         const firstDivide =
  //           (newUserPositionInfo.capital.borrowedCapital * BigInt(100)) /
  //           BigInt(maxLtv * 100)

  //         const secondDivide =
  //           (firstDivide * BigInt(1e18)) / collateralExchangeRate[asset]
  //         const maxWithdrawAmt =
  //           currUserPositionInfo.vault.collateral - secondDivide

  //         maxBigInt = maxWithdrawAmt
  //         maxString = formatBigInt(maxBigInt, 18, 4) + ' ' + asset
  //       }
  //     }
  //   }
  //   return [maxBigInt, maxString]
  // }

  // populates the Deposit Amount input field with max value
  const handleInputMaxButton = async (field: Fields) => {
    updatingRef.current = 'user'
    if (field === Fields.Deposit) {
      setDepositAmt(formatBigInt(getInputMax(field), 18, 18))
    } else if (field === Fields.Repay) {
      setRepayAmt(formatBigInt(getInputMax(field), 18, 18))
    } else if (field === Fields.Withdraw) {
      setWithdrawAmt(formatBigInt(getInputMax(field), 18, 18))
    }
  }

  return (
    <Card className="drop-shadow-none">
      <div className="border border-gray-100 dark:border-dark-primary-700 rounded p-4 pb-10">
        <Tab.Group
          selectedIndex={tabsArray.indexOf(selectedTab)}
          onChange={(index) => {
            setSelectedTab(tabsArray[index])
            setRepayAmt('0')
            setLocalRepayAmt('0')
            setWithdrawAmt('0')
            setLocalWithdrawAmt('0')
            setDepositAmt('0')
          }}
        >
          <Tab.List
            className={`mb-4 flex space-x-1 rounded-lg bg-gray-50 border border-gray-200 dark:border-dark-primary-700 p-1 dark:bg-dark-primary-900 bg-gray-300`}
          >
            {tabsArray.map((category) => (
              <Tab
                key={category}
                className={({ selected }) => {
                  return classNames(
                    'w-full rounded-lg py-1 text-sm leading-5 text-blue-700 outline-none',
                    selected
                      ? 'bg-white dark:bg-dark-primary-700'
                      : 'text-gray-500 dark:bg-dark-primary-900'
                  )
                }}
              >
                {category}
              </Tab>
            ))}
          </Tab.List>
        </Tab.Group>
        {/* <div className="flex justify-between"> */}
        <div className="mt-8">
          {selectedTab === Tabs.Deposit ? (
            <>
              <div className="flex items-center justify-between mb-2">
                Deposit Amount
                <p className="text-[12px] text-gray-500">
                  Your Balance:{' '}
                  {formatBigInt(getInputMax(Fields.Deposit), 18, 4)}
                </p>
              </div>
              <div
                className={`p-1 outline-gray-200 ${
                  userInputError?.some(
                    (error) => error.borderRed.topAmountInput
                  )
                    ? 'border border-warning-main'
                    : 'dark:border-none'
                } drop-shadow bg-white dark:bg-dark-primary-700 rounded relative flex`}
              >
                <AmountInput
                  value={depositAmt}
                  // setValue={handleFirstInputAmt}
                  // setValue={(e) => {
                  //   updatingRef.current = 'user'
                  //   setFirstInputAmt(e)
                  // }}
                  setValue={setDepositAmt}
                  localValue={depositAmt}
                  setLocalValue={setDepositAmt}
                  isTyping={isTyping}
                  setIsTyping={setIsTyping}
                  className="w-full font-bold text-lg 2xl:text-2xl rounded dark:bg-dark-primary-600 outline-none pl-2 h-10"
                />
                <div className="min-w-fit flex items-center px-1">
                  <Button
                    className="w-10 px-1 hover:text-white border-gray text-gray-400 font-light h-6 text-[12px] rounded-md dark:bg-dark-primary-900"
                    onClick={() => handleInputMaxButton(Fields.Deposit)}
                  >
                    MAX
                  </Button>
                  <hr className="block h-[24px] w-[0.1px] ml-2 mr-1 border-l-[0.1px] border-gray-200 dark:border-gray-400 rounded" />
                  <div className="flex items-center">
                    <>
                      {/* TODO: Should have a generalized rendere for all token graphics */}
                      {markets[chain.id][marketId].collateralAsset ===
                        'weETH' && <WeEth className="scale-[90%]" />}
                      <p className="text-sm pt-[0.5px] pt-1">
                        {markets[chain.id][marketId].collateralAsset}
                      </p>
                    </>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between mb-2">
                Repay Amount
                <p className="text-[12px] text-gray-500">
                  Max: {formatBigInt(getInputMax(Fields.Repay), 18, 4)}
                </p>
              </div>
              <div
                className={`p-1 outline-gray-200 ${
                  userInputError?.some(
                    (error) => error.borderRed.topAmountInput
                  )
                    ? 'border border-warning-main'
                    : 'dark:border-none'
                } drop-shadow bg-white dark:bg-dark-primary-700 rounded relative flex`}
              >
                <AmountInput
                  value={repayAmt}
                  // setValue={handleFirstInputAmt}
                  // setValue={(e) => {
                  //   updatingRef.current = 'user'
                  //   setFirstInputAmt(e)
                  // }}
                  setValue={setRepayAmt}
                  localValue={localRepayAmt}
                  setLocalValue={setLocalRepayAmt}
                  isTyping={isTyping}
                  setIsTyping={setIsTyping}
                  className="w-full font-bold text-lg 2xl:text-2xl rounded dark:bg-dark-primary-600 outline-none pl-2 h-10"
                />
                <div className="min-w-fit flex items-center px-1">
                  <Button
                    className="w-10 px-1 hover:text-white border-gray text-gray-400 font-light h-6 text-[12px] rounded-md dark:bg-dark-primary-900"
                    onClick={() => handleInputMaxButton(Fields.Repay)}
                  >
                    MAX
                  </Button>
                  <hr className="block h-[24px] w-[0.1px] ml-2 mr-1 border-l-[0.1px] border-gray-200 dark:border-gray-400 rounded" />
                  <div className="flex items-center">
                    <>
                      {asset === 'wstETH' && <WstEth className="scale-[90%]" />}
                      <p className="text-sm pt-[0.5px] pt-1">{asset}</p>
                    </>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between mt-4">
                Withdraw Amount
                <p className="text-[12px] text-gray-500">
                  Your Balance:{' '}
                  {formatBigInt(getInputMax(Fields.Withdraw), 18, 4)}
                </p>
              </div>
              <div
                className={`p-1 outline-gray-200 ${
                  userInputError?.some(
                    (error) => error.borderRed.topAmountInput
                  )
                    ? 'border border-warning-main'
                    : 'dark:border-none'
                } drop-shadow bg-white dark:bg-dark-primary-700 rounded relative flex`}
              >
                <AmountInput
                  value={withdrawAmt}
                  // setValue={handleFirstInputAmt}
                  // setValue={(e) => {
                  //   updatingRef.current = 'user'
                  //   setFirstInputAmt(e)
                  // }}
                  setValue={setWithdrawAmt}
                  localValue={localWithdrawAmt}
                  setLocalValue={setLocalWithdrawAmt}
                  isTyping={isTyping}
                  setIsTyping={setIsTyping}
                  className="w-full font-bold text-lg 2xl:text-2xl rounded dark:bg-dark-primary-600 outline-none pl-2 h-10"
                />
                <div className="min-w-fit flex items-center px-1">
                  <Button
                    className="w-10 px-1 hover:text-white border-gray text-gray-400 font-light h-6 text-[12px] rounded-md dark:bg-dark-primary-900"
                    onClick={() => handleInputMaxButton(Fields.Withdraw)}
                  >
                    MAX
                  </Button>
                  <hr className="block h-[24px] w-[0.1px] ml-2 mr-1 border-l-[0.1px] border-gray-200 dark:border-gray-400 rounded" />
                  <div className="flex items-center">
                    <>
                      {/* TODO: Conditionally render correct token image based on the collateral asset of the pair */}
                      {<WeEth className="scale-[90%]" />}
                      <p className="text-sm pt-[0.5px] pt-1">
                        {markets[chain.id][marketId].collateralAsset}
                      </p>
                    </>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      <UserInputError
        marketId={marketId}
        errors={userInputError}
        setErrors={setUserInputError}
        selectedTab={
          selectedTab === Tabs.RepayAndWithdraw ? 'Repay' : 'Deposit'
        } // receives 'Deposit' or 'Repay'
        currUserPositionInfo={currUserPositionInfo}
        newUserPositionInfo={newUserPositionInfo}
        newTotalCollateral={newTotalCollateral}
        newTotalDebt={newTotalDebt}
        repayInput={strToBigInt(repayAmt, 18)}
        withdrawInput={strToBigInt(withdrawAmt, 18)}
        depositInput={strToBigInt(depositAmt, 18)}
      />
      <Button
        variant={
          userInputError !== null ||
          !showResultingInfo ||
          closePositionButtonLoading
            ? 'disabled'
            : 'static'
        }
        className="mt-4 w-full p-2 leading-loose"
        onClick={(e) => {
          setSubmitTxButtonLoading(true)
          handleDepositButton()
        }}
        loading={submitTxButtonLoading}
        loadingMsg={'Sending Transaction...'}
      >
        {selectedTab === 'Deposit' ? 'Deposit' : 'Repay & Withdraw'}
      </Button>
      {selectedTab === 'Repay & Withdraw' && (
        <div className={`w-full flex justify-center mt-4`}>
          <Button
            variant={submitTxButtonLoading ? 'disabled' : 'hover'}
            className={
              'w-1/2 p-2 leading-loose bg-white dark:bg-dark-primary-900 border dark:border-dark-primary-600'
            }
            onClick={async (e) => {
              setClosePositionButtonLoading(true)
              handleClosePositionButton()
            }}
            loading={closePositionButtonLoading}
            loadingMsg={'Closing Position...'}
          >
            Close Position
          </Button>
        </div>
      )}
      <div className="flex flex-col gap-2 bg-gray-50 rounded mt-4 p-2 bg-gray-50 dark:bg-dark-primary-600">
        <div className="flex justify-between w-full">
          <p>Current Collateral</p>
          <p>
            {userData !== null ? (
              <>
                {formatBigInt(
                  userData[marketId]?.userVaultInfo.collateral ?? BigInt(0),
                  18,
                  4
                )}{' '}
                {markets[chain.id][marketId].collateralAsset}
              </>
            ) : (
              'show skeleton'
            )}
          </p>
        </div>
        <div className="flex justify-between w-full">
          <p>Current Debt</p>
          <p>
            {userData !== null ? (
              <>
                {formatBigInt(
                  userData[marketId]?.userVaultInfo.debt ?? BigInt(0),
                  18,
                  4
                )}{' '}
                {markets[chain.id][marketId].lenderAsset}
              </>
            ) : (
              'show skeleton'
            )}
          </p>
        </div>
        <div className="flex justify-between w-full">
          <p>Resulting Collateral</p>
          <p className="flex flex-row">
            {showResultingInfo && newTotalCollateral !== null ? (
              formatBigInt(newTotalCollateral, 18, 4)
            ) : (
              <div
                className={`block p-2 rounded-md bg-gray-200 animate-pulse w-full`}
              />
            )}{' '}
            {markets[chain.id][marketId].collateralAsset}
          </p>
        </div>
        <div className="flex justify-between w-full">
          <p>Resulting Debt</p>
          <p>
            {showResultingInfo && newTotalDebt !== null
              ? formatBigInt(newTotalDebt, 18, 4)
              : 'Loading...'}{' '}
            {markets[chain.id][marketId].lenderAsset}
          </p>
        </div>
        <div className="flex justify-between w-full">
          <p>Resulting LTV</p>
          <p>
            {!showResultingInfo || newUserPositionInfo === null ? (
              <div>show skeleton</div>
            ) : (
              <div>
                {(newUserPositionInfo.vault.ltv * 100).toFixed(2) + '%'}
              </div>
            )}
          </p>
        </div>
        <div className="flex justify-between w-full">
          <p>Liquidation Exchange Rate</p>
          <p>
            {!showResultingInfo || newUserPositionInfo === null ? (
              <div>show skeleton</div>
            ) : (
              <div>
                {formatBigInt(
                  newUserPositionInfo.vault.liquidationExchangeRate,
                  18,
                  2
                )}{' '}
                {`ETH\/${markets[chain.id][marketId].collateralAsset}`}
              </div>
            )}
          </p>
        </div>
      </div>
    </Card>
  )
}

export default AddRemoveCapitalPositionCard
