import NavBar from '@/components/NavBar'
import React from 'react'
import Footer from './Footer'

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="relative mx-2 md:mx-6 lg:mx-24 2xl:mx-48 flex flex-col dark:text-white gap-8">
      <NavBar />
      {children}
      <Footer />
    </div>
  )
}
export default Layout
