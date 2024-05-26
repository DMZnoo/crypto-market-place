import { SVGProps } from 'react'
const SvgMinus = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={7}
    height={25}
    fill="none"
    {...props}
  >
    <path
      fill={`${props.fill ? props.fill : '#18181B'}`}
      d="M.66 12.19v-.96h5.445v.96H.66Z"
    />
  </svg>
)
export default SvgMinus
