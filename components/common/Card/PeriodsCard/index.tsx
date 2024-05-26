import { useTheme } from '@/contexts/ThemeProvider'
import themes from '@/styles/globals.json'
import { formatETH } from '@/utils/number'
import { classNames } from '@/utils/util'
import { Tab } from '@headlessui/react'
import moment from 'moment'
import React, { useEffect, useState } from 'react'
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { AxisDomain, AxisInterval, ScaleType } from 'recharts/types/util/types'
import { twMerge } from 'tailwind-merge'
import Card from '..'
import AllEthLoading from '../../Loading/AllEthLoading'

interface IPeriodsCard {
  className?: string
  children?: React.ReactNode
  data: any
  dataKeys?: string[]
  strokes?: string[]
  titleEl?: React.ReactNode
  contentEl?: React.ReactNode
  xAxisKey: string
  xAxisType?: 'number' | 'category'
  xAxisInterval?: AxisInterval
  xAxisDomain?: AxisDomain
  xAxisScale?: ScaleType
  xTickLine?: boolean
  xAxisTickFormatter?: (val: any, index: number) => string
  xTickCount?: number
  yAxisKey?: string
  yAxisDomain?: AxisDomain
  yAxisInterval?: AxisInterval
  yTickCount?: number
  lineDot?: boolean
  barChart?: React.ReactNode
  graphUnit?: string
  period: 'day' | 'week' | 'month' | 'year' | 'all'
  setPeriod: (val: string) => void
}

const SkeletonCard = () => (
  <div className={`relative block rounded-md animate-pulse w-full h-[200px]`}>
    <div className="absolute top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%]">
      <AllEthLoading outerRing={false} />
    </div>
    <div className="h-[200px] bg-blue opacity-40 dark:opacity-10 rounded" />
  </div>
)

const PeriodsCard: React.FunctionComponent<IPeriodsCard> = ({
  className,
  titleEl,
  contentEl,
  data,
  xAxisKey,
  xAxisType = 'category',
  xAxisInterval = 0,
  xAxisDomain,
  xAxisScale = 'auto',
  xTickLine = false,
  xAxisTickFormatter = (val) => '',
  xTickCount = 10,
  yAxisKey,
  yAxisDomain = [0, 'dataMax+1'],
  yAxisInterval = 'preserveStartEnd',
  yTickCount = 10,
  lineDot = false,
  barChart,
  period = 'day',
  setPeriod,
  graphUnit,
  dataKeys = [],
  strokes = [],
}) => {
  const periods = ['Day', 'Week', 'Month', 'Year', 'All']
  const { theme } = useTheme()
  const [selectedIndex, setSelectedIndex] = useState<number>(0)
  useEffect(() => {
    switch (period) {
      case 'day':
        setSelectedIndex(0)
        break
      case 'week':
        setSelectedIndex(1)
        break
      case 'month':
        setSelectedIndex(2)
        break
      case 'year':
        setSelectedIndex(3)
        break
      default:
        setSelectedIndex(4)
    }
  }, [period])

  return (
    <Card className={twMerge('bg-white dark:bg-spaceCadet', className)}>
      <div className="grid grid-cols-2">
        {titleEl}
        <div className="w-full">
          <Tab.Group selectedIndex={selectedIndex}>
            <Tab.List className="flex space-x-1 rounded-lg bg-gray-50 border border-gray-200 dark:border-dark-primary-900 p-1 dark:bg-[#171731]">
              {periods.map((category) => (
                <Tab
                  key={category}
                  onClick={() => {
                    setPeriod(category.toLowerCase())
                  }}
                  className={({ selected }) => {
                    return classNames(
                      'w-full rounded-lg py-1 text-sm leading-5 text-blue-700 dark:text-white',
                      selected
                        ? 'bg-white dark:bg-dark-primary-900 font-bold'
                        : 'text-gray-500'
                    )
                  }}
                >
                  {category}
                </Tab>
              ))}
            </Tab.List>
          </Tab.Group>
        </div>
      </div>
      <div className="flex items-center space-x-4 mt-4">
        {contentEl}
        {/* <IconButton
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
                  </IconButton> */}
      </div>
      <div className="mt-4 overflow-hidden relative">
        {/* <Tab.Group>
          <Tab.List className="flex space-x-12 p-1">
            {['TVL', 'Interest Rate', 'APY'].map((category) => (
              <Tab
                key={category}
                className={({ selected }) =>
                  classNames(
                    'py-1 text-sm leading-5 text-blue-700',
                    selected
                      ? 'border-b border-black dark:border-transparent'
                      : 'text-gray-500'
                  )
                }
              >
                {category}
              </Tab>
            ))}
          </Tab.List>
        </Tab.Group> */}
        {/* <hr className="-mt-[6px] w-full mb-7 bg-gray-300 border rounded " /> */}
        {!data || Object.entries(data).length === 0 ? (
          <SkeletonCard />
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <ComposedChart data={data}>
              <defs>
                <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="1%"
                    stopColor={
                      theme === 'dark' ? themes.colors.blue : '#3fdefe'
                    }
                    stopOpacity={theme === 'dark' ? 0.4 : 0.01}
                  />
                  <stop
                    offset="90%"
                    stopColor={theme === 'dark' ? '#3fdefe' : '#FFFFFF'}
                    stopOpacity={theme === 'dark' ? 0.01 : 0.5}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                vertical={false}
                strokeWidth={theme === 'light' ? '0.5px' : '0.1px'}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  return active && payload && payload.length ? (
                    <div className="bg-white p-4 rounded dark:text-darkBlue overflow-hidden whitespace-nowrap">
                      <div className="grid">
                        <p className="dark:text-dark-primary-900">
                          {moment.unix(payload[0].payload[xAxisKey]).calendar()}
                        </p>
                        {payload
                          .reduce((acc: any, curr: any) => {
                            if (acc.length === 0) {
                              acc = [curr]
                            } else {
                              if (
                                payload[0].name !== curr.name ||
                                payload[0].payload['date'] !==
                                  curr.payload['date']
                              ) {
                                acc = [...acc, curr]
                              }
                            }
                            return acc
                          }, [])
                          .map((p: any) => {
                            return (
                              <>
                                <div>
                                  <p
                                    style={{ color: p.stroke }}
                                    key={`${p.value}`}
                                  >
                                    {p.unit === 'ETH'
                                      ? formatETH(Number(p.value))
                                      : p.value}{' '}
                                    {p.unit !== 'ETH' ? p.unit : ''}
                                  </p>
                                </div>
                              </>
                            )
                          })}
                      </div>
                    </div>
                  ) : null
                }}
                // allowEscapeViewBox={{
                //   y: true,
                // }}
              />
              <XAxis
                dataKey={xAxisKey}
                scale={xAxisScale}
                tickLine={xTickLine}
                tickFormatter={xAxisTickFormatter}
                type={xAxisType}
                interval={xAxisInterval}
                tickCount={xTickCount}
                domain={xAxisDomain}
              />
              <YAxis
                dataKey={yAxisKey}
                // orientation="right"
                axisLine={false}
                tickLine={false}
                tickFormatter={(val) => ''}
                tickCount={yTickCount}
                interval={yAxisInterval}
                domain={yAxisDomain}
              />
              {barChart === null && (
                <Area
                  type="monotone"
                  dataKey={yAxisKey ?? ''}
                  fillOpacity={1}
                  fill="url(#colorUv)"
                  connectNulls={true}
                />
              )}
              {dataKeys.map((key, idx) => (
                <Line
                  key={key}
                  connectNulls={true}
                  type="monotone"
                  dataKey={key}
                  stroke={strokes[idx]}
                  strokeWidth={2}
                  dot={lineDot}
                  unit={graphUnit}
                />
              ))}
              {yAxisKey && (
                <>
                  <Area
                    type="monotone"
                    dataKey={yAxisKey}
                    fillOpacity={1}
                    fill="url(#colorUv)"
                    connectNulls={true}
                  />
                  <Line
                    connectNulls={true}
                    type="monotone"
                    dataKey={yAxisKey}
                    stroke={themes.colors.blue}
                    strokeWidth={2}
                    dot={lineDot}
                    unit={graphUnit}
                  />
                </>
              )}
              {barChart}
              {dataKeys.length > 0 && <Legend />}
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  )
}
export default PeriodsCard
