import * as React from 'react'
import { SVGProps } from 'react'
const SvgClip = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox={`0 0 ${props.width} ${props.height}`}
    {...props}
  >
    <path
      stroke="#AEAEB0"
      strokeLinecap="round"
      d="m3.731 3.692 4 4.49M3.152 6.386C.914 4.348.389 2.72 1.73 1.497c1.342-1.222 3.21-.003 5 1.628M4.744 8.339c2.134 2.115 3.718 2.939 4.987 1.658 1.269-1.28.104-3.38-1.603-5.073"
    />
  </svg>
)
export default SvgClip
