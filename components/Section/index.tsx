import React from 'react'

interface ISection extends React.PropsWithChildren {
  className?: string
}

const Section = ({ className, children }: ISection) => {
  return (
    <section className={`mt-4 2xl:mt-6 ${className ?? ''}`}>{children}</section>
  )
}
export default Section
