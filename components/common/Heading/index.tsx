import React from 'react'
import { twMerge } from 'tailwind-merge'

interface IHeading {
  children: React.ReactNode
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5'
  className?: string
  id?: string
}

const renderHeader = (as: string, className: string, props: IHeading) => {
  switch (as) {
    case 'h1':
      return (
        <h1
          className={twMerge(
            `font-bold text-4xl 2xl:text-5xl ${className ?? ''}`
          )}
          {...props}
        >
          {props.children}
        </h1>
      )
    case 'h2':
      return (
        <h2
          className={twMerge(
            `font-bold text-3xl 2xl:text-4xl ${className ?? ''}`
          )}
          {...props}
        >
          {props.children}
        </h2>
      )
    case 'h3':
      return (
        <h3
          className={twMerge(
            `font-bold text-[18px] 2xl:text-[22px] ${className ?? ''}`
          )}
          {...props}
        >
          {props.children}
        </h3>
      )
    case 'h4':
      return (
        <h4
          className={twMerge(
            `font-bold text-[18px] 2xl:text-[20px] ${className ?? ''}`
          )}
          {...props}
        >
          {props.children}
        </h4>
      )
    case 'h5':
      return (
        <h5
          className={twMerge(
            `font-bold text-[14px] 2xl:text-[18px] ${className ?? ''}`
          )}
          {...props}
        >
          {props.children}
        </h5>
      )
    default:
      return (
        <h1
          className={twMerge(
            `font-bold text-4xl 2xl:text-5xl ${className ?? ''}`
          )}
          {...props}
        >
          {props.children}
        </h1>
      )
  }
}

const Heading: React.FunctionComponent<IHeading> = ({
  as = 'h1',
  className,
  id,
  ...rest
}) => {
  return <>{renderHeader(as, className ?? '', rest)}</>
}

export default Heading
