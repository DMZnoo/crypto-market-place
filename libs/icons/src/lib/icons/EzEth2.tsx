import * as React from 'react'
import { SVGProps } from 'react'
const SvgEzEth2 = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={25}
    height={25}
    fill="none"
    {...props}
  >
    <rect width={24} height={24} x={0.5} y={0.5} fill="#fff" rx={12} />
    <rect width={24} height={24} x={0.5} y={0.5} stroke="#F0F0F4" rx={12} />
    <path
      fill="#90C228"
      d="m12.499 5.447-.099.334v9.706l.099.098 4.498-2.663L12.5 5.447Z"
    />
    <path fill="#C2ED68" d="M12.499 5.447 8 12.922l4.499 2.663V5.447Z" />
    <path
      fill="#6B8D1D"
      d="m12.5 16.438-.056.068v3.457l.055.162L17 13.777l-4.5 2.661Z"
    />
    <path fill="#C2ED68" d="M12.499 20.125v-3.687L8 13.777l4.499 6.348Z" />
    <path fill="#A3DB2E" d="m12.499 15.585 4.498-2.663-4.498-2.048v4.711Z" />
    <path fill="#E3F7B9" d="m8 12.922 4.499 2.663v-4.71L8 12.921Z" />
  </svg>
)
export default SvgEzEth2
