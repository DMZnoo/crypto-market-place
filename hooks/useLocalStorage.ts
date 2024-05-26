import { useCallback, useEffect, useState } from 'react'

export const useLocalStorage = (key: string, initialValue: any) => {
  const [state, setState] = useState(initialValue)

  useEffect(() => {
    const item = localStorage.getItem(key)
    if (item) {
      try {
        const val = JSON.parse(item)
        setState(val)
      } catch (e) {
        setState(item)
      }
    }
  }, [])

  const setValue = useCallback(
    (val: any) => {
      localStorage.setItem(key, JSON.stringify(val))
      setState(val)
    },
    [state]
  )

  return [state, setValue]
}
