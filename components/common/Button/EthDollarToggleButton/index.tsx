import { useApp } from '@/contexts/AppProvider'
import { Ethereum, Usd } from '@/libs/icons/src/lib/icons'

const EthDollarToggleButton = () => {
  const { setCurrency, currency } = useApp()
  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        value=""
        className="sr-only peer"
        onClick={() => setCurrency(currency === 'WEI' ? 'DOLLAR' : 'WEI')}
      />
      <div className="w-[150px] h-10 after:h-8 after:w-[70px] after:top-1 after:start-1 bg-gray-200 dark:bg-dark-primary-900 peer-focus:outline-none peer-focus:ring-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full after:content-[''] after:absolute after:bg-white after:dark:bg-dark-primary-800 after:rounded-full after:transition-all"></div>
      <div className="absolute left-4 text-[15px] flex items-center">
        <Ethereum className="scale-[80%] -ml-6 -mr-4" />
        <p className="mt-1">ETH</p>
      </div>
      <div className="absolute left-[50%] translate-x-[12%] text-[15px] flex items-center">
        <Usd className="scale-[80%] mr-1" />
        <p className="mt-1">USD</p>
      </div>
    </label>
  )
}

export default EthDollarToggleButton
