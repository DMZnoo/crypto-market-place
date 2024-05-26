import AssetComponent from '@/components/AssetComponent'
import { markets } from '@/config'
import { useAssetValue } from '@/contexts/AssetValueProvider'
import { useMarkets } from '@/contexts/MarketsProvider'
import { useTheme } from '@/contexts/ThemeProvider'
import { DashboardMarketData } from '@/pages'
import themes from '@/styles/globals.json'
import { weiDollarToggle } from '@/utils/number'
import Link from 'next/link'
import { mainnet, useNetwork } from 'wagmi'
import Table from '..'
import Button from '../../Button'

const lendColumnsData = [
  {
    id: 'Lend',
    header: <p className="ml-2">Lend</p>,
    enableSorting: false,
    accessorKey: 'Lend',
  },
  {
    id: 'Collateral',
    header: 'Collateral',
    accessorKey: 'Collateral',
  },
  {
    id: 'Total Supplied',
    header: 'Total Supplied',
    accessorKey: 'Total Supplied',
  },
  {
    id: 'Total Borrowing',
    header: 'Total Borrowing',
    accessorKey: 'Total Borrowing',
  },
  {
    id: 'Lender APY',
    header: 'Lender APY',
    accessorKey: 'Lender APY',
  },
  {
    id: 'Deposit',
    header: '',
    accessorKey: 'Deposit',
  },
]

interface ILendTable {
  dashboardData: DashboardMarketData[]
  price: bigint | null
  currency: string
}

const LendTable = ({ dashboardData, price, currency }: ILendTable) => {
  const { theme } = useTheme()

  const { marketData } = useMarkets()
  const { assetApy } = useAssetValue()
  const { chain: returnedChain } = useNetwork()
  const chain = returnedChain === undefined ? mainnet : returnedChain

  // TODO: refactor out into context provider
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
    if (marketData === null || assetApy === null || chain === undefined)
      return 0
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
    <Table
      data={dashboardData.map((data: DashboardMarketData, idx) => {
        if (data === null) return <></>
        return {
          Lend: (
            <div className="relative flex items-center gap-2 z-10">
              <AssetComponent asset={data.lenderAsset} />
              {data.lenderAsset}
            </div>
          ),
          Collateral: (
            <div className="relative flex items-center gap-2 z-10">
              <AssetComponent asset={data.collateralAsset} />
              <p>{data.collateralAsset}</p>
            </div>
          ),
          'Total Supplied': (
            <p className="relative z-10">
              {formatCurrency(
                weiDollarToggle(data.totalSuppliedInETH, price, currency, 2)
              )}{' '}
            </p>
          ),
          'Total Borrowing': (
            <p className="relative z-10">
              {formatCurrency(
                weiDollarToggle(data.totalBorrowedInETH, price, currency, 2)
              )}
            </p>
          ),
          'Lender APY': (
            <p className="relative z-10">
              {calculateLenderAPY(idx).toFixed(2)}%
            </p>
          ),
          Deposit: (
            <>
              <Link
                href={
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
                  variant={!data.comingSoon ? 'static' : 'disabled'}
                  className="relative p-2 mt-1 w-full"
                >
                  {!data.comingSoon && theme === 'dark' && (
                    <>
                      <span className="absolute block top-0 left-[-100%] w-full h-[2px]" />
                      <span className="absolute block top-[-100%] right-0 w-[2px] h-full" />
                      <span className="absolute block bottom-0 right-[-100%] w-full h-[2px]" />
                      <span className="absolute block bottom-[-100%] left-0 w-[2px] h-full" />
                    </>
                  )}
                  {!data.comingSoon ? 'Lend' : 'Coming Soon'}
                </Button>
              </Link>
            </>
          ),
        }
      })}
      //@ts-ignore
      columnsData={lendColumnsData}
      thStyle="font-medium pb-3"
      trStyle="relative z-10"
      theadStyle="border-b text-gray-500 dark:text-white font-light w-full"
      tbodyStyle="relative"
      tdStyle="dark:border-t-gray-800 pt-3 px-2"
      customRow={
        <td
          className="absolute top-[7%] w-full h-12 rounded z-1"
          style={{
            background: `
                  linear-gradient(to right, 
                    ${themes.colors.blue}1A 0%,
                    transparent 50%,
                    ${themes.colors.blue}1A 100%
                  )`,
          }}
        />
      }
      hoveredRows={{
        '0': (
          <tr className="relative w-inherit h-[60px]">
            <div className="absolute h-14 bg-primary-50 dark:bg-dark-primary-700 w-full -top-[70%] z-0 rounded-t" />
            <div className="absolute bg-primary-50 dark:bg-dark-primary-700 rounded-b w-full">
              <p className="text-[15px] pt-4 pl-2">
                {' '}
                Earn with your restaked assets
              </p>
              <p className="text-xs mt-1 pl-2 pb-4">
                Boost your LRT points with flashloan leverage. You will be
                paying the market borrow rate on your leveraged deposit in
                return for increasing your exposure to points emissions.
              </p>
            </div>
          </tr>
        ),
        '1': (
          <tr className="relative w-inherit h-[60px]">
            <div className="absolute h-14 bg-primary-50 dark:bg-dark-primary-700 w-full -top-[70%] z-0 rounded-t" />
            <div className="absolute bg-primary-50 dark:bg-dark-primary-700 rounded-b w-full">
              <p className="text-[15px] pt-4 pl-2">
                {' '}
                Earn with your restaked assets
              </p>
              <p className="text-xs mt-1 pl-2 pb-4">
                Boost your LRT points with flashloan leverage. You will be
                paying the market borrow rate on your leveraged deposit in
                return for increasing your exposure to points emissions.
              </p>
            </div>
          </tr>
        ),
        '2': (
          <tr className="relative w-inherit h-[60px]">
            <div className="absolute h-14 bg-primary-50 dark:bg-dark-primary-700 w-full -top-[70%] z-0 rounded-t" />
            <div className="absolute bg-primary-50 dark:bg-dark-primary-700 rounded-b w-full">
              <p className="text-[15px] pt-4 pl-2">
                {' '}
                Earn with your restaked assets
              </p>
              <p className="text-xs mt-1 pl-2 pb-4">
                Boost your LRT points with flashloan leverage. You will be
                paying the market borrow rate on your leveraged deposit in
                return for increasing your exposure to points emissions.
              </p>
            </div>
          </tr>
        ),
      }}
    />
  )
}

export default LendTable
