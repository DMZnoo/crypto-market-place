import * as React from 'react'
import type { SVGProps } from 'react'
const SvgStEth = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    width={35}
    height={35}
    fill="none"
    {...props}
  >
    <g filter="url(#stETH_svg__a)">
      <path
        fill="url(#stETH_svg__b)"
        d="M5 5h25v25H5z"
        shapeRendering="crispEdges"
      />
    </g>
    <defs>
      <pattern
        id="stETH_svg__b"
        width={1}
        height={1}
        patternContentUnits="objectBoundingBox"
      >
        <use xlinkHref="#stETH_svg__c" transform="scale(.01563)" />
      </pattern>
      <filter
        id="stETH_svg__a"
        width={35}
        height={35}
        x={0}
        y={0}
        colorInterpolationFilters="sRGB"
        filterUnits="userSpaceOnUse"
      >
        <feFlood floodOpacity={0} result="BackgroundImageFix" />
        <feColorMatrix
          in="SourceAlpha"
          result="hardAlpha"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
        />
        <feOffset />
        <feGaussianBlur stdDeviation={2.5} />
        <feComposite in2="hardAlpha" operator="out" />
        <feColorMatrix values="0 0 0 0 0.208 0 0 0 0 0.69344 0 0 0 0 0.8 0 0 0 0.25 0" />
        <feBlend in2="BackgroundImageFix" result="effect1_dropShadow_958_478" />
        <feBlend
          in="SourceGraphic"
          in2="effect1_dropShadow_958_478"
          result="shape"
        />
      </filter>
      <image
        xlinkHref="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAADvElEQVR4nO1bsW4TQRB9a1tBioQU5I4KCYkuEpIrOj6AggoJiCMiJEeUiI4GKigpKJDdOMF2QcUf0FJR5QPoSBWJKkoBHorkfGf77jwzO3NnS7wmzvl2d+bNzO7s7Br4jxoxIsKI+nWK0Kht5BFR5nNtJNRHwJqgHgKy1k+f1eIF1ROQp3yCMX2oUBIA6xYChO2qh6yWgDLrp+9UGgrVEcBRPsFneuUoyRzWKwQSBNypaqhqCJBYP21TSSj4E6BRPsGQ7hpKkov1DIEELbzwHsKXgBjrp324hoIfAWP6adZXn9zyAz8CCLfM+tqGW4YYXHrluf4AANC4+jtFb2WLbjiMESsPLesOMaE3mJa+8QlAc+lpAwP8xS4C7pnLVAL7EJjibcm3A+Qpn6CJk5lH5MFhQrQNgWLXL1aqTOGisDAMBbsQGFLepFesHAeS+UE9hBVaSJe9gI+IVT6LSyJOZv8bhoINAfOuPwDhmkm/WTTwfS5cjEiwXAXsLF4G47CInwRjLVE2CXLwNPyIGz4WDskJG5HKA/bLoNwbNB5goHgCr1SYT4SEAEPF0+E90A2HCDg36+8Cpx7KA1oPGBEh4D32wmvGu+XesMoDOIpPqIMpepr5SE5AuuZfCs4dtIiIIgI4ig9pB1u4DSBdFoUkyAgY0xCEZ5knqfBaIhYJ4Lr6hDqzz9mcwJWA5c3OsvU4AozpHQhtACkBFzjF8/BrZdus4gkWkyIBCbEEAHkkBJyx54cGBuw4z0NeRuhCgGara5EkHVMbrZLyWuSW2WIZLM7JR9SPSpUn1FEpL4B9SSwPCQlcjyhy9yymuB4l0xV4ISApcq4esXh+4CieYJX1KwwBGQjtpbA4prZIeeDByjeYoWcZAj1IagKJgJrN0BQ3xW0KYOsBAVum/eXBuD5oS8B8lrgRsJ8DPA82HKrD9gQQds37dITXKvDIvEenswEvAnac+uXDNA/oBk3hxM5iG3EytKHwJiDeco7WByQE/MENRzlsIdiG8wk4CL9VwsR4gbP1AWkIELQkyKHd7gqLMDIC9oM2DDSWfKwcSwT5JKhbEmUg3Fe1U5TgqlwG+V5AisvSypMoHQFaL+Bsl7UT3154qWmm9wANCV7b5Yjqc1wIaEgIKC59aawfWXq3uCAhI4FKCJCPHX3uYDMJyj1hORQk1g84t7qZYlcUTUjgldD1tUPjKzn2y2A3BBAOGG+mFudelN6Iy9IAsB+OABwBiP/RhPMlLP+sLosRfQXwcOHp/LlAE1/wJHyrSqR/XoUcGBpGDl0AAAAASUVORK5CYII="
        id="stETH_svg__c"
        width={64}
        height={64}
      />
    </defs>
  </svg>
)
export default SvgStEth
