import { useTheme } from '@/contexts/ThemeProvider'
import { twMerge } from 'tailwind-merge'

interface IButton {
  onClick?: (e: React.MouseEvent) => void
  className?: string
  as?: string
  variant?:
    | 'static'
    | 'static-bare'
    | 'warning'
    | 'disabled'
    | 'hover'
    | 'yellow-warning'
  loading?: boolean
  loadingMsg?: string
}

const Button = ({
  as,
  onClick,
  className,
  variant,
  children,
  loading,
  loadingMsg,
}: React.PropsWithChildren<IButton>) => {
  const { theme } = useTheme()

  const renderButton = (className: string, children: React.ReactNode) => {
    const handleClick = (e: React.MouseEvent) => {
      if (variant !== 'disabled' && onClick) {
        onClick(e)
      }
    }

    switch (as) {
      case 'div':
        return (
          <div className={className} onClick={handleClick}>
            {children}
          </div>
        )
      default:
        return (
          <button className={className} onClick={handleClick}>
            {children}
          </button>
        )
    }
  }

  const getVariant = (variant: string) => {
    switch (variant) {
      case 'static':
        return 'border-transparent bg-gradient-to-r from-blue to-darkBlue text-white '
      case 'static-bare':
        return ''
      case 'yellow-warning':
        return 'border bg-red-400 bg-opacity-[30%]'
      case 'warning':
        return 'border-transparent bg-gradient-to-r from-red-500 to-red-800 text-white'
      case 'disabled':
        return 'bg-lightGray dark:bg-gray-400 dark:text-white text-[#929295] hover:text-[#929295] cursor-not-allowed'
      case 'hover':
        return 'transition ease-in-out hover:text-white hover:bg-gradient-to-r hover:from-blue hover:to-darkBlue leading-loose from-white to-white border border-blue duration-100 text-blue dark:hover:text-white'
      default:
        return 'neon-button dark:hover:delay-700 dark:duration-300 transition ease-in-out duration-300 dark:bg-dark-primary-600 hover:bg-blue dark:hover:bg-darkBlue dark:hover:shadow-darkBlue dark:hover:shadow-[0_0_25px_0_rgba(1,176,209,0.4)] border-black hover:border-none hover:text-white dark:hover:border-none border dark:border-none'
    }
  }

  const content = (
    <>
      {/* {theme === 'dark' && (
        <>
          <span className="absolute block top-0 left-[-100%] w-full h-[2px]" />
          <span className="absolute block top-[-100%] right-0 w-[2px] h-full" />
          <span className="absolute block bottom-0 right-[-100%] w-full h-[2px]" />
          <span className="absolute block bottom-[-100%] left-0 w-[2px] h-full" />
        </>
      )} */}
      {children}
    </>
  )

  return (
    <>
      {loading ? (
        <button
          className={twMerge(`${getVariant('disabled')}
          ${className ?? ''} rounded-lg`)}
        >
          {loadingMsg}
        </button>
      ) : (
        renderButton(
          twMerge(
            `${getVariant(
              variant ?? ''
            )} dark:relative dark:inline-block rounded-lg text-center ${
              className ?? ''
            }`
          ),
          content
        )
      )}
    </>
  )
}
export default Button
