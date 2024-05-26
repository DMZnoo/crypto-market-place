import type { SVGProps } from 'react'
const SvgArrowRight = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} {...props}>
    <path
      fill={props.fill ?? 'url(#ArrowRight_svg__a)'}
      d="M2 9a1 1 0 0 0 0 2V9Zm16.707 1.707a1 1 0 0 0 0-1.414l-6.364-6.364a1 1 0 1 0-1.414 1.414L16.586 10l-5.657 5.657a1 1 0 0 0 1.414 1.414l6.364-6.364ZM2 11h16V9H2v2Z"
    />
    <defs>
      <linearGradient
        id="ArrowRight_svg__a"
        x1={1}
        x2={19}
        y1={10}
        y2={10}
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#01B0D1" />
        <stop offset={1} stopColor="#01718F" />
      </linearGradient>
    </defs>
  </svg>
)
export default SvgArrowRight
