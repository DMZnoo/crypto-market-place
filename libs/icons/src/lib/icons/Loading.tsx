import * as React from 'react'
import { SVGProps } from 'react'
const SvgLoading = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={props.width ? props.width : 13}
    height={props.height ? props.height : 13}
    fill="none"
    {...props}
  >
    <g clipPath="url(#loading_svg__a)">
      <path
        fill="#B4EBFA"
        d="M6.861 0a1.806 1.806 0 1 0 0 3.611 1.806 1.806 0 0 0 0-3.611ZM2.167 2.167a1.444 1.444 0 1 0 0 2.889 1.444 1.444 0 0 0 0-2.89Zm8.666.722a.722.722 0 1 0 0 1.445.722.722 0 0 0 0-1.445ZM1.083 6.5a1.083 1.083 0 1 0 0 2.167 1.083 1.083 0 0 0 0-2.167Zm11.195 0a.722.722 0 1 0 0 1.444.722.722 0 0 0 0-1.444ZM3.25 10.111a1.083 1.083 0 1 0 0 2.166 1.083 1.083 0 0 0 0-2.166Zm7.583 0a.723.723 0 1 0 0 1.445.723.723 0 0 0 0-1.445Zm-3.972.722a1.084 1.084 0 1 0 0 2.167 1.084 1.084 0 0 0 0-2.167Z"
      />
    </g>
    <defs>
      <clipPath id="loading_svg__a">
        <path fill="#fff" d="M0 0h13v13H0z" />
      </clipPath>
    </defs>
  </svg>
)
export default SvgLoading
