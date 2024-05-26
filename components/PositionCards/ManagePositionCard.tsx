import { Asset, DEBOUNCE_TIME, markets, tokenAddresses } from '@/config'
import { useApp } from '@/contexts/AppProvider'
import { useAssetValue } from '@/contexts/AssetValueProvider'
import { UserVaultInfo, useMarkets } from '@/contexts/MarketsProvider'
import { useTheme } from '@/contexts/ThemeProvider'
import { useWhitelist } from '@/contexts/WhitelistProvider'
import useAccountInfo from '@/hooks/useAccountInfo'
import { TxArgs, TxStatusMessages } from '@/hooks/useTransaction'
import { UserPositionInfo } from '@/hooks/useUserPositionInfo'
import { ChevronLeft, Info, WstEth } from '@/libs/icons/src/lib/icons'
import themes from '@/styles/globals.json'
import { WAD, formatBigInt, strToBigInt } from '@/utils/number'
import {
  LeverageUserInput,
  Strategies,
} from '@/utils/strategies/UniswapFlashswapDirectMint'
import { getLeverageStrategyInstance } from '@/utils/strategies/strategy'
import { classNames } from '@/utils/util'
import { Disclosure, Tab } from '@headlessui/react'
import { debounce } from 'lodash'
import { useCallback, useEffect, useRef, useState } from 'react'
import { mainnet, useNetwork } from 'wagmi'
import AmountInput from '../AmountInput'
import LeverageSliderInput from '../LeverageSliderInput'
import UserInputError, { UserInputErrorType } from '../UserInputError'
import Button from '../common/Button'
import Card from '../common/Card'

interface IManagePositionCard {
  marketId: number
  asset: Asset
  currUserPositionInfo: UserPositionInfo | null
  newUserPositionInfo: UserPositionInfo | null
  leverageMultiplierTarget: number | null
  localLeverageMultiplierTarget: number | null
  setLeverageMultiplierTarget: (val: number) => void
  setLocalLeverageMultiplierTarget: React.Dispatch<
    React.SetStateAction<number | null>
  >
  setShowResultingInfo: (val: boolean) => void
  showResultingInfo: boolean
  setCalculateCostOfCapitalLoading: React.Dispatch<
    React.SetStateAction<boolean>
  >
  newTotalCollateral: bigint | null
  newTotalDebt: bigint | null
  setNewTotalCollateral: any
  setNewTotalDebt: any
  isTyping: boolean
  setIsTyping: React.Dispatch<React.SetStateAction<boolean>>
  handleSendTransaction: (
    txArgs: TxArgs,
    statusMessages: TxStatusMessages,
    showSuccessModal: boolean
  ) => Promise<void>
}

const leverageTabs = ['Leverage', 'Deleverage']

const ManagePositionCard = ({
  marketId,
  asset,
  currUserPositionInfo,
  newUserPositionInfo,
  localLeverageMultiplierTarget,
  leverageMultiplierTarget,
  showResultingInfo,

  setLeverageMultiplierTarget,
  setLocalLeverageMultiplierTarget,
  setShowResultingInfo,
  setCalculateCostOfCapitalLoading,

  newTotalCollateral,
  newTotalDebt,
  setNewTotalCollateral,
  setNewTotalDebt,

  isTyping,
  setIsTyping,

  handleSendTransaction,
}: IManagePositionCard) => {
  const [leverageDepositButtonLoading, setLeverageDepositButtonLoading] =
    useState<boolean>(false)

  const [selectedTab, setSelectedTab] = useState<'Leverage' | 'Deleverage'>(
    'Leverage'
  )

  const { userData } = useMarkets()
  const { address } = useAccountInfo()
  const { assetValue } = useAssetValue()
  const { whitelistInfos } = useWhitelist()
  const { chain: returnedChain } = useNetwork()
  const chain = returnedChain === undefined ? mainnet : returnedChain

  const [userInputError, setUserInputError] = useState<
    UserInputErrorType[] | null
  >(null)

  const [route, setRoute] = useState<Strategies | null>(null)

  // if user updated the Leverage/Deleverage tab, then don't compare
  // the text input multiplier to currUserPosition currentLeverageMultiplier
  const updatingLeverageMultiplierRef = useRef<'user' | 'program'>('program')
  const updatingLeverageSliderAndTextInputRef = useRef<'user' | 'program'>(
    'program'
  )

  // calculatingInputAmt
  // skeleton for select borrow/repay amount when true
  const [calculatingInputAmt, setCalculatingInputAmt] = useState<boolean>(false)
  // skeleton for leverage slider and text input when true
  const [calculatingLeverageSlider, setCalculatingLeverageSlider] =
    useState<boolean>(false)

  // borrowAmount when Leverage
  // repayAmount when Deleverage
  const [inputAmt, setInputAmt] = useState<string>('0')
  const [localInputAmt, setLocalInputAmt] = useState(inputAmt)

  const [leverageMultiplierTextInput, setLeverageMultiplierTextInput] =
    useState<number | null>(leverageMultiplierTarget)
  const [
    localLeverageMultiplierTextInput,
    setLocalLeverageMultiplierTextInput,
  ] = useState<number | null>(leverageMultiplierTextInput)

  // typing the borrow/repay amount
  const [typingBorrowRepayAmt, setTypingBorrowRepayAmt] =
    useState<boolean>(false)
  // typing the multiplier inputs (slider and text input)
  const [typingMultiplierInputs, setTypingMultiplierInputs] =
    useState<boolean>(false)

  const [showMultiplierInputs, setShowMultiplierInputs] =
    useState<boolean>(true)
  const [showBorrowRepayAmtInputs, setShowBorrowRepayAmtInputs] =
    useState<boolean>(true)

  const debouncedSetLeverageMultiplierTarget = useCallback(
    debounce((value: number) => {
      setIsTyping(false) // TODO: delete?
      setTypingMultiplierInputs(false)
      updatingRef.current = 'user'
      setLeverageMultiplierTarget(value)
    }, DEBOUNCE_TIME),
    []
  )

  const debouncedSetInputAmt = useCallback(
    debounce((value: string) => {
      setIsTyping(false)
      setTypingBorrowRepayAmt(false)
      // if (value !== inputAmt) {
      updatingRef.current = 'user'
      setInputAmt(value)
      // }
    }, DEBOUNCE_TIME),
    []
  )

  const reset = () => {
    setTypingMultiplierInputs(false)
    setTypingBorrowRepayAmt(false)

    setCalculatingInputAmt(false)
    setCalculatingLeverageSlider(false)

    setInputAmt('0')
    setLocalInputAmt('0')

    debouncedSetInputAmt.cancel()
    debouncedSetLeverageMultiplierTarget.cancel()

    // reset leverage multiplier slider
    if (currUserPositionInfo !== null) {
      const currMultiplier =
        currUserPositionInfo.leverage.currLeverageMultiplier
      setLeverageMultiplierTarget(currMultiplier)
      updatingLeverageSliderAndTextInputRef.current = 'program'
    }
    return () => {
      debouncedSetInputAmt.cancel()
      debouncedSetLeverageMultiplierTarget.cancel()
    }
  }

  // reset on Leverage/Deleverage tab switch
  useEffect(() => {
    reset()
    // setIsTyping(false)// TODO: delete?
    // setTypingMultiplierInputs(false)
    // setTypingBorrowRepayAmt(false)

    // setCalculatingInputAmt(false)
    // setCalculatingLeverageSlider(false)
    // debouncedSetInputAmt.cancel()
    // debouncedSetLeverageMultiplierTarget.cancel()
    // if (currUserPositionInfo !== null) {
    //   const currMultiplier = currUserPositionInfo.leverage.currLeverageMultiplier
    //   setLeverageMultiplierTarget(currMultiplier)
    //   // setLeverageMultiplierTextInput(currMultiplier)
    //   updatingLeverageSliderAndTextInputRef.current = 'program'
    // }
    // return () => {
    //   debouncedSetInputAmt.cancel()
    //   debouncedSetLeverageMultiplierTarget.cancel()
    // }
  }, [selectedTab])

  /**
   * Show skeleton for multiplier slider and text input when
   * 1. User is typing the borrow amount
   * 2. Or The exact multiplier is still being calculated with the debounced value
   * - calculatingCollateralFromCost is true
   *
   * Show skeleton for borrow/repay amount input when
   * 1. User is typing the leverage multiplier text input
   * 2. Or User is typing the leverage multiplier slider input
   * 3. Or System is calculating the cost of capital aka borrow amount
   *
   * Show skeleton for resulting transaction information
   * and the Position Summary if
   * 1. User is typing the multiplier input (slider and text)
   * 2. Or User is typing the borrow/repay amount input
   * 3. Or Calculating the cost of capital
   * 4. Or Calculating the leverage from borrow/repay amount
   */
  useEffect(() => {
    if (typingBorrowRepayAmt || calculatingLeverageSlider) {
      setShowMultiplierInputs(false)
    } else {
      setShowMultiplierInputs(true)
    }

    if (typingMultiplierInputs || calculatingInputAmt) {
      setShowBorrowRepayAmtInputs(false)
    } else {
      setShowBorrowRepayAmtInputs(true)
    }

    if (
      typingBorrowRepayAmt ||
      calculatingLeverageSlider ||
      typingMultiplierInputs ||
      calculatingInputAmt
    ) {
      // showResultingInfo should come from parent
      // and it acts on both the user input component and the position summary
      setShowResultingInfo(false)
    } else {
      setShowResultingInfo(true)
    }
  }, [
    typingBorrowRepayAmt,
    calculatingLeverageSlider,
    typingMultiplierInputs,
    calculatingInputAmt,
  ])

  // Based on the tagetLeverageMultiplier, compute newTotalDebt and newTotalCollateral
  // newTotalDebt and newTotalCollateral changing should recalculate the
  // borrow/repay amount based on whether it's leverage or deleverage
  useEffect(() => {
    const setAmountInputFromSliderInput = async () => {
      if (updatingRef.current == 'program') {
        return
      }

      if (
        currUserPositionInfo === null ||
        leverageMultiplierTarget === null ||
        assetValue === null ||
        userData === null ||
        userData[marketId] === null
      ) {
        return
      }

      setCalculatingInputAmt(true)

      const collateralAsset = markets[chain.id][marketId].collateralAsset
      const lenderAsset = markets[chain.id][marketId].lenderAsset
      const lenderAssetAddr =
        tokenAddresses[markets[chain.id][marketId].lenderAsset]
      const mintAssetAddr =
        tokenAddresses[markets[chain.id][marketId].mintAsset]

      const lenderAssetValue = assetValue[lenderAsset]
      const collateralAssetValue = assetValue[collateralAsset]
      if (lenderAssetValue === null || lenderAssetValue === undefined) return
      if (collateralAssetValue === null || collateralAssetValue === undefined)
        return

      // TODO: is this denominated in ETH or lender asset
      // we want to get how much collateral needs to be acquired for target leverage
      // 1. get additional capital in ETH required
      // 2. convert ETH amount to wstETH Amount using lenderAssetExchangerate
      // 3. convert wstETH amount to weETH amount using the spot oracle
      const myCapital = currUserPositionInfo.capital.myCapital
      const totalCapital = currUserPositionInfo.capital.totalCapital
      const leverageMultiplierTargerBigInt = strToBigInt(
        leverageMultiplierTarget.toString(),
        18
      )
      const newTotalCapital = (myCapital * leverageMultiplierTargerBigInt) / WAD

      const lenderAssetExchangeRate = lenderAssetValue.exchangeRate
      const collateralPrice =
        collateralAssetValue?.marketPriceInLenderAsset ?? BigInt(0)
      const exchangeRate = collateralAssetValue.exchangeRate

      // (total capital + new capital) / my capital  = target leverage multiplier
      // new capital = target leverage multiplier * my capital - total capital
      if (selectedTab === 'Leverage') {
        try {
          const changeInCapital = newTotalCapital - totalCapital
          const changeInCapitalInLenderAsset =
            (changeInCapital * WAD) / lenderAssetExchangeRate
          const changeInCollateralAmount =
            (changeInCapitalInLenderAsset * WAD) / collateralPrice
          // convert capital amount to amount of collateral
          // const changeInCollateralAmount = changeInCapital * WAD / exchangeRate
          // convert amount of collateral to amount of debt required
          // cost of capital
          // const strategy = new UniswapFlashswapDirectMint(
          //   address,
          //   marketId,
          //   chain.id,
          //   publicClient,
          //   handleSendTransaction,
          //   setCalculateCostOfCapitalLoading
          // );
          const strategy = getLeverageStrategyInstance({
            sender: address,
            marketId: marketId,
            chainId: chain.id,
            client: walletClient,
            handleSendTransaction: handleSendTransaction,
            setCalculateCostOfCapitalLoading: setCalculateCostOfCapitalLoading,
          })
          if (strategy === null) return

          const costOfCapital = (await strategy.calculateCostOfCapital(
            BigInt(0),
            changeInCollateralAmount,
            lenderAssetAddr as `0x${string}`,
            mintAssetAddr as `0x${string}`
          )) as bigint
          setInputAmt(formatBigInt(costOfCapital, 18, 4))

          const currentCollateralAmount =
            userData[marketId]!.userVaultInfo.collateral
          const newTotalCollateral =
            changeInCollateralAmount + currentCollateralAmount
          const currentDebtAmount = userData[marketId]!.userVaultInfo.debt
          const newTotalDebt = currentDebtAmount + costOfCapital

          setNewTotalCollateral(newTotalCollateral)
          setNewTotalDebt(newTotalDebt)

          setRoute(strategy.route)
        } catch (e) {
          return
        }
      } else if (selectedTab === 'Deleverage') {
        const changeInCapital = totalCapital - newTotalCapital
        // TODO: Do deleverage
        // convert amount of collateral to amount of mint asset it can acquire

        // convert mint asset to amount of lender asset it can acquire
      }
      updatingRef.current = 'program'

      setCalculatingInputAmt(false)
    }
    setAmountInputFromSliderInput()
  }, [leverageMultiplierTarget])

  // Based on the borrow/repay amount input,
  // set newTotalCollateral, newTotalDebt,
  // and set leverageMultiplierTarget on the input component UI.
  useEffect(() => {
    const setResultingVaultInfo = async () => {
      if (
        currUserPositionInfo === null ||
        userData === null ||
        assetValue === null
      ) {
        return
      }
      if (updatingRef.current === 'program') {
        return
      }
      // TODO: check for leverage/deleverage comparing
      // new leverage multiplier to current

      setCalculatingLeverageSlider(true)

      const lenderAsset = markets[chain.id][marketId].lenderAsset
      const mintAsset = markets[chain.id][marketId].mintAsset
      const lenderAssetAddr = tokenAddresses[lenderAsset] as `0x${string}`
      const mintAssetAddr = tokenAddresses[mintAsset] as `0x${string}`

      const changeInDebtAmt = strToBigInt(inputAmt, 18)

      // convert borrow amount to collateral amount
      // TODO: Should grab the more optimal strategy based on the market
      // const strategy = new UniswapFlashswapDirectMint(
      //   address,
      //   marketId,
      //   chain.id,
      //   publicClient,
      //   handleSendTransaction,
      //   setCalculateCostOfCapitalLoading
      // );

      const strategy = getLeverageStrategyInstance({
        sender: address,
        marketId: marketId,
        chainId: chain.id,
        client: walletClient,
        handleSendTransaction: handleSendTransaction,
        setCalculateCostOfCapitalLoading: setCalculateCostOfCapitalLoading,
      })
      if (strategy === null) return

      const collateralAmt = await strategy.calculateCollateralAmountFromCost(
        changeInDebtAmt, // borrow amount
        lenderAssetAddr,
        mintAssetAddr
      )
      if (collateralAmt === null) {
        // calculation failed due to rpc error
        setCalculatingLeverageSlider(false)
        return
      }

      const currTotalCollateral = userData[marketId]!.userVaultInfo.collateral
      const currTotalDebt = userData[marketId]!.userVaultInfo.debt

      const newTotalCollateral = currTotalCollateral + collateralAmt
      const newTotalDebt = currTotalDebt + changeInDebtAmt
      // 59991449552717843545n
      // 55891265533232427608n
      setNewTotalCollateral(newTotalCollateral)
      setNewTotalDebt(newTotalDebt)

      // TODO: when new total collateral and new total debt changes, does this change
      // the leverage slider input as well?

      setRoute(strategy.route)

      updatingRef.current = 'program'
      setCalculatingLeverageSlider(false)
    }
    setResultingVaultInfo()
  }, [inputAmt])

  // When newTotalCollateral and setNewTotalDebt is set from inputAmt,
  // update the leverageMultiplierTarget to the new leverage multiplier
  useEffect(() => {
    if (newUserPositionInfo === null) {
      return
    }
    const newLeverageMultiplier =
      newUserPositionInfo?.leverage.currLeverageMultiplier
    setLeverageMultiplierTarget(newLeverageMultiplier)
  }, [newUserPositionInfo])

  // earn tab leveragePerc debounce
  const [slippagePerc, setSlippagePerc] = useState<number>(0.01)
  const updatingRef = useRef<'user' | 'program'>('program')

  const {
    errors,
    infos,
    setLoading,
    setCurrency,
    publicClient,
    walletClient,
    currency,
  } = useApp()

  const { theme } = useTheme()

  /**
   * For Leverage/Deleverage Tab
   */
  const handleDepositButton = async () => {
    // convert initial and resulting deposit values to 18 precision

    if (selectedTab === 'Leverage') {
      if (
        userData === null ||
        newTotalDebt === null ||
        newTotalCollateral === null
      ) {
        return
      }

      if (whitelistInfos === null) return false
      const proof: string[] = whitelistInfos[marketId]?.borrowerProof ?? []

      const userVaultInfo: UserVaultInfo = userData[marketId]!.userVaultInfo
      const leverageUserInput: LeverageUserInput = {
        initialDeposit: BigInt(0),
        resultingAdditionalDeposit:
          newTotalCollateral - userVaultInfo.collateral,
        estAdditionalDebt: newTotalDebt - userVaultInfo.debt,
        slippageTolerance: slippagePerc,
        proof: proof,
      }
      // TODO: strategy selection and keeping the state can be pulled out to a custom hook
      // const strategy = new UniswapFlashswapDirectMint(
      //   address,
      //   marketId,
      //   chain.id,
      //   walletClient,
      //   handleSendTransaction,
      //   setCalculateCostOfCapitalLoading
      // )

      const strategy = getLeverageStrategyInstance({
        sender: address,
        marketId: marketId,
        chainId: chain.id,
        client: walletClient,
        handleSendTransaction: handleSendTransaction,
        setCalculateCostOfCapitalLoading: setCalculateCostOfCapitalLoading,
      })
      if (strategy === null) return

      await strategy.executeLeverage(leverageUserInput)
      setLeverageDepositButtonLoading(false)
      reset()
    } else if (selectedTab === 'Deleverage') {
      setLeverageDepositButtonLoading(false)
      reset()
      return // TODO: There is no deleverage for weETH <> wstETH market right now
    }
  }

  const renderAdvancedInformationCostOfCapital = (): JSX.Element => {
    // context is not ready
    if (
      newTotalCollateral === null ||
      newTotalDebt === null ||
      userData === null ||
      userData[marketId] === null ||
      assetValue === null
    )
      return <>N/A</>

    // pending async calculation
    if (!showResultingInfo) {
      return (
        <div className="flex flex-row">
          <div
            className={`block p-2 px-6 mr-1 rounded-md bg-gray-200 animate-pulse w-full h-full`}
          />
          {' ETH/' + markets[chain.id][marketId].collateralAsset}
        </div>
      )
    }

    const changeInDebt = newTotalDebt - userData[marketId]!.userVaultInfo.debt
    const changeInCollateral =
      newTotalCollateral - userData[marketId]!.userVaultInfo.collateral
    if (changeInCollateral === BigInt(0)) {
      return <>0 ETH/{markets[chain.id][marketId].collateralAsset}</>
    }
    const costOfCapitalInLenderAsset = (changeInDebt * WAD) / changeInCollateral
    const costOfCapitalInETH =
      (costOfCapitalInLenderAsset *
        assetValue[markets[chain.id][marketId].lenderAsset]!.exchangeRate) /
      WAD

    return (
      <>
        {formatBigInt(costOfCapitalInETH, 18, 4) +
          ' ETH/' +
          markets[chain.id][marketId].collateralAsset}
      </>
    )
  }

  // TODO: Refactor for max leverage and max deleverage
  /**
   * Returns values for maximum possible values for the top input component
   * @returns bigint for pure value and string to specify units
   */
  // const getInputMax = (): [bigint, string] => {
  //   let maxBigInt = BigInt(0)
  //   let maxString = ''
  //   if (currUserPositionInfo !== null && userIlkInfo !== null) {
  //     if (selectedTab === 'Leverage') {
  //       // maximum borrowing power - current borrowing power
  //       maxBigInt =
  //         currUserPositionInfo?.borrowingPower.maxBorrowingPower -
  //         currUserPositionInfo?.borrowingPower.currUsedBorrowingPower
  //       maxString = formatBigInt(maxBigInt, 18, 4) + ' ETH'
  //     } else if (selectedTab === 'Deleverage') {
  //       // maximum deleveragable
  //       maxBigInt = currUserPositionInfo?.capital.borrowedCapital
  //       maxString = formatBigInt(maxBigInt, 18, 4) + ' ETH'
  //     }
  //   }
  //   return [maxBigInt, maxString]
  // }

  return (
    <Card className="drop-shadow-none">
      <div className="border border-gray-100 dark:border-dark-primary-600 rounded p-4">
        <Tab.Group
          selectedIndex={leverageTabs.indexOf(selectedTab)}
          onChange={(idx) => {
            setSelectedTab('Leverage') // disable deleverage for now
            // setSelectedTab(leverageTabs[idx] as 'Leverage' | 'Deleverage')

            // const newMultiplier = document.getElementById(
            //   'new-multiplier-leverage'
            // )
            // if (newMultiplier) {
            //   newMultiplier.style.setProperty('width', `0%`)
            // }
            // reset slider to current multiplier position
            // if (currUserPositionInfo) {
            //   setLeverageMultiplierTarget(
            //     currUserPositionInfo?.leverage.currLeverageMultiplier
            //   )
            //   setLocalLeverageMultiplierTarget(
            //     currUserPositionInfo?.leverage.currLeverageMultiplier
            //   )
            // }
            // updatingLeverageMultiplierRef.current = 'user'
          }}
        >
          <Tab.List
            className={`mb-8 flex space-x-1 rounded-lg bg-gray-50 border border-gray-200 p-1 bg-gray-300 dark:bg-dark-primary-900 dark:border-dark-primary-600`}
          >
            {leverageTabs.map((category) => (
              <Tab
                key={category}
                className={({ selected }) => {
                  return classNames(
                    'w-full rounded-lg py-1 text-sm leading-5 text-blue-700 outline-none relative',
                    selected
                      ? 'bg-white dark:bg-dark-primary-600'
                      : 'text-gray-500 dark:bg-dark-primary-00 has-tooltip'
                  )
                }}
              >
                <>
                  {
                    <div className="tooltip rounded shadow-lg p-2 bg-white dark:bg-dark-primary-600 text-xs text-black dark:text-white border dark:border-dark-primary-900">
                      Deleverage will be enabled soon
                    </div>
                  }
                </>
                {category}
              </Tab>
            ))}
          </Tab.List>
        </Tab.Group>
        {/* <div className="flex justify-between"> */}
        <div className="flex items-center justify-between mt-4">
          <p>
            {selectedTab === 'Leverage' ? 'Select' : 'Decrease'} Target
            Multiplier
          </p>
          <div className="shadow-sm p-1 rounded flex items-center space-x-1">
            {!showMultiplierInputs ? (
              <div
                className={`block rounded-md bg-gray-200 animate-pulse w-8 h-4 my-2  mr-1 `}
              />
            ) : (
              <AmountInput
                localValue={String(localLeverageMultiplierTarget)}
                setLocalValue={setLocalLeverageMultiplierTarget}
                value={String(leverageMultiplierTarget)} //
                setValue={(val: any) => {
                  debouncedSetLeverageMultiplierTarget(val)
                }}
                isTyping={typingMultiplierInputs}
                setIsTyping={setTypingMultiplierInputs}
                className="w-8 dark:bg-dark-primary-700 rounded p-1 mr-1"
              />
            )}
            <span className="">x</span>
          </div>
        </div>
        {currUserPositionInfo ? (
          !showMultiplierInputs ? (
            <div
              className={`block pl-2 rounded-md bg-gray-200 animate-pulse h-7 w-full`}
            />
          ) : (
            <LeverageSliderInput
              value={String(localLeverageMultiplierTarget)}
              setValue={(val: string) => {
                setIsTyping(true) // TODO: delete?

                setTypingMultiplierInputs(true)

                setCalculatingInputAmt(true)
                debouncedSetLeverageMultiplierTarget(Number(val))
                // setLeverageMultiplierTarget(Number(val))
                setLocalLeverageMultiplierTarget(Number(val))
                updatingRef.current = 'user'
                updatingLeverageSliderAndTextInputRef.current = 'user'
              }}
              min={currUserPositionInfo.leverage.minLeverageMultiplier}
              max={currUserPositionInfo!.leverage.maxLeverageMultiplier}
              refValue={String(
                currUserPositionInfo?.leverage.currLeverageMultiplier
              )}
              step={0.1}
              sliderThumbColor={themes.colors.primary['400']}
              selectedTab={selectedTab}
            />
          )
        ) : (
          <div
            className={`block p-4 rounded-md bg-gray-200 animate-pulse w-full h-12`}
          />
        )}
        <p className="mt-6 mb-2">
          Or Select {selectedTab === 'Leverage' ? 'Borrow' : 'Repay'} Amount
        </p>
        <div
          className={`p-1 outline-gray-200 ${
            userInputError?.some((error) => error.borderRed.topAmountInput)
              ? 'border border-red-600'
              : 'dark:border-none'
          } drop-shadow bg-white dark:bg-dark-primary-700 rounded relative flex items-center`}
        >
          {!showBorrowRepayAmtInputs ? (
            <div
              className={`block pl-2 rounded-md bg-gray-200 animate-pulse h-7 w-full mx-1`}
            />
          ) : (
            <AmountInput
              value={inputAmt}
              // setValue={handledepositAmt}
              // setValue={(e) => {
              //   updatingRef.current = 'user'
              //   setDepositAmt(e)
              // }}
              setValue={debouncedSetInputAmt}
              localValue={localInputAmt}
              setLocalValue={setLocalInputAmt}
              isTyping={typingBorrowRepayAmt}
              setIsTyping={setTypingBorrowRepayAmt}
              className="w-full font-bold text-lg 2xl:text-2xl rounded dark:bg-dark-primary-600 outline-none pl-2 h-10"
            />
          )}
          <div className="min-w-fit flex items-center px-1">
            {/* <Button
              className="w-10 px-1 hover:text-white border-gray text-gray-400 font-light h-6 text-[12px] rounded-md dark:bg-dark-primary-900"
            >
              MAX
            </Button> */}
            {/* <hr className="block h-[24px] w-[0.1px] mx-1 border-l-[0.1px] border-gray-200 dark:border-gray-400 rounded" /> */}
            <div className="flex items-center">
              {asset === 'wstETH' && <WstEth className="scale-[90%]" />}
              <p className="text-sm pt-[0.5px] pt-1">{asset}</p>
            </div>
          </div>
        </div>
        <div className="mt-8 flex gap-1">
          <Info width={50} height={25} />
          <p className="text-xs text-gray-400">
            Move the slider to the right or specify the exact amount to borrow.
            The borrowed funds will be used to purchase additional collateral
            assets that are deposited to your vault.
          </p>
        </div>
      </div>
      <div className="flex justify-between items-center drop-shadow bg-white dark:bg-dark-primary-700 rounded p-2 mt-4">
        <p className="text-[14px]">Max Slippage</p>
        <div className="grid grid-cols-4 gap-2 text-xs">
          <Button
            variant={slippagePerc === 0.001 ? 'static' : undefined}
            className="w-10 px-1 hover:text-white border-gray font-light h-6 text-[12px] rounded-md"
            onClick={() => setSlippagePerc(0.001)}
          >
            0.1%
          </Button>
          <Button
            variant={slippagePerc === 0.0025 ? 'static' : undefined}
            className="w-10 px-1 hover:text-white border-gray font-light h-6 text-[12px] rounded-md"
            onClick={() => setSlippagePerc(0.0025)}
          >
            0.25%
          </Button>
          <Button
            variant={slippagePerc === 0.005 ? 'static' : undefined}
            className="w-10 px-1 hover:text-white border-gray font-light h-6 text-[12px] rounded-md"
            onClick={() => setSlippagePerc(0.005)}
          >
            0.5%
          </Button>
          <Button
            variant={slippagePerc === 0.01 ? 'static' : undefined}
            className="w-10 px-1 hover:text-white border-gray font-light h-6 text-[12px] rounded-md"
            onClick={() => setSlippagePerc(0.01)}
          >
            1%
          </Button>
        </div>
      </div>
      <UserInputError
        marketId={marketId}
        errors={userInputError}
        setErrors={setUserInputError}
        selectedTab={selectedTab}
        currUserPositionInfo={currUserPositionInfo}
        newUserPositionInfo={newUserPositionInfo}
        newTotalCollateral={newTotalCollateral}
        newTotalDebt={newTotalDebt}
      />
      <div
        className={`mt-4 drop-shadow dark:border-dark-primary-900 rounded bg-white dark:bg-dark-primary-700 flex items-center justify-between p-2 font-light dark:text-white`}
      >
        <p className="text-[14px]">Est. Borrow APR</p>
        <p className="text-lg font-bold">
          {/* {newUserPositionInfo?.yield.leveragedStakingYield.toFixed(2) ?? 0}% */}
          {(
            (newUserPositionInfo?.yield.leveragedStakingYield ?? 0) * -1
          )?.toFixed(2) + '%'}
        </p>
      </div>
      <Button
        variant={
          userInputError !== null || !showResultingInfo ? 'disabled' : 'static'
        }
        className="mt-4 w-full p-2 leading-loose"
        onClick={(e) => {
          setLeverageDepositButtonLoading(true)
          handleDepositButton()
        }}
        loading={leverageDepositButtonLoading}
        loadingMsg={'Sending Transaction...'}
      >
        <p>Deposit</p>
      </Button>
      <div className="flex flex-col gap-2 bg-gray-50 dark:bg-dark-primary-700 rounded mt-4 p-2">
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
          <div className="flex flex-row items-center">
            {showResultingInfo && newTotalCollateral !== null ? (
              formatBigInt(newTotalCollateral, 18, 4)
            ) : (
              <div
                className={`flex-grow block px-8 rounded-md bg-gray-200 animate-pulse w-full h-4`}
              />
            )}
            &nbsp;
            {markets[chain.id][marketId].collateralAsset}
          </div>
        </div>
        <div className="flex justify-between w-full">
          <p>Resulting Debt</p>
          <div className="flex flex-row items-center">
            {showResultingInfo && newTotalDebt !== null ? (
              formatBigInt(newTotalDebt, 18, 4)
            ) : (
              <div
                className={`flex-grow block px-8 rounded-md bg-gray-200 animate-pulse w-full h-4`}
              />
            )}
            &nbsp;
            {markets[chain.id][marketId].lenderAsset}
          </div>
        </div>
        <div className="flex justify-between w-full">
          <p>Resulting LTV</p>
          <div className="flex flex-row items-center gap-x-1">
            {showResultingInfo && newUserPositionInfo !== null ? (
              (newUserPositionInfo!.vault.ltv * 100).toFixed(2)
            ) : (
              <div
                className={`flex-grow block px-8 rounded-md bg-gray-200 animate-pulse w-full h-4`}
              />
            )}
            %
          </div>
        </div>
        <div className="flex justify-between w-full">
          <p>Liquidation Exchange Rate</p>
          <div className="flex flex-row items-center items-">
            {showResultingInfo && newUserPositionInfo !== null ? (
              <div>
                {formatBigInt(
                  newUserPositionInfo!.vault.liquidationExchangeRate,
                  18,
                  2
                )}{' '}
              </div>
            ) : (
              <div
                className={`flex-grow block px-8 rounded-md bg-gray-200 animate-pulse w-full h-4`}
              />
            )}
            &nbsp;
            {`ETH\/${markets[chain.id][marketId].collateralAsset}`}
          </div>
        </div>
      </div>
      {/* TODO: Refactor Advaned Information into a component that can be reused in both create and manage position tba */}
      <Disclosure>
        {({ open }) => (
          <div>
            <Disclosure.Button className="flex items-center justify-between rounded-lg mt-4 text-left text-sm font-medium focus:outline-none focus-visible:ring">
              <p>Advanced Information</p>
              <ChevronLeft
                width={25}
                height={25}
                fill={`${theme === 'light' ? 'black' : 'white'}`}
                className={`${open ? 'rotate-90' : '-rotate-90'}`}
              />
            </Disclosure.Button>
            <Disclosure.Panel>
              {/* {
                            strategyDataLoading ? (
    
                              <div>
                                Should show skeleton...
                              </div>
    
                            ) : ( */}

              <div className="grid md:grid-cols-1 gap-4 mt-2">
                <div className="text-sm flex flex-col gap-2">
                  <div className="flex justify-between">
                    <p className="text-gray-400">Earn Route</p>
                    {showResultingInfo && route !== null ? (
                      <p className="bg-gray-100 dark:bg-indigo rounded p-1">
                        {route.toString()}
                      </p>
                    ) : (
                      <div
                        className={`block p-1 rounded-md bg-gray-200 animate-pulse w-1/4 h-full`}
                      />
                    )}
                  </div>
                  <div className="flex justify-between">
                    <p className="text-gray-400">
                      {markets[chain.id][marketId].collateralAsset} Exchange
                      Rate
                    </p>
                    <>
                      {showResultingInfo && assetValue !== null ? (
                        <p>
                          {formatBigInt(
                            assetValue[
                              markets[chain.id][marketId].collateralAsset
                            ]!.exchangeRate,
                            18,
                            4
                          ) + ' ETH'}
                        </p>
                      ) : (
                        <div className="flex gap-1">
                          <div
                            className={`block p-1 px-7 rounded-md bg-gray-200 animate-pulse w-full h-full`}
                          />{' '}
                          <p>ETH</p>
                        </div>
                      )}
                    </>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-gray-400">
                      {markets[chain.id][marketId].lenderAsset} Exchange Rate
                    </p>
                    <>
                      {showResultingInfo && assetValue !== null ? (
                        <p>
                          {formatBigInt(
                            assetValue[markets[chain.id][marketId].lenderAsset]!
                              .exchangeRate,
                            18,
                            4
                          ) + ' ETH'}
                        </p>
                      ) : (
                        <div className="flex gap-1">
                          <div
                            className={`block p-1 px-7 rounded-md bg-gray-200 animate-pulse w-full h-full`}
                          />{' '}
                          <p>ETH</p>
                        </div>
                      )}
                    </>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-gray-400">Cost of Capital</p>
                    <p>{renderAdvancedInformationCostOfCapital()}</p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-gray-400">Slippage Tolerance</p>
                    <p>{slippagePerc * 100} %</p>
                  </div>
                  {/* TODO: Bring back gas estimation later */}
                  {/* <div className="flex justify-between">
                                <p className="text-gray-400">Network Cost</p>
                                <p>Est. $x.XX</p>
                              </div> */}
                </div>
                {/* <div className="border dark:border-indigo rounded p-2">
                              <p className="w-full text-center">Utilization Rate</p>
                              <p className="text-gray-400 w-full ml-8">Deposited</p>
                              <div className="flex justify-between text-gray-400 w-full text-end">
                                <p className="md:ml-8">Capital($USD)</p>
                                <p className="md:ml-3">40%</p>
                                <p className="md:ml-3">60%</p>
                                <p className="md:ml-3">80%</p>
                              </div>
                              <hr className="mt-2 relative mb-7 bg-gray-300 border dark:border-indigo rounded " />
                              <div className="flex justify-between text-end">
                                <p className="grow">$1,000.00</p>
                                <p className="grow">xx.X% ($XX.xx)</p>
                                <p className="grow">xx.X% ($XX.xx)</p>
                                <p className="grow">xx.X% ($XX.xx)</p>
                              </div>
                            </div> */}
              </div>
              {/* )
    
                          } */}
            </Disclosure.Panel>
          </div>
        )}
      </Disclosure>
    </Card>
  )
}

export default ManagePositionCard
