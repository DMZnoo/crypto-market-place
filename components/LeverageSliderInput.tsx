import themes from '@/styles/globals.json'
import { useEffect } from 'react'
import { twMerge } from 'tailwind-merge'

interface ILeverageSliderInput {
  className?: string
  min?: number
  max?: number
  value: string
  refValue?: string
  step?: number
  unit?: string
  sliderThumbColor?: string
  setValue: (val: string) => void
  selectedTab: 'Leverage' | 'Deleverage'
}

const LeverageSliderInput = ({
  className,
  min = 1,
  max = 100,
  step = 0.1,
  value = '0',
  refValue = '30',
  setValue,
  unit = 'x',
  sliderThumbColor = themes.colors.primary['600'],
  selectedTab,
}: ILeverageSliderInput) => {
  useEffect(() => {
    document.documentElement.style.setProperty(
      '--slider-thumb-color',
      sliderThumbColor
    )
  }, [sliderThumbColor])

  useEffect(() => {
    const currLev = document.getElementById('curr-leverage-indicator')
    if (Number(value) > Number(refValue)) {
      document.documentElement.style.setProperty(
        '--slider-thumb-color',
        sliderThumbColor
      )
      if (currLev) {
        currLev.style.display = 'block'
      }
    } else {
      document.documentElement.style.setProperty(
        '--slider-thumb-color',
        themes.colors.primary['600']
      )
      if (currLev) {
        currLev.style.display = 'none'
      }
    }
  }, [value])

  useEffect(() => {
    const currDeLeverageLev = document.getElementById(
      'curr-deleverage-indicator'
    )
    // const currLeverageMarker = document.getElementById('curr-leverage-marker')
    // const currLeverageLabel = document.getElementById('curr-leverage-label')

    const val = Number(refValue)
    const length = Number(100 * (Number(val === min ? 0 : val - 0.5) / max))

    if (currDeLeverageLev) {
      currDeLeverageLev.style.width = length + '%'
    }
    // if (currLeverageMarker) {
    //   currLeverageMarker.style.left = length + '%'
    // }
    // if (currLeverageLabel) {
    //   currLeverageLabel.style.left = length - 2 + '%'
    // }
  }, [refValue, value])

  return (
    <>
      <div className="flex items-center gap-4 mt-4">
        <p className="text-gray-400 text-xs">{min}x</p>
        <div className="w-full relative mb-2">
          <div className="absolute bg-gray-200 w-full h-1.5 rounded" />
          <div
            id="curr-deleverage-indicator"
            className={twMerge(
              `absolute bg-gray-200 dark:bg-spaceCadet h-1.5 cursor-pointer appearance-none rounded-l-lg`,
              className ?? ''
            )}
            style={(function () {
              const val = Number(refValue)
              const length = Number(
                100 * (Number(val === min ? 0 : val - 0.5) / max)
              )
              return {
                width: length + '%',
                background: themes.colors.primary['400'],
              }
            })()}
          />
          <hr
            id="curr-leverage-marker"
            className="absolute h-[16px] w-[1px] -top-[5px] border border-primary-400 rounded"
            style={(function () {
              // min 1 max 5
              // if values is 4, what % of the total length does it take up?
              // total length is 4
              // (value - min) / (max - min)
              // if value = 1, then % is 0
              // if value = 2, then % is 1/4
              // if value is 4 then % is 3 / 4

              const val = Number(refValue)
              const length = ((val - min) / (max - min)) * 100

              // bubble.style.left = `calc(${newVal}% + (${8 - newVal * 0.15}px))`;
              // bubble.style.left = `calc(${length}% + (${8 - length * 0.15}px))`;
              // const length = Number(
              //   100 * (Number(val === min ? 0 : val - 0.5) / max)
              // )
              return {
                left: `calc(${length}% + (${7.4 - length * 0.15}px))`,
              }
            })()}
          />
          <input
            type="range"
            defaultValue={Number(refValue)}
            className={twMerge(
              `absolute bg-gray-200 dark:bg-spaceCadet h-1.5 w-full cursor-pointer appearance-none rounded-lg`,
              className ?? ''
            )}
            min={min}
            max={max}
            value={Number(value)}
            step={step}
            onChange={(e) => {
              const value = Number((e.target as HTMLInputElement).value)
              const currMultiplier = parseFloat(refValue)
              if (value >= min && value <= max) {
                if (selectedTab === 'Leverage' && value > currMultiplier) {
                  setValue(String(value))
                } else if (
                  selectedTab === 'Deleverage' &&
                  value < currMultiplier
                ) {
                  setValue(String(value))
                }
              }
            }}
            style={(function () {
              const length = (Number(Number(value) - min) / (max - min)) * 100
              const refLength =
                (Number(Number(refValue) - min) / (max - min)) * 100
              const stopPosition = `calc(${refLength}% + ${
                8 - refLength * 0.15
              }px)`

              return {
                background: `linear-gradient(
                    to right,
                    ${themes.colors.primary['800']} 0%,
                    ${themes.colors.primary['800']} ${stopPosition},
                    ${
                      Number(value) > Number(refValue)
                        ? themes.colors.primary['400']
                        : themes.colors.primary['800']
                    } ${stopPosition},
                    ${themes.colors.primary['600']} ${length}%,
                    rgba(0, 0, 0, 0) ${length}%,
                    rgba(0, 0, 0, 0) 100%
                )`,
              }
            })()}
          />
          <p
            id="curr-leverage-label"
            className="absolute w-[5px] top-4 text-xs text-primary-400"
            style={(function () {
              const val = Number(refValue)
              const length = ((val - min) / (max - min)) * 100
              return {
                left: `calc(${length}% + (${-5 - length * 0.15}px))`,
              }
            })()}
          >
            {Number(refValue).toFixed(2)}x
          </p>
        </div>
        <p className="text-gray-400 text-xs">{max}x</p>
      </div>
    </>
  )
}

export default LeverageSliderInput
