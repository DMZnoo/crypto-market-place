import * as React from 'react'
import { SVGProps } from 'react'
const SvgClose = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={21}
    height={20}
    fill="none"
    {...props}
  >
    <path
      stroke="#7C7C7E"
      strokeLinecap="round"
      strokeWidth={2}
      d="m1.49 1 18 18M19 1 1 19"
    />
  </svg>
)
export default SvgClose
