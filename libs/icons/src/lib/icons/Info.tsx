import { SVGProps } from 'react'
const SvgInfo = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={19}
    height={19}
    fill="none"
    {...props}
  >
    <path
      fill="#929295"
      fillRule="evenodd"
      d="M9.526 0Zm0-1.928a0 0 0 1 0-.024-9.168 6.5 6.5 0 0 1 .024 9.168Zm-9.263-.022ZM9.474 16Zm.782-7.647-1.86.233-.067.31.367.065c.238.058.285.144.233.382l-.6 2.818c-.157.729.085 1.072.657 1.072.442 0 .957-.205 1.19-.486l.071-.338c-.161.143-.4.2-.557.2-.223 0-.304-.157-.247-.433l.813-3.823ZM8.926 7.23a.812.812 0 1 0 1.148-1.15.812.812 0 0 0-1.149 1.15Z"
      clipRule="evenodd"
    />
    <circle cx={9.5} cy={9.5} r={6} stroke="#929295" />
  </svg>
)
export default SvgInfo
