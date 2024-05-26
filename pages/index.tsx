import AlertBanner from '@/components/AlertBanner'
import AssetComponent from '@/components/AssetComponent'
import Section from '@/components/Section'
import Button from '@/components/common/Button'
import Card from '@/components/common/Card'
import FlipCard from '@/components/common/Card/FlipCard'
import Heading from '@/components/common/Heading'
import BorrowTable from '@/components/common/Table/BorrowTable'
import LendTable from '@/components/common/Table/LendTable'
import { Asset, markets } from '@/config'
import { useApp } from '@/contexts/AppProvider'
import { useAssetValue } from '@/contexts/AssetValueProvider'
import { useMarkets } from '@/contexts/MarketsProvider'
import usePriceOracle from '@/hooks/usePriceOracle'
import SvgHamburger from '@/libs/icons/src/lib/icons/Hamburger'
import SvgRectangle from '@/libs/icons/src/lib/icons/Rectangle'
import themes from '@/styles/globals.json'
import { WAD, weiDollarToggle } from '@/utils/number'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { mainnet, useNetwork } from 'wagmi'

const SkeletonCard = () => (
  <div className={`block py-6 pr-6 rounded-md animate-pulse w-full`}>
    <div className="mt-2 flex items-center justify-between">
      <div className="h-7 bg-gray-300  rounded w-48" />
      <svg
        className="w-10 h-10 mr-2 text-gray-300"
        aria-hidden="true"
        fill="currentColor"
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"
          clipRule="evenodd"
        ></path>
      </svg>
    </div>
    <div className="mt-6 h-2 bg-gray-300 rounded-full max-w-[360px] mb-2.5" />
    <div className="h-2 bg-gray-300 rounded-full max-w-[400px] mb-2.5" />
    <div className="h-2 bg-gray-300 rounded-full max-w-[330px] mb-2.5" />
    <div className="h-2 bg-gray-300 rounded-full max-w-[300px] mb-2.5" />
    <div className="h-2 bg-gray-300 rounded-full max-w-[360px]" />
    <div className="mt-9 h-16 bg-gray-300 rounded min-w-[320px]" />
  </div>
)

export type SingleMarketWithOnlyAssetNames = {
  collateralAsset: Asset
  lenderAsset: Asset
}
export type MarketsWithOnlyAssetNames = {
  [id: string]: SingleMarketWithOnlyAssetNames
}
export type DashboardMarketData = {
  comingSoon: boolean
  collateralAsset: Asset
  lenderAsset: Asset
  totalSuppliedInETH: bigint
  totalBorrowedInETH: bigint
  lenderApy: number
  totalCollateralInETH: bigint
  maxMultiplier: number
}

const marketsComingSoon: SingleMarketWithOnlyAssetNames[] = [
  {
    collateralAsset: 'rsETH',
    lenderAsset: 'wstETH',
  },
  {
    collateralAsset: 'ezETH',
    lenderAsset: 'wstETH',
  },
]

export default function Home() {
  const [assetsViewType, setAssetsViewType] = useState<'Table' | 'Cards'>(
    'Cards'
  )
  const [selectedMode, setSelectedMode] = useState<'Lend' | 'Borrow'>('Lend')
  const [dashboardData, setDashboardData] = useState<DashboardMarketData[]>([])
  const { marketData } = useMarkets()
  const { assetValue } = useAssetValue()
  const { assetApy } = useAssetValue()
  const { price } = usePriceOracle()
  const { loading, currency } = useApp()
  const { chain: returnedChain } = useNetwork()
  const chain = returnedChain === undefined ? mainnet : returnedChain

  // TODO: refactor to support multiple lender assets
  const calculateTvl = (): string | number | null => {
    if (price === null || marketData === null || assetValue === null) return 0

    // calculate total collateral
    let totalCollateral = BigInt(0)
    let totalLenderAsset = BigInt(0)

    let totalCollateralInETH = BigInt(0)
    let totalLenderAssetInETH = BigInt(0)

    Object.values(marketData).forEach((info, idx) => {
      if (info === null) return
      const collateralAsset = markets[chain.id][idx].collateralAsset
      const lenderAsset = markets[chain.id][idx].lenderAsset

      const collateralQuantity = info.tvlInfo.totalCollateralAmount
      const lenderAssetQuantity = info.lenderPoolInfo.totalSupply

      const collateralToETH =
        assetValue[collateralAsset]?.exchangeRate ?? BigInt(0)
      const lenderAssetToETH =
        assetValue[lenderAsset]?.exchangeRate ?? BigInt(0)

      const collateralInETH = (collateralQuantity * collateralToETH) / WAD
      const lenderAssetInETH = (lenderAssetQuantity * lenderAssetToETH) / WAD

      totalCollateralInETH += collateralInETH
      totalLenderAssetInETH += lenderAssetInETH
    })

    const tvlInETH = totalCollateralInETH + totalLenderAssetInETH

    return weiDollarToggle(tvlInETH, price, currency, 4)
  }

  /**
   * Returns an array of objects with information to show on the dashboard
   * @param singleMarket
   */
  const getDashboardDataToShow = (): DashboardMarketData[] | [] => {
    const namedMarkets: SingleMarketWithOnlyAssetNames[] = []

    Object.keys(markets[chain.id]).forEach((id) => {
      const market = markets[chain.id][+id]

      namedMarkets.push({
        collateralAsset: market.collateralAsset,
        lenderAsset: market.lenderAsset,
      })
    })

    const allMarketNames = namedMarkets.concat(marketsComingSoon)

    // append exiting markets to new markets array

    if (marketData === null || assetValue === null) return []
    const dashboardData: DashboardMarketData[] = []
    allMarketNames.forEach((marketNames, idx) => {
      const collateralAsset = marketNames.collateralAsset
      const lenderAsset = marketNames.lenderAsset

      const totalSuppliedQuantity =
        marketData[idx]?.lenderPoolInfo.totalSupply ?? BigInt(0)
      const totalBorrowedQuantity =
        marketData[idx]?.tvlInfo.totalDebtAmount ?? BigInt(0)
      const totalCollateralQuantity =
        marketData[idx]?.tvlInfo.totalCollateralAmount ?? BigInt(0)

      const lenderAssetExchangeRate =
        assetValue[lenderAsset]?.exchangeRate ?? BigInt(0)
      const collateralExchangeRate =
        assetValue[collateralAsset]?.exchangeRate ?? BigInt(0)

      const totalSuppliedInETH =
        (totalSuppliedQuantity * lenderAssetExchangeRate) / WAD
      const totalBorrowedInETH =
        (totalBorrowedQuantity * lenderAssetExchangeRate) / WAD

      const lenderApy = calculateLenderAPY(idx)

      const totalCollateralInETH =
        (totalCollateralQuantity * collateralExchangeRate) / WAD

      const maxLtv = marketData[idx]?.paramsInfo.maxLtv ?? 0
      const maxMultiplier = 1 / (1 - maxLtv)

      const comingSoon = idx > Object.keys(markets[chain.id]).length - 1
      dashboardData.push({
        comingSoon: comingSoon,
        collateralAsset: collateralAsset,
        lenderAsset: lenderAsset,
        totalSuppliedInETH: totalSuppliedInETH,
        totalBorrowedInETH: totalBorrowedInETH,
        lenderApy: lenderApy,
        totalCollateralInETH: totalCollateralInETH,
        maxMultiplier: maxMultiplier,
      })
    })

    return dashboardData
  }

  useEffect(() => {
    setDashboardData(getDashboardDataToShow())
  }, [marketData, assetValue, assetApy, price, loading]) // TODO: Should also update when chain or account changes

  const calculateTotalBorrowing = (): string | number | null => {
    if (price !== null && marketData !== null) {
      let totalBorrowing = BigInt(0)

      Object.values(marketData).forEach((info) => {
        totalBorrowing +=
          info !== null ? info['tvlInfo']['totalDebtAmount'] : BigInt(0)
      })
      return weiDollarToggle(totalBorrowing, price, currency, 4)
    } else {
      return null
    }
  }

  const calculateUtilization = (): number => {
    if (marketData === null) return 0
    const totalSupply = Number(marketData[0]?.lenderPoolInfo.totalSupply) / 1e18
    const totalLiquidity =
      Number(marketData[0]?.lenderPoolInfo.liquidity) / 1e18
    if (totalSupply === 0) return 0
    return ((totalSupply - totalLiquidity) / totalSupply) * 100
  }

  /**
   * Lender APY = (1 + borrowRate) * (1 + lenderAssetAPY) * utilization - 1
   */
  const calculateLenderAPY = (idx: number): number => {
    if (idx !== 0) return 0
    if (marketData === null || assetApy === null) return 0
    const annualBorrowRate = marketData[idx]?.rateInfo.annualBorrowRate ?? 0
    const lenderAsset = markets[chain.id][idx].lenderAsset
    const lenderAssetApy = assetApy[lenderAsset] ?? 0
    const utilizationRate = calculateUtilization()
    const lenderApy = (1 + annualBorrowRate) * (1 + lenderAssetApy / 100) - 1
    const lenderNetApy = lenderApy * utilizationRate
    return lenderNetApy
  }

  const formatCurrency = (content: React.ReactNode) => (
    <>
      {currency === 'DOLLAR' && '$'}
      {currency === 'WEI' ? Number(content).toFixed(2) : content}{' '}
      {currency === 'WEI' && 'ETH'}
    </>
  )
  return (
    <main className="grow h-screen">
      {/* {errors.size > 0 &&
        Array.from(errors).map((error) => (
          <Alert key={error} title="Error" description={error} />
        ))} */}
      <AlertBanner />
      <Section>
        <Heading className="pb-2 2xl:pb-4">Dashboard</Heading>
        <p className="text-md 2xl:text-xl font-light">
          An overview of markets on Ion Protocol
        </p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4 2xl:mt-6">
          <Card
            className={`max-h-fit grid grid-cols-2 h-fit card-blue-gradient from-darkBlue to-blue text-white drop-shadow-[0_35px_35px_rgba(1,150,182,0.3)]`}
          >
            <div>
              <Heading as="h5" className="font-light pb-1">
                Total Value Locked
              </Heading>
              {!loading &&
              marketData !== null &&
              !(Object.keys(marketData).length === 0) ? (
                <p className="text-md 2xl:text-xl font-bold truncate">
                  {formatCurrency(calculateTvl())}
                  {/* {formatBigInt(
                    Object.keys(protocolIlkInfo).length > 0
                      ? Array.from(
                        Object.keys(protocolIlkInfo).map((key) => {
                          return protocolIlkInfo[key]['Dollar']
                        })
                      ).reduce((a, b) => a + b)
                      : 0
                    , 18, 2)} */}
                </p>
              ) : (
                <p className="bg-gray-300 h-6 animate-pulse rounded w-32" />
              )}
            </div>
            {/* {supplyBorrowRateData ? (
              <div className="relative h-24 2xl:h-28 -ml-20">
                <ResponsiveContainer
                  // className="absolute -top-2"
                  width="100%"
                  height={120}
                >
                  <ComposedChart data={supplyBorrowRateData}>
                    <defs>
                      <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="30%"
                          stopColor="#3fdefe"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="90%"
                          stopColor="#01b0d1"
                          stopOpacity={0.1}
                        />
                      </linearGradient>
                    </defs>
                    <XAxis
                      // type="number"
                      // scale="time"
                      dataKey="timestamp"
                      axisLine={false}
                      tickLine={false}
                      tick={false}
                    />
                    <YAxis
                      dataKey="protocol_total_debt"
                      type="category"
                      tickLine={false}
                      tick={false}
                      axisLine={false}
                    // domain={['dataMin', 'dataMax']}
                    />
                    <Line
                      type="monotone"
                      dataKey="protocol_total_debt"
                      stroke="white"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Area
                      type="monotone"
                      dataKey="protocol_total_debt"
                      fillOpacity={1}
                      fill="url(#colorUv)"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-42 bg-gray-300 rounded animate-pulse" />
            )} */}
          </Card>
          <Card
            className={`max-h-fit flex flex-col h-fit border-none ${
              loading ? 'pt-6 md:pt-0' : ''
            }`}
          >
            <div>
              <Heading as="h5" className="font-light pb-1">
                Total Borrowed
              </Heading>
              <div className="flex items-center space-y-2">
                {!loading ? (
                  <p className="text-md 2xl:text-xl font-bold truncate">
                    {formatCurrency(calculateTotalBorrowing())}
                  </p>
                ) : (
                  <p className="mt-2 bg-gray-300 h-6 animate-pulse rounded w-52 mr-4" />
                )}

                {/* {!loading ? (
                <Chip
                  className="bg-green/10 font-light text-green"
                  icon={
                    <SvgArrowUp
                      width={9}
                      height={9}
                      className="mr-1"
                      stroke={themes.colors.green}
                    />
                  }
                >
                  2.31%
                </Chip>
              ) : (
                <div className="mt-2 h-6 bg-gray-300 w-16 rounded animate-pulse" />
              )} */}
              </div>
            </div>
            {/* {supplyBorrowRateData ? (
              <div className="relative h-24 2xl:h-28 -ml-[54px]">
                <ResponsiveContainer
                  // className="absolute -top-2"
                  width="100%"
                  height={100}
                >
                  <ComposedChart data={supplyBorrowRateData}>
                    <defs>
                      <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="30%"
                          stopColor="#3fdefe"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="90%"
                          stopColor="#01b0d1"
                          stopOpacity={0.1}
                        />
                      </linearGradient>
                    </defs>
                    <YAxis
                      dataKey="protocol_ion_pool_balance"
                      type="category"
                      tickLine={false}
                      tick={false}
                      axisLine={false}
                      domain={['dataMin', 'dataMax']}
                    />
                    <XAxis
                      // type="number"
                      // scale="time"
                      dataKey="created_at"
                      axisLine={false}
                      tickLine={false}
                      tick={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="protocol_ion_pool_balance"
                      stroke={theme === 'light' ? themes.colors.blue : 'white'}
                      strokeWidth={2}
                      dot={false}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="mt-4 h-10 animate-pulse bg-gray-300" />
            )} */}
          </Card>
        </div>
      </Section>
      <Section className={`${assetsViewType === 'Table' ? 'mb-20' : ''}`}>
        <div className="flex items-center justify-between mb-2">
          <Heading as="h2" className="font-semibold text-2xl md:text-3xl">
            Markets
          </Heading>
          <div className="flex items-center space-x-2">
            <div className="grid gap-3 md:gap-0 md:mb-2 md:flex items-center md:space-x-2">
              <div className="flex items-center space-x-6 md:space-x-2 scale-75 2xl:scale-100">
                <SvgHamburger
                  className="cursor-pointer scale-[150%] md:scale-[120%]"
                  stroke={
                    assetsViewType === 'Cards'
                      ? themes.colors.gray
                      : themes.colors.blue
                  }
                  width={16}
                  height={14}
                  onClick={() => setAssetsViewType('Table')}
                />
                <SvgRectangle
                  className="cursor-pointer scale-[150%] md:scale-[120%]"
                  fill={
                    assetsViewType === 'Table'
                      ? themes.colors.gray
                      : themes.colors.blue
                  }
                  width={16}
                  height={14}
                  onClick={() => setAssetsViewType('Cards')}
                />
              </div>
            </div>
            <div className="hidden md:block">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  value=""
                  className="sr-only peer"
                  onClick={() =>
                    setSelectedMode(selectedMode === 'Lend' ? 'Borrow' : 'Lend')
                  }
                />
                <div className="relative w-[150px] h-10 after:h-8 after:w-[70px] after:top-1 after:start-1 bg-gray-200 dark:bg-dark-primary-900 peer-focus:outline-none peer-focus:ring-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full after:content-[''] after:absolute after:bg-white after:dark:bg-dark-primary-800 after:rounded-full after:transition-all"></div>
                <p className="absolute left-4 text-[17px]">Lend</p>
                <p className="absolute left-20 md:left-[50%] translate-x-[12%] text-[17px]">
                  Borrow
                </p>
              </label>
            </div>
          </div>
        </div>
        <p className="mb-4 md:mb-8">
          {/* A list of available markets for staked and restaked assets */}
        </p>
        <div className="absolute left-[50%] -translate-x-[50%] my-2">
          <label className="relative md:hidden inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              value=""
              className="sr-only peer"
              onClick={() =>
                setSelectedMode(selectedMode === 'Lend' ? 'Borrow' : 'Lend')
              }
            />
            <div className="relative w-[150px] h-10 after:h-8 after:w-[70px] after:top-1 after:start-1 bg-gray-200 dark:bg-dark-primary-900 peer-focus:outline-none peer-focus:ring-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full after:content-[''] after:absolute after:bg-white after:dark:bg-dark-primary-800 after:rounded-full after:transition-all"></div>
            <p className="absolute left-4 text-[17px]">Lend</p>
            <p className="absolute left-20 md:left-[50%] translate-x-[12%] text-[17px]">
              Borrow
            </p>
          </label>
        </div>
        <div
          className={`mt-20 md:mt-0 ${
            assetsViewType === 'Table' &&
            'bg-white dark:bg-[#0E3163B3] rounded-md p-4 drop-shadow-xl'
          }`}
        >
          {assetsViewType === 'Cards' ? (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-6">
              {loading ||
              marketData === null ||
              Object.keys(marketData).length === 0 ? (
                <>
                  {marketData !== null ? (
                    Object.keys(marketData).map((_, key) => (
                      <SkeletonCard key={key} />
                    ))
                  ) : (
                    <SkeletonCard />
                  )}
                </>
              ) : (
                <>
                  {selectedMode === 'Lend' &&
                    dashboardData.map((data: DashboardMarketData, idx) => {
                      if (data === null) return <></>
                      return (
                        <FlipCard
                          key={`lend-${idx}`}
                          frontCard={
                            <Card
                              style={
                                data.lenderAsset === 'wstETH'
                                  ? {
                                      background: `radial-gradient(farthest-corner at 200px -100px, ${themes.colors.blue}42, transparent 320px),
                                               radial-gradient(farthest-corner at 70% 100%, ${themes.colors.blue}42, transparent 320px)
                                              `,
                                    }
                                  : undefined
                              }
                              className="flex flex-col justify-between bg-neutral-50 p-4 border border-gray-200 dark:border-dark-primary-700 h-[265px]"
                            >
                              <div className="flex space-x-4 mb-6">
                                <div className="flex flex-col border dark:border-dark-primary-700 shadow-[0_0_30px_0_rgba(172,172,172,0.2)] bg-transparent dark:bg-[#10376f1A] rounded-md p-3 pr-4 w-full">
                                  <p className="text-sm text-gray-400">Lend</p>
                                  <div className="flex items-center space-x-1 mt-1">
                                    <div className="rounded-full">
                                      <AssetComponent
                                        asset={data.lenderAsset}
                                      />
                                    </div>
                                    <p>{data.lenderAsset}</p>
                                  </div>
                                </div>
                                <div className="flex flex-col p-3 pr-4 w-full items-start">
                                  <p className="text-sm text-gray-400">
                                    Collateral
                                  </p>
                                  <div className="flex items-center space-x-1 mt-2">
                                    <AssetComponent
                                      asset={data.collateralAsset}
                                    />
                                    <p>{data.collateralAsset}</p>
                                  </div>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-y-1 text-xs mx-4">
                                <p>Total Supplied</p>
                                <p className="text-end">
                                  {loading
                                    ? 0
                                    : formatCurrency(
                                        weiDollarToggle(
                                          data.totalSuppliedInETH,
                                          price,
                                          currency,
                                          2
                                        )
                                      )}{' '}
                                </p>
                                <p>Total Borrowed</p>
                                <p className="text-end">
                                  {loading
                                    ? 0
                                    : formatCurrency(
                                        weiDollarToggle(
                                          data.totalBorrowedInETH,
                                          price,
                                          currency,
                                          18
                                        )
                                      )}{' '}
                                </p>
                                <p>Lender APY</p>
                                <p className="text-end">
                                  {calculateLenderAPY(idx).toFixed(2)}%
                                </p>
                              </div>
                              <Link
                                href={
                                  // disable links for indices greater than length of markets - 1
                                  !data.comingSoon
                                    ? {
                                        pathname: `/lend`,
                                        query: {
                                          collateralAsset: data.collateralAsset,
                                          lenderAsset: data.lenderAsset,
                                          marketId: idx,
                                        },
                                      }
                                    : '/'
                                }
                              >
                                <Button
                                  variant={
                                    !data.comingSoon ? 'static' : 'disabled'
                                  }
                                  className="p-2 w-full text-xs 2xl:text-base border-gray-100"
                                >
                                  {!data.comingSoon ? 'Lend' : 'Coming Soon'}
                                </Button>
                              </Link>
                            </Card>
                          }
                          backCard={
                            <Card
                              className="bg-white border border-gray-100 dark:border-dark-primary-700 h-[265px]"
                              style={{
                                background: `radial-gradient(farthest-corner at 170px 40px, ${themes.colors.blue}42, transparent 400px),
                                         radial-gradient(farthest-corner at 80% 80%, ${themes.colors.blue}42, transparent 400px)`,
                                border: `solid 1px ${themes.colors.cyan}42`,
                              }}
                            >
                              <div className="flex flex-col items-center h-full justify-between">
                                <div className="flex flex-col items-center space-y-4">
                                  <div className="flex mt-2 items-center">
                                    <AssetComponent
                                      asset={data.lenderAsset}
                                      className={`${
                                        data.lenderAsset === 'wstETH'
                                          ? 'scale-[155%]'
                                          : 'scale-[150%]'
                                      } z-10 bg-white rounded-full`}
                                    />
                                    <AssetComponent
                                      asset={data.collateralAsset}
                                      className="-ml-1 z-0 scale-[150%]"
                                    />
                                  </div>
                                  <p className="text-lg font-semiBold pt-1">
                                    Earn more with your staked ETH
                                  </p>
                                </div>
                                <p className="text-xs w-3/4 text-center">
                                  Earn additional ETH yield on top of your stETH
                                  by allowing {data.collateralAsset} depositors
                                  to boost their points and receiving interest
                                  payments from LRT depositors.
                                </p>
                                <Link
                                  href={
                                    !data.comingSoon
                                      ? {
                                          pathname: `/lend`,
                                          query: {
                                            collateralAsset:
                                              data.collateralAsset,
                                            lenderAsset: data.lenderAsset,
                                            marketId: idx,
                                          },
                                        }
                                      : '/'
                                  }
                                  className="w-full place-self-end"
                                >
                                  <Button
                                    variant={
                                      !data.comingSoon ? 'static' : 'disabled'
                                    }
                                    className="p-2 mt-1 w-full text-xs 2xl:text-base border-gray-100"
                                  >
                                    {!data.comingSoon ? 'Lend' : 'Coming Soon'}
                                  </Button>
                                </Link>
                              </div>
                            </Card>
                          }
                        />
                      )
                    })}
                  <>
                    {selectedMode === 'Borrow' &&
                      dashboardData.map((data: DashboardMarketData, idx) => {
                        if (data === null) return <></>
                        const collateralAsset = Object.keys(
                          markets[chain.id]
                        ).includes(String(idx))
                          ? markets[chain.id][idx]['collateralAsset']
                          : data['collateralAsset']
                        const lenderAsset = Object.keys(
                          markets[chain.id]
                        ).includes(String(idx))
                          ? markets[chain.id][idx]['lenderAsset']
                          : data['lenderAsset']
                        return (
                          <FlipCard
                            key={`borrow-${data.collateralAsset}`}
                            frontCard={
                              <Card className="flex flex-col justify-between bg-neutral-50 dark:bg-[#10376f1A] border border-gray-100 dark:border-dark-primary-700 p-4 h-[265px]">
                                <div className="flex space-x-4 mb-6">
                                  <div className="flex flex-col border dark:border-dark-primary-700 shadow-[0_0_30px_0_rgba(172,172,172,0.2)] dark:shadow-none bg-neutral-50 dark:bg-[#10376f32] rounded-md p-3 pr-4 w-full">
                                    <p className="text-sm text-gray-400">
                                      Deposit
                                    </p>
                                    <div className="flex items-center space-x-1 mt-1">
                                      <div className="rounded-full">
                                        <AssetComponent
                                          asset={data.collateralAsset}
                                        />
                                      </div>
                                      <p>{data.collateralAsset}</p>
                                    </div>
                                  </div>
                                  <div className="flex flex-col p-3 pr-4 w-full items-start">
                                    <p className="text-sm text-gray-400">
                                      Borrow
                                    </p>
                                    <div className="flex items-center space-x-1">
                                      <div className="bg-white dark:bg-transparent rounded-full">
                                        <AssetComponent
                                          asset={data.lenderAsset}
                                          className={
                                            data.lenderAsset === 'wstETH'
                                              ? 'scale-[80%]'
                                              : ''
                                          }
                                        />
                                      </div>
                                      <p>{data.lenderAsset}</p>
                                    </div>
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-y-1 text-xs mx-4">
                                  <p>Total Collateral</p>
                                  <p className="text-end">
                                    {loading
                                      ? 0
                                      : formatCurrency(
                                          weiDollarToggle(
                                            data.totalCollateralInETH,
                                            price,
                                            currency,
                                            2
                                          )
                                        )}{' '}
                                  </p>
                                  <p>Total Borrowed</p>
                                  <p className="text-end">
                                    {loading
                                      ? 0
                                      : formatCurrency(
                                          weiDollarToggle(
                                            data.totalBorrowedInETH,
                                            price,
                                            currency,
                                            2
                                          )
                                        )}{' '}
                                  </p>
                                  <p>Max Multiplier</p>
                                  <p className="text-end">
                                    {data.maxMultiplier.toFixed(2)}x
                                  </p>
                                </div>
                                <Link
                                  href={
                                    !data.comingSoon
                                      ? {
                                          pathname: `/borrow`,
                                          query: {
                                            collateralAsset: collateralAsset,
                                            lenderAsset: lenderAsset,
                                            marketId: idx,
                                          },
                                        }
                                      : '/'
                                  }
                                >
                                  <Button
                                    variant={
                                      !data.comingSoon ? 'static' : 'disabled'
                                    }
                                    className="p-2 w-full text-xs 2xl:text-base border-gray-100"
                                  >
                                    {!data.comingSoon
                                      ? 'Borrow'
                                      : 'Coming Soon'}
                                  </Button>
                                </Link>
                              </Card>
                            }
                            backCard={
                              <Card
                                className="bg-white dark:bg-spaceCadet border border-gray-100 dark:border-dark-primary-700 h-[265px]"
                                style={{
                                  background: `radial-gradient(farthest-corner at 170px 40px, ${themes.colors.blue}42, transparent 400px),
                                         radial-gradient(farthest-corner at 80% 80%, ${themes.colors.blue}42, transparent 400px)
                          `,
                                  border: `solid 1px ${themes.colors.cyan}42`,
                                }}
                              >
                                <div className="h-full flex flex-col items-center justify-between">
                                  <div className="flex flex-col items-center space-y-4">
                                    <div className="flex mt-2 items-center">
                                      <AssetComponent
                                        asset={data.collateralAsset}
                                        className="scale-[110%]"
                                      />
                                    </div>
                                    <p className="text-lg font-semiBold pt-1">
                                      Multiply Your Restaking Rewards
                                    </p>
                                  </div>
                                  <p className="text-xs w-3/4 text-center">
                                    Boost your {data.collateralAsset} &
                                    EigenLayer rewards with flashloans. Pay the
                                    market interest rate to multiply your
                                    exposure to to LRT & Eigenlayer points
                                    emissions.
                                  </p>
                                  <Link
                                    href={
                                      !data.comingSoon
                                        ? {
                                            pathname: `/borrow`,
                                            query: {
                                              collateralAsset:
                                                data.collateralAsset,
                                              lenderAsset: data.lenderAsset,
                                              marketId: idx,
                                            },
                                          }
                                        : '/'
                                    }
                                    className="w-full"
                                  >
                                    <Button
                                      variant={
                                        !data.comingSoon ? 'static' : 'disabled'
                                      }
                                      className="p-2 w-full text-xs 2xl:text-base border-gray-100"
                                    >
                                      {!data.comingSoon
                                        ? 'Borrow'
                                        : 'Coming Soon'}
                                    </Button>
                                  </Link>
                                </div>
                              </Card>
                            }
                          />
                        )
                      })}
                  </>
                </>
              )}
            </div>
          ) : (
            <div className="overflow-auto md:overflow-hidden">
              {marketData !== null ? (
                <>
                  {selectedMode === 'Lend' ? (
                    <LendTable
                      dashboardData={dashboardData}
                      price={price}
                      currency={currency}
                    />
                  ) : (
                    <BorrowTable
                      dashboardData={dashboardData}
                      price={price}
                      currency={currency}
                    />
                  )}
                </>
              ) : (
                <div />
              )}
            </div>
          )}
        </div>
      </Section>
    </main>
  )
}
