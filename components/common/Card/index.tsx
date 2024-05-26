import React, { CSSProperties, HTMLAttributes } from 'react'
import { twMerge } from 'tailwind-merge'

interface ICard {
  className?: string
  style?: CSSProperties
  id?: string
  children?: React.ReactNode
  onMouseEnter?: React.MouseEventHandler<HTMLDivElement>
  onMouseLeave?: React.MouseEventHandler<HTMLDivElement>
}

const Card: React.FunctionComponent<ICard> = (props) => {
  return (
    <div
      id={props.id}
      style={props.style}
      className={twMerge(
        `block p-4 2xl:p-4 rounded-2xl drop-shadow-xl ${props.className ?? ''}`
      )}
      onMouseEnter={props.onMouseEnter}
      onMouseLeave={props.onMouseLeave}
    >
      {props.children}
    </div>
  )
}
export default Card
