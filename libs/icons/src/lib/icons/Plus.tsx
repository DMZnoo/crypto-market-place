import { SVGProps } from 'react'
const SvgPlus = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={25}
    height={25}
    fill={props.fill ?? 'none'}
    {...props}
  >
    <path
      stroke={props.stroke ? props.stroke : '#18181B'}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.2}
      d="M12.5 5.208v14.584M5.208 12.5h14.584"
    />
  </svg>
)
export default SvgPlus
