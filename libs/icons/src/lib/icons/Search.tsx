import { SVGProps } from 'react'
const SvgSearch = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={19}
    height={16}
    fill="none"
    {...props}
  >
    <circle cx={8.5} cy={6.5} r={4} stroke={props.stroke ?? '#000'} />
    <path stroke={props.stroke ?? '#000'} d="m11.554 8.846 4.8 4.8" />
  </svg>
)
export default SvgSearch
