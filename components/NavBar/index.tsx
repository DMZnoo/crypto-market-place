// import useMediaQuery from '@/hooks/useMediaQuery'
import useMediaQuery from '@/hooks/useMediaQuery'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import EthDollarToggleButton from '../common/Button/EthDollarToggleButton'
import ThemeButton from '../common/Button/ThemeButton'

const NavBar = () => {
  const [open, setOpen] = useState<boolean>(false)
  const [loaded, setLoaded] = useState<boolean>(false)
  const maxMobile = useMediaQuery('(max-width: 1020px)')
  const [isMobile, setIsMobile] = useState<boolean>(false)

  const router = useRouter()
  const { query } = router
  const route = router.pathname

  const getBorrowLendLink = (isBorrow: boolean): string => {
    const queryString = new URLSearchParams(
      query as { [key: string]: string }
    ).toString()
    if (queryString === '') {
      return isBorrow
        ? '/borrow?collateralAsset=weETH&lenderAsset=wstETH&marketId=0'
        : '/lend?collateralAsset=weETH&lenderAsset=wstETH&marketId=0'
    } else {
      return isBorrow ? `/borrow?${queryString}` : `/lend?${queryString}`
    }
  }

  useEffect(() => {
    setTimeout(() => {
      setIsMobile(maxMobile)
    }, 50)
  }, [maxMobile])

  useEffect(() => {
    setTimeout(() => setLoaded(true), 50)
    const handleResize = () => {
      if (window.innerWidth > 1020) {
        setOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  useEffect(() => {
    if (open) {
      document.body.classList.add('overflow-y-hidden')
    } else {
      document.body.classList.remove('overflow-y-hidden')
    }
  }, [open])

  return (
    <nav className="w-full mt-0 md:mt-1 flex items-center justify-between text-sm 2xl:text-base">
      <div className="flex w-full h-full justify-between items-center">
        <Link href="/">
          <Image src="/logo.svg" width={40} height={44} alt="logo" />
        </Link>
        <div className="flex items-center space-x-6">
          <button
            className="mt-2 text-sm text-gray-400 lg:hidden"
            onClick={() => setOpen(!open)}
            aria-controls="navbar"
            aria-expanded="false"
          >
            <span className="sr-only">Open main menu</span>
            <div className="relative w-5 h-5 mr-2">
              <span
                className={`rounded-lg block absolute left-0 w-full rotate-0 border border-neutral-400 top-0 origin-left-center ease-in-out duration-300 ${
                  open && 'rotate-45 top-1 -left-1'
                }`}
              ></span>
              <span
                className={`rounded-lg block absolute left-0 w-full rotate-0 border border-neutral-400 top-[6px] origin-left-center ease-in-out duration-300 ${
                  open && 'opacity-0'
                }`}
              ></span>
              <span
                className={`rounded-lg block absolute left-0 w-full border border-neutral-400 top-[12px] origin-left-center ease-in-out duration-300 ${
                  open && '-rotate-45 top-[5px] -left-1'
                }`}
              ></span>
            </div>
          </button>
        </div>
        <div className="hidden lg:flex lg:justify-between lg:w-full">
          <ul className="flex p-4 space-x-8 items-center">
            <li className={route === '/' ? 'font-bold' : ''}>
              <Link href="/">Dashboard</Link>
            </li>
            {/* <li className={route === '/profile' ? 'font-bold' : ''}>
              <Link href="/profile">My Page</Link>
            </li> */}
            <li className={route === '/lend' ? 'font-bold' : ''}>
              <Link href={getBorrowLendLink(false)}>Lending</Link>
            </li>
            <li className={route === '/borrow' ? 'font-bold' : ''}>
              <Link href={getBorrowLendLink(true)}>Borrowing</Link>
            </li>
            {/* <li className={route === '/providers' ? 'font-bold' : ''}>
              <Link href="/providers">Providers</Link>
            </li> */}
            <li>
              <Link
                href="https://docs.ionprotocol.io/"
                target="_blank"
                rel="noopener"
              >
                Docs
              </Link>
            </li>
            <li className={route === '/discord' ? 'font-bold' : ''}>
              <Link
                href="https://discord.com/invite/CjQqUgPA6Y"
                target="_blank"
                rel="noopener"
              >
                Discord
              </Link>
            </li>
          </ul>
          <div className="flex space-x-6 -mr-2 items-center scale-90 2xl:scale-100">
            {!isMobile && (
              <>
                <EthDollarToggleButton />
                <ThemeButton />
              </>
            )}
            <ConnectButton />
          </div>
        </div>
      </div>
      <div
        className={`absolute z-50 left-0 top-[5rem] rounded ${
          open
            ? 'translate-y-0 h-full'
            : 'hidden h-0 opacity-0 translate-y-full'
        } w-full lg:hidden bg-gray-100 dark:bg-dark-primary-900 ${
          loaded && 'ease-in-out duration-300'
        }`}
      >
        <ul className="grid p-4 space-y-4 items-center">
          <li
            onClick={() => {
              setOpen(false)
            }}
            className={`w-full pt-2 ${route === '/' ? 'font-bold' : ''}`}
          >
            <Link className="flex" href="/">
              Dashboard
            </Link>
          </li>
          <li
            onClick={() => {
              setOpen(false)
            }}
            className={`w-full ${route === '/lend' ? 'font-bold' : ''}`}
          >
            <Link className="flex" href="/lend">
              Lending
            </Link>
          </li>
          <li
            onClick={() => {
              setOpen(false)
            }}
            className={`w-full ${route === '/borrow' ? 'font-bold' : ''}`}
          >
            <Link className="flex" href="/borrow">
              Borrowing
            </Link>
          </li>
          <li
            onClick={() => setOpen(false)}
            className={route === '/docs' ? 'font-bold' : ''}
          >
            <Link href="https://docs.ionprotocol.io/">Docs</Link>
          </li>
          {/* <li
            onClick={() => setOpen(false)}
            className={route === '/docs' ? 'font-bold' : ''}
          >
            <Link href="https://docs.ionprotocol.io/">Protocols</Link>
          </li> */}
          <li
            onClick={() => {
              setOpen(false)
            }}
            className={`w-full ${route === '/discord' ? 'font-bold' : ''}`}
          >
            <Link
              className="flex"
              href="https://discord.com/invite/CjQqUgPA6Y"
              target="_blank"
              rel="noopener"
            >
              Discord
            </Link>
          </li>
          <li className="flex items-center space-x-12">
            <ThemeButton />
          </li>

          <li
            onClick={() => {
              setOpen(false)
            }}
            className="pt-2"
          >
            <ConnectButton />
          </li>
        </ul>
      </div>
    </nav>
  )
}

export default NavBar
