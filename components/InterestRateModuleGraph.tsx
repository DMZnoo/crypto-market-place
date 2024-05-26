import { MarketInfo } from '@/contexts/MarketsProvider'
import { useTheme } from '@/contexts/ThemeProvider'
import themes from '@/styles/globals.json'
import Decimal from 'decimal.js'
import { useEffect, useMemo, useState } from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

interface IInterestRateModuleGraph {
  marketInfo: MarketInfo
}

type InterestRateParams = {
  minimumBelowKinkSlope: number
  minimumBaseRate: number
  adjustedBelowKinkSlope: number
  adjustedBaseRate: number
  optimalUtilizationRate: number
  minimumAboveKinkSlope: number
  minimumKinkRate: number
  adjustedAboveKinkSlope: number
  adjustedKinkRate: number
}

const InterestRateModuleGraph = ({ marketInfo }: IInterestRateModuleGraph) => {
  const [lineChartCoords, setLineChartCoords] = useState<any>({
    x: 0,
    y: 0,
  })
  const [graphYMax, setGraphYMax] = useState<number>(8)
  const [ilkData, setIlkData] = useState<any>({})

  const { theme } = useTheme()

  const currentUtilizationRate = useMemo(() => {
    if (marketInfo) {
      const totalSupply = Number(marketInfo.lenderPoolInfo.totalSupply) / 1e18
      const totalLiquidity = Number(marketInfo.lenderPoolInfo.liquidity) / 1e18
      if (totalSupply === 0) return 0
      return ((totalSupply - totalLiquidity) / totalSupply) * 100
    }
    return 0
  }, [marketInfo])

  const getRatesAtUtilization = (
    utilization: number,
    params: InterestRateParams
  ) => {
    let minY =
      Number(params.minimumBelowKinkSlope) * utilization +
      params.minimumBaseRate
    let adjustedY =
      Number(params.adjustedBelowKinkSlope) * utilization +
      params.adjustedBaseRate
    if (utilization >= params.optimalUtilizationRate) {
      minY =
        params.minimumAboveKinkSlope *
          (utilization - params.optimalUtilizationRate) +
        params.minimumKinkRate
      adjustedY =
        params.adjustedAboveKinkSlope *
          (utilization - params.optimalUtilizationRate) +
        params.adjustedKinkRate
    }
    return [minY, adjustedY]
  }

  useEffect(() => {
    ;(async function () {
      const apy = marketInfo['rateInfo']['annualCollateralYield']

      Decimal.config({ precision: 30 }) // Giving ourselves some extra precision

      // RAW DATA
      const apyPerc = (apy * 100).toFixed(4)

      const optimalUtilizationRate =
        marketInfo['rateInfo']['optimalUtilizationRate']

      const minimumBaseRate = marketInfo.rateInfo.annualMinimumBaseRate
      const minimumKinkRate = marketInfo.rateInfo.annualMinimumKinkRate
      const minimumAboveKinkSlope =
        marketInfo.rateInfo.annualMinimumAboveKinkSlope

      const adjustedBaseRate = marketInfo.rateInfo.annualAdjustedBaseRate
      const adjustedKinkRate =
        parseFloat(apyPerc) -
        parseFloat(String(marketInfo.rateInfo.adjustedProfitMargin))

      const adjustedAboveKinkSlope =
        marketInfo.rateInfo.annualAdjustedAboveKinkSlope

      // CALCULATED DATA
      // slope between (0, minimumBaseRate) and (U_opt, minimumKinkRate)
      // (minimumKinkRate - minimumBaseRate) / U_opt

      const minimumBelowKinkSlope =
        (minimumKinkRate - minimumBaseRate) / optimalUtilizationRate

      const adjustedBelowKinkSlope =
        (adjustedKinkRate - adjustedBaseRate) / optimalUtilizationRate

      // TEST DATA
      const minimumFullUtilizationRate =
        minimumAboveKinkSlope * (100 - optimalUtilizationRate) +
        Number(minimumKinkRate)

      // Adjusted Borrow Rate Curve
      // first point = (0, adjustedBaseRate) = ()
      // second point = (optimalUtilizationRate, adjustedKinkRate)
      // third point = (100%, adjustedAboveKinkSlope * (1 - optimalUtilizationRate) + apy - adjustedProfitMargin)
      const adjustedFullUtilizationRate =
        adjustedAboveKinkSlope * (100 - optimalUtilizationRate) +
        adjustedKinkRate

      const params = {
        minimumBelowKinkSlope: minimumBelowKinkSlope,
        minimumBaseRate: minimumBaseRate,
        adjustedBelowKinkSlope: adjustedBelowKinkSlope,
        adjustedBaseRate: adjustedBaseRate,
        optimalUtilizationRate: optimalUtilizationRate,
        minimumAboveKinkSlope: minimumAboveKinkSlope,
        minimumKinkRate: minimumKinkRate,
        adjustedAboveKinkSlope: adjustedAboveKinkSlope,
        adjustedKinkRate: adjustedKinkRate,
      }

      // All 6 coordinates that we want to plot for the two interest rate graphs
      // console.log('rate data MIMUM BORROW RATE CURVE:')
      // console.log(
      //   'rate data minimum borrow rate first point: ',
      //   '(0, ' + minimumBaseRate + ')'
      // )
      // console.log(
      //   'rate data minimum borrow rate second point: ',
      //   '(' + optimalUtilizationRate + ', ',
      //   +minimumKinkRate + ')'
      // )
      // console.log(
      //   'rate data minimum borrow rate third point: ',
      //   '(100, ' + minimumFullUtilizationRate + ')'
      // )

      // console.log('rate data ADJUSTED BORROW RATE CURVE: ')
      // console.log(
      //   'rate data adjusted borrow rate first point: ',
      //   '(0, ' + adjustedBaseRate + ')'
      // )
      // console.log(
      //   'rate data adjusted borrow rate second point: ',
      //   '(' + optimalUtilizationRate + ', ',
      //   +adjustedKinkRate + ')'
      // )
      // console.log(
      //   'rate data adjusted borrow rate third point: ',
      //   '(100, ' + adjustedFullUtilizationRate + ')'
      // )

      const currentRates = getRatesAtUtilization(currentUtilizationRate, params)
      const currentMinY = currentRates[0]
      const currentAdjustedY = currentRates[1]

      let dat: { [i: string]: any } = {}
      for (let i = 0; i <= 100; i++) {
        // from 0% to 92% utilization rate
        // minimumY = minimumBaseRate + minimumBelowKinkSlope * x
        // adjustedY = adjustedBaseRate + adjustedBelowKinkSlope * x
        // from 92% to 100% utilization rate
        // minimumY = minimumKinkRate + minimumAboveKinkSlope * (x - 92)
        // adjustedY = adjustedKinkRate + adjustedAboveKinkSlope * (x - 92)
        const rates = getRatesAtUtilization(i, params)
        const minY = rates[0]

        dat[i] = {
          // name: `rate-${i}`,
          // adjustedY: adjustedY,
          x: i,
          minimumY: minY,
        }
      }

      // TODO: Can we plot the currentUtilizationRate point without
      // removing the point at the nearest integer?
      // replace the nearest integer utilization rate so that the
      // currentUtilizationRate shows up on the graph

      const nearestInteger = Math.round(currentUtilizationRate)
      dat[nearestInteger] = {
        // name: `rate-${currentUtilizationRate}`,
        // adjustedY: currentAdjustedY,
        x: currentUtilizationRate,
        minimumY: currentMinY,
      }

      // set y axis max value to be max(apy, minimum rate at 100% utilization, adjusted rate at 100% utilization)
      const maxRate =
        dat[100].adjustedY > dat[100].minimumY
          ? dat[100].adjustedY
          : dat[100].minimumY
      const yMax = maxRate > apy ? maxRate : apy
      setGraphYMax(yMax)

      setIlkData(Object.values(dat))
    })()
  }, [marketInfo])

  return (
    <div id="interest-module-graph">
      {Object.entries(ilkData).length === 0 ? (
        <div
          className={`block py-6 pr-6 rounded-md bg-gray-200 animate-pulse w-full h-72`}
        />
      ) : (
        <>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart
              data={ilkData}
              onMouseMove={(e) => {
                setLineChartCoords({
                  x: e.chartX,
                  y: e.chartY,
                })
                // const adjustedY = ilkData[0]['adjustedY']
                // const minimumY = ilkData[0]['minimumY']
              }}
            >
              <CartesianGrid vertical={false} strokeWidth="0.5px" />
              <Tooltip
                offset={500}
                // cursor={false}
                content={({ active, payload, label }) => {
                  if (payload && active)
                    return (
                      <div className="bg-white dark:bg-dark-primary-600 border border-gray-400 p-4 rounded">
                        <p className="label">
                          Utilization Rate:{' '}
                          {Number.isInteger(payload[0].payload.x)
                            ? payload[0].payload.x
                            : payload[0].payload.x.toFixed(2)}
                          %
                        </p>
                        {/* TODO: Remove dual interest rate curve for now  */}
                        {/* <p>
                          Adjusted Borrow Rate:{' '}
                          {payload[0].payload['adjustedY'].toFixed(2)}%
                        </p> */}
                        {/* <p>
                          Minimum Borrow Rate: {payload[0].payload['minimumY'].toFixed(2)}%
                        </p> */}
                        <p>
                          Annual Borrow Rate:{' '}
                          {payload[0].payload['minimumY'].toFixed(2)}%
                        </p>
                      </div>
                    )
                  return null
                }}
              />
              <XAxis
                dataKey="x"
                type="number"
                ticks={[...Array(100).keys()]}
                style={theme === 'dark' ? { fill: 'white' } : undefined}
                tickLine={false}
                domain={[0, 100]}
                tickMargin={5}
                padding={{
                  left: 5,
                }}
                interval={0}
                tickFormatter={(val, index) => {
                  return [0, 25, 50, 75, 100].includes(val) ? val + '%' : ''
                }}
              />
              <YAxis
                tickLine={false}
                domain={['dataMin', graphYMax * 1.2]}
                style={theme === 'dark' ? { fill: 'white' } : undefined}
                orientation="right"
                tickFormatter={(val, _) => `${Math.round(val)}%`}
              />
              {/* <ReferenceLine
                label={
                  theme === 'dark'
                    ? { value: 'staking rate', fill: 'white', position: 'top' }
                    : { value: 'staking rate', position: 'top' }
                }
                stroke={themes.colors.cyan}
                strokeDasharray="10 10"
                y={marketInfo['rateInfo']['annualCollateralYield']}
              /> */}
              <ReferenceLine
                label={
                  theme === 'dark'
                    ? { value: 'current', fill: 'white' }
                    : 'current'
                }
                stroke={themes.colors.green}
                strokeDasharray="3 3"
                x={String(currentUtilizationRate)}
              />
              <ReferenceLine
                label={
                  theme === 'dark'
                    ? { value: 'optimal', fill: 'white' }
                    : 'optimal'
                }
                stroke={themes.colors.green}
                strokeDasharray="3 3"
                x={String(marketInfo['rateInfo']['optimalUtilizationRate'])}
              />
              {/* TODO: The  */}
              {/* <ReferenceLine
                label={
                  theme === 'dark'
                    ? { value: 'staking yield', fill: 'white' }
                    : 'staking yield'
                }
                stroke={themes.colors.green}
                strokeDasharray="3 3"
                y={(marketInfo['rateInfo']['annualCollateralYield'] * 100).toFixed(4)} // (apy * 100).toFixed(4)
              /> */}
              {/* TODO: Question: with this dotted line, there were two vertical lines following the mouse. I think removing this and just having one line looks cleaner? */}
              {/* <line
                x1={lineChartCoords.x}
                x2={lineChartCoords.x}
                y1={0}
                y2={217}
                // fill="black"
                stroke={themes.colors.darkBlue}
                strokeDasharray="3 3"
              /> */}

              {/* <circle
                cx={lineChartCoords.x}
                r="3"
                // cy={100}
                cy={
                  ((-minimumBorrowRate + graphDims.y) / graphDims.y) *
                  interestGraphPadding
                }
                fill={'white'}
                stroke={themes.colors.blue}
                strokeWidth={2}
              />
              <circle
                cx={lineChartCoords.x}
                r="3"
                // cy={100}
                cy={
                  ((-adjustedBorrowRate + graphDims.y) / graphDims.y) *
                  interestGraphPadding
                }
                fill={'white'}
                stroke={themes.colors.darkBlue}
                strokeWidth={2}
              /> */}
              <Line
                // type="monotone"
                dataKey="adjustedY"
                stroke={themes.colors.darkBlue}
                strokeWidth={2}
                dot={false}
              />
              <Line
                dataKey="minimumY"
                stroke={themes.colors.blue}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex space-x-4 items-center mt-4">
            {/* <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-darkBlue rounded" />
              <p className="text-sm text-gray-400 dark:text-white">
                Adjusted Borrow Rate
              </p>
            </div> */}
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue rounded" />
              <p className="text-sm text-gray-400 dark:text-white">
                Annual Borrow Rate
              </p>
            </div>
            {/* <div className="flex items-center space-x-2">
              <div className="w-4 h-4 flex items-center space-x-1">
                <div className="w-1 bg-blue h-[1px]" />
                <div className="w-1 bg-blue h-[1px]" />
                <div className="w-1 bg-blue h-[1px]" />
              </div>
              <p className="text-sm text-gray-400 dark:text-white">
                Staking Rate
              </p>
            </div> */}
          </div>
        </>
      )}
    </div>
  )
}

export default InterestRateModuleGraph
