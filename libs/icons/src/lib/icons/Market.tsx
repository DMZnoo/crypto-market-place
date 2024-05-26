import { SVGProps } from 'react'
const SvgMarket = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={15} height={15} {...props}>
    <path
      fill={props.fill ?? '#8D8D8D'}
      d="M7.067 5.25a.5.5 0 0 1 .866 0L10.098 9a.5.5 0 0 1-.433.75h-4.33A.5.5 0 0 1 4.902 9l2.165-3.75Z"
    />
  </svg>
)
export default SvgMarket
