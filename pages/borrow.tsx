import AlertBanner from '@/components/AlertBanner'
import AssetComponent from '@/components/AssetComponent'
import InterestRateModuleGraph from '@/components/InterestRateModuleGraph'
import Modal from '@/components/Modal'
import CornerToaster from '@/components/Modal/CornerModal'
import TxFinishedModal from '@/components/Modal/TxFinishedModal'
import WhitelistModal from '@/components/Modal/WhitelistModal'
import AddRemoveCapitalPositionCard from '@/components/PositionCards/AddRemoveCapitalPositionCard'
import CreatePositionCard from '@/components/PositionCards/CreatePositionCard'
import ManagePositionCard from '@/components/PositionCards/ManagePositionCard'
import Section from '@/components/Section'
import { UserInputErrorType } from '@/components/UserInputError'
import UserPositionInfoCard from '@/components/UserPositionInfoCard'
import Button from '@/components/common/Button'
import EthDollarToggleButton from '@/components/common/Button/EthDollarToggleButton'
import Card from '@/components/common/Card'
import { Asset, DEBOUNCE_TIME, markets } from '@/config'
import { useApp } from '@/contexts/AppProvider'
import { useAssetValue } from '@/contexts/AssetValueProvider'
import { useMarkets } from '@/contexts/MarketsProvider'
import { useTheme } from '@/contexts/ThemeProvider'
import { useWhitelist } from '@/contexts/WhitelistProvider'
import useAccountInfo from '@/hooks/useAccountInfo'
import useTransaction from '@/hooks/useTransaction'
import useUserPositionInfo from '@/hooks/useUserPositionInfo'
import { API_METHOD, callApi } from '@/utils/backend'
import { WAD, formatBigInt } from '@/utils/number'
import { classNames } from '@/utils/util'
import { Tab, Transition } from '@headlessui/react'
import { debounce } from 'lodash'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useRef, useState } from 'react'
import toast, { ToastIcon, Toaster } from 'react-hot-toast'
import { mainnet, useAccount, useNetwork } from 'wagmi'
import TxStatusModal from '../components/Modal/TxStatusModal'

export type Tabs =
  | 'Earn'
  | 'Leverage'
  | 'Deleverage'
  | 'Borrow'
  | 'Repay'
  | 'Deposit'

// TODO: This needs to change based on the routing

const userInputTabs: Tabs[] = [
  'Earn',
  'Leverage',
  'Deleverage',
  'Borrow',
  'Repay',
]

const positionTabs = ['Manage Position', 'Add / Remove Capital']

const Borrow = () => {
  const router = useRouter()

  const routerAsset =
    typeof router.query.asset === 'string' ? router.query.asset : undefined

  const { address, signer } = useAccountInfo()

  const { chain: returnedChain } = useNetwork()
  const chain = returnedChain === undefined ? mainnet : returnedChain

  const {
    whitelistInfos,
    status: whitelistStatus,
    fetchWhitelistStatus,
  } = useWhitelist()

  const { isConnected } = useAccount()
  const { walletClient } = useApp()

  const [marketId, setMarketId] = useState<number>(0)

  /**
   * When the chain or address changes, requery the whitelist for the current marketId from scratch.
   */
  useEffect(() => {
    if (!isConnected || !chain || !walletClient || address === '') return
    if ((walletClient.chain?.id ?? null) !== chain.id) return
    fetchWhitelistStatus(address, marketId)
  }, [address, walletClient, chain])

  /**
   * If only the marketId changes, query the additional whitelist information only if the current marketId
   * is not already in the whitelistInfos object.
   */
  useEffect(() => {
    if (!isConnected || !chain || address === '') return
    if (whitelistInfos === null || whitelistInfos[marketId] === undefined) {
      fetchWhitelistStatus(address, marketId)
    }
  }, [marketId])

  const { marketData, userData, trigger, setTrigger } = useMarkets()

  const { assetValue, assetApy } = useAssetValue()

  // Set by child components to update newUserPositionInfo
  const [newTotalCollateral, setNewTotalCollateral] = useState<bigint | null>(
    null
  )
  const [newTotalDebt, setNewTotalDebt] = useState<bigint | null>(null)

  const [calculateCostOfCapitalLoading, setCalculateCostOfCapitalLoading] =
    useState<boolean>(false)

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const id = urlParams.get('marketId')
    if (id) {
      setMarketId(Number(id))
    }
  }, [marketData, chain])

  // --- Curr and New UserPositionInfo ---
  const { userPositionInfo: currUserPositionInfo } = useUserPositionInfo({
    marketId: marketId,
    totalDeposits:
      userData && userData[marketId]
        ? userData[marketId]?.userVaultInfo.collateral ?? null
        : null,
    totalBorrows:
      userData && userData[marketId]
        ? userData[marketId]?.userVaultInfo.debt ?? null
        : null,
  })

  const { userPositionInfo: newUserPositionInfo } = useUserPositionInfo({
    marketId: marketId,
    totalDeposits: newTotalCollateral,
    totalBorrows: newTotalDebt,
  })

  // --- CreatePositionCard ---
  // Set by CreatePositionCard to update UserPositionInfoCard
  // TODO: Can these props be contained in the CreatePositionCard?
  const [createPositionDepositAmount, setCreatePositionDepositAmount] =
    useState<string>('0')
  const [
    localCreatePositionDepositAmount,
    setLocalCreatePositionDepositAmount,
  ] = useState(createPositionDepositAmount)
  const [
    createPositionLeverageMultiplier,
    setCreatePositionLeverageMultiplier,
  ] = useState<string>('1')
  const [
    localCreatePositionLeverageMultiplier,
    setLocalCreatePositionLeverageMultiplier,
  ] = useState(createPositionLeverageMultiplier)

  // TODO: create position leverage multiplier not being debounced
  // local never updates, non local keeps updating

  /// --- ManagePositionCard ---
  // Leverage / Deleverage tab
  const [leverageMultiplierTarget, setLeverageMultiplierTarget] = useState<
    number | null
  >(null)
  // initialize leverageMultiplierTarget to currLeverageMultiplier
  useEffect(() => {
    if (currUserPositionInfo !== null) {
      const currLeverageMultiplier =
        currUserPositionInfo.leverage.currLeverageMultiplier
      setLeverageMultiplierTarget(currLeverageMultiplier)
    }
  }, [currUserPositionInfo])

  const [alreadyUpdated, setAlreadyUpdated] = useState<boolean>(false)
  const [resultingCollateralAmount, setResultingCollateralAmount] = useState<
    bigint | null
  >(null)
  const [resultingBorrowAmount, setResultingBorrowAmount] = useState<
    bigint | null
  >(null)

  // Leverage / Deleverage debounce
  const [localLeverageMultiplierTarget, setLocalLeverageMultiplierTarget] =
    useState<number | null>(leverageMultiplierTarget)
  const debouncedLeverageMultiplierTarget = useCallback(
    debounce((value: number) => {
      setIsTyping(false)
      updatingRef.current = 'user'
      setLeverageMultiplierTarget(value)
    }, DEBOUNCE_TIME),
    []
  )

  useEffect(() => {
    if (!isTyping) {
      setLocalLeverageMultiplierTarget(leverageMultiplierTarget)
    }
  }, [leverageMultiplierTarget])

  // Initialize newTotalCollateral and newTotalDebt
  useEffect(() => {
    if (userData !== null && userData[marketId] !== null) {
      setNewTotalCollateral(
        userData[marketId]?.userVaultInfo.collateral ?? BigInt(0)
      )
      setNewTotalDebt(userData[marketId]?.userVaultInfo.debt ?? BigInt(0))
    }
  }, [userData])

  // use is typing or using the slider (waiting for debounce)
  const [isTyping, setIsTyping] = useState<boolean>(false)

  // true if the user does not have a vault, false otherwise
  // TODO: default to true
  const [showCreatePosition, setShowCreatePosition] = useState<boolean>(true)

  /**
   * Show create position card instead of Manage Position card if
   * 1. User has zero debt and zero collateral
   * 2.
   */
  useEffect(() => {
    if (userData === null || userData[marketId] === null) {
      return
    }

    const userVaultInfo = userData[marketId]?.userVaultInfo ?? null
    if (userVaultInfo === null) return

    if (
      userVaultInfo.collateral === BigInt(0) &&
      userVaultInfo.debt === BigInt(0)
    ) {
      setShowCreatePosition(true)
    } else {
      setShowCreatePosition(false)
    }
  }, [userData, marketId])

  const assetName: Asset = (routerAsset as Asset) || 'wstETH'

  const [asset, setAsset] = useState<Asset>(assetName)

  const [assetListOpen, setAssetListOpen] = useState<boolean>(false)

  // testnet mint asset
  const [mintAssetLoading, setMintAssetLoading] = useState<boolean>(false)

  // switch tabs
  const [selectedTab, setSelectedTab] = useState<Tabs>(userInputTabs[0])
  const [selectedPositionTab, setSelectedPositionTab] = useState<
    (typeof positionTabs)[number]
  >(positionTabs[0])

  // user input for Leverage / Deleverage / Borrow / Repay
  const [firstInputAmt, setFirstInputAmt] = useState<string>('0')

  const [secondInputAmt, setSecondInputAmt] = useState<string>('0')
  const [localSecondInputAmt, setLocalSecondInputAmt] = useState<string>('0')
  const [showManageTab, setShowManageTab] = useState<boolean>(false)

  const debouncedSetFirstInputAmt = useCallback(
    debounce((value: string) => {
      if (value !== firstInputAmt) {
        setIsTyping(false)
        updatingRef.current = 'user'
        setFirstInputAmt(value)
      }
    }, DEBOUNCE_TIME),
    []
  )

  const debouncedSetSecondInputAmt = useCallback(
    debounce((value: string) => {
      if (value !== secondInputAmt) {
        setIsTyping(false)
        updatingRef.current = 'user'
        setSecondInputAmt(value)
      }
    }, DEBOUNCE_TIME),
    []
  )

  // these values get applied to calculate new user position
  const [userDepositInput, setUserDepositInput] = useState<string>('0')
  const [userWithdrawInput, setUserWithdrawInput] = useState<string>('0')
  const [userBorrowInput, setUserBorrowInput] = useState<string>('0')
  const [userRepayInput, setUserRepayInput] = useState<string>('0')

  // Earn tab
  const [userBeforeLeverageDepositInput, setUserBeforeLeverageDepositInput] =
    useState<string>('0')
  const [leveragedDepositAmount, setLeveragedDepositAmount] = useState<bigint>(
    BigInt(0)
  )

  // Errors
  const [userInputError, setUserInputError] = useState<
    UserInputErrorType[] | null
  >(null)

  const [ilkDepositInputError, setIlkDepositInputError] =
    useState<boolean>(false)

  // earn tab user input values
  const [ilkDepositInputAmt, setIlkDepositInputAmt] = useState<string>('0')
  const [leveragePerc, setLeveragePerc] = useState<number>(1)
  const [slippagePerc, setSlippagePerc] = useState<number>(0.01)

  // earn tab leveragePerc debounce
  const [localLeveragePerc, setLocalLeveragePerc] =
    useState<number>(leveragePerc)
  const debouncedLeveragePerc = useCallback(
    debounce((value: number) => {
      // if (value !== leveragePerc) {
      setIsTyping(false)
      updatingRef.current = 'user'
      setLeveragePerc(value)
      // }
    }, DEBOUNCE_TIME),
    []
  )

  // mint asset success/error modal
  const [mintAssetOpen, setMintAssetOpen] = useState<boolean>(true)

  // calculated values
  const [debtToPayBack, setDebtToPayBack] = useState<bigint | null>(BigInt(0)) // without slippage

  const { txStatus, setTxStatus, handleSendTransaction } = useTransaction()

  const [ilkData, setIlkData] = useState<any>()
  const [graphCategory, setGraphCategory] = useState<any>()

  const handleTabChange = (index: number) => {
    setSelectedTab(userInputTabs[index])
  }

  const updatingRef = useRef<'user' | 'program'>('program')

  // Relevant only for manage position
  // Connect the user input field to be responsive to leverage slider
  useEffect(() => {
    if (updatingRef.current == 'user') {
      if (
        leverageMultiplierTarget !== null &&
        leverageMultiplierTarget !== -1 &&
        currUserPositionInfo !== null
      ) {
        const myCapital = currUserPositionInfo.capital.myCapital
        const totalCapital = currUserPositionInfo.capital.totalCapital

        const newTotalCapital =
          (BigInt(leverageMultiplierTarget * 1e27) * myCapital) / BigInt(1e27)

        const difference =
          newTotalCapital > totalCapital
            ? newTotalCapital - totalCapital
            : totalCapital - newTotalCapital

        setFirstInputAmt(formatBigInt(difference, 18, 4))

        updatingRef.current = 'program'
      }
    }
  }, [leverageMultiplierTarget]) // TODO: should this be dependent on currUserPositionInfo as well

  /**
   * Show 'after' info, advanced details, and resulting position info
   * if the user is done typing and the strategy data is finished loading.
   * Also only set true when all variables have loaded.
   */
  const [showResultingInfo, setShowResultingInfo] = useState<boolean>(true)

  useEffect(() => {
    if (
      isTyping === false &&
      calculateCostOfCapitalLoading === false &&
      newUserPositionInfo !== null
      // TODO: Add calculateNewCollateralFromNewDebtLoading === false
    ) {
      setShowResultingInfo(true)
    } else {
      setShowResultingInfo(false)
    }
  }, [isTyping, calculateCostOfCapitalLoading, newUserPositionInfo])

  const { theme } = useTheme()
  const assets: Record<string, string> = {
    wstETH: 'Lido',
    swETH: 'Swell',
    ETHx: 'Stader',
  }

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1020) {
        setShowManageTab(false)
      }
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])
  const handleMintAsset = async () => {
    setMintAssetLoading(true)
    try {
      const body = { address, marketId }
      await callApi('bigbrother/faucetV2', API_METHOD.POST, body)
      toast.custom((t) => (
        <CornerToaster
          title="Success"
          description="You can now use your LSTs to create and manage your positions on the testnet!"
          variant="success"
        />
      ))
      setMintAssetLoading(false)
      setTrigger(!trigger)
    } catch (e: any) {
      setMintAssetLoading(false)
      if (e.statusCode === 409) {
        // show 24 hours left
        toast.custom((t) => (
          <CornerToaster
            title="Error"
            description="You can only use the faucet once every 24 hours"
            variant="error"
          />
        ))
      } else if (e.statusCode === 500) {
        toast.custom((t) => (
          <CornerToaster
            title="Error"
            description="Testnet JSON-RPC Error. Please contact the team!"
            variant="error"
          />
        ))
      } else {
        toast.custom((t) => (
          <CornerToaster
            title="Error"
            description="Testnet Server Error. Please contact the team!"
            variant="error"
          />
        ))
      }
    }
  }
  const renderPositionCard = () => (
    <div
      className={`bg-white dark:bg-dark-primary-900 ${
        showManageTab ? '-mt-4' : 'dark:border'
      } dark:border-dark-primary-600 p-2 xl:pt-6 rounded-md xl:drop-shadow-xl`}
    >
      {showCreatePosition === null ? (
        <div
          className={`block p-4 rounded-md bg-gray-200 animate-pulse w-full h-96`}
        />
      ) : (
        <>
          {!showCreatePosition && (
            <Tab.Group
              selectedIndex={positionTabs.indexOf(selectedPositionTab)}
              onChange={(index) => {
                // setLeverageMultiplierTarget(1)
                setSelectedPositionTab(positionTabs[index])
              }}
            >
              <Tab.List className="flex justify-between mx-4 border-b">
                {positionTabs.map((category) => (
                  <Tab
                    key={category}
                    className={({ selected }) =>
                      classNames(
                        'relative z-50 py-1 text-sm leading-5 text-blue-700 outline-none w-full',
                        selected
                          ? 'border-b border-ebony dark:border-white'
                          : 'text-gray-500'
                      )
                    }
                  >
                    {category}
                  </Tab>
                ))}
              </Tab.List>
            </Tab.Group>
          )}
          {showCreatePosition ? (
            <CreatePositionCard
              marketId={marketId}
              isTyping={isTyping}
              setIsTyping={setIsTyping}
              newTotalCollateral={newTotalCollateral}
              newTotalDebt={newTotalDebt}
              currUserPositionInfo={currUserPositionInfo}
              newUserPositionInfo={newUserPositionInfo}
              createPositionDepositAmount={createPositionDepositAmount}
              setCreatePositionDepositAmount={setCreatePositionDepositAmount}
              localCreatePositionDepositAmount={
                localCreatePositionDepositAmount
              }
              setLocalCreatePositionDepositAmount={
                setLocalCreatePositionDepositAmount
              }
              createPositionLeverageMultiplier={
                createPositionLeverageMultiplier
              }
              setCreatePositionLeverageMultiplier={
                setCreatePositionLeverageMultiplier
              }
              localCreatePositionLeverageMultiplier={
                localCreatePositionLeverageMultiplier
              }
              setLocalCreatePositionLeverageMultiplier={
                setLocalCreatePositionLeverageMultiplier
              }
              setNewTotalCollateral={setNewTotalCollateral}
              setNewTotalDebt={setNewTotalDebt}
              handleSendTransaction={handleSendTransaction}
              setCalculateCostOfCapitalLoading={
                setCalculateCostOfCapitalLoading
              }
              showResultingInfo={showResultingInfo}
            />
          ) : selectedPositionTab === 'Manage Position' ? (
            <ManagePositionCard
              marketId={marketId}
              asset={asset}
              currUserPositionInfo={currUserPositionInfo}
              newUserPositionInfo={newUserPositionInfo}
              leverageMultiplierTarget={leverageMultiplierTarget}
              setLeverageMultiplierTarget={setLeverageMultiplierTarget}
              localLeverageMultiplierTarget={localLeverageMultiplierTarget}
              setLocalLeverageMultiplierTarget={
                setLocalLeverageMultiplierTarget
              }
              // resultingCollateralAmount={resultingCollateralAmount}
              // resultingBorrowAmount={resultingBorrowAmount}
              // setResultingCollateralAmount={setResultingCollateralAmount}
              // setResultingBorrowAmount={setResultingBorrowAmount}
              showResultingInfo={showResultingInfo}
              setShowResultingInfo={setShowResultingInfo}
              setCalculateCostOfCapitalLoading={
                setCalculateCostOfCapitalLoading
              }
              newTotalCollateral={newTotalCollateral}
              newTotalDebt={newTotalDebt}
              setNewTotalCollateral={setNewTotalCollateral}
              setNewTotalDebt={setNewTotalDebt}
              isTyping={isTyping}
              setIsTyping={setIsTyping}
              handleSendTransaction={handleSendTransaction}
            />
          ) : (
            <AddRemoveCapitalPositionCard
              marketId={marketId}
              asset={asset}
              currUserPositionInfo={currUserPositionInfo}
              newUserPositionInfo={newUserPositionInfo}
              leverageMultiplierTarget={leverageMultiplierTarget}
              setLeverageMultiplierTarget={setLeverageMultiplierTarget}
              localLeverageMultiplierTarget={localLeverageMultiplierTarget}
              setLocalLeverageMultiplierTarget={
                setLocalLeverageMultiplierTarget
              }
              resultingCollateralAmount={resultingCollateralAmount}
              resultingBorrowAmount={resultingBorrowAmount}
              setResultingCollateralAmount={setResultingCollateralAmount}
              setResultingBorrowAmount={setResultingBorrowAmount}
              handleSendTransaction={handleSendTransaction}
              newTotalCollateral={newTotalCollateral}
              newTotalDebt={newTotalDebt}
              setNewTotalCollateral={setNewTotalCollateral}
              setNewTotalDebt={setNewTotalDebt}
              showResultingInfo={showResultingInfo}
            />
          )}
        </>
      )}
    </div>
  )
  const getCollateralApy = (): string => {
    if (assetApy === null || markets[chain.id][marketId] === null) return ''
    const collateralAsset = markets[chain.id][marketId].collateralAsset
    if (
      assetApy[collateralAsset] === null ||
      assetApy[collateralAsset] === undefined
    )
      return ''
    const apy = assetApy[collateralAsset]
    if (apy === null) return ''
    return apy.toFixed(2)
  }

  const calculateTotalBorrowedInETH = (): string => {
    if (assetValue === null || marketData === null) return ''
    const lenderAsset = markets[chain.id][marketId].lenderAsset
    const exchangeRate = assetValue[lenderAsset]?.exchangeRate
    const totalDebtAmt = marketData[marketId]?.tvlInfo.totalDebtAmount
    if (exchangeRate === undefined || totalDebtAmt === undefined) return ''
    const totalDebtInETH = (totalDebtAmt * exchangeRate) / WAD
    return formatBigInt(totalDebtInETH, 18, 4)
  }

  const calculateDebtCeilingInETH = (): string => {
    if (assetValue === null || marketData === null) return ''
    const lenderAsset = markets[chain.id][marketId].lenderAsset
    const debtCeiling = marketData[marketId]?.paramsInfo.debtCeiling
    const exchangeRate = assetValue[lenderAsset]?.exchangeRate
    if (exchangeRate === undefined || debtCeiling === undefined) return ''
    const debtCeilingInETH = (debtCeiling * exchangeRate) / WAD
    return formatBigInt(debtCeilingInETH, 18, 4)
  }

  return (
    <main className="grow h-full">
      <AlertBanner />
      <div className="pb-1">
        {address !== '' && (
          <WhitelistModal
            whitelistInfos={whitelistInfos}
            whitelistStatus={whitelistStatus}
            marketId={marketId}
            type={'Borrow'}
          />
        )}
      </div>

      <Section>
        <div className="w-full flex justify-between items-center flex-col lg:flex-row space-y-6 lg:space-y-0">
          <div className="relative lg:hidden">
            <EthDollarToggleButton />
          </div>
          <h1
            className={
              'relative flex items-center flex-col lg:flex-row text-2xl lg:text-3xl font-semiBold'
            }
          >
            <div className="flex items-center mb-2 lg:mb-0">
              <p>Deposit</p>
              <div className="mx-2 flex gap-1 items-center border border-xl dark:border-dark-primary-600 dark:bg-dark-primary-900 rounded-lg p-1">
                <AssetComponent
                  asset={markets[chain.id][marketId].collateralAsset}
                />
                {markets[chain.id][marketId].collateralAsset}
              </div>
            </div>
            <div className="flex items-center">
              <p>and Borrow </p>
              <div className="mx-2 flex gap-1 items-center border border-xl dark:border-dark-primary-600 dark:bg-dark-primary-900 rounded-lg p-1">
                <AssetComponent
                  asset={markets[chain.id][marketId].lenderAsset}
                />
                {markets[chain.id][marketId].lenderAsset}
              </div>
            </div>
          </h1>
          {/* {
            (chain !== undefined &&
              chain.id !== 1) && (
              <Button className="p-2 w-48 lg:w-fit" onClick={handleMintAsset}>
                Mint Testnet Assets
              </Button>
            )
          } */}
        </div>
        <div className="xl:grid xl:grid-cols-[30%_70%] xl:gap-4 mt-8">
          <div className="h-full relative z-10">
            {/* <Card className="sticky top-8 bg-white h-96 w-42" /> */}
            <div className="sticky top-8 hidden xl:block">
              {renderPositionCard()}
            </div>
          </div>
          <div className="relative z-0">
            <Card className="bg-gray-50 drop-shadow-none dark:bg-transparent dark:md:bg-[#001134] border dark:border-[0px] dark:md:border dark:border-dark-primary-600 grid grid-cols-2 md:grid-cols-3 lg:flex lg:flex-row gap-4 md:gap-12 relative mb-4 p-6 2xl:p-6">
              <div className="grow bg-gray-50 dark:bg-[#001134] dark:border dark:border-dark-primary-600 md:dark:border-none p-4 md:p-0 rounded-lg md:rounded-none">
                <p className="text-gray-500">Staking Yield</p>
                <>
                  {assetApy !== null && markets[chain.id][marketId] !== null ? (
                    <p>{getCollateralApy()}%</p>
                  ) : (
                    <div className="animate-pulse">
                      <div className="h-4 w-12 mr-2 bg-gray-200 opacity-80 dark:opacity-10 rounded" />
                    </div>
                  )}
                </>
              </div>
              <hr className="hidden lg:block h-[50px] my-auto w-[0.1px] border-l-[0.1px] border-gray-200 dark:border-gray-400 rounded" />
              {/* <div className="grow bg-gray-50 dark:bg-[#001134] dark:border dark:border-dark-primary-600 md:dark:border-none p-4 md:p-0 rounded-lg md:rounded-none">
                <p className="text-gray-500">Net Borrow APR</p>
                <>
                  {marketData !== null && marketData[marketId] !== null ? (
                    <p>
                      {(
                        marketData[marketId]?.rateInfo.annualBorrowRate * 100
                      ).toFixed(2)}
                      %
                    </p>
                  ) : (
                    <div className="animate-pulse">
                      <div className=" h-4 w-12 mr-2 bg-gray-200 opacity-80 dark:opacity-10 rounded" />
                    </div>
                  )}
                </>
              </div> */}
              <div className="grow bg-gray-50 dark:bg-[#001134] dark:border dark:border-dark-primary-600 md:dark:border-none p-4 md:p-0 rounded-lg md:rounded-none">
                <p className="text-gray-500">MAX LTV</p>
                <>
                  {marketData !== null && marketData[marketId] !== null ? (
                    <p>
                      {(marketData[marketId]?.paramsInfo.maxLtv ?? 0) * 100}%
                    </p>
                  ) : (
                    <div className="animate-pulse">
                      <div className=" h-4 w-12 mr-2 bg-gray-200 opacity-80 dark:opacity-10 rounded" />
                    </div>
                  )}
                </>
              </div>
              <hr className="hidden lg:block h-[50px] my-auto w-[0.1px] border-l-[0.1px] border-gray-200 dark:border-gray-400 rounded" />
              <div className="grow bg-gray-50 dark:bg-[#001134] dark:border dark:border-dark-primary-600 md:dark:border-none p-4 md:p-0 rounded-lg md:rounded-none">
                <p className="text-gray-500">Liq. Threshold</p>
                <>
                  {marketData !== null && marketData[marketId] !== null ? (
                    <p>
                      {(marketData[marketId]?.paramsInfo.liquidationThreshold ??
                        0) * 100}
                      %
                    </p>
                  ) : (
                    <div className="animate-pulse">
                      <div className=" h-4 w-12 mr-2 bg-gray-200 opacity-80 dark:opacity-10 rounded" />
                    </div>
                  )}
                </>
              </div>
              <hr className="hidden lg:block h-[50px] my-auto w-[0.1px] border-l-[0.1px] border-gray-200 dark:border-gray-400 rounded" />
              <div className="grow bg-gray-50 dark:bg-[#001134] dark:border dark:border-dark-primary-600 md:dark:border-none p-4 md:p-0 rounded-lg md:rounded-none col-span-2 md:col-span-1">
                <p className="text-gray-500">Total Borrowed</p>
                <>
                  {marketData !== null &&
                  marketData[marketId] !== null &&
                  assetValue !== null &&
                  assetValue !== undefined ? (
                    <p>{calculateTotalBorrowedInETH()} ETH</p>
                  ) : (
                    <div className="animate-pulse">
                      <div className=" h-4 w-12 mr-2 bg-gray-200 opacity-80 dark:opacity-10 rounded" />
                    </div>
                  )}
                </>
              </div>
              <hr className="hidden lg:block h-[50px] my-auto w-[0.1px] border-l-[0.1px] border-gray-200 dark:border-gray-400 rounded" />
              <div className="grow bg-gray-50 dark:bg-[#001134] dark:border dark:border-dark-primary-600 md:dark:border-none p-4 md:p-0 rounded-lg md:rounded-none col-span-2 md:col-span-1">
                <p className="text-gray-500">Debt Ceiling</p>
                <>
                  {marketData !== null && marketData[marketId] !== null ? (
                    <p>{calculateDebtCeilingInETH()} ETH</p>
                  ) : (
                    <div className="animate-pulse">
                      <div className=" h-4 w-12 mr-2 bg-gray-200 opacity-80 dark:opacity-10 rounded" />
                    </div>
                  )}
                </>
              </div>
            </Card>
            {/* TODO: user position info card */}
            <div className="overflow-auto">
              <UserPositionInfoCard
                currUserPositionInfo={currUserPositionInfo}
                newUserPositionInfo={newUserPositionInfo}
                asset={asset}
                leverageMultiplierTarget={leverageMultiplierTarget}
                isManagePosition={!showCreatePosition}
                showAfterValues={showResultingInfo}
                marketId={marketId}
              />
            </div>
            <Card className="bg-gray-50 drop-shadow-none dark:bg-[#001134] border dark:border-dark-primary-600 mt-6">
              <Tab.Group>
                <Tab.List className="flex space-x-4 pb-1">
                  {/* TODO: introduce historical rates later */}
                  {['Interest Rate Module'].map((category) => (
                    <Tab
                      key={category}
                      className={({ selected }) => {
                        if (selected) {
                          setGraphCategory(category)
                        }
                        return classNames(
                          'relative z-50 py-1 text-sm leading-5 text-blue-700 outline-none',
                          selected
                            ? 'border-b border-ebony dark:border-white'
                            : 'text-gray-500'
                        )
                      }}
                    >
                      {category}
                    </Tab>
                  ))}
                </Tab.List>
              </Tab.Group>
              <hr className="-mt-[5px] relative -z-1 mb-7 bg-gray-300 dark:border-indigo rounded " />
              <div className="pl-8">
                {marketData !== null && marketData[marketId] !== null && (
                  <InterestRateModuleGraph marketInfo={marketData[marketId]!} />
                )}
              </div>
            </Card>
          </div>
          {showCreatePosition ? (
            <div className="mt-8 w-full xl:hidden">
              <Button
                variant="static-bare"
                className="w-full bg-white dark:bg-dark-primary-900 p-2"
                onClick={(e) => {
                  setShowManageTab(!showManageTab)
                }}
              >
                Create Position
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-4 mt-8 w-full xl:hidden">
              <Button
                variant="static-bare"
                className="w-full bg-white dark:bg-dark-primary-900 p-2"
                onClick={(e) => {
                  setShowManageTab(!showManageTab)
                  setSelectedPositionTab(positionTabs[0])
                }}
              >
                Manage Position
              </Button>
              <Button
                variant="static-bare"
                className="w-full bg-white dark:bg-dark-primary-900 p-2"
                onClick={(e) => {
                  setShowManageTab(!showManageTab)
                  setSelectedPositionTab(positionTabs[1])
                }}
              >
                Add/Remove Capital
              </Button>
            </div>
          )}
        </div>
      </Section>
      <Toaster position="bottom-left">
        {(t) => (
          <Transition
            appear
            show={t.visible}
            className="transform p-4 flex bg-white rounded shadow-lg"
            enter="transition-all duration-150"
            enterFrom="opacity-0 scale-50"
            enterTo="opacity-100 scale-100"
            leave="transition-all duration-150"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-75"
          >
            <ToastIcon toast={t} />
            {/* <p className="px-2">{resolveValue(t.message)}</p> */}
          </Transition>
        )}
      </Toaster>
      <TxStatusModal status={txStatus.status} message={txStatus.message} />
      {currUserPositionInfo !== null && newUserPositionInfo !== null && (
        <TxFinishedModal
          txStatus={txStatus}
          asset={asset}
          currUserPositionInfo={currUserPositionInfo}
          newUserPositionInfo={newUserPositionInfo}
          txType={selectedTab} // TODO: should manage tab and transaction type as types
          numbers={[]}
          onClose={() => {
            setTxStatus({ ...txStatus, status: 'Idle' })
            setTrigger(!trigger) // manually update the context state
          }} // Assuming 'Pending' hides the modal
        />
      )}
      <Modal
        className="w-[500px]"
        open={showManageTab}
        setOpen={setShowManageTab}
        content={renderPositionCard()}
      />
      {/* Loading for testnet mint asset */}
    </main>
  )
}

export default Borrow
