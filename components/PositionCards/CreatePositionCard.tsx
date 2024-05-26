import { DEBOUNCE_TIME, markets, tokenAddresses } from '@/config'
import { useApp } from '@/contexts/AppProvider'
import { useAssetValue } from '@/contexts/AssetValueProvider'
import { UserVaultInfo, useMarkets } from '@/contexts/MarketsProvider'
import { useTheme } from '@/contexts/ThemeProvider'
import { useWhitelist } from '@/contexts/WhitelistProvider'
import useAccountInfo from '@/hooks/useAccountInfo'
import { TxArgs, TxStatusMessages } from '@/hooks/useTransaction'
import { UserPositionInfo } from '@/hooks/useUserPositionInfo'
import { ChevronLeft } from '@/libs/icons/src/lib/icons'
import { WAD, formatBigInt, strToBigInt } from '@/utils/number'
import {
  LeverageUserInput,
  Strategies,
} from '@/utils/strategies/UniswapFlashswapDirectMint'
import { getLeverageStrategyInstance } from '@/utils/strategies/strategy'
import { Disclosure, Tab } from '@headlessui/react'
import { debounce } from 'lodash'
import { useCallback, useEffect, useRef, useState } from 'react'
import { mainnet, useNetwork } from 'wagmi'
import AlertComponent from '../AlertComponent'
import AmountInput from '../AmountInput'
import AssetComponent from '../AssetComponent'
import SliderInput from '../Input/SliderInput'
import UserInputError, { UserInputErrorType } from '../UserInputError'
import Button from '../common/Button'
import Card from '../common/Card'

type CreatePositionCardProps = {
  marketId: number

  newTotalCollateral: bigint | null
  newTotalDebt: bigint | null

  isTyping: boolean
  setIsTyping: React.Dispatch<React.SetStateAction<boolean>>

  currUserPositionInfo: UserPositionInfo | null
  newUserPositionInfo: UserPositionInfo | null

  createPositionDepositAmount: string
  setCreatePositionDepositAmount: any

  localCreatePositionDepositAmount: string
  setLocalCreatePositionDepositAmount: any

  createPositionLeverageMultiplier: string
  setCreatePositionLeverageMultiplier: any

  localCreatePositionLeverageMultiplier: string
  setLocalCreatePositionLeverageMultiplier: any
  setNewTotalCollateral: any
  setNewTotalDebt: any

  handleSendTransaction: (
    txArgs: TxArgs,
    statusMessages: TxStatusMessages,
    showSuccessModal: boolean
  ) => Promise<void>
  setCalculateCostOfCapitalLoading: React.Dispatch<
    React.SetStateAction<boolean>
  >

  showResultingInfo: boolean
}

const positionTabs = ['Create Position']

const CreatePositionCard: React.FC<CreatePositionCardProps> = ({
  marketId,

  newTotalCollateral,
  newTotalDebt,

  isTyping,
  setIsTyping,

  currUserPositionInfo,
  newUserPositionInfo,

  createPositionDepositAmount,
  setCreatePositionDepositAmount,

  localCreatePositionDepositAmount,
  setLocalCreatePositionDepositAmount,

  createPositionLeverageMultiplier,
  setCreatePositionLeverageMultiplier,

  localCreatePositionLeverageMultiplier,
  setLocalCreatePositionLeverageMultiplier,

  setNewTotalCollateral,
  setNewTotalDebt,

  handleSendTransaction,
  setCalculateCostOfCapitalLoading,
  showResultingInfo,
}: CreatePositionCardProps) => {
  const { marketData, userData } = useMarkets()
  const { signer, address } = useAccountInfo()

  const { chain: returnedChain } = useNetwork()
  const chain = returnedChain === undefined ? mainnet : returnedChain

  const { assetValue } = useAssetValue()
  const { whitelistInfos } = useWhitelist()

  // TODO: delete unused
  const { publicClient, walletClient, termsAccepted } = useApp()

  const [depositButtonLoading, setDepositButtonLoading] =
    useState<boolean>(false)
  const [userInputError, setUserInputError] = useState<
    UserInputErrorType[] | null
  >(null)

  const [uniswapUserInputError, setUniswapUserInputError] =
    useState<UserInputErrorType | null>(null)

  const [resultingAdditionalCollateral, setResultingAdditionalCollateral] =
    useState<bigint | null>(null)

  const [costOfCapital, setCostOfCapital] = useState<bigint | null>(null)

  const [slippagePerc, setSlippagePerc] = useState<number>(0.01)

  const { theme } = useTheme()

  const [leverageMultiplierTextInput, setLeverageMultiplierTextInput] =
    useState<string>('1')

  // const reset = () => {
  //   setCreatePositionDepositAmount('0')
  //   setLocalCreatePositionDepositAmount('0')
  //   setCreatePositionLeverageMultiplier(1)
  //   setLocalCreatePositionDepositAmount(1)
  // }

  /**
   * Reset errors when local i.e. non-debounced values change
   */
  // useEffect(() => {

  // }, [localCreatePositionDepositAmount, localCreatePositionLeverageMultiplier])

  const debouncedCreatePositionDepositAmount = useCallback(
    debounce((value: string) => {
      if (value !== createPositionDepositAmount) {
        setIsTyping(false)
        updatingRef.current = 'user'
        setCreatePositionDepositAmount(value)
      }
    }, DEBOUNCE_TIME),
    []
  )
  const debouncedCreatePositionLeverageMultiplier = useCallback(
    debounce((value: string) => {
      setIsTyping(false)
      updatingRef.current = 'user'
      setCreatePositionLeverageMultiplier(value)
      // if (value !== createPositionLeverageMultiplier) {
      // }
    }, DEBOUNCE_TIME),
    []
  )

  // keep
  useEffect(() => {
    debouncedCreatePositionDepositAmount.cancel()
    debouncedCreatePositionLeverageMultiplier.cancel()
    return () => {
      debouncedCreatePositionDepositAmount.cancel()
      debouncedCreatePositionLeverageMultiplier.cancel()
    }
  }, [])

  // advanced information
  const [route, setRoute] = useState<Strategies | null>(null)

  // don't know
  // for making slider and user input reactive to each other
  const updatingRef = useRef<'user' | 'program'>('program')

  /**
   * The max deposit amount for create position is equal to their total wallet balance.
   */
  const handleInputMaxButton = () => {
    if (userData === null || userData[marketId] === null) {
      return
    }
    const maxDeposit =
      userData[marketId]?.userWalletInfo.collateralTokenBalance ?? BigInt(0)
    setCreatePositionDepositAmount(formatBigInt(maxDeposit, 18, 18))
  }

  /**
   * TODO: Should only be able to be called after the values are returned
   * from
   */
  const handleDepositButton = async () => {
    // convert initial and resulting deposit values to 18 precision
    const slippagePercBigInt = strToBigInt(slippagePerc.toString(), 18)

    // TODO: Refactor to use a different hook to return optimal strategy object to use
    // From here, it should send a standardized user input type for
    // all leverage calls. (handle deleverage separately)
    // For now, just call the one strategy

    if (
      newTotalCollateral === null ||
      newTotalDebt === null ||
      userData === null
    )
      return
    const userDataVar = userData[marketId]
    if (userDataVar === null) return

    if (whitelistInfos === null) return false
    const proof: string[] = whitelistInfos[marketId]?.borrowerProof ?? []
    const userVaultInfo: UserVaultInfo = userDataVar.userVaultInfo
    const leverageUserInput: LeverageUserInput = {
      initialDeposit: strToBigInt(createPositionDepositAmount, 18),
      resultingAdditionalDeposit: newTotalCollateral - userVaultInfo.collateral,
      estAdditionalDebt: newTotalDebt - userVaultInfo.debt,
      slippageTolerance: slippagePerc,
      proof: proof,
    }

    const strategy = getLeverageStrategyInstance({
      sender: address,
      marketId: marketId,
      chainId: chain.id,
      client: walletClient,
      handleSendTransaction: handleSendTransaction,
      setCalculateCostOfCapitalLoading: setCalculateCostOfCapitalLoading,
    })
    if (strategy === null) return

    // const strategy = new UniswapFlashswapDirectMint(
    //   address,
    //   marketId,
    //   chain.id,
    //   walletClient,
    //   handleSendTransaction,
    //   setCalculateCostOfCapitalLoading
    // )

    await strategy.executeLeverage(leverageUserInput)

    setDepositButtonLoading(false)
  }

  /**
   * Calculates resulting collateral based on user inputs.
   * This does not require debounce delay and therefore uses
   * local values and updates while the user is typing.
   */
  useEffect(() => {
    const depositAmtBigInt = strToBigInt(createPositionDepositAmount, 18)
    const resultingAdditionalCollateral =
      (depositAmtBigInt * strToBigInt(createPositionLeverageMultiplier, 18)) /
      WAD
    setNewTotalCollateral(resultingAdditionalCollateral)
  }, [localCreatePositionDepositAmount, localCreatePositionLeverageMultiplier])

  /**
   * Calculate exact resulting collateral and debt using exact uniswap
   * quoted prices. This requires debounce delay.
   * This value should override the estimated resulting collateral and
   * debt values that do not use exact uniswap quoted prices.
   */
  useEffect(() => {
    const getResultingCollateralAndDebt = async () => {
      if (marketId === null || userData === null) return

      const userDataVar = userData[marketId]
      if (userDataVar === null) return

      const depositAmtBigInt = strToBigInt(createPositionDepositAmount, 18)
      const resultingAdditionalCollateral =
        (depositAmtBigInt * strToBigInt(createPositionLeverageMultiplier, 18)) /
        WAD
      const newTotalCollateral =
        userDataVar.userVaultInfo.collateral + resultingAdditionalCollateral

      const lenderAssetAddr =
        tokenAddresses[markets[chain.id][marketId].lenderAsset]
      const mintAssetAddr =
        tokenAddresses[markets[chain.id][marketId].mintAsset]

      let costOfCapital: bigint
      try {
        const strategy = getLeverageStrategyInstance({
          sender: address,
          marketId: marketId,
          chainId: chain.id,
          client: walletClient,
          handleSendTransaction: handleSendTransaction,
          setCalculateCostOfCapitalLoading: setCalculateCostOfCapitalLoading,
        })
        if (strategy === null) return
        // const strategy = new UniswapFlashswapDirectMint(
        //   address,
        //   marketId,
        //   chain.id,
        //   publicClient,
        //   handleSendTransaction,
        //   setCalculateCostOfCapitalLoading
        // );

        const route = strategy.route

        setUniswapUserInputError(null)
        costOfCapital = (await strategy.calculateCostOfCapital(
          depositAmtBigInt,
          resultingAdditionalCollateral,
          lenderAssetAddr as `0x${string}`,
          mintAssetAddr as `0x${string}`
        )) as bigint

        const newTotalDebt = userDataVar.userVaultInfo.debt + costOfCapital // bang required

        // set parent component resultingCollateralAmount and resultingBorrowAmount
        setResultingAdditionalCollateral(resultingAdditionalCollateral)
        setCostOfCapital(costOfCapital)
        setNewTotalCollateral(newTotalCollateral)
        setNewTotalDebt(newTotalDebt)
        setRoute(route)
      } catch (e) {
        const error = {
          message:
            'Not enough liquidity on Uniswap. Consider reducing the leverage amount',
          borderRed: {
            topAmountInput: true,
          },
        }
        setUniswapUserInputError(error)
        // TODO: show error modal when errors bubble up
      }
    }
    getResultingCollateralAndDebt()
  }, [createPositionDepositAmount, createPositionLeverageMultiplier])

  // TODO: what does this do? do we need this?
  useEffect(() => {
    let input = document.getElementById('multiplier-input')
    if (input) {
      input.textContent = localCreatePositionLeverageMultiplier
    }
  }, [localCreatePositionLeverageMultiplier, createPositionLeverageMultiplier])

  return (
    <Card className="bg-white dark:bg-transparent drop-shadow-none md:-mt-4">
      <Tab.Group>
        <Tab.List className="flex space-x-4 border-b border-gray-100 dark:border-dark-primary-600 mb-4">
          <Tab className="relative z-50 py-1 text-sm leading-5 text-blue-700 outline-none border-b border-gray-900 dark:border-gray-100">
            Create Position
          </Tab>
        </Tab.List>
      </Tab.Group>
      <div className="border border-gray-100 dark:border-dark-primary-600 rounded p-4">
        {/* <div className="flex justify-between"> */}
        <div className="flex items-center justify-between">
          <p className="mb-1">Deposit Amount</p>
          <p className="mb-1 text-[12px] text-gray-500 flex flex-row">
            Your balance:&nbsp;
            {userData !== null && userData[marketId] !== null ? (
              formatBigInt(
                userData[marketId]?.userWalletInfo.collateralTokenBalance ??
                  BigInt(0),
                18,
                4
              )
            ) : (
              <span
                className={`block p-2 rounded-md bg-gray-200 animate-pulse w-16`}
              ></span>
            )}
          </p>
        </div>
        {/* <p className="text-[12px] text-gray-500">{getUserBalance()[1]}</p> */}
        {/* </div> */}
        <div
          className={`p-1 outline-gray-200 
            ${
              userInputError?.some((error) => {
                error.borderRed.topAmountInput
              })
                ? 'border border-warning-main'
                : 'dark:border-none'
            } drop-shadow bg-white dark:bg-dark-primary-700 rounded relative flex`}
        >
          <AmountInput
            value={createPositionDepositAmount}
            // setValue={handledepositAmt}
            // setValue={(e) => {
            //   updatingRef.current = 'user'
            //   setDepositAmt(e)
            // }}
            setValue={debouncedCreatePositionDepositAmount}
            localValue={localCreatePositionDepositAmount}
            setLocalValue={setLocalCreatePositionDepositAmount}
            isTyping={isTyping}
            setIsTyping={setIsTyping}
            className="w-full font-bold text-lg 2xl:text-2xl rounded dark:bg-dark-primary-600 outline-none pl-2 h-10"
          />
          <div className="min-w-fit flex items-center px-1">
            <Button
              className="w-10 px-1 hover:text-white border-gray text-gray-400 font-light h-6 text-[12px] rounded-md"
              onClick={handleInputMaxButton}
            >
              MAX
            </Button>
            <hr className="block h-[24px] w-[0.1px] mx-2 border-l-[0.1px] border-gray-200 dark:border-gray-400 rounded" />
            <div className="flex items-center gap-1">
              <AssetComponent
                asset={markets[chain.id][marketId].collateralAsset}
              />
              <p className="text-sm pt-[0.5px] pt-1">
                {markets[chain.id][marketId].collateralAsset}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between w-full mt-4">
          <p>Select Leverage</p>
          <div className="shadow-sm p-1 rounded flex space-x-1">
            <AmountInput
              localValue={localCreatePositionLeverageMultiplier}
              setLocalValue={setLocalCreatePositionLeverageMultiplier}
              value={createPositionLeverageMultiplier}
              setValue={debouncedCreatePositionLeverageMultiplier}
              isTyping={isTyping}
              setIsTyping={setIsTyping}
              className="w-8 dark:bg-dark-primary-700 rounded p-1 mr-1"
            />
            <span>x</span>
          </div>
        </div>
        <SliderInput
          value={localCreatePositionLeverageMultiplier}
          setLocalValue={setLocalCreatePositionLeverageMultiplier}
          setValue={debouncedCreatePositionLeverageMultiplier}
          setIsTyping={setIsTyping}
          // setValue={setCreatePositionLeverageMultiplier}
          step={0.1}
          min={1}
          max={currUserPositionInfo?.leverage.maxLeverageMultiplier}
        />
      </div>
      <div className="flex lg:justify-between items-center drop-shadow bg-white dark:bg-dark-primary-700 rounded p-2 mt-4">
        <p className="text-[14px]">Max Slippage</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
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
        selectedTab={'Earn'}
        // depositInput={strToBigInt(userDepositInput, 18)}
        // withdrawInput={strToBigInt(userWithdrawInput, 18)}
        // borrowInput={strToBigInt(userBorrowInput, 18)}
        // repayInput={strToBigInt(userRepayInput, 18)}
        beforeLeverageDepositInput={strToBigInt(
          localCreatePositionDepositAmount,
          18
        )}
        // afterLeverageDepositInput={newTotalCollateral}
        // debtToPayBack={debtToPayBack}
        // userIlkInfo={userIlkInfo}
        // asset={asset}
        // lenderPoolInfo={lenderPoolInfo}
        currUserPositionInfo={currUserPositionInfo} // context
        newUserPositionInfo={newUserPositionInfo} //
        newTotalCollateral={newTotalCollateral}
        newTotalDebt={newTotalDebt}
        // ilkMaxLTVInfo={ilkMaxLTVInfo} // context
        // ilkDustInfo={ilkDustInfo} // context
      />
      {uniswapUserInputError !== null && (
        <div className="flex flex-col mt-2">
          <AlertComponent
            showIcon={false}
            warnings={new Set<string>([uniswapUserInputError.message])}
          />
        </div>
      )}
      <div
        className={`mt-4 drop-shadow dark:border-dark-primary-600 rounded bg-white dark:bg-dark-primary-700 flex items-center justify-between p-2 font-light dark:text-white`}
      >
        <p className="text-[14px]">Est. Borrow APR</p>
        <p className="text-lg font-bold flex space-x-2">
          {showResultingInfo ? (
            (
              (newUserPositionInfo?.yield.leveragedStakingYield ?? 0) * -1
            )?.toFixed(2) + '%'
          ) : (
            <div
              className={`block rounded-md bg-gray-200 animate-pulse w-24 h-5`}
            />
          )}
        </p>
      </div>
      <Button
        variant={
          userInputError !== null || !termsAccepted || !showResultingInfo
            ? 'disabled'
            : 'static'
        }
        className="mt-4 w-full p-2 leading-loose"
        onClick={(e) => {
          setDepositButtonLoading(true)
          handleDepositButton()
        }}
        loading={depositButtonLoading}
        loadingMsg={'Creating Position...'}
      >
        <p>Deposit</p>
      </Button>

      <div className="flex flex-col gap-2 bg-gray-50 dark:bg-dark-primary-700 rounded mt-4 p-2">
        <div className="flex justify-between w-full">
          <p>Resulting Collateral</p>
          <p>
            {
              // newTotalCollateral is not used because it is the exact value
              // after on chain queries. Uses local values here to be responsive to
              // user input.
              (
                parseFloat(localCreatePositionDepositAmount) *
                parseFloat(localCreatePositionLeverageMultiplier)
              ).toFixed(2)
            }{' '}
            {markets[chain.id][marketId].collateralAsset}
          </p>
        </div>
        <div className="flex justify-between w-full">
          <p>Resulting Debt</p>
          <>
            {
              // TODO: if isTyping and newUserPositionInfo is loading
              !showResultingInfo ? (
                <div
                  className={`block rounded-md bg-gray-200 animate-pulse w-24 h-5`}
                />
              ) : (
                <p>
                  {newTotalDebt !== null && formatBigInt(newTotalDebt, 18, 2)}{' '}
                  {markets[chain.id][marketId].lenderAsset}
                </p>
              )
              // If user is typing, render skeleton.
            }
          </>
        </div>
        <div className="flex justify-between w-full">
          <p>Resulting LTV</p>
          <>
            {!showResultingInfo || newUserPositionInfo === null ? (
              <div
                className={`block rounded-md bg-gray-200 animate-pulse w-24 h-5`}
              />
            ) : (
              <p>
                {
                  // TODO: values here don't seem correct
                  (newUserPositionInfo.vault.ltv * 100).toFixed(2) + '%'
                }
              </p>
            )}
          </>
        </div>
        <div className="flex justify-between w-full">
          <p>Liquidation Exchange Rate</p>
          <>
            {!showResultingInfo || newUserPositionInfo === null ? (
              <div
                className={`block rounded-md bg-gray-200 animate-pulse w-24 h-5`}
              />
            ) : (
              <p>
                {formatBigInt(
                  newUserPositionInfo.vault.liquidationExchangeRate,
                  18,
                  2
                )}{' '}
                {`ETH\/${markets[chain.id][marketId].collateralAsset}`}
              </p>
            )}
          </>
        </div>
      </div>
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
                        className={`block rounded-md bg-gray-200 animate-pulse w-24 h-5`}
                      />
                    )}
                  </div>
                  <div className="flex justify-between">
                    <p className="text-gray-400">
                      {markets[chain.id][marketId].collateralAsset} Exchange
                      Rate
                    </p>
                    <>
                      {showResultingInfo &&
                      assetValue !== null &&
                      assetValue[
                        markets[chain.id][marketId].collateralAsset
                      ] !== null ? (
                        <p>
                          {formatBigInt(
                            assetValue[
                              markets[chain.id][marketId].collateralAsset
                            ]?.exchangeRate ?? BigInt(0),
                            18,
                            4
                          ) + ' ETH'}
                        </p>
                      ) : (
                        <div
                          className={`block rounded-md bg-gray-200 animate-pulse w-24 h-5`}
                        />
                      )}
                    </>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-gray-400">
                      {markets[chain.id][marketId].lenderAsset} Exchange Rate
                    </p>
                    <>
                      {showResultingInfo &&
                      assetValue !== null &&
                      assetValue[markets[chain.id][marketId].lenderAsset] !==
                        null ? (
                        <p>
                          {formatBigInt(
                            assetValue[markets[chain.id][marketId].lenderAsset]
                              ?.exchangeRate ?? BigInt(0),
                            18,
                            4
                          ) + ' ETH'}
                        </p>
                      ) : (
                        <div
                          className={`block rounded-md bg-gray-200 animate-pulse w-24 h-5`}
                        />
                      )}
                    </>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-gray-400">
                      {markets[chain.id][marketId].collateralAsset} Market Price
                    </p>
                    <>
                      {showResultingInfo &&
                      assetValue !== null &&
                      assetValue[markets[chain.id][marketId].lenderAsset] !==
                        null ? (
                        <p>
                          {formatBigInt(
                            assetValue[
                              markets[chain.id][marketId].collateralAsset
                            ]?.marketPriceInLenderAsset ?? BigInt(0),
                            18,
                            4
                          ) +
                            ' ' +
                            markets[chain.id][marketId].lenderAsset}
                        </p>
                      ) : (
                        <div
                          className={`block rounded-md bg-gray-200 animate-pulse w-24 h-5`}
                        />
                      )}
                    </>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-gray-400">Cost of Capital</p>
                    <>
                      {
                        // swap cost = token In / token Out
                        // cost of capital per collateral asset = wstETH debt / weETHOnLeverage
                        // costOfCap
                        <>
                          {showResultingInfo &&
                          markets !== null &&
                          assetValue !== null &&
                          costOfCapital !== null &&
                          resultingAdditionalCollateral !== null ? (
                            <p>
                              {resultingAdditionalCollateral -
                                strToBigInt(createPositionDepositAmount, 18) <=
                                BigInt(0) ||
                              assetValue[
                                markets[chain.id][marketId].lenderAsset
                              ] === null
                                ? 0
                                : formatBigInt(
                                    assetValue[
                                      markets[chain.id][marketId].lenderAsset
                                    ]?.exchangeRate ??
                                      (BigInt(0) *
                                        ((costOfCapital * WAD) /
                                          (resultingAdditionalCollateral -
                                            strToBigInt(
                                              createPositionDepositAmount,
                                              18
                                            )))) /
                                        WAD,
                                    18,
                                    10
                                  ) +
                                  ' ETH/' +
                                  markets[chain.id][marketId].collateralAsset}
                            </p>
                          ) : (
                            <div
                              className={`block rounded-md bg-gray-200 animate-pulse w-24 h-5`}
                            />
                          )}
                        </>
                      }
                    </>
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

export default CreatePositionCard
