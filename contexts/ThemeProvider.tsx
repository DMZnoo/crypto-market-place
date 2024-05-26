import { useLocalStorage } from '@/hooks/useLocalStorage'
import React, {
  Dispatch,
  SetStateAction,
  createContext,
  useContext,
  useEffect,
} from 'react'

export type ThemeProviderProps = {
  theme: 'dark' | 'light'
  setTheme: Dispatch<SetStateAction<'dark' | 'light'>>
}

export const ThemeContext = createContext<ThemeProviderProps>({
  theme: 'dark',
  setTheme: () => {},
})

export const ThemeProvider = ({ children }: React.PropsWithChildren) => {
  const [theme, setTheme] = useLocalStorage('theme', 'dark')

  useEffect(() => {
    const html = document.documentElement
    html.className = theme
    html.setAttribute('data-theme', theme)
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext<ThemeProviderProps>(ThemeContext)
