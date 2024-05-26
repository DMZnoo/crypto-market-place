import AssetComponent from '@/components/AssetComponent'
import { useAssetValue } from '@/contexts/AssetValueProvider'
import { useTheme } from '@/contexts/ThemeProvider'
import { DashboardMarketData } from '@/pages'
import themes from '@/styles/globals.json'
import { weiDollarToggle } from '@/utils/number'
import Link from 'next/link'
import Table from '..'
import Button from '../../Button'
const borrowColumnsData = [
  {
    id: 'Deposit',
    header: <p className="ml-2">Deposit</p>,
    enableSorting: false,
    accessorKey: 'Deposit',
  },
  {
    id: 'Borrow',
    header: 'Borrow',
    accessorKey: 'Borrow',
  },
  {
    id: 'Total Collateral',
    header: 'Total Collateral',
    accessorKey: 'Total Collateral',
  },
  {
    id: 'Total Borrowing',
    header: 'Total Borrowing',
    accessorKey: 'Total Borrowing',
  },
  {
    id: 'Max Multiplier',
    header: 'Max Multiplier',
    accessorKey: 'Max Multiplier',
  },
  {
    id: 'Button',
    header: '',
    accessorKey: 'Button',
  },
]

interface IBorrowTable {
  dashboardData: DashboardMarketData[]
  price: bigint | null
  currency: string
}

const BorrowTable = ({ dashboardData, price, currency }: IBorrowTable) => {
  const { theme } = useTheme()
  const { assetApy } = useAssetValue()

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
          Deposit: (
            <div className="relative flex items-center gap-1 z-10">
              <AssetComponent asset={data.collateralAsset} className="mr-1" />
              {data.collateralAsset}
            </div>
          ),
          Borrow: (
            <div className="relative flex items-center gap-2 z-10">
              <AssetComponent asset={data.lenderAsset} />
              {data.lenderAsset}
            </div>
          ),
          'Total Collateral': (
            <p className="relative z-10">
              {formatCurrency(
                weiDollarToggle(data.totalCollateralInETH, price, currency, 18)
              )}{' '}
            </p>
          ),
          'Total Borrowing': (
            <p className="relative z-10">
              {formatCurrency(
                weiDollarToggle(data.totalBorrowedInETH, price, currency, 18)
              )}
            </p>
          ),
          'Max Multiplier': (
            <p className="relative z-10">{data.maxMultiplier.toFixed(2)}x</p>
          ),
          Button: (
            <>
              <Link
                href={
                  !data.comingSoon
                    ? {
                        pathname: `/borrow`,
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
                  {!data.comingSoon ? 'Deposit' : 'Coming Soon'}
                </Button>
              </Link>
            </>
          ),
        }
      })}
      //@ts-ignore
      columnsData={borrowColumnsData}
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

export default BorrowTable
