import AlertBanner from '@/components/AlertBanner'
import AlertComponent from '@/components/AlertComponent'
import AmountInput from '@/components/AmountInput'
import AssetComponent from '@/components/AssetComponent'
import InterestRateModuleGraph from '@/components/InterestRateModuleGraph'
import Modal from '@/components/Modal'
import TxFinishedModal from '@/components/Modal/TxFinishedModal'
import TxStatusModal from '@/components/Modal/TxStatusModal'
import WhitelistModal from '@/components/Modal/WhitelistModal'
import Section from '@/components/Section'
import Button from '@/components/common/Button'
import Card from '@/components/common/Card'
import { Asset, markets } from '@/config'
import { useApp } from '@/contexts/AppProvider'
import { useAssetValue } from '@/contexts/AssetValueProvider'
import { MarketInfo, useMarkets } from '@/contexts/MarketsProvider'
import { useTheme } from '@/contexts/ThemeProvider'
import { useWhitelist } from '@/contexts/WhitelistProvider'
import useAccountInfo from '@/hooks/useAccountInfo'
import useLend from '@/hooks/useLend'
import usePriceOracle from '@/hooks/usePriceOracle'
import useTransaction from '@/hooks/useTransaction'
import { HistoryType, useTxHistory } from '@/hooks/useTxHistory'
import { ChevronLeft, EtherFi, Ion } from '@/libs/icons/src/lib/icons'
import { WAD, formatBigInt, strToBigInt, weiDollarToggle } from '@/utils/number'
import { classNames } from '@/utils/util'
import { Listbox, Tab, Transition } from '@headlessui/react'
import { Fragment, useEffect, useState } from 'react'
import { mainnet, useAccount, useNetwork } from 'wagmi'

const enum Tabs {
  Deposit,
  Withdraw,
}

type InputError = {
  message: string
  borderRed: boolean
}

const Lending = () => {
  const { currency, loading } = useApp()

  const [submitTxButtonLoading, setSubmitTxButtonLoading] =
    useState<boolean>(false)
  const [handleSubmitTransactionToggle, setHandleSubmitTransactionToggle] =
    useState<boolean>(false)

  const [collateralAsset, setCollateralAsset] = useState<Asset>('weETH')
  const [lenderAsset, setLenderAsset] = useState<Asset>('wstETH')
  const [marketId, setMarketId] = useState<number>(0)
  const [assetListOpen, setAssetListOpen] = useState<boolean>(false)
  const { theme } = useTheme()

  const [selectedLendTab, setSelectedLendTab] = useState<Tabs>(Tabs.Deposit)
  const [inputAmt, setInputAmt] = useState<string>('0')
  const [inputError, setInputError] = useState<InputError | null>(null)

  const [showDepositTab, setShowDepositTab] = useState<boolean>(false)

  const { txStatus, setTxStatus, handleSendTransaction } = useTransaction()

  const { address, signer } = useAccountInfo()

  const { marketData, userData, trigger, setTrigger } = useMarkets()

  const [marketInfo, setMarketInfo] = useState<MarketInfo | null>(null)

  const { assetApy, assetValue } = useAssetValue()

  const { price } = usePriceOracle()

  const { lendTxHistory } = useTxHistory(HistoryType.Lend)
  const { isConnected } = useAccount()
  const { walletClient } = useApp()
  const { chain: returnedChain } = useNetwork()
  const chain = returnedChain === undefined ? mainnet : returnedChain

  const {
    whitelistInfos,
    status: whitelistStatus,
    fetchWhitelistStatus,
  } = useWhitelist()

  /**
   * When the chain or address changes, requery the whitelist for the current marketId from scratch.
   * The chain object updates before the walletClient updates, so the two objects can refer to
   * different chains. Make sure that they all point to the same chainId before requerying.
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

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const assetType = urlParams.get('collateralAsset')
    const lenderAssetType = urlParams.get('lenderAsset')
    const id = urlParams.get('marketId')
    if (assetType) {
      setCollateralAsset(assetType as Asset)
    }
    if (lenderAssetType) {
      setLenderAsset(lenderAssetType as Asset)
    }
    if (id) {
      setMarketId(Number(id))
    }
    if (marketData !== null) {
      const market = marketData[marketId]
      if (market !== null) {
        setMarketInfo(market)
      }
    }
  }, [marketData, chain])

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1020) {
        setShowDepositTab(false)
      }
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  const resetPage = () => {
    setInputAmt('0')
    setInputError(null)
    setTrigger(!trigger)
  }

  useEffect(() => {
    resetPage()
  }, [selectedLendTab])

  const { supply, withdraw } = useLend(handleSendTransaction)

  const setLendState = (lendS: string) => {
    switch (lendS) {
      case 'Deposit':
        setSelectedLendTab(0)
        break
      case 'Withdraw':
        setSelectedLendTab(1)
        break
      default:
        setSelectedLendTab(0)
    }
  }
  /**
   * Supply or Withdraw based on selected lender state
   */
  const handleSubmitTransaction = async () => {
    setHandleSubmitTransactionToggle(!handleSubmitTransactionToggle)
    if (inputError !== null || strToBigInt(inputAmt, 18) <= BigInt(0)) {
      return
    }
    setSubmitTxButtonLoading(true)
    if (selectedLendTab === Tabs.Deposit) {
      const success = await supply(
        strToBigInt(inputAmt, 18),
        lenderAsset,
        marketId
      )
      if (success) {
        setTrigger(!trigger)
      }
    } else if (selectedLendTab === Tabs.Withdraw) {
      const success = await withdraw(
        strToBigInt(inputAmt, 18),
        lenderAsset,
        marketId
      )
      if (success) {
        setTrigger(!trigger)
      }
    }
    resetPage()
    setSubmitTxButtonLoading(false)
  }

  useEffect(() => {
    ;(async function () {
      if (userData === null || userData[marketId] === null) {
        return
      }
      if (selectedLendTab === Tabs.Deposit) {
        const debtTokenBalance =
          userData[marketId]!.userWalletInfo.debtTokenBalance
        if (BigInt(0) === strToBigInt(inputAmt, 18)) {
          const error: InputError = {
            message: 'Please input a deposit amount!',
            borderRed: true,
          }
          setInputError(error)
        } else if (strToBigInt(inputAmt, 18) > debtTokenBalance) {
          const error: InputError = {
            message: 'The input amount is greater than balance!',
            borderRed: true,
          }
          setInputError(error)
        } else {
          setInputError(null)
        }
      } else if (selectedLendTab === Tabs.Withdraw) {
        const totalClaim = userData[marketId]!.userLendInfo.totalSupplied
        if (strToBigInt(inputAmt, 18) === BigInt(0)) {
          const error: InputError = {
            message: 'Please input a withdraw amoount!',
            borderRed: true,
          }
          setInputError(error)
        } else if (strToBigInt(inputAmt, 18) > totalClaim) {
          const error: InputError = {
            message: 'The input amount is greater than total deposit!',
            borderRed: true,
          }
          setInputError(error)
        } else {
          setInputError(null)
        }
      }
    })()
  }, [inputAmt, handleSubmitTransactionToggle])

  useEffect(() => {
    setInputError(null)
  }, [])

  const handleInputMaxButton = () => {
    if (userData === null || userData[marketId] === null) {
      return
    }
    if (selectedLendTab === Tabs.Deposit) {
      const maxDeposit = userData[marketId]!.userWalletInfo.debtTokenBalance
      // total lender asset balance
      setInputAmt(formatBigInt(maxDeposit, 18, 18))
    } else if (selectedLendTab === Tabs.Withdraw) {
      // TODO: This needs to preempt the rounding for how much to withdraw
      const maxClaim = userData[marketId]!.userLendInfo.totalSupplied
      setInputAmt(formatBigInt(maxClaim, 18, 18))
    }
  }

  const renderMaxInputInfo = () => {
    if (userData === null || userData[marketId] === null) {
      return
    }
    if (selectedLendTab === Tabs.Deposit) {
      const maxDeposit = userData[marketId]!.userWalletInfo.debtTokenBalance
      return <>{formatBigInt(maxDeposit, 18, 4) + ' ' + lenderAsset}</>
    } else if (selectedLendTab === Tabs.Withdraw) {
      // TODO: is there any other way of moving total shares?
      // burnTokens = shares * newSupplyFactor (`balanceOf`)
      // burnShares = burnTokens / newSupplyFactor
      // if supplyFactor increases from time of sending tx to execution,
      // it will burn less shares than intended
      const maxClaim = userData[marketId]!.userLendInfo.totalSupplied
      return <>{formatBigInt(maxClaim, 18, 4) + ' ' + lenderAsset}</>
    }
  }

  const formatCurrency = (content: React.ReactNode) => (
    <>
      {currency === 'DOLLAR' && '$'}
      {content} <span className="text-sm">{currency === 'WEI' && 'ETH'}</span>
    </>
  )

  const renderDepositCard = () => (
    <Card
      className={`bg-white dark:bg-dark-primary-900 dark:border ${
        showDepositTab ? '-mt-8' : ''
      } dark:border-dark-primary-600 relative p-6 relative z-10 drop-shadow-none md:drop-shadow-xl`}
    >
      <Tab.Group selectedIndex={selectedLendTab}>
        <Tab.List className="flex justify-between pb-1">
          {['Deposit', 'Withdraw'].map((category) => (
            <Tab
              key={category}
              onClick={() => {
                setLendState(category)
                setInputAmt('0')
              }}
              className={({ selected }: { selected: boolean }) =>
                classNames(
                  'relative py-1 text-sm leading-5 text-blue-700 outline-none w-full',
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
      <hr className="-mt-[5px] relative -z-1 bg-gray-300 dark:border-dark-primary-800 rounded" />
      <div className="mt-4 flex flex-col gap-4 w-full flex-1 border dark:border-dark-primary-600 p-4 rounded-md">
        {selectedLendTab === Tabs.Deposit && (
          <div className="w-full">
            <p>Choose Asset</p>
            <Listbox value={lenderAsset} onChange={setLenderAsset}>
              <div className="relative">
                <Listbox.Button
                  onClick={() => setAssetListOpen(!assetListOpen)}
                  className={`relative w-full cursor-default rounded-lg ${
                    theme === 'light' ? 'bg-white' : 'bg-dark-primary-600'
                  } py-2 pl-2 pr-10 text-left shadow-md focus:outline-none focus-visible:border-dark-primary-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-300 sm:text-sm`}
                >
                  <div className="flex gap-1 items-center h-10">
                    <AssetComponent asset={lenderAsset} />
                    <span>{lenderAsset}</span>
                  </div>
                  <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                    <ChevronLeft
                      width={25}
                      height={25}
                      fill={`${theme === 'light' ? 'black' : 'white'}`}
                      className={`${
                        assetListOpen ? 'rotate-90' : '-rotate-90'
                      }`}
                    />
                  </span>
                </Listbox.Button>
                <Transition
                  as={Fragment}
                  leave="transition ease-in duration-100"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <Listbox.Options
                    className={`absolute mt-1 max-h-60 w-full overflow-auto rounded-md ${
                      theme === 'light' ? 'bg-white' : 'bg-dark-primary-600'
                    } text-base py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-10`}
                  >
                    {marketData !== null && (
                      <Listbox.Option
                        key={marketId}
                        className={({ active }: { active: boolean }) =>
                          `relative cursor-default select-none py-2 pl-2 pr-4 dark:bg-dark-primary-600 ${
                            active && 'bg-gray-50 text-gray-900 dark:text-white'
                          }`
                        }
                        value={markets[chain.id][marketId]['lenderAsset']}
                        onClick={() => setInputAmt('0')}
                      >
                        {({ selected }: { selected: boolean }) => (
                          <div className="flex items-center">
                            <AssetComponent
                              asset={markets[chain.id][marketId]['lenderAsset']}
                            />
                            <span
                              className={`ml-1 ${
                                selected ? 'font-medium' : 'font-normal'
                              }`}
                            >
                              {markets[chain.id][marketId]['lenderAsset']}
                            </span>
                          </div>
                        )}
                      </Listbox.Option>
                    )}
                  </Listbox.Options>
                </Transition>
              </div>
            </Listbox>
          </div>
        )}
        <div className="w-full">
          <div
            className={`flex items-center justify-between mb-2 ${
              selectedLendTab === Tabs.Deposit ? 'mt-2' : ''
            }`}
          >
            <p>
              {selectedLendTab === Tabs.Deposit ? 'Deposit' : 'Withdraw'} Amount
            </p>
            <p className="text-[12px] text-gray-500">
              {selectedLendTab === Tabs.Deposit
                ? 'Your balance: '
                : 'Your claim: '}
              {/* Your balance:{' '} */}
              <span>{renderMaxInputInfo()}</span>
            </p>
          </div>
          <div
            className={`p-1 shadow-md dark:bg-dark-primary-700 rounded relative flex ${
              inputError ? 'border border-warning-main' : 'dark:border-none'
            }`}
          >
            <AmountInput
              value={inputAmt}
              localValue={inputAmt}
              setValue={setInputAmt}
              setLocalValue={setInputAmt}
              className="w-full pt-1 font-bold text-lg 2xl:text-2xl rounded dark:bg-dark-primary-600 outline-none pl-2"
            />

            <div className="min-w-fit flex items-center px-1">
              <Button
                className="w-10 px-1 hover:text-white border-gray text-gray-400 font-light h-6 text-[12px] rounded-md"
                onClick={handleInputMaxButton}
              >
                Max
              </Button>
              <hr className="block h-[24px] w-[0.1px] mx-2 border-l-[0.1px] border-gray-200 dark:border-gray-400 rounded" />
              <div className="flex items-center gap-1">
                <div className="h-12 flex items-center">
                  {/* <Ethereum className="-mx-4 mb-2 scale-[70%] h-12" /> */}
                  <AssetComponent asset={lenderAsset} />
                </div>
                <p className="text-xs pt-[1px]">{lenderAsset}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {inputError && (
        <div className="mt-4 md:-mb-5">
          <AlertComponent
            showIcon={false}
            warnings={new Set([inputError.message])}
          />
        </div>
      )}
      <Button
        variant={
          inputError !== null
            ? 'disabled'
            : selectedLendTab === Tabs.Deposit
            ? 'static'
            : 'hover'
        }
        className={'w-full h-12 md:h-14 px-2 leading-loose mt-2 md:mt-7'}
        onClick={handleSubmitTransaction}
        loading={submitTxButtonLoading}
        loadingMsg={
          selectedLendTab === Tabs.Deposit ? 'Depositing...' : 'Withdrawing...'
        }
      >
        {selectedLendTab === Tabs.Deposit ? 'Deposit' : 'Withdraw'}
      </Button>
    </Card>
  )

  const calculateUtilization = (): number => {
    if (marketInfo === null) return 0
    const totalSupply = Number(marketInfo.lenderPoolInfo.totalSupply) / 1e18
    const totalLiquidity = Number(marketInfo.lenderPoolInfo.liquidity) / 1e18
    if (totalSupply === 0) return 0
    return ((totalSupply - totalLiquidity) / totalSupply) * 100
  }
  /**
   * Lender APY = (1 + borrowRate) * (1 + lenderAssetAPY) * utilization - 1
   */
  const calculateLenderAPY = (): number => {
    if (marketData === null || assetApy === null) return 0
    const annualBorrowRate =
      marketData[marketId]?.rateInfo.annualBorrowRate ?? 0
    const lenderAsset = markets[chain.id][marketId].lenderAsset
    const lenderAssetApy = assetApy[lenderAsset] ?? 0
    const utilizationRate = calculateUtilization()
    const lenderApy = (1 + annualBorrowRate) * (1 + lenderAssetApy / 100) - 1

    const lenderNetApy = lenderApy * utilizationRate
    return lenderNetApy
  }

  return (
    <main className="grow xl:h-screen">
      <AlertBanner />
      {address !== '' && (
        <WhitelistModal
          whitelistInfos={whitelistInfos}
          whitelistStatus={whitelistStatus}
          marketId={marketId}
          type={'Lend'}
        />
      )}
      <Section>
        <h1
          className={
            'relative flex items-center flex-col md:flex-row mx-auto text-2xl md:text-3xl font-semiBold'
          }
        >
          <div className="flex items-center mb-2 md:mb-0">
            <p>Supply</p>
            <div className="mx-2 flex gap-1 items-center border dark:border-dark-primary-600 dark:bg-dark-primary-900 rounded-lg p-1">
              <AssetComponent asset={lenderAsset} />
              {lenderAsset}
            </div>
          </div>
          <div className="flex items-center">
            <p>to the</p>
            <div className="mx-2 flex gap-1 items-center border dark:border-dark-primary-600 dark:bg-dark-primary-900 rounded-lg p-1">
              <AssetComponent asset={collateralAsset} />
              {collateralAsset}
            </div>
            <p>Market</p>
          </div>
        </h1>
        <div className="xl:grid xl:grid-cols-[25%_75%] xl:gap-4 mt-8">
          <div className="h-full">
            <div className="sticky top-8 hidden xl:block">
              {renderDepositCard()}
            </div>
          </div>
          <div>
            <Card className="md:bg-gray-50 drop-shadow-none md:dark:bg-[#001134] border dark:border-[0px] md:dark:border md:dark:border-dark-primary-600 grid grid-cols-2 md:flex md:flex-row gap-4 md:gap-12 relative p-6">
              <div className="grow bg-gray-50 dark:bg-[#001134] dark:border dark:border-dark-primary-600 md:dark:border-none p-4 md:p-0 rounded-lg md:rounded-none">
                <p className="text-gray-500">Total Supplied</p>
                <>
                  {marketInfo && assetValue ? (
                    <p className="font-bold mt-1">
                      {formatCurrency(
                        weiDollarToggle(
                          (marketInfo.lenderPoolInfo.totalSupply *
                            (assetValue[lenderAsset]?.exchangeRate ??
                              BigInt(0))) /
                            WAD,
                          price,
                          currency,
                          2
                        )
                      )}
                    </p>
                  ) : (
                    <div className="animate-pulse">
                      <div
                        className={`block p-2 rounded-md bg-gray-200 opacity-80 dark:opacity-10 w-16 h-1 mt-2`}
                      />
                    </div>
                  )}
                </>
              </div>
              <hr className="hidden md:block h-[50px] my-auto w-[0.1px] border-l-[0.1px] border-gray-200 dark:border-gray-400 rounded" />
              <div className="grow bg-gray-50 dark:bg-[#001134] dark:border dark:border-dark-primary-600 md:dark:border-none p-4 md:p-0 rounded-lg md:rounded-none">
                <p className="text-gray-500 md:text-[16px]">Supply Cap</p>
                <>
                  {marketInfo && assetValue ? (
                    <p className="font-bold mt-1">
                      {formatCurrency(
                        weiDollarToggle(
                          (marketInfo.lenderPoolInfo.supplyCap *
                            (assetValue[lenderAsset]?.exchangeRate ??
                              BigInt(0))) /
                            WAD,
                          price,
                          currency,
                          2
                        )
                      )}
                    </p>
                  ) : (
                    <div className="animate-pulse">
                      {/* <div className={`block p-2 rounded-md bg-gray-200 opacity-80 dark:opacity-10 w-16 h-1 mt-2`} /> */}
                      <div className="h-4 w-16 mr-2 mt-2 bg-gray-200 opacity-80 dark:opacity-10 rounded" />
                    </div>

                    // <div className="animate-pulse">
                    //   <div className=" h-4 w-16 mr-2 mt-1 bg-gray-200 opacity-80 dark:opacity-10 rounded" />
                    // </div>
                  )}
                </>
              </div>
              <hr className="hidden md:block h-[50px] my-auto w-[0.1px] mx-2 my-2 border-l-[0.1px] border-gray-200 dark:border-gray-400 rounded" />
              <div className="grow bg-gray-50 dark:bg-[#001134] dark:border dark:border-dark-primary-600 md:dark:border-none p-4 md:p-0 rounded-lg md:rounded-none">
                <p className="text-gray-500">Total Collateral</p>
                <>
                  {marketData !== null &&
                  assetValue !== null &&
                  Object.values(marketData).length > 0 ? (
                    <p className="font-bold mt-1">
                      {formatCurrency(
                        weiDollarToggle(
                          ((marketData[marketId]?.tvlInfo
                            .totalCollateralAmount ?? BigInt(0)) *
                            (assetValue[collateralAsset]?.exchangeRate ??
                              BigInt(0))) /
                            WAD,
                          price,
                          currency,
                          2
                        )
                      )}
                    </p>
                  ) : (
                    <div className="animate-pulse">
                      <div className=" h-4 w-16 mr-2 mt-2 bg-gray-200 opacity-80 dark:opacity-10 rounded" />
                    </div>
                  )}{' '}
                </>
              </div>
              <hr className="hidden md:block h-[50px] my-auto w-[0.1px] border-l-[0.1px] border-gray-200 dark:border-gray-400 rounded" />
              <div className="grow bg-gray-50 dark:bg-[#001134] dark:border dark:border-dark-primary-600 md:dark:border-none p-4 md:p-0 rounded-lg md:rounded-none">
                <p className="text-gray-500">Total Borrowing</p>
                <>
                  {marketData !== null &&
                  marketData !== undefined &&
                  assetValue !== null ? (
                    <p className="font-bold mt-1">
                      {formatCurrency(
                        weiDollarToggle(
                          ((marketData[marketId]?.tvlInfo.totalDebtAmount ??
                            BigInt(0)) *
                            (assetValue[lenderAsset]?.exchangeRate ??
                              BigInt(0))) /
                            WAD,
                          price,
                          currency,
                          2
                        )
                      )}
                    </p>
                  ) : (
                    <div className="animate-pulse">
                      <div className=" h-4 w-16 mr-2 mt-2 bg-gray-200 opacity-80 dark:opacity-10 rounded" />
                    </div>
                  )}
                </>
              </div>
            </Card>
            <Card className="bg-gray-50 drop-shadow-none dark:bg-[#001134] border dark:border-dark-primary-600 mt-6">
              <p className="py-1 text-sm relative z-10 leading-5 w-fit text-blue-700 border-b border-black dark:border-white">
                Position Summary
              </p>
              <hr className="-mt-[1.5px] relative -z-1 mb-7 bg-gray-300 dark:border-indigo rounded " />
              <div className="grid grid-cols-2 md:grid-cols-9 mb-4 gap-8">
                <Card className="bg-gray-50 dark:bg-dark-primary-900 md:col-span-2">
                  <p>APY</p>
                  {marketInfo ? (
                    <p className="font-bold mt-1">
                      {calculateLenderAPY().toFixed(2)}
                      {/* {Number(
                        marketInfo['rateInfo']['annualLenderAssetYield'] * 100
                      ).toFixed(2)} */}
                      %
                    </p>
                  ) : (
                    <div className="animate-pulse">
                      <div
                        className={`block p-2 rounded-md bg-gray-200 opacity-80 dark:opacity-10 w-16 h-1 mt-2`}
                      />
                    </div>
                    // <div
                    //   className={`block p-2 rounded-md bg-gray-200 animate-pulse w-16 h-1 mt-2`}
                    // />
                  )}
                </Card>
                <Card className="bg-gray-50 dark:bg-[#001134] drop-shadow-none border dark:border-dark-primary-600 md:col-span-2">
                  <p>My Deposit</p>

                  {marketInfo &&
                  userData !== null &&
                  userData[marketId] !== null ? (
                    <div className="flex flex-row">
                      <p className="font-bold mt-1">
                        {formatCurrency(
                          weiDollarToggle(
                            userData[marketId]!.userLendInfo.totalSupplied,
                            price,
                            currency,
                            2
                          )
                        )}
                      </p>
                    </div>
                  ) : (
                    <div className="animate-pulse">
                      <div
                        className={`block p-2 rounded-md bg-gray-200 opacity-80 dark:opacity-10 w-16 h-1 mt-2`}
                      />
                    </div>
                  )}
                </Card>
                <Card className="bg-gray-50 dark:bg-[#001134] drop-shadow-none md:col-span-2">
                  <p>Borrow Rate</p>
                  {marketInfo ? (
                    <p className="font-bold mt-1">
                      {(
                        marketInfo['rateInfo']['annualBorrowRate'] * 100
                      ).toFixed(2) + '%'}
                    </p>
                  ) : (
                    <div className="animate-pulse">
                      <div
                        className={`block p-2 rounded-md bg-gray-200 opacity-80 dark:opacity-10 w-16 h-1 mt-2`}
                      />
                    </div>
                    // <div
                    //   className={`block p-2 rounded-md bg-gray-200 opacity-80 dark:opacity-10 animate-pulse w-16 h-1 mt-2`}
                    // />
                  )}
                </Card>

                <Card className="bg-gray-50 dark:bg-[#001134] drop-shadow-none md:col-span-2">
                  <p>Utilization Rate</p>
                  {marketInfo ? (
                    <p className="font-bold mt-1">
                      {calculateUtilization().toFixed(2)} %
                    </p>
                  ) : (
                    <div className="animate-pulse">
                      <div
                        className={`block p-2 rounded-md bg-gray-200 opacity-80 dark:opacity-10 w-16 h-1 mt-2`}
                      />
                    </div>
                    // <div
                    //   className={`block p-2 rounded-md bg-gray-200 opacity-80 dark:opacity-10 animate-pulse w-16 h-1 mt-2`}
                    // />
                  )}
                </Card>
              </div>
              <div className="grid grid-cols-2 mb-4 gap-4">
                <Card className="flex flex-col text-primary-300 dark:text-white items-center gap-2 border border-primary-200 dark:border-dark-primary-600 bg-primary-100 dark:bg-dark-primary-900 dark:bg-dark-primary-900">
                  <EtherFi />
                  <p className="text-primary-600 dark:text-white">
                    EtherFi Points
                  </p>
                  <p className="text-gray-400">Coming Soon...</p>
                </Card>
                <Card className="flex flex-col items-center gap-2 border dark:border-dark-primary-600">
                  <Ion />
                  <p>Ion Points</p>
                  <p className="text-gray-400">Coming Soon...</p>
                </Card>
              </div>
              <div className="pl-8">
                {marketInfo && (
                  <InterestRateModuleGraph marketInfo={marketInfo} />
                )}
              </div>
              {/* {marketInfo && <IRMGraph marketInfo={marketInfo} />} */}
            </Card>
            {/* TODO: Bring back TxHistory Table */}
            {/* <Card className="bg-gray-50 border dark:bg-[#001134] dark:border-dark-primary-600  drop-shadow-none  mt-6">
              <TxHistoryTable
                lendTxHistory={lendTxHistory}
                marketId={marketId}
              ></TxHistoryTable>
            </Card> */}
          </div>
          <div className="flex items-center justify-center gap-4 mt-12 w-full xl:hidden">
            <Button
              variant="static-bare"
              className="w-full bg-white dark:bg-dark-primary-700 p-2"
              onClick={(e) => {
                setShowDepositTab(!showDepositTab)
                setSelectedLendTab(selectedLendTab === Tabs.Deposit ? 0 : 1)
              }}
            >
              Deposit
            </Button>
            <Button
              variant="static-bare"
              className="w-full bg-white dark:bg-dark-primary-700 p-2"
              onClick={(e) => {
                setShowDepositTab(!showDepositTab)
                setSelectedLendTab(selectedLendTab === Tabs.Deposit ? 1 : 0)
              }}
            >
              Withdraw
            </Button>
          </div>
        </div>
      </Section>
      {/* <Modal
        open={open}
        setOpen={setOpen}
        title={
          <div className="flex flex-col gap-4 items-center">
            <Heading as="h2">
              {ilkInputError || strToBigInt(ilkInputAmt, 18) <= 0 ? (
                'Input Error'
              ) : (
                <>{selectedLendState === 0 ? 'Deposit' : 'Withdraw'} Info</>
              )}
            </Heading>
          </div>
        }
        description={
          <div className="mt-4">
            <div>
              {!ilkInputError ? (
                <p className=" flex flex-col">
                  <span className="text-lg text-center">
                    {strToBigInt(ilkInputAmt, 18) <= 0
                      ? 'Not a valid input!'
                      : ''}
                  </span>
                  <span className="text-sm">
                    Balance After:

                    ETH
                  </span>
                  <span className="text-sm">
                    Gas: <>{gasEstimate.toString()}</>
                  </span>
                </p>
              ) : (
                <p className="text-lg text-center">{ilkInputError.message}</p>
              )}
            </div>
            <Button
              variant={
                ilkInputError || strToBigInt(ilkInputAmt, 18) <= 0
                  ? 'warning'
                  : 'static'
              }
              className="w-full h-8 mt-2"
              onClick={handleSubmitTransaction}
            >
              Ok
            </Button>
          </div>
        }
      /> */}
      <TxFinishedModal
        txStatus={txStatus}
        txType={selectedLendTab === Tabs.Deposit ? 'Deposit' : 'Withdraw'} // TODO: should manage tab and transaction type as types
        numbers={[]}
        onClose={() => {
          setTxStatus({ ...txStatus, status: 'Idle' })
          setTrigger(!trigger)
        }} // Assuming 'Pending' hides the modal
      />
      <TxStatusModal status={txStatus.status} message={txStatus.message} />
      {showDepositTab && (
        <Modal
          className="h-[300px]"
          open={showDepositTab}
          setOpen={setShowDepositTab}
          content={renderDepositCard()}
        />
      )}
    </main>
  )
}

export default Lending
