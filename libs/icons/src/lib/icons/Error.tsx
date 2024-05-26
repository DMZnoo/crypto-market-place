import * as React from 'react'
import { SVGProps } from 'react'
const SvgError = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={28}
    height={28}
    fill="none"
    {...props}
  >
    <path
      fill="#D14343"
      d="M0 4.308 4.308 0 14 9.692 23.692 0 28 4.308 18.308 14 28 23.692 23.692 28 14 18.308 4.308 28 0 23.692 9.692 14 0 4.308Z"
    />
  </svg>
)
export default SvgError
