import { Asset, markets } from '@/config'
import { useAssetValue } from '@/contexts/AssetValueProvider'
import usePriceOracle from '@/hooks/usePriceOracle'
import { UserPositionInfo } from '@/hooks/useUserPositionInfo'
import { Eigenlayer, EtherFi, Ion } from '@/libs/icons/src/lib/icons'
import themes from '@/styles/globals.json'
import { Currency, WAD, weiDollarToggle } from '@/utils/number'
import { classNames } from '@/utils/util'
import { Tab } from '@headlessui/react'
import React, { useEffect, useState } from 'react'
import { twMerge } from 'tailwind-merge'
import { mainnet, useNetwork } from 'wagmi'
import { useApp } from '../contexts/AppProvider'
import Card from './common/Card'

const tabs = ['User Position']

type TextComponentProps = {
  title: string
  dataOne: string | null
  dataTwo: string | null
  textAlign?: 'left' | 'center' | 'right'
  unit: Currency | string
  className?: string
  isManagePosition: boolean
  showAfterValues: boolean
}
const TextComponent = (props: TextComponentProps) => {
  // Determine the text alignment class based on props.textAlign
  const textAlignClass = (() => {
    switch (props.textAlign) {
      case 'center':
        return 'text-center'
      case 'right':
        return 'text-right'
      default:
        return 'text-left' // Default alignment
    }
  })()

  return (
    // TODO: If values are null, display the skeleton
    <div
      className={twMerge(
        `flex flex-col ${textAlignClass}`,
        `${props.className ?? props.className}`
      )}
    >
      <p className="pb-3">{props.title}</p>
      <>
        {!props.dataOne ? (
          <div className="animate-pulse">
            <div className=" h-6 w-12 mr-2 bg-gray-200 opacity-80 dark:opacity-10 rounded" />
          </div>
        ) : props.unit === 'WEI' ? (
          <p className="font-bold text-xl pb-2">{props.dataOne + ' ETH'}</p>
        ) : props.unit === 'DOLLAR' ? (
          <p className="font-bold text-xl pb-2">${props.dataOne}</p>
        ) : (
          <p className="font-bold text-xl pb-2">
            {props.dataOne + `${props.unit}`}
          </p>
        )}
      </>
      <>
        {
          <div className="text-sm text-gray-400 flex items-center">
            After:{' '}
            <>
              {/* {!props.dataTwo || !props.showAfterValues ? ( */}
              {!props.showAfterValues || props.dataTwo === null ? (
                <div className="animate-pulse">
                  <div className="ml-1 h-4 w-8 mr-2 bg-gray-200 opacity-80 dark:opacity-10 rounded" />
                </div>
              ) : (
                <span className="ml-1 text-customGreen">
                  {props.unit === 'WEI'
                    ? props.dataTwo + ' ETH'
                    : props.unit === 'DOLLAR'
                    ? '$' + props.dataTwo
                    : props.dataTwo + `${props.unit}`}
                </span>
              )}
            </>
          </div>
        }
      </>
    </div>
  )
}

interface UserPositionInfoProps {
  currUserPositionInfo: UserPositionInfo | null
  newUserPositionInfo: UserPositionInfo | null
  asset: Asset
  leverageMultiplierTarget: number | null
  isManagePosition: boolean
  showAfterValues: boolean
  marketId: number
}

const UserPositionInfoCard: React.FC<UserPositionInfoProps> = ({
  currUserPositionInfo,
  newUserPositionInfo,
  asset,
  leverageMultiplierTarget,
  isManagePosition,
  showAfterValues,
  marketId,
}) => {
  const [selectedTab, setSelectedTab] = useState<string>(tabs[0])
  const { currency } = useApp()
  const { assetValue } = useAssetValue()
  const { price } = usePriceOracle()

  const { chain: returnedChain } = useNetwork()
  const chain = returnedChain === undefined ? mainnet : returnedChain

  const [currLeverage, setCurrLeverage] = useState(
    currUserPositionInfo
      ? Number(currUserPositionInfo.leverage.currLeverageMultiplier)
      : 0
  )

  const [newLeverage, setNewLeverage] = useState(
    newUserPositionInfo
      ? Number(newUserPositionInfo.leverage.currLeverageMultiplier)
      : 0
  )

  const [currMaxLeverage, setCurrMaxLeverage] = useState(
    currUserPositionInfo
      ? Number(currUserPositionInfo.leverage.maxLeverageMultiplier)
      : 10
  )

  const [newMaxLeverage, setNewMaxLeverage] = useState(
    newUserPositionInfo
      ? Number(newUserPositionInfo.leverage.maxLeverageMultiplier)
      : 10
  )

  useEffect(() => {
    if (currUserPositionInfo && newUserPositionInfo) {
      if (leverageMultiplierTarget === null) {
        return
      }
      const currMultiplier = document.getElementById('curr-multiplier-leverage')
      const newMultiplier = document.getElementById('new-multiplier-leverage')

      const currLeverageMultiplier =
        currUserPositionInfo.leverage.currLeverageMultiplier
      const newLeverageMultiplier =
        newUserPositionInfo.leverage.currLeverageMultiplier
      const maxLeverageMultiplier =
        newUserPositionInfo.leverage.maxLeverageMultiplier

      // TODO: Setting the variable here does not save for later in later lines of
      // this execution of useEffect
      setCurrLeverage(
        Number(currUserPositionInfo.leverage.currLeverageMultiplier)
      )
      setNewLeverage(
        Number(newUserPositionInfo.leverage.currLeverageMultiplier)
      )
      if (
        currMaxLeverage !==
        Number(currUserPositionInfo.leverage.maxLeverageMultiplier)
      ) {
        setCurrMaxLeverage(
          Number(currUserPositionInfo.leverage.maxLeverageMultiplier)
        )
      }
      if (
        newMaxLeverage !==
        Number(newUserPositionInfo.leverage.maxLeverageMultiplier)
      ) {
        setNewMaxLeverage(
          Number(newUserPositionInfo.leverage.maxLeverageMultiplier)
        )
      }

      if (!isManagePosition) {
        if (currMultiplier) {
          // assume 1 min ~ 12.5 max
          // for 1x, length should be 0 = 1 / 12.5 -
          // (value - 1) / (total - 1?)
          let length =
            ((currLeverageMultiplier - 1) / (maxLeverageMultiplier - 1)) * 100
          currMultiplier.style.setProperty('width', `${length}%`)
        }
        if (newMultiplier) {
          // the length in percentage should be
          // what percentage does newMultiplier - 1 take up
          // min is 1
          // max is 5
          // if newLeverageMultiplier is 2
          // that's newLeverageMultiplier - min / (max - min)
          // 100 / (max - min)
          let length =
            ((newLeverageMultiplier - 1) / (maxLeverageMultiplier - 1)) * 100
          if (length > 100) {
            length = 100
          }
          newMultiplier.style.setProperty('width', `${length}%`)
        }
      } else {
        // Manage Position
        if (currMultiplier) {
          let length =
            ((currLeverageMultiplier - 1) / (maxLeverageMultiplier - 1)) * 100
          currMultiplier.style.setProperty('width', `${length}%`)
        }
        if (newMultiplier) {
          let length =
            ((newLeverageMultiplier - 1) / (maxLeverageMultiplier - 1)) * 100
          if (length > 100) {
            length = 100
          }
          newMultiplier.style.setProperty('width', `${length}%`)
        }
      }
    }
  }, [
    currUserPositionInfo,
    newUserPositionInfo,
    leverageMultiplierTarget,
    asset,
  ])

  const calculateAvailableBorrowingPower = (
    positionInfo: UserPositionInfo
  ): bigint => {
    const available =
      positionInfo.borrowingPower.maxBorrowingPower -
      positionInfo.borrowingPower.currUsedBorrowingPower // in lender asset terms
    const lenderAsset = markets[chain.id][marketId].lenderAsset
    if (assetValue === null) return BigInt(0)
    const exchangeRate = assetValue[lenderAsset]?.exchangeRate ?? BigInt(0)
    return (available * exchangeRate) / WAD
  }

  const renderLeverageSliderCard = () => (
    <div className="relative flex flex-col pb-8 p-4 rounded-lg border dark:border-dark-primary-600">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-4">
        <Card className="flex flex-col text-primary-300 dark:text-white items-center gap-2 border border-primary-200 dark:border-dark-primary-600 bg-primary-100 dark:bg-dark-primary-900 dark:bg-dark-primary-900">
          <p className="text-primary-600 dark:text-white">EtherFi Points</p>
          <div className="flex space-x-1 font-bold">
            <EtherFi />
          </div>
          <p>
            Multiplier:{' '}
            {currUserPositionInfo?.leverage.currLeverageMultiplier.toFixed(2)}x
          </p>
          <p>
            <span className="text-gray-400">After:</span>{' '}
            <span className="text-cyan">
              {newUserPositionInfo?.leverage.currLeverageMultiplier.toFixed(2)}x
            </span>
          </p>
        </Card>
        <Card className="flex flex-col text-white items-center gap-2 border border-primary-600 bg-primary-300">
          <p>Eigenlayer Points</p>
          <div className="flex space-x-1 font-bold">
            <Eigenlayer />
          </div>
          <p className="text-primary-100 dark:text-white">
            Multiplier:{' '}
            {currUserPositionInfo?.leverage.currLeverageMultiplier.toFixed(2)}x
          </p>
          <p>
            <span className="text-primary-800">After: </span>
            <span className="text-white">
              {newUserPositionInfo?.leverage.currLeverageMultiplier.toFixed(2)}x
            </span>
          </p>
        </Card>
        <Card className="flex flex-col items-center gap-2 border dark:border-dark-primary-600">
          <p>Ion Points</p>
          <div className="flex space-x-1 font-bold">
            <Ion />
          </div>
          <p className="text-gray-400 mt-4">Coming Soon...</p>
          {/* <p className="text-gray-400">Multiplier: 3x</p>
          <p>
            <span className="text-gray-400">After: </span>3x
          </p> */}
        </Card>
      </div>

      <div className="flex flex-row justify-between">
        <p className="text-start mb-2">Leverage Multiplier</p>
        {isManagePosition && (
          <p className="text-start mb-2">
            Available Borrowing Power and % Used
          </p>
        )}
      </div>
      <div className="flex mb-4 justify-between ">
        <div className="flex flex-col md:flex-row md:space-x-2 items-start md:items-center">
          <p>
            <span className="text-lg">
              {currUserPositionInfo?.leverage.currLeverageMultiplier.toFixed(2)}
            </span>{' '}
            x
          </p>
          <p className="text-gray-400">
            After:{' '}
            <span className="text-cyan">
              {newUserPositionInfo?.leverage.currLeverageMultiplier.toFixed(2)}x
            </span>
          </p>
        </div>
        {isManagePosition && (
          <div>
            <div className="flex items-end md:items-center flex-col md:flex-row md:space-x-2 ">
              {currUserPositionInfo ? (
                <>
                  {/* <p className="">
                      {currency === 'DOLLAR' && '$'}
                      {weiDollarToggle(
                        currUserPositionInfo.borrowingPower.currUsedBorrowingPower,
                        price,
                        currency,
                        4
                      )}
                      {' '}
                      {currency === 'WEI' && 'ETH'}
                    </p>
                    &nbsp;
                    / */}
                  <p className="">
                    {currency === 'DOLLAR' && '$'}
                    {weiDollarToggle(
                      calculateAvailableBorrowingPower(currUserPositionInfo),
                      // (currUserPositionInfo.borrowingPower.maxBorrowingPower - currUserPositionInfo.borrowingPower.currUsedBorrowingPower),
                      price,
                      currency,
                      4
                    )}{' '}
                    {currency === 'WEI' && 'ETH'}
                  </p>
                  &nbsp; / &nbsp;
                  {Number(
                    currUserPositionInfo.borrowingPower.currUsedBorrowingPowerPerc.toFixed(
                      2
                    )
                  )}
                  %
                </>
              ) : (
                ''
              )}
              {newUserPositionInfo && (
                <p className="text-gray-400">
                  After:{' '}
                  {newUserPositionInfo !== null && (
                    <span className="text-cyan">
                      {/* {currency === 'DOLLAR' && '$'}
                        {weiDollarToggle(
                          newUserPositionInfo.borrowingPower.currUsedBorrowingPower,
                          price,
                          currency,
                          4
                        )}
                        {' '}
                        /
                        {' '} */}
                      {weiDollarToggle(
                        calculateAvailableBorrowingPower(newUserPositionInfo),
                        // newUserPositionInfo.borrowingPower.maxBorrowingPower - newUserPositionInfo.borrowingPower.currUsedBorrowingPower,
                        price,
                        currency,
                        4
                      )}{' '}
                      {currency === 'WEI' && 'ETH'} /{' '}
                      {Number(
                        newUserPositionInfo.borrowingPower.currUsedBorrowingPowerPerc.toFixed(
                          2
                        )
                      )}
                      %
                    </span>
                  )}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
      <div className="relative flex w-full">
        {/* TODO: background sider theme dark mode */}
        <div className="absolute bg-gray-100 dark:bg-dark-primary-900 h-5 rounded-xl w-full -left-1" />

        <div
          id="new-multiplier-leverage"
          className={`-left-1 relative h-5 rounded-xl bg-gradient-to-r from-primary-300 to-primary-300`}
        >
          {newLeverage < currLeverage && (
            // this length is equal from left to new multiplier tick
            <div
              id="new-multiplier-leverage"
              className={`absolute h-5 rounded-xl bg-primary-300`}
            />
          )}
        </div>

        <div
          id="curr-multiplier-leverage"
          className={`-left-1 absolute h-5 rounded-xl bg-gradient-to-r from-primary-800 to-primary-800`}
        >
          {newLeverage < currLeverage && (
            // this length is equal from left to current multiplier tick
            <div
              id="curr-multiplier-leverage"
              className={`absolute h-5 rounded-xl bg-primary-300 right-0`}
            />
          )}
        </div>

        {[...Array(Number(currMaxLeverage.toFixed(0)) + 1).keys()]
          .slice(1)
          .map((key, idx) => {
            // key 1, idx 0 left: 0
            // key 2, idx 1 left: 2/5 * 100 = 40%
            // key 3, idx 2
            // key 4, idx 3
            // key 5, idx 4 left: 4/5 * 100 = 80%

            // TODO: instead of adjusting this to 97 from 100, change the total length of the container
            const perc = 97 / (currMaxLeverage - 1)
            const left = perc * idx

            // 1 should be 0%
            // 2 should be 25%
            // 3 should be 50%
            // 4 should be 75%
            // 5 should be 100%
            // 0 + 25% * idx
            // 25% = 100 / (5 - 1)

            return (
              <>
                <div
                  className="absolute rounded-full w-3 h-3 bg-primary-200 top-[50%] -translate-y-[50%]"
                  style={(() => {
                    return {
                      // left: `${(idx / currMaxLeverage) * 100
                      //   }%`,
                      left: `${left}%`,
                      background:
                        (isManagePosition && key < currLeverage) ||
                        key < (leverageMultiplierTarget ?? currLeverage)
                          ? themes.colors.primary['200']
                          : `${themes.colors.gray}42`,
                    }
                  })()}
                />
                <span
                  className="absolute rounded-full w-3 h-3 top-[100%] translate-y-[100%] text-xs text-gray-400"
                  style={(() => {
                    return {
                      // left: `${(idx / currMaxLeverage) * 100
                      //   }%`,
                      left: `${left}%`,
                    }
                  })()}
                >
                  {key}x
                </span>
              </>
            )
          })}
      </div>
    </div>
  )

  return (
    <Card
      className={`bg-gray-50 drop-shadow-none dark:bg-[#001134] border dark:border-dark-primary-600 p-6 ${
        isManagePosition ? 'opacity-[100%]' : ''
      }`}
    >
      <Tab.Group
        selectedIndex={tabs.indexOf(selectedTab)}
        onChange={(e) => {
          setSelectedTab(tabs[e])
        }}
      >
        <Tab.List className="flex space-x-4">
          {tabs.map((category) => (
            <Tab
              key={category}
              className={({ selected }) =>
                classNames(
                  'relative z-50 py-1 text-sm leading-5 text-blue-700 outline-none',
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
      <div className="relative flex flex-col gap-4 mt-5">
        {/* <div className="col-span-1 flex flex-col justify-center text-center rounded border">
                    <TextComponent
                        title="My Capital"
                        // dataOne="$300"
                        dataOne={weiDollarToggle(
                            currUserPositionInfo?.capital?.myCapital,
                            price,
                            currency,
                            4
                        )}
                        dataTwo={
                            weiDollarToggle(
                                newUserPositionInfo?.capital.myCapital,
                                price,
                                currency,
                                4
                            )
                        }
                        textAlign="center"
                        unit={currency}
                    />
                </div> */}
        <div className="grid grid-cols-2 gap-4 md:gap-0 md:grid-cols-4 w-full">
          <TextComponent
            title="Total Capital"
            className={`p-4 md:border-r dark:border dark:bg-dark-primary-900 dark:border-dark-primary-600 rounded-md shadow-md dark:shadow-none`}
            dataOne={weiDollarToggle(
              currUserPositionInfo?.capital.totalCapitalInETH,
              price,
              currency,
              4
            )}
            dataTwo={weiDollarToggle(
              newUserPositionInfo?.capital.totalCapitalInETH,
              price,
              currency,
              4
            )}
            textAlign="left"
            unit={currency}
            isManagePosition={isManagePosition}
            showAfterValues={showAfterValues}
          />
          <TextComponent
            title="My Capital"
            className={`${
              selectedTab === tabs[0]
                ? 'p-4 dark:border dark:border-dark-primary-600 dark:md:border-none rounded-md'
                : ''
            }`}
            dataOne={weiDollarToggle(
              currUserPositionInfo?.capital.myCapitalInETH,
              price,
              currency,
              4
            )}
            dataTwo={weiDollarToggle(
              newUserPositionInfo?.capital.myCapitalInETH,
              price,
              currency,
              4
            )}
            textAlign="left"
            unit={currency}
            isManagePosition={isManagePosition}
            showAfterValues={showAfterValues}
          />
          <TextComponent
            title="Borrowed Capital"
            className={`${
              selectedTab === tabs[0]
                ? 'p-4 dark:border dark:border-dark-primary-600 dark:md:border-none rounded-md'
                : ''
            }`}
            dataOne={weiDollarToggle(
              currUserPositionInfo?.capital.borrowedCapitalInETH,
              price,
              currency,
              4
            )}
            dataTwo={weiDollarToggle(
              newUserPositionInfo?.capital.borrowedCapitalInETH,
              price,
              currency,
              4
            )}
            textAlign="left"
            unit={currency}
            isManagePosition={isManagePosition}
            showAfterValues={showAfterValues}
          />
          <TextComponent
            title="Borrow APR"
            className={
              selectedTab === tabs[0]
                ? 'p-4 dark:border dark:border-dark-primary-600 dark:md:border-none rounded-md'
                : ''
            }
            dataOne={
              currUserPositionInfo
                ? (
                    (currUserPositionInfo?.yield.leveragedStakingYield ?? 0) *
                    -1
                  )?.toFixed(2)
                : null
            }
            dataTwo={
              newUserPositionInfo
                ? (
                    (newUserPositionInfo?.yield.leveragedStakingYield ?? 0) * -1
                  )?.toFixed(2)
                : null
            }
            textAlign="left"
            unit="%"
            isManagePosition={isManagePosition}
            showAfterValues={showAfterValues}
          />
        </div>
        <div className="grow">{renderLeverageSliderCard()}</div>
      </div>
    </Card>
  )
}
export default UserPositionInfoCard
