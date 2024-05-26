import { SVGProps } from 'react'
const SvgChevronLeft = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    {...props}
  >
    <path
      fill={props.fill ? props.fill : '#fff'}
      d="M14.944 8.263a.857.857 0 1 0-1.317-1.098l-4.286 4.286c-.034.04-.05.088-.076.133-.02.035-.044.066-.06.105a.85.85 0 0 0-.062.31c0 .107.023.212.062.312.016.039.04.07.06.105.026.044.042.092.076.132l4.286 4.286a.856.856 0 1 0 1.317-1.097l-3.114-2.88-.857-.857.859-.86 3.112-2.877Z"
    />
  </svg>
)
export default SvgChevronLeft
