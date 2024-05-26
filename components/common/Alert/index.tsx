import {
  AlertChange,
  Success2,
  Alert as SvgAlert,
} from '@/libs/icons/src/lib/icons'
import themes from '@/styles/globals.json'
import { useEffect, useState } from 'react'
import { twMerge } from 'tailwind-merge'
import Heading from '../Heading'
import Loading from '../Loading'

interface IAlert {
  title?: string
  description: string
  className?: string
  variant?: 'Error' | 'Success' | 'Info' | 'Warning' | 'Loading'
  showIcon?: boolean
}

const Alert: React.FunctionComponent<IAlert> = ({
  title,
  description,
  className,
  variant = 'Error',
  showIcon = true,
}) => {
  const [icon, setIcon] = useState<React.ReactNode>(
    <SvgAlert fill={themes.colors.error['100']} />
  )
  const [alertStyle, setAlertStyle] = useState<string>('')

  useEffect(() => {
    switch (variant) {
      case 'Error':
        setIcon(<SvgAlert fill={themes.colors.error['100']} />)
        setAlertStyle(
          'border-red-400 bg-error-30 dark:bg-error-10/[0.2] text-red-700'
        )
        break
      case 'Info':
        setIcon(
          <AlertChange
            fill={themes.colors.primary['700']}
            className="scale-[135%] mt-2 ml-2 mr-1"
          />
        )
        setAlertStyle(
          'border-primary-600 bg-sky-100 dark:bg-sky-100/[0.2] text-primary-700'
        )
        break
      case 'Success':
        setIcon(
          <Success2
            fill={themes.colors.secondary['700']}
            className="scale-[130%] mt-2 ml-2 mr-1"
          />
        )
        setAlertStyle(
          'border-success-100 bg-success-30 dark:bg-success-30/[0.2] text-success-100'
        )
        break
      case 'Warning':
        setIcon(<SvgAlert fill={themes.colors.warning['100']} />)
        setAlertStyle(
          'border-yellow-400 bg-orange-100 dark:bg-orange-100/[0.2] text-yellow-500'
        )
        break
      case 'Loading':
        setIcon(<Loading className="scale-[75%] -ml-1" />)
        setAlertStyle(
          'border-primary-600 bg-sky-100 dark:bg-sky-100/[0.2] text-primary-700'
        )
        break
      default:
        setIcon(<SvgAlert fill={themes.colors.error['100']} />)
        setAlertStyle(
          'border-red-400 bg-error-100 dark:bg-error-10/[0.2] text-red-700'
        )
    }
  }, [variant])

  return (
    <div role="alert" className={className}>
      <div className={twMerge(`border rounded-md px-4 py-3`, alertStyle)}>
        <div className="flex items-start space-x-2">
          {showIcon && icon}
          <div className="flex flex-col items-start">
            {title && <Heading as="h5">{title}</Heading>}
            <p className="mt-1">{description}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
export default Alert
