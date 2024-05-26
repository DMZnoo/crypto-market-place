import * as React from 'react'
import { SVGProps } from 'react'
const SvgAlertChange = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={13}
    height={13}
    fill="none"
    {...props}
  >
    <path
      fill="#01B0D1"
      fillRule="evenodd"
      d="M6.498.005A6.496 6.496 0 0 0 0 6.502 6.496 6.496 0 0 0 6.498 13a6.496 6.496 0 0 0 6.497-6.498A6.496 6.496 0 0 0 6.498.005ZM7.31 9.75a.812.812 0 1 1-1.625 0 .812.812 0 0 1 1.625 0Zm-.812-1.624a.812.812 0 0 0 .812-.812V3.254a.812.812 0 0 0-1.625 0v4.06c0 .45.364.813.813.813Z"
      clipRule="evenodd"
    />
  </svg>
)
export default SvgAlertChange
