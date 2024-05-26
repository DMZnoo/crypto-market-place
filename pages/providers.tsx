import Section from '@/components/Section'
import Heading from '@/components/common/Heading'
import themes from '@/styles/globals.json'
import { Fragment, useEffect, useState } from 'react'
// import themes from '@/styles/globals.json'

import Card from '@/components/common/Card'
import PeriodsCard from '@/components/common/Card/PeriodsCard'
import Table from '@/components/common/Table'
import { useApp } from '@/contexts/AppProvider'
import { useTheme } from '@/contexts/ThemeProvider'
import { ChevronLeft } from '@/libs/icons/src/lib/icons'
import { formatETH } from '@/utils/number'
import { slice } from '@/utils/util'
import { Listbox, Transition } from '@headlessui/react'
import moment from 'moment'
import Link from 'next/link'
import { Bar, Cell, Pie, PieChart, Tooltip, YAxis } from 'recharts'

export default function Providers() {
  const [providers, setProviders] = useState<any[]>([])
  const [selectedProvider, setSelectedProvider] = useState<string>('all')
  const [selectedValidatorStatus, setSelectedValidatorStatus] =
    useState<string>('active_ongoing_validator_count')
  const [
    selectedPermissionedValidatorStatus,
    setSelectedPermissionedValidatorStatus,
  ] = useState<string>('permissioned_active_ongoing_validator_count')
  const [providerListOpen, setProviderListOpen] = useState<boolean>(false)
  const [validatorStatusListOpen, setValidatorStatusListOpen] =
    useState<boolean>(false)
  const [providerHistory, setProviderHistory] = useState<any>({})
  const [allHistory, setAllHistory] = useState<any>({})
  const [selectedCategoryState, setSelectedCategoryState] = useState<any>({})
  const [defaultCategoryState, setDefaultCategoryState] = useState<any>({})
  const [totalValidatorCount, setTotalValidatorCount] = useState<any>({})
  const [pieProviderColorMap, setPieProviderColorMap] = useState<any[]>([])
  const [totalReserveInfo, setTotalReserveInfo] = useState<any>()
  const [elReserveInfo, setElReserveInfo] = useState<any>()

  const { loading, setLoading } = useApp()
  const { theme } = useTheme()

  const setProtocolTotalReservesInfo = (name: string) => {
    switch (name) {
      case 'stader':
        setTotalReserveInfo(
          <div className="tooltip rounded shadow-lg pt-2 pb-4 px-2 bg-white dark:bg-indigo text-sm text-black dark:text-white">
            <span className="grid pt-1">
              <span className="text-green whitespace-nowrap">
                Total Reserves <span className="text-black"> =</span>
              </span>
              <span className="text-black dark:text-white">
                <Link
                  className="hover:text-blue hover:underline"
                  href="https://etherscan.io/address/0x4f4Bfa0861F62309934a5551E0B2541Ee82fdcF1"
                  target="_blank"
                  rel="noopener"
                >
                  permission_less_validator_reserve_eth
                </Link>{' '}
                +{' '}
                <Link
                  className="hover:text-blue hover:underline"
                  href="https://etherscan.io/address/0xaf42d795A6D279e9DCc19DC0eE1cE3ecd4ecf5dD"
                  target="_blank"
                  rel="noopener"
                >
                  permissioned_validator_reserve_eth
                </Link>{' '}
                + permission_less_rewards_vault +{' '}
                <Link
                  className="hover:text-blue hover:underline"
                  href="https://etherscan.io/address/0x1DE458031bFbe5689deD5A8b9ed57e1E79EaB2A4"
                  target="_blank"
                  rel="noopener"
                >
                  permission_less_socialising_pool
                </Link>{' '}
                + permission_less_withdrawal_vault +
                <Link
                  className="hover:text-blue hover:underline"
                  href="https://etherscan.io/address/0x9d4C3166c59412CEdBe7d901f5fDe41903a1d6Fc"
                  target="_blank"
                  rel="noopener"
                >
                  permissioned_socialising_pool
                </Link>{' '}
                + permissioned_withdrawal_vault
              </span>
            </span>
            <div className="absolute left-0 top-1/2 transform -translate-x-1/2 rotate-45 w-2 h-2 bg-indigo-400"></div>
          </div>
        )
        setElReserveInfo(
          <div className="tooltip rounded shadow-lg pt-2 pb-4 px-2 bg-white dark:bg-indigo text-sm text-black dark:text-white">
            <span className="grid pt-1">
              <span className="text-green whitespace-nowrap">
                Execution Layer Reserves <span className="text-black"> =</span>
              </span>
              <span className="text-black dark:text-white">
                permission_less_rewards_vault +{' '}
                <Link
                  className="hover:text-blue hover:underline"
                  href="https://etherscan.io/address/0x1DE458031bFbe5689deD5A8b9ed57e1E79EaB2A4"
                  target="_blank"
                  rel="noopener"
                >
                  permission_less_socialising_pool
                </Link>
                + permission_less_withdrawal_vault +
                <Link
                  className="hover:text-blue hover:underline"
                  href="https://etherscan.io/address/0x9d4C3166c59412CEdBe7d901f5fDe41903a1d6Fc"
                  target="_blank"
                  rel="noopener"
                >
                  {' '}
                  permissioned_socialising_pool
                </Link>{' '}
                + permissioned_withdrawal_vault
              </span>
            </span>
            <div className="absolute left-0 top-1/2 transform -translate-x-1/2 rotate-45 w-2 h-2 bg-indigo-400"></div>
          </div>
        )
        break
      case 'swell':
        setTotalReserveInfo(
          <div className="tooltip rounded shadow-lg pt-2 pb-4 px-2 bg-white dark:bg-indigo text-sm text-black dark:text-white">
            <span className="grid pt-1">
              <span className="text-green whitespace-nowrap">
                Total Reserves <span className="text-black"> =</span>
              </span>
              <span className="text-black dark:text-white">
                validator_reserve_eth +{' '}
                <Link
                  className="hover:text-blue hover:underline"
                  href="https://etherscan.io/address/0xa599805b96dF24CDFC5bCC6951C047f5414be0a5"
                  target="_blank"
                  rel="noopener"
                >
                  treasury
                </Link>{' '}
                +{' '}
                <Link
                  className="hover:text-blue hover:underline"
                  href="https://etherscan.io/address/0xb3D9cf8E163bbc840195a97E81F8A34E295B8f39"
                  target="_blank"
                  rel="noopener"
                >
                  deposit_manager
                </Link>
              </span>
            </span>
            <div className="absolute left-0 top-1/2 transform -translate-x-1/2 rotate-45 w-2 h-2 bg-indigo-400"></div>
          </div>
        )
        setElReserveInfo(
          <div className="tooltip rounded shadow-lg pt-2 pb-4 px-2 bg-white dark:bg-indigo text-sm text-black dark:text-white">
            <span className="grid pt-1">
              <span className="text-green whitespace-nowrap">
                Execution Layer Reserves <span className="text-black"> =</span>
              </span>
              <span className="text-black dark:text-white">
                <Link
                  className="hover:text-blue hover:underline"
                  href="https://etherscan.io/address/0xa599805b96dF24CDFC5bCC6951C047f5414be0a5"
                  target="_blank"
                  rel="noopener"
                >
                  treasury
                </Link>{' '}
                +{' '}
                <Link
                  className="hover:text-blue hover:underline"
                  href="https://etherscan.io/address/0xb3D9cf8E163bbc840195a97E81F8A34E295B8f39"
                  target="_blank"
                  rel="noopener"
                >
                  deposit_manager
                </Link>
              </span>
            </span>
            <div className="absolute left-0 top-1/2 transform -translate-x-1/2 rotate-45 w-2 h-2 bg-indigo-400"></div>
          </div>
        )
        break
      case 'lido':
        setTotalReserveInfo(
          <div className="tooltip rounded shadow-lg pt-2 pb-4 px-2 bg-white dark:bg-indigo text-sm text-black dark:text-white">
            <span className="grid pt-1">
              <span className="text-green whitespace-nowrap">
                Total Reserves <span className="text-black"> =</span>
              </span>
              <span className="text-black dark:text-white">
                validator_reserve_eth +{' '}
                <Link
                  className="hover:text-blue hover:underline"
                  href="https://etherscan.io/address/0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84"
                  target="_blank"
                  rel="noopener"
                >
                  buffered_ether
                </Link>{' '}
                +{' '}
                <Link
                  className="hover:text-blue hover:underline"
                  href="https://etherscan.io/address/0x388C818CA8B9251b393131C08a736A67ccB19297"
                  target="_blank"
                  rel="noopener"
                >
                  el_rewards_vault
                </Link>{' '}
                +{' '}
                <Link
                  className="hover:text-blue hover:underline"
                  href="https://etherscan.io/address/0x889edC2eDab5f40e902b864aD4d7AdE8E412F9B1"
                  target="_blank"
                  rel="noopener"
                >
                  withdrawal_queue
                </Link>{' '}
                +{' '}
                <Link
                  className="hover:text-blue hover:underline"
                  href="https://etherscan.io/address/0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f"
                  target="_blank"
                  rel="noopener"
                >
                  withdrawal_vault
                </Link>
              </span>
            </span>
            <div className="absolute left-0 top-1/2 transform -translate-x-1/2 rotate-45 w-2 h-2 bg-indigo-400"></div>
          </div>
        )
        setElReserveInfo(
          <div className="tooltip rounded shadow-lg pt-2 pb-4 px-2 bg-white dark:bg-indigo text-sm text-black dark:text-white">
            <span className="grid pt-1">
              <span className="text-green whitespace-nowrap">
                Execution Layer Reserves <span className="text-black"> =</span>
              </span>
              <span className="text-black dark:text-white">
                <Link
                  className="hover:text-blue hover:underline"
                  href="https://etherscan.io/address/0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84"
                  target="_blank"
                  rel="noopener"
                >
                  buffered_ether
                </Link>{' '}
                +{' '}
                <Link
                  className="hover:text-blue hover:underline"
                  href="https://etherscan.io/address/0x388C818CA8B9251b393131C08a736A67ccB19297"
                  target="_blank"
                  rel="noopener"
                >
                  el_rewards_vault
                </Link>{' '}
                +{' '}
                <Link
                  className="hover:text-blue hover:underline"
                  href="https://etherscan.io/address/0x889edC2eDab5f40e902b864aD4d7AdE8E412F9B1"
                  target="_blank"
                  rel="noopener"
                >
                  withdrawal_queue
                </Link>{' '}
                +
                <Link
                  className="hover:text-blue hover:underline"
                  href="https://etherscan.io/address/0xb9d7934878b5fb9610b3fe8a5e441e8fad7e293f"
                  target="_blank"
                  rel="noopener"
                >
                  withdrawal_vault
                </Link>
              </span>
            </span>
            <div className="absolute left-0 top-1/2 transform -translate-x-1/2 rotate-45 w-2 h-2 bg-indigo-400"></div>
          </div>
        )
        break
      default:
        setTotalReserveInfo(undefined)
        setElReserveInfo(undefined)
    }
  }

  const processProtocolHistory = (data = providers, history: any) => {
    return history.map((d: any) => {
      const provider = data.find((p) => p.id === d['protocol_id'])
      let elReserve = 0
      let clReserve = 0
      let oracleReserve = 0
      let oracleInfo
      let externalInfo
      let exchangeRate = 0
      const totalSupply = Number(d['total_supply_eth'])
      setProtocolTotalReservesInfo(provider.name)
      d['validator_reserve_eth'] = Number(d['validator_reserve_eth'])
      if (provider.name === 'stader') {
        d['permission_less_validator_reserve_eth'] = Number(
          d['permission_less_validator_reserve_eth']
        )
        clReserve = d['permission_less_validator_reserve_eth']
        clReserve += Number(d['permissioned_validator_reserve_eth'])
        elReserve += Number(d['permission_less_rewards_vault'])
        elReserve += Number(d['permission_less_socialising_pool'])
        elReserve += Number(d['permission_less_withdrawal_vault'])
        elReserve += Number(d['permissioned_socialising_pool'])
        elReserve += Number(d['permissioned_withdrawal_vault'])

        if (d['oracle_info'] !== undefined) {
          const oracleInfoBuffer = Buffer.from(d['oracle_info'])
          oracleInfo = JSON.parse(oracleInfoBuffer.toString())
        }
        const oracleReserve = Number(d['oracle_reported_reserve'])
        const oracleSupply = Number(d['oracle_reported_supply'])

        exchangeRate = oracleReserve / oracleSupply
      } else {
        clReserve = d['validator_reserve_eth']
        if (d['oracle_info'] !== undefined) {
          const oracleInfoBuffer = Buffer.from(d['oracle_info'])
          oracleInfo = JSON.parse(oracleInfoBuffer.toString())
        }

        if (d['execution_layer_info'] !== undefined) {
          const externalContractsBuffer = Buffer.from(d['execution_layer_info'])

          externalInfo = JSON.parse(externalContractsBuffer.toString())
          if (provider.name === 'lido') {
            const transientBalance =
              (Number(
                oracleInfo['oracle_reported_deposited_validators_count']
              ) -
                Number(oracleInfo['oracle_reported_beacon_validators_count'])) *
              32
            clReserve =
              Number(d['validator_reserve_eth']) +
              transientBalance +
              Number(externalInfo['buffered_ether'])
            oracleReserve =
              Number(oracleInfo['oracle_reported_reserve']) +
              Number(transientBalance) +
              Number(externalInfo['buffered_ether'])
            elReserve += Number(externalInfo['el_rewards_vault'])
            elReserve += Number(externalInfo['withdrawal_queue'])
            elReserve += Number(externalInfo['withdrawal_vault'])
          } else if (provider.name === 'swell') {
            elReserve += Number(externalInfo['treasury'])
            elReserve += Number(externalInfo['deposit_manager'])
            oracleReserve += Number(oracleInfo['oracle_reported_reserve'])
          }
        }
        exchangeRate = oracleReserve / totalSupply
      }
      const totalReserve = clReserve + elReserve

      const reserveRatio = totalReserve / totalSupply

      return {
        ...d,
        oracleInfo: oracleInfo,
        externalInfo: externalInfo ?? undefined,
        total_reserve_eth: totalReserve,
        total_supply_eth: totalSupply,
        external_reserve_eth: elReserve,
        exchange_rate: exchangeRate,
        reserve_ratio: reserveRatio,
      }
    })
  }

  useEffect(() => {
    setLoading(true)
    let providerHist: any = {}
    let allhist: any = {}
    let categories: any = {}

    fetch(process.env.NEXT_PUBLIC_BACKEND_ENDPOINT + '/protocols')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          data = data.filter(
            (d) => !d.name.includes('nil') && !d.name.includes('permission')
          )

          const themeColors = Object.values(
            (({ ebony, martinique, spaceCadet, gray, ...o }) => o)(
              themes.colors
            )
          )
          const randPieArr = data.map((k: string, idx: number) => {
            // const randIdx = Math.floor(Math.random() * themeColors.length)
            const color = themeColors[idx]
            delete themeColors[idx]
            return color
          })
          setPieProviderColorMap(randPieArr)

          fetch(process.env.NEXT_PUBLIC_BACKEND_ENDPOINT + `/protocols/history`)
            .then((res) => res.json())
            .then((history) => {
              if (Array.isArray(history) && history.length > 0) {
                const hist = processProtocolHistory(data, history)
                if (Object.keys(hist[0]).length !== 0) {
                  //getting categories from swell/lido
                  Object.keys(hist[0]).forEach((category) => {
                    categories[category] = 'day'
                  })
                }
                if (Object.keys(hist[hist.length - 1]).length !== 0) {
                  //setting up categories for stader (as its appended as the last item from the backend payload)
                  Object.keys(hist[hist.length - 1]).forEach((category) => {
                    categories[category] = 'day'
                  })
                }
                for (let provider of data) {
                  const provData = hist.filter(
                    (h: any) => h['protocol_id'] === provider.id
                  )
                  providerHist[provider.name] = {
                    day: provData,
                    token: provider.token,
                  }
                  provData.forEach((d: any) => {
                    const date = moment.unix(d['date']).format('MM/DD/YYYY')
                    allhist[date] = {
                      ...allhist[date],
                      date: Number(d['date']),
                      [`${provider.name}-exchange_rate`]: d['exchange_rate'],
                      [`${provider.name}-reserve_ratio`]: d['reserve_ratio'],
                    }
                  })
                }
                setProviderHistory(providerHist)
                setAllHistory({
                  day: Object.values(allhist).sort(
                    (a: any, b: any) => a['date'] - b['date']
                  ),
                })
                setProviders(data)
              }
            })
            .then(() => {
              if (Object.keys(providerHist).includes(selectedProvider)) {
                let map: any = {}
                Object.entries(
                  providerHist[selectedProvider]['day'].slice(-1)[0]
                ).forEach((entry, idx) => {
                  if (entry[0].includes('count')) {
                    map[entry[0]] = Number(entry[1])
                  }
                })
                let totalCount = Object.values(map).reduce(
                  (accum: any, v: any) => accum + v,
                  0
                )
                setTotalValidatorCount(totalCount)
              }
            })
        }
      })
      .then(() => {
        setSelectedCategoryState(categories)
        setDefaultCategoryState(categories)
      })
  }, [])

  useEffect(() => {
    setLoading(true)
    if (Object.keys(providerHistory).includes(selectedProvider)) {
      let map: any = {}
      Object.entries(
        slice(providerHistory[selectedProvider], 'day', [])
      ).forEach((entry, idx) => {
        if (entry[0].includes('count')) {
          map[entry[0]] = Number(entry[1])
        }
      })
      let totalCount = Object.values(map).reduce(
        (accum: any, v: any) => accum + v,
        0
      )
      setTotalValidatorCount(totalCount)
      setProtocolTotalReservesInfo(selectedProvider)
    }
    setSelectedCategoryState(defaultCategoryState)
    setLoading(false)
  }, [selectedProvider])

  const updateProtocolHistory = (
    provider: string,
    category: string,
    period: string
  ) => {
    setSelectedCategoryState({
      ...selectedCategoryState,
      [category]: period,
    })
    if (provider !== 'all') {
      if (
        Object.keys(providerHistory).includes(selectedProvider) &&
        Object.keys(providerHistory[selectedProvider]) &&
        Object.keys(providerHistory[selectedProvider]).includes(period) &&
        Object.values(providerHistory[selectedProvider][period]).length > 0
      ) {
        const latestInHist =
          providerHistory[selectedProvider][period].slice(-1)[0]
        const date = moment.unix(Number(latestInHist['date']))
        const now = moment()
        if (date.date === now.date) {
          if (date.hour === now.hour) {
            return
          }
        }
      }
    } else {
      if (
        Object.keys(allHistory).includes(period) &&
        Object.values(allHistory[period]).length > 0
      ) {
        const latestInHist = allHistory[period].slice(-1)[0]
        const date = moment.unix(Number(latestInHist['date']))
        const now = moment()
        if (date.date === now.date) {
          if (date.hour === now.hour) {
            return
          }
        }
      }
    }
    fetch(
      process.env.NEXT_PUBLIC_BACKEND_ENDPOINT +
        `/protocols/history${
          provider === 'all' ? '?' : `?protocol=${provider}&`
        }period=${period}`
    )
      .then((res) => res.json())
      .then((history) => {
        if (Array.isArray(history) && history.length > 0) {
          const hist = processProtocolHistory(providers, history)
          if (provider === 'all') {
            let prevHist = providerHistory
            hist.forEach((h: any) => {
              const currProv = providers.find((p) => p.id === h['protocol_id'])
              prevHist = {
                ...prevHist,
                [currProv.name]: {
                  ...prevHist[currProv.name],
                  [period]: Object.keys(prevHist[currProv.name]).includes(
                    period
                  )
                    ? [...prevHist[currProv.name][period], h]
                    : [h],
                },
              }
            })
            let allHist: any = {}
            for (let provider of providers) {
              const provData = hist.filter(
                (h: any) => h['protocol_id'] === provider.id
              )
              provData.forEach((d: any) => {
                allHist[d['date']] = {
                  ...allHist[d['date']],
                  date: Number(d['date']),
                  [`${provider.name}-exchange_rate`]: d['exchange_rate'],
                  [`${provider.name}-reserve_ratio`]: d['reserve_ratio'],
                }
              })
            }
            setAllHistory({
              ...allHistory,
              [period]: Object.values(allHist).sort(
                (a: any, b: any) => a['date'] - b['date']
              ),
            })
          } else {
            setProviderHistory({
              ...providerHistory,
              [provider]: {
                ...providerHistory[provider],
                [period]: hist,
              },
            })
          }
        }
      })
  }

  return (
    <main
      className={`${
        loading ||
        !(
          Object.keys(providerHistory).includes(selectedProvider) &&
          Object.keys(providerHistory[selectedProvider]).length > 0
        )
          ? 'grow lg:h-screen'
          : ''
      }`}
    >
      <Section>
        <div
          className="w-fit relative z-50"
          onClick={() => setProviderListOpen(!providerListOpen)}
        >
          <Listbox value={selectedProvider} onChange={setSelectedProvider}>
            <div className="mt-1">
              <Listbox.Button className="relative w-full text-left">
                <div className="flex items-center">
                  <Heading as="h2" className="w-full">
                    {Object.keys(providerHistory).includes(selectedProvider) &&
                      Object.keys(providerHistory[selectedProvider]).includes(
                        'token'
                      ) &&
                      providerHistory[selectedProvider]['token'] + ' | '}
                    <span
                      className={
                        Object.keys(providerHistory).includes(
                          selectedProvider
                        ) &&
                        Object.keys(providerHistory[selectedProvider]).includes(
                          'token'
                        )
                          ? 'text-gray-400'
                          : ''
                      }
                    >
                      {selectedProvider.charAt(0).toUpperCase() +
                        selectedProvider.slice(1)}
                    </span>
                  </Heading>
                  <ChevronLeft
                    width={50}
                    height={50}
                    fill={`${theme === 'light' ? 'black' : 'white'}`}
                    className={`${
                      providerListOpen ? '-rotate-90' : 'rotate-90'
                    }`}
                  />
                </div>
              </Listbox.Button>
              <Transition
                as={Fragment}
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Listbox.Options className="absolute mt-1 max-h-60 w-full rounded-md bg-white py-1">
                  {[{ name: 'all' }, ...providers].map((provider, key) => (
                    <Listbox.Option
                      key={`${provider.name + key}`}
                      value={provider.name}
                    >
                      {({ selected }) => (
                        <button
                          className={`w-full ${
                            selected ? 'font-medium' : 'font-light'
                          }
                          text-black
                          `}
                          onClick={() => {
                            setSelectedProvider(provider.name)
                          }}
                        >
                          {provider.name}
                        </button>
                      )}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </Transition>
            </div>
          </Listbox>
        </div>
        <Heading className="mt-4 mb-6 text-[18px] 2xl:text-[22px] font-light">
          Reserve Information
        </Heading>
        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-4">
          {!loading && (
            <>
              <PeriodsCard
                data={
                  selectedProvider !== 'all'
                    ? providerHistory[selectedProvider][
                        selectedCategoryState['exchange_rate']
                      ]
                    : allHistory[selectedCategoryState['exchange_rate']]
                }
                dataKeys={
                  selectedProvider !== 'all'
                    ? undefined
                    : providers.map((p) => p.name + `-exchange_rate`)
                }
                strokes={pieProviderColorMap}
                titleEl={
                  <Heading as="h3" className="font-medium has-tooltip">
                    Exchange Rate
                    <div className="tooltip rounded shadow-lg pt-2 pb-4 px-2 bg-white dark:bg-indigo text-sm text-black dark:text-white">
                      <span className="font-bold">Exchange Rate</span> is
                      calculated using the following formula: <br />
                      <span className="grid pt-1">
                        <div className="pb-2">
                          <span className="text-green">[Total Reserve]</span> /{' '}
                          <span className="text-blue">[Total Supply]</span>
                        </div>
                        <span className="text-green flex">
                          <span className="whitespace-nowrap mr-2">
                            Total Reserve:{' '}
                          </span>
                          <span className="text-black dark:text-white">
                            The sum total of protocol&apos;s consensus/execution
                            layer ETH balance as reported by its accounting
                            oracle.
                          </span>
                        </span>
                        <span className="text-blue">
                          Total Supply:{' '}
                          <span className="ml-3 text-black dark:text-white">
                            The sum of circulating token supply
                          </span>
                        </span>
                      </span>
                      <div className="absolute left-0 top-1/2 transform -translate-x-1/2 rotate-45 w-2 h-2 bg-indigo-400"></div>
                    </div>
                  </Heading>
                }
                xAxisKey="date"
                xAxisTickFormatter={(val, idx) => {
                  if (idx % 100 === 0) {
                    if (selectedCategoryState['exchange_rate'] !== 'day') {
                      return moment.unix(val).format('MM-DD')
                    } else {
                      return moment.unix(val).calendar()
                    }
                  }
                  return ''
                }}
                yAxisKey={
                  selectedProvider !== 'all' ? 'exchange_rate' : undefined
                }
                yAxisDomain={['auto', 'dataMax']}
                yTickCount={selectedProvider === 'all' ? 500 : undefined}
                period={selectedCategoryState['exchange_rate']}
                setPeriod={(val) => {
                  updateProtocolHistory(selectedProvider, 'exchange_rate', val)
                }}
              />
              <PeriodsCard
                data={
                  selectedProvider !== 'all'
                    ? providerHistory[selectedProvider][
                        selectedCategoryState['reserve_ratio']
                      ]
                    : allHistory[selectedCategoryState['reserve_ratio']]
                }
                dataKeys={
                  selectedProvider !== 'all'
                    ? undefined
                    : providers.map((p) => p.name + `-reserve_ratio`)
                }
                strokes={pieProviderColorMap}
                titleEl={
                  <Heading as="h3" className="font-medium has-tooltip">
                    Reserve Ratio
                    <div className="tooltip rounded shadow-lg pt-2 pb-4 px-2 bg-white dark:bg-indigo text-sm text-black dark:text-white">
                      <span className="font-bold">Reserve Ratio</span> is
                      calculated using the following formula: <br />
                      <span className="grid pt-1">
                        <div className="pb-2">
                          <span className="text-green">[Total Reserve]</span> /{' '}
                          <span className="text-blue">[Total Supply]</span>
                        </div>
                        <span className="text-green flex">
                          <span className="whitespace-nowrap mr-2">
                            Total Reserve:{' '}
                          </span>
                          <span className="text-black dark:text-white">
                            The internal sum of protocol&apos;s
                            consensus/execution layer ETH balance reported via
                            in-house accounting oracles.
                          </span>
                        </span>
                        <span className="text-blue">
                          Total Supply:{' '}
                          <span className="ml-3 text-black dark:text-white">
                            The sum of circulating token supply
                          </span>
                        </span>
                      </span>
                      <div className="absolute left-0 top-1/2 transform -translate-x-1/2 rotate-45 w-2 h-2 bg-indigo-400"></div>
                    </div>
                  </Heading>
                }
                xAxisKey="date"
                xAxisTickFormatter={(val, idx) => {
                  if (idx % 100 === 0) {
                    if (selectedCategoryState['reserve_ratio'] !== 'day') {
                      return moment.unix(val).format('MM-DD')
                    } else {
                      return moment.unix(val).calendar()
                    }
                  }
                  return ''
                }}
                yTickCount={selectedProvider === 'all' ? 500 : undefined}
                yAxisDomain={['auto', 'dataMax']}
                yAxisKey={
                  selectedProvider !== 'all' ? 'reserve_ratio' : undefined
                }
                period={selectedCategoryState['reserve_ratio']}
                setPeriod={(val) => {
                  updateProtocolHistory(selectedProvider, 'reserve_ratio', val)
                }}
              />
            </>
          )}
          {!loading &&
            Object.keys(providerHistory).includes(selectedProvider) &&
            Object.keys(providerHistory[selectedProvider]).length > 0 &&
            providerHistory[selectedProvider][
              selectedCategoryState['total_supply_eth']
            ] &&
            providerHistory[selectedProvider][
              selectedCategoryState['total_reserve_eth']
            ] && (
              <>
                <PeriodsCard
                  data={
                    providerHistory[selectedProvider][
                      selectedCategoryState['total_supply_eth']
                    ]
                  }
                  xAxisKey="date"
                  xAxisTickFormatter={(val, idx) => {
                    if (idx % 100 === 0) {
                      if (selectedCategoryState['total_supply_eth'] !== 'day') {
                        return moment.unix(val).format('MM-DD')
                      } else {
                        return moment.unix(val).calendar()
                      }
                    }
                    return ''
                  }}
                  yAxisKey="total_supply_eth"
                  yAxisDomain={['auto', 'dataMax']}
                  barChart={
                    <>
                      <YAxis
                        yAxisId={'total_supply_eth'}
                        width={0}
                        domain={['auto', 'dataMax']}
                      />
                      <Bar
                        yAxisId={'total_supply_eth'}
                        dataKey="reserve_eth"
                        fill={
                          theme === 'dark'
                            ? `${themes.colors.cyan}73`
                            : `${themes.colors.cyan}1A`
                        }
                        type="bar"
                      />
                    </>
                  }
                  titleEl={
                    <Heading as="h3" className="font-medium">
                      Total Circulating Supply
                    </Heading>
                  }
                  period={selectedCategoryState['total_supply_eth']}
                  setPeriod={(val) => {
                    updateProtocolHistory(
                      selectedProvider,
                      'total_supply_eth',
                      val
                    )
                  }}
                  contentEl={
                    <div className="flex items-center">
                      <Heading as="h2">
                        {formatETH(
                          Number(
                            slice(
                              providerHistory[selectedProvider][
                                selectedCategoryState['total_supply_eth']
                              ],
                              'total_supply_eth',
                              ''
                            )
                          )
                        ).toLocaleString('en-us')}{' '}
                        ETH
                      </Heading>
                    </div>
                  }
                />
                <PeriodsCard
                  data={
                    providerHistory[selectedProvider][
                      selectedCategoryState['total_reserve_eth']
                    ]
                  }
                  titleEl={
                    <Heading as="h3" className="font-medium has-tooltip">
                      Total Reserves
                      {totalReserveInfo}
                    </Heading>
                  }
                  xAxisKey="date"
                  xAxisTickFormatter={(val, idx) => {
                    if (idx % 100 === 0) {
                      if (
                        selectedCategoryState['total_reserve_eth'] !== 'day'
                      ) {
                        return moment.unix(val).format('MM-DD')
                      } else {
                        return moment.unix(val).calendar()
                      }
                    }
                    return ''
                  }}
                  yAxisKey="total_reserve_eth"
                  yAxisDomain={['dataMin', 'dataMax']}
                  period={selectedCategoryState['total_reserve_eth']}
                  setPeriod={(val) => {
                    updateProtocolHistory(
                      selectedProvider,
                      'total_reserve_eth',
                      val
                    )
                  }}
                  barChart={
                    <>
                      <YAxis
                        yAxisId={'total_reserve_eth'}
                        width={0}
                        domain={['dataMin', 'dataMax']}
                      />
                      <Bar
                        yAxisId={'total_reserve_eth'}
                        dataKey="total_reserve_eth"
                        fill={
                          theme === 'dark'
                            ? `${themes.colors.cyan}73`
                            : `${themes.colors.cyan}1A`
                        }
                        type="bar"
                      />
                    </>
                  }
                  contentEl={
                    <div className="flex items-center">
                      <Heading as="h2">
                        {formatETH(
                          slice(
                            providerHistory[selectedProvider][
                              selectedCategoryState['total_reserve_eth']
                            ],
                            'total_reserve_eth',
                            ''
                          )
                        ).toLocaleString('en-us')}{' '}
                        ETH
                      </Heading>
                    </div>
                  }
                />
              </>
            )}
        </div>
        <div className="mt-4 flex flex-col space-y-4">
          {!loading &&
            Object.keys(providerHistory).includes(selectedProvider) &&
            Object.keys(providerHistory[selectedProvider]).length > 0 &&
            providerHistory[selectedProvider][
              selectedCategoryState['external_reserve_eth']
            ] &&
            providerHistory[selectedProvider][
              selectedCategoryState['validator_reserve_eth']
            ] &&
            providerHistory[selectedProvider][
              selectedCategoryState[selectedValidatorStatus]
            ] && (
              <>
                <div className="flex flex-col lg:grid lg:grid-cols-2 gap-4">
                  <PeriodsCard
                    data={
                      providerHistory[selectedProvider][
                        selectedCategoryState['external_reserve_eth']
                      ]
                    }
                    titleEl={
                      <Heading as="h3" className="font-medium has-tooltip">
                        Total Execution Layer Reserves
                        {elReserveInfo}
                      </Heading>
                    }
                    xAxisKey="date"
                    xAxisTickFormatter={(val, idx) => {
                      if (idx % 100 === 0) {
                        if (
                          selectedCategoryState['external_reserve_eth'] !==
                          'day'
                        ) {
                          return moment.unix(val).format('MM-DD')
                        } else {
                          return moment.unix(val).calendar()
                        }
                      }
                      return ''
                    }}
                    yAxisKey="external_reserve_eth"
                    yAxisDomain={['dataMin', 'dataMax']}
                    period={selectedCategoryState['external_reserve_eth']}
                    setPeriod={(val) => {
                      updateProtocolHistory(
                        selectedProvider,
                        'external_reserve_eth',
                        val
                      )
                    }}
                    contentEl={
                      <div className="flex items-center">
                        <Heading as="h2">
                          {formatETH(
                            slice(
                              providerHistory[selectedProvider][
                                selectedCategoryState['external_reserve_eth']
                              ],
                              'external_reserve_eth',
                              ''
                            )
                          ).toLocaleString('en-us')}{' '}
                          ETH
                        </Heading>
                      </div>
                    }
                  />
                  <PeriodsCard
                    data={
                      providerHistory[selectedProvider][
                        selectedCategoryState['validator_reserve_eth']
                      ]
                    }
                    titleEl={
                      <Heading as="h3" className="font-medium has-tooltip">
                        Total Consensus Layer Reserves
                        <div className="tooltip rounded shadow-lg pt-2 pb-4 px-2 bg-white dark:bg-indigo text-sm text-black dark:text-white">
                          <span className="text-green grid">
                            <span className="whitespace-nowrap">
                              Total Consensus Layer Reserves{' '}
                              <span className="text-black"> = </span>
                            </span>
                            <span className="text-black dark:text-white">
                              The summed Eth balance of validators on the beacon
                              chain.
                            </span>
                          </span>
                          <div className="absolute left-0 top-1/2 transform -translate-x-1/2 rotate-45 w-2 h-2 bg-indigo-400"></div>
                        </div>
                      </Heading>
                    }
                    xAxisKey="date"
                    xAxisTickFormatter={(val, idx) => {
                      if (idx % 100 === 0) {
                        if (
                          selectedCategoryState['validator_reserve_eth'] !==
                          'day'
                        ) {
                          return moment.unix(val).format('MM-DD')
                        } else {
                          return moment.unix(val).calendar()
                        }
                      }
                      return ''
                    }}
                    yAxisKey={
                      selectedProvider === 'stader'
                        ? 'permission_less_validator_reserve_eth'
                        : 'validator_reserve_eth'
                    }
                    yAxisDomain={['dataMin', 'dataMax']}
                    period={selectedCategoryState['validator_reserve_eth']}
                    setPeriod={(val) => {
                      updateProtocolHistory(
                        selectedProvider,
                        'validator_reserve_eth',
                        val
                      )
                    }}
                    barChart={
                      <>
                        <YAxis
                          yAxisId={'validator_reserve_eth'}
                          width={0}
                          domain={['dataMin', 'dataMax']}
                        />
                        <Bar
                          yAxisId={'validator_reserve_eth'}
                          dataKey={
                            selectedProvider === 'stader'
                              ? 'permission_less_validator_reserve_eth'
                              : 'validator_reserve_eth'
                          }
                          fill={
                            theme === 'dark'
                              ? `${themes.colors.cyan}73`
                              : `${themes.colors.cyan}1A`
                          }
                          type="bar"
                        />
                      </>
                    }
                    graphUnit="ETH"
                    contentEl={
                      <div className="flex items-center">
                        <Heading as="h2">
                          {formatETH(
                            Number(
                              slice(
                                providerHistory[selectedProvider][
                                  selectedCategoryState['validator_reserve_eth']
                                ],
                                selectedProvider === 'stader'
                                  ? 'permission_less_validator_reserve_eth'
                                  : 'validator_reserve_eth',
                                0
                              )
                            )
                          ).toLocaleString('en-us')}{' '}
                          ETH
                        </Heading>
                      </div>
                    }
                  />
                </div>
                <div className="">
                  {/* <Card className="bg-white dark:bg-spaceCadet">
                    <div className="w-full h-96">
                      <Heading as="h3" className="font-medium">
                        Validator Status
                      </Heading>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          width={300}
                          height={400}
                          layout="vertical"
                          margin={{ top: 5, right: 5, left: 230, bottom: 10 }}
                          data={Object.entries(validatorCountMap).map(
                            (entry) => {
                              return {
                                name: entry[0],
                                value: Number(entry[1]),
                              }
                            }
                          )}
                          barSize={20}
                        >
                          <CartesianGrid strokeDasharray={'3 3'} />
                          <XAxis
                            type="number"
                            tick={{
                              fill: theme === 'light' ? 'black' : 'white',
                            }}
                          />
                          <YAxis
                            type="category"
                            dataKey="name"
                            tick={{
                              fill: theme === 'light' ? 'black' : 'white',
                            }}
                          />
                          <Tooltip
                            contentStyle={{
                              color: 'black',
                            }}
                            cursor={{
                              fill:
                                theme === 'light'
                                  ? `${themes.colors.darkBlue}33`
                                  : `${themes.colors.cyan}33`,
                            }}
                          />
                          <Bar
                            dataKey={'value'}
                            fill={
                              theme === 'light'
                                ? themes.colors.cyan
                                : themes.colors.green
                            }
                            background={{
                              fill:
                                theme === 'light'
                                  ? `${themes.colors.green}33`
                                  : `${themes.colors.cyan}33`,
                            }}
                            stackId="a"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </Card> */}
                  <Card className="relative z-50 bg-white dark:bg-spaceCadet">
                    <Listbox
                      value={selectedValidatorStatus.split('_').join(' ')}
                      onChange={setSelectedValidatorStatus}
                    >
                      <div className="mt-1">
                        <Listbox.Button className="relative w-full text-left">
                          <div className="flex items-center">
                            <p>
                              {selectedProvider === 'stader' &&
                                '[Permission-less]'}{' '}
                              {selectedValidatorStatus.split('_').join(' ')}
                            </p>
                            <ChevronLeft
                              width={25}
                              height={25}
                              fill={`${theme === 'light' ? 'black' : 'white'}`}
                              className={`${
                                validatorStatusListOpen
                                  ? '-rotate-90'
                                  : 'rotate-90'
                              }`}
                            />
                          </div>
                        </Listbox.Button>
                        <Transition
                          as={Fragment}
                          leave="transition ease-in duration-100"
                          leaveFrom="opacity-100"
                          leaveTo="opacity-0"
                        >
                          <Listbox.Options
                            className={`absolute mt-1 rounded bg-white p-2 z-50 overflow-scroll ${
                              theme === 'light' ? 'bg-white' : 'bg-martinique'
                            } text-base py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm`}
                          >
                            {Object.keys(selectedCategoryState)
                              .filter(
                                (cat) =>
                                  cat.includes('count') &&
                                  !cat.includes('permissioned')
                              )
                              .map((cat, key) => (
                                <Listbox.Option
                                  key={`${cat + key}`}
                                  value={cat}
                                  className={({ active }) =>
                                    `relative cursor-default select-none ${
                                      active
                                        ? 'bg-gray-100 text-gray-900'
                                        : theme === 'light'
                                        ? 'text-black'
                                        : 'text-white'
                                    }`
                                  }
                                >
                                  {({ selected }) => (
                                    <button
                                      className={`w-full ${
                                        selected ? 'font-medium' : 'font-light'
                                      }
                          text-black
                          `}
                                      onClick={() => {
                                        setSelectedValidatorStatus(cat)
                                      }}
                                    >
                                      {selectedProvider === 'stader' &&
                                        '[Permission-less]'}{' '}
                                      {cat.split('_').join(' ')}
                                    </button>
                                  )}
                                </Listbox.Option>
                              ))}
                          </Listbox.Options>
                        </Transition>
                      </div>
                    </Listbox>
                    <PeriodsCard
                      className="drop-shadow-none pb-0"
                      data={
                        providerHistory[selectedProvider][
                          selectedCategoryState[selectedValidatorStatus]
                        ]
                      }
                      titleEl={
                        <Heading as="h3" className="font-medium">
                          {selectedProvider === 'stader' && '[Permission-less]'}{' '}
                          {selectedValidatorStatus.split('_').join(' ')}
                        </Heading>
                      }
                      xAxisKey="date"
                      yAxisKey={selectedValidatorStatus}
                      yAxisDomain={['auto', 'dataMax']}
                      period={selectedCategoryState[selectedValidatorStatus]}
                      setPeriod={(val) => {
                        updateProtocolHistory(
                          selectedProvider,
                          selectedValidatorStatus,
                          val
                        )
                      }}
                      barChart={
                        <>
                          <YAxis
                            yAxisId={selectedValidatorStatus}
                            width={0}
                            domain={['auto', 'dataMax']}
                          />
                          <Bar
                            yAxisId={selectedValidatorStatus}
                            dataKey={selectedValidatorStatus}
                            fill={
                              theme === 'dark'
                                ? `${themes.colors.cyan}73`
                                : `${themes.colors.cyan}1A`
                            }
                            type="bar"
                          />
                        </>
                      }
                      contentEl={
                        <div className="flex items-center">
                          <Heading as="h2">
                            {formatETH(
                              Number(
                                slice(
                                  providerHistory[selectedProvider][
                                    selectedCategoryState[
                                      selectedValidatorStatus
                                    ]
                                  ],
                                  selectedValidatorStatus,
                                  0
                                )
                              )
                            ).toLocaleString('en-us')}{' '}
                          </Heading>
                        </div>
                      }
                    />
                  </Card>
                </div>
                {selectedProvider === 'stader' && (
                  <Card className="relative z-50 bg-white dark:bg-spaceCadet">
                    <Listbox
                      value={selectedPermissionedValidatorStatus
                        .split('_')
                        .map((p, idx) => (idx === 0 ? `[${p}]` : p))
                        .join(' ')}
                      onChange={setSelectedPermissionedValidatorStatus}
                    >
                      <div className="mt-1">
                        <Listbox.Button className="relative w-full text-left">
                          <div className="flex items-center">
                            <p>
                              {selectedPermissionedValidatorStatus
                                .split('_')
                                .map((p, idx) => (idx === 0 ? `[${p}]` : p))
                                .join(' ')}
                            </p>
                            <ChevronLeft
                              width={25}
                              height={25}
                              fill={`${theme === 'light' ? 'black' : 'white'}`}
                              className={`${
                                validatorStatusListOpen
                                  ? '-rotate-90'
                                  : 'rotate-90'
                              }`}
                            />
                          </div>
                        </Listbox.Button>
                        <Transition
                          as={Fragment}
                          leave="transition ease-in duration-100"
                          leaveFrom="opacity-100"
                          leaveTo="opacity-0"
                        >
                          <Listbox.Options
                            className={`absolute mt-1 rounded bg-white p-2 z-50 overflow-scroll ${
                              theme === 'light' ? 'bg-white' : 'bg-martinique'
                            } text-base py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm`}
                          >
                            {Object.keys(selectedCategoryState)
                              .filter(
                                (cat) =>
                                  cat.includes('count') &&
                                  cat.includes('permissioned')
                              )
                              .map((cat, key) => (
                                <Listbox.Option
                                  key={`${cat + key}`}
                                  value={cat}
                                  className={({ active }) =>
                                    `relative cursor-default select-none ${
                                      active
                                        ? 'bg-gray-100 text-gray-900'
                                        : theme === 'light'
                                        ? 'text-black'
                                        : 'text-white'
                                    }`
                                  }
                                >
                                  {({ selected }) => (
                                    <button
                                      className={`w-full ${
                                        selected ? 'font-medium' : 'font-light'
                                      }
                          text-black
                          `}
                                      onClick={() => {
                                        setSelectedPermissionedValidatorStatus(
                                          cat
                                        )
                                      }}
                                    >
                                      {cat
                                        .split('_')
                                        .map((p, idx) =>
                                          idx === 0 ? `[${p}]` : p
                                        )
                                        .join(' ')}
                                    </button>
                                  )}
                                </Listbox.Option>
                              ))}
                          </Listbox.Options>
                        </Transition>
                      </div>
                    </Listbox>
                    <PeriodsCard
                      className="drop-shadow-none pb-0"
                      data={
                        providerHistory[selectedProvider][
                          selectedCategoryState[
                            selectedPermissionedValidatorStatus
                          ]
                        ]
                      }
                      titleEl={
                        <Heading as="h3" className="font-medium">
                          {selectedPermissionedValidatorStatus
                            .split('_')
                            .map((p, idx) => (idx === 0 ? `[${p}]` : p))
                            .join(' ')}
                        </Heading>
                      }
                      xAxisKey="date"
                      yAxisKey={selectedPermissionedValidatorStatus}
                      yAxisDomain={['auto', 'dataMax']}
                      period={
                        selectedCategoryState[
                          selectedPermissionedValidatorStatus
                        ]
                      }
                      setPeriod={(val) => {
                        updateProtocolHistory(
                          selectedProvider,
                          selectedPermissionedValidatorStatus,
                          val
                        )
                      }}
                      barChart={
                        <>
                          <YAxis
                            yAxisId={selectedPermissionedValidatorStatus}
                            width={0}
                            domain={['auto', 'dataMax']}
                          />
                          <Bar
                            yAxisId={selectedPermissionedValidatorStatus}
                            dataKey={selectedPermissionedValidatorStatus}
                            fill={
                              theme === 'dark'
                                ? `${themes.colors.cyan}73`
                                : `${themes.colors.cyan}1A`
                            }
                            type="bar"
                          />
                        </>
                      }
                      contentEl={
                        <div className="flex items-center">
                          <Heading as="h2">
                            {formatETH(
                              Number(
                                slice(
                                  providerHistory[selectedProvider][
                                    selectedCategoryState[
                                      selectedPermissionedValidatorStatus
                                    ]
                                  ] ?? [],
                                  selectedPermissionedValidatorStatus,
                                  0
                                )
                              )
                            ).toLocaleString('en-us')}{' '}
                          </Heading>
                        </div>
                      }
                    />
                  </Card>
                )}
                <Card className="bg-white dark:bg-spaceCadet flex flex-col lg:grid lg:grid-cols-[1fr_1%_1fr]">
                  <div className="flex w-full flex-col items-center">
                    <Heading as="h3" className="font-medium">
                      Validator Distribution
                    </Heading>
                    <PieChart width={400} height={300}>
                      <Pie
                        data={
                          providerHistory &&
                          Object.entries(providerHistory).map((entry: any) => {
                            return {
                              name: entry[0],
                              value: Number(
                                slice(
                                  entry[1]['day'],
                                  'active_ongoing_validator_count'
                                )
                              ),
                            }
                          })
                        }
                        innerRadius={100}
                        outerRadius={120}
                        cornerRadius={5}
                        paddingAngle={2}
                        blendStroke={true}
                        isAnimationActive={true}
                        dataKey="value"
                        nameKey="name"
                        label={(val) =>
                          val.payload.payload && val.payload.payload['name']
                        }
                      >
                        {pieProviderColorMap.map((entry, index) => {
                          return (
                            <Cell
                              style={{
                                outline: 'none',
                                filter:
                                  theme === 'dark'
                                    ? 'drop-shadow(0px 0px 15px rgba(99, 197, 254, 0.5))'
                                    : undefined,
                              }}
                              key={`cell-${index}`}
                              fill={pieProviderColorMap[index]}
                            />
                          )
                        })}
                      </Pie>
                      <Pie
                        data={[{ name: '', faint: 100 }]}
                        dataKey="faint"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={90}
                        fill={theme === 'light' ? '#EFEFEF' : '#2A2A54'}
                        labelLine={false}
                        stroke="none"
                        label={({ cx, cy }) => {
                          return (
                            <g className="overflow-hidden">
                              <text
                                className="overflow-scroll flex flex-col"
                                x={cx}
                                y={cy - 20}
                                textAnchor="middle"
                                fontWeight={'400'}
                                fontSize={20}
                                fill={theme === 'dark' ? 'white' : 'black'}
                              >
                                Total{' '}
                                {
                                  Object.keys(
                                    (({ all, ...o }) => o)(providerHistory)
                                  ).length
                                }
                              </text>
                              <text
                                x={cx}
                                y={cy + 10}
                                textAnchor="middle"
                                fontWeight={'400'}
                                fontSize={20}
                                fill={theme === 'dark' ? 'white' : 'black'}
                              >
                                Providers
                              </text>
                            </g>
                          )
                        }}
                      />
                      <Tooltip
                        content={({ active, payload, label }) => {
                          return active &&
                            payload &&
                            payload.length &&
                            !Object.keys(payload[0].payload).includes(
                              'faint'
                            ) ? (
                            <div className="bg-white p-4 rounded dark:text-darkBlue overflow-hidden whitespace-nowrap">
                              <div>
                                <div>
                                  {payload.map((data, idx) => (
                                    <p key={`${data.value}-${idx}`}>
                                      {data.unit === 'ETH'
                                        ? formatETH(Number(data.value))
                                        : data.value}{' '}
                                      {data.unit}
                                    </p>
                                  ))}
                                </div>
                              </div>
                            </div>
                          ) : null
                        }}
                      />
                    </PieChart>
                  </div>
                  <hr className="hidden lg:block h-5/6 my-auto w-[0.1px] mx-2 my-2 border-l-[0.1px] border-gray-200 dark:border-gray-400 rounded" />
                  <div className="ml-4 w-full flex flex-col items-center">
                    <Heading as="h3" className="font-medium">
                      Reserve Distribution
                    </Heading>
                    <PieChart width={400} height={300}>
                      <Pie
                        data={Object.entries(
                          (({ all, ...o }) => o)(providerHistory)
                        ).map((entry: any) => {
                          return {
                            name: entry[0],
                            value: Number(
                              slice(entry[1]['day'], 'total_reserve_eth')
                            ),
                          }
                        })}
                        innerRadius={100}
                        outerRadius={120}
                        cornerRadius={5}
                        paddingAngle={2}
                        blendStroke={true}
                        isAnimationActive={true}
                        dataKey="value"
                        nameKey="name"
                        label={(val) => val.payload.payload['name']}
                      >
                        {Object.keys(
                          (({ all, ...o }) => o)(providerHistory)
                        ).map((entry, index) => (
                          <Cell
                            style={{
                              outline: 'none',
                              filter:
                                theme === 'dark'
                                  ? 'drop-shadow(0px 0px 15px rgba(99, 197, 254, 0.5))'
                                  : undefined,
                            }}
                            key={`cell-${index}`}
                            stroke="none"
                            fill={
                              pieProviderColorMap[
                                index % pieProviderColorMap.length
                              ]
                            }
                          />
                        ))}
                      </Pie>
                      <Pie
                        data={[{ name: '', faint: 100 }]}
                        dataKey="faint"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={90}
                        fill={theme === 'light' ? '#EFEFEF' : '#2A2A54'}
                        stroke="none"
                        labelLine={false}
                        label={({ cx, cy }) => {
                          return (
                            <g className="overflow-hidden">
                              <text
                                className="overflow-scroll flex flex-col"
                                x={cx}
                                y={cy - 20}
                                textAnchor="middle"
                                fontWeight={'400'}
                                fontSize={20}
                                fill={theme === 'dark' ? 'white' : 'black'}
                              >
                                Total{' '}
                                {
                                  Object.keys(
                                    (({ all, ...o }) => o)(providerHistory)
                                  ).length
                                }
                              </text>
                              <text
                                x={cx}
                                y={cy + 10}
                                textAnchor="middle"
                                fontWeight={'400'}
                                fontSize={20}
                                fill={theme === 'dark' ? 'white' : 'black'}
                              >
                                Providers
                              </text>
                            </g>
                          )
                        }}
                      />
                      <Tooltip
                        content={({ active, payload, label }) => {
                          return active &&
                            payload &&
                            payload.length &&
                            !Object.keys(payload[0].payload).includes(
                              'faint'
                            ) ? (
                            <div className="bg-white p-4 rounded dark:text-darkBlue overflow-hidden whitespace-nowrap">
                              <div>
                                <div>
                                  {payload.map((data, idx) => (
                                    <p key={`${data.value}-${idx}`}>
                                      {formatETH(Number(data.value))} ETH
                                    </p>
                                  ))}
                                </div>
                              </div>
                            </div>
                          ) : null
                        }}
                      />
                    </PieChart>
                  </div>
                </Card>
                {!loading && Object.keys(providerHistory).length > 0 && (
                  <Card className="bg-white dark:bg-spaceCadet">
                    <Table
                      data={providers.map((provider) => {
                        return {
                          Provider: provider.name,
                          ['number-of-validators']: totalValidatorCount[
                            provider.name
                          ]
                            ? totalValidatorCount[provider.name].toLocaleString(
                                'en-US'
                              )
                            : '',
                          ['Total Reserve']: providerHistory[provider.name]
                            ? `${slice(
                                providerHistory[provider.name]['day'],
                                'total_reserve_eth'
                              ).toLocaleString('en-us')} ETH`
                            : [],
                          ['Total Circulating LST']: providerHistory[
                            provider.name
                          ]
                            ? `${formatETH(
                                slice(
                                  providerHistory[provider.name]['day'],
                                  'total_supply_eth'
                                )
                              ).toLocaleString('en-us')} ETH`
                            : [],
                          ['Exchange Rate']: providerHistory[provider.name]
                            ? `${slice(
                                providerHistory[provider.name]['day'],
                                'exchange_rate',
                                1
                              ).toLocaleString('en-us')}`
                            : [],
                        }
                      })}
                      //@ts-ignore
                      columnsData={[
                        {
                          id: 'Provider',
                          header: 'Provider',
                          enableSorting: false,
                          accessorKey: 'Provider',
                        },
                        {
                          id: 'number-of-validators',
                          header: 'No. of Validators',
                          accessorKey: 'number-of-validators',
                        },
                        {
                          id: 'Total Reserve',
                          header: 'Total Reserve',
                          accessorKey: 'Total Reserve',
                        },
                        {
                          id: 'Total Circulating LST',
                          header: 'Total Circulating LST',
                          accessorKey: 'Total Circulating LST',
                        },
                        {
                          id: 'Exchange Rate',
                          header: 'Exchange Rate',
                          accessorKey: 'Exchange Rate',
                        },
                      ]}
                      thStyle="font-medium py-2"
                      theadStyle="border-b text-gray-500 dark:text-white font-light w-full"
                      tbodyStyle="mt-4"
                      tdStyle="px-2 pt-3"
                    />
                  </Card>
                )}
              </>
            )}
        </div>
      </Section>

      {/* {Object.keys(providerHistory).length > 0 &&
        !(
          Object.keys(providerHistory).includes(selectedProvider) &&
          Object.keys(providerHistory[selectedProvider]).length > 0
        ) && (
          <Heading className="absolute left-[50%] top-[50%] -translate-x-[50%] -translate-y-[50%]">
            Coming Soon..
          </Heading>
        )} */}
    </main>
  )
}
