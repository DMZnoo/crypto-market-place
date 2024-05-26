import * as React from 'react'
import { SVGProps } from 'react'
const SvgDocument = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={25}
    height={25}
    fill="none"
    {...props}
  >
    <path
      fill={props.fill ? props.fill : '#000'}
      d="M18.827 6.73h-7.692a.481.481 0 0 1-.481-.48V4.327c0-.265.215-.48.48-.48h7.693c.265 0 .48.215.48.48V6.25c0 .265-.215.48-.48.48Z"
    />
    <path
      fill={props.fill ? props.fill : '#000'}
      d="M21.712 0H8.25c-.795 0-1.442.647-1.442 1.442v2.404H3.442C2.647 3.846 2 4.493 2 5.288v18.27C2 24.353 2.647 25 3.442 25h13.462c.795 0 1.442-.647 1.442-1.442v-2.404h3.366c.795 0 1.442-.647 1.442-1.442V1.442C23.154.647 22.507 0 21.712 0Zm0 20.192h-1.924V18.15c0-.198.163-.36.361-.36h2.043v1.922c0 .266-.215.481-.48.481Zm.48-3.365H20.15c-.73 0-1.322.593-1.322 1.322v2.043H8.25a.481.481 0 0 1-.48-.48V8.173H4.884v.962h1.923v.961H4.885v.962h1.923v.961H4.885v.962h1.923v.961H4.885v.962h1.923v.961H4.885v.962h1.923v2.884c0 .796.647 1.443 1.442 1.443h9.135v2.404c0 .265-.216.48-.481.48H3.442a.481.481 0 0 1-.48-.48V5.288a.48.48 0 0 1 .48-.48H7.77V1.442a.48.48 0 0 1 .481-.48h13.462c.265 0 .48.215.48.48v15.385Z"
    />
    <path
      fill={props.fill ? props.fill : '#000'}
      d="M19.307 10.096h-6.73v.962h6.73v-.962ZM19.307 14.423h-6.73v.962h6.73v-.962ZM11.615 8.173h-.961v.962h.961v-.962ZM19.307 8.173h-6.73v.962h6.73v-.962ZM11.615 12.5h-.961v.961h.961V12.5ZM19.307 12.5h-6.73v.961h6.73V12.5Z"
    />
  </svg>
)
export default SvgDocument
