import React, { StyleHTMLAttributes, SVGProps } from 'react'
import { twMerge } from 'tailwind-merge'

interface IIconButton {
  icon: React.ReactSVGElement | React.ReactElement<SVGProps<SVGSVGElement>>
  className?: string
  children: React.ReactNode
}

const IconButton: React.FunctionComponent<IIconButton> = (props) => {
  return (
    <button
      className={twMerge(
        `inline-flex items-center py-1 px-4 rounded ${props.className ?? ''}`
      )}
    >
      {props.icon}
      {props.children}
    </button>
  )
}
export default IconButton
