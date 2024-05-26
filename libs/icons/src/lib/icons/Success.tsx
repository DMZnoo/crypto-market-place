import * as React from 'react'
import { SVGProps } from 'react'
const SvgSuccess = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={28}
    height={28}
    fill="none"
    {...props}
  >
    <rect width={28} height={28} fill="#05BB85" rx={3} />
    <path
      fill="#fff"
      d="M4.308 12.923h3.23l4.308 5.385 7.538-12.923h3.231L11.846 23.692 4.308 12.923Z"
    />
  </svg>
)
export default SvgSuccess
