import themes from '@/styles/globals.json'
import { useEffect } from 'react'
import { twMerge } from 'tailwind-merge'

interface ISliderInput {
  className?: string
  min?: number
  max?: number
  value: string
  step?: number
  unit?: string
  sliderThumbColor?: string
  setIsTyping?: React.Dispatch<React.SetStateAction<boolean>>
  setLocalValue: (val: string) => void
  setValue: (val: string) => void
}

const SliderInput = ({
  className,
  min = 1,
  max = 10,
  step = 10,
  value = '0',
  setLocalValue,
  setIsTyping,
  setValue,
  unit = 'x',
  sliderThumbColor = themes.colors.darkBlue,
}: ISliderInput) => {
  useEffect(() => {
    document.documentElement.style.setProperty(
      '--slider-thumb-color',
      sliderThumbColor
    )
  }, [sliderThumbColor])
  return (
    <>
      <div className="flex items-center gap-4 mt-4">
        {/* <Minus
          className={`scale-[120%] ${Number(value) === min ? 'cursor-not-allowed' : 'cursor-pointer'
            }`}
          fill={Number(value) === min ? `${themes.colors.gray}B3` : 'black'}
          onClick={() => {
            if (Number(value) === min) return
            setValue(
              Number(value) - step <= min
                ? String(min)
                : `${Number(value) - step}`
            )
          }}
        /> */}
        <p className="text-gray-400 text-xs">{min}x</p>
        <div className="w-full relative mb-1">
          <input
            type="range"
            defaultValue={Number(value)}
            className={twMerge(
              'bg-gray-200 dark:bg-spaceCadet h-1.5 w-full cursor-pointer appearance-none rounded-lg border-transparent bg-gradient-to-r from-blue dark to-darkBlue bg-no-repeat bg-[length:0%_100%]',
              className ?? ''
            )}
            min={min}
            max={max}
            value={Number(value)}
            step={0.1}
            onChange={(e) => {
              if (setIsTyping) {
                setIsTyping(true)
              }
              const value = (e.target as HTMLInputElement).value
              // TODO: Debounce
              // setValue should call the callback function
              // setLocalValue should just set the local value
              setLocalValue(value)
              setValue(value)
            }}
            style={(function () {
              const val = (Number(Number(value) - min) / (max - min)) * 100

              return {
                background: `linear-gradient(
            to right,
            #01B0D1 0%,
            #01718F ${val}%,
            #e5e7eb ${val}%,
            #e5e7eb 100%
          )`,
              }
            })()}

            // onChange={(e) => {
            //   setIsTyping(true)
            //   const target = e.target
            //   const min: number = Number(target.min)
            //   const max: number = Number(target.max)
            //   const val: number = Number(target.value)
            //   setLocalLeveragePerc(val)
            //   if (val >= 0) {
            //     const ratio = ((val - min) * 100) / (max - min)
            //     if (val < 100) {
            //       target.style.backgroundSize = ratio + '% 100%'
            //     } else {
            //       target.style.backgroundSize = 100 + '% 100%'
            //     }

            //     // setLeveragePerc(val)
            //     debouncedLeveragePerc(val)
            //   }
            // }}
          />
          {/* <div className="relative mt-1">
            {[...Array(max + 1).keys()].slice(1).map((val, key) => (
              <div
                key={key}
                style={(() => {
                  return {
                    left: `${val === 1 ? 0 : key * 10.6}%`,
                  }
                })()}
                className="absolute flex flex-col items-center"
              >
                <hr className="h-2 border-l border-gray-400" />
                <p className="mt-1 text-xs text-gray-400">
                  {val}
                  {unit}
                </p>
              </div>
            ))}
          </div> */}
        </div>
        <p className="text-gray-400 text-xs">{max}x</p>
        {/* <Plus
          className={`scale-[60%] -ml-2 ${
            Number(value) === max ? 'cursor-not-allowed' : 'cursor-pointer'
          }`}
          stroke={Number(value) === max ? `${themes.colors.gray}B3` : 'black'}
          onClick={() => {
            if (Number(value) === max) return
            setValue(
              Number(value) + step > max
                ? String(max)
                : `${Number(value) + step}`
            )
          }}
        /> */}
      </div>
    </>
  )
}

export default SliderInput
