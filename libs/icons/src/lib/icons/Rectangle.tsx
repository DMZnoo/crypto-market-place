import * as React from 'react'
import { SVGProps } from 'react'
const SvgRectangle = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    xmlSpace="preserve"
    width={24}
    height={24}
    viewBox="0 0 5.5 5.5"
    {...props}
  >
    <rect
      width={8}
      height={8}
      fill={props.fill ? props.fill : '#000000'}
      rx={2}
      transform="matrix(.30752 0 0 .30672 .015 0)"
    />
    <rect
      width={8}
      height={8}
      fill={props.fill ? props.fill : '#000000'}
      rx={2}
      transform="matrix(.30752 0 0 .30672 2.832 .007)"
    />
    <rect
      width={8}
      height={8}
      fill={props.fill ? props.fill : '#000000'}
      rx={2}
      transform="matrix(.30752 0 0 .30672 0 2.838)"
    />
    <rect
      width={8}
      height={8}
      fill={props.fill ? props.fill : '#000000'}
      rx={2}
      transform="matrix(.30752 0 0 .30672 2.763 2.833)"
    />
  </svg>
)
export default SvgRectangle
