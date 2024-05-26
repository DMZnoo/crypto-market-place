import * as React from 'react'
import { SVGProps } from 'react'
const SvgHamburger = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={20}
    height={18}
    viewBox="0 0 20 18"
    fill="none"
    {...props}
  >
    <path
      stroke={props.stroke ? props.stroke : '#8D8D8D'}
      strokeLinecap="round"
      strokeWidth={3}
      d="M18 2H2M18 9H2M18 16H2"
    />
  </svg>
)
export default SvgHamburger
