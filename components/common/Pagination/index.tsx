import { useTheme } from '@/contexts/ThemeProvider'
import { ChevronLeft } from '@/libs/icons/src/lib/icons'
import { useState } from 'react'

interface IPagination {
  validatorsTableCurrPage: number
  setValidatorsTableCurrPage: (val: number) => void
  range: number[]
}

const Pagination = ({
  validatorsTableCurrPage,
  setValidatorsTableCurrPage,
  range,
}: IPagination) => {
  const [updateInput, setUpdateInput] = useState<boolean>(false)
  const { theme } = useTheme()
  const renderButton = (num: number) => (
    <button
      key={`${num}-validator-count`}
      className={`pl-3 ${
        validatorsTableCurrPage === num
          ? theme === 'light'
            ? 'text-black'
            : 'text-white'
          : 'text-gray-400'
      }`}
      onClick={() => {
        setValidatorsTableCurrPage(num)
      }}
    >
      {num + 1}
    </button>
  )
  return (
    <div className="flex items-center space-x-12">
      <button
        onClick={() => {
          if (validatorsTableCurrPage > 0) {
            setValidatorsTableCurrPage(validatorsTableCurrPage - 1)
            setUpdateInput(false)
          }
        }}
        className={`${validatorsTableCurrPage === 0 && 'cursor-default'}`}
      >
        <ChevronLeft
          width={25}
          height={25}
          fill={`${
            validatorsTableCurrPage > 0
              ? theme === 'light'
                ? 'black'
                : 'white'
              : 'gray'
          }`}
        />
      </button>
      <div className="flex space-x-2">
        <input
          className="w-8"
          type="number"
          onClick={() => setUpdateInput(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              setValidatorsTableCurrPage(
                Number((e.target as HTMLInputElement).value) - 1
              )
            }
          }}
          onKeyUp={(e) => {
            if (e.key !== 'Backspace') {
              const value = (e.target as HTMLInputElement).value
              if (value.length > 0) {
                setValidatorsTableCurrPage(Number(value) - 1)
              }
            }
          }}
          value={updateInput ? undefined : validatorsTableCurrPage + 1}
        />
        of
        <p>{range.length}</p>
      </div>

      <button
        onClick={() => {
          if (validatorsTableCurrPage < range.slice(-1)[0]) {
            setValidatorsTableCurrPage(validatorsTableCurrPage + 1)
            setUpdateInput(false)
          }
        }}
      >
        <ChevronLeft
          width={25}
          height={25}
          fill={`${theme === 'light' ? 'black' : 'white'}`}
          className="rotate-180"
        />
      </button>
    </div>
  )
}

export default Pagination
