import { targetChainId } from '@/config'
import useAccountInfo from '@/hooks/useAccountInfo'
import useClient from '@/hooks/useClient'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { ERROR } from '@/types/error'
import detectEthereumProvider from '@metamask/detect-provider'
import { useRouter } from 'next/router'
import { createContext, useContext, useEffect, useState } from 'react'
import { PublicClient, WalletClient } from 'viem'
import { useAccount, useNetwork } from 'wagmi'
import { Currency } from '../utils/number'

export type AppContextProps = {
  publicClient: PublicClient | null
  walletClient: WalletClient | null
  errors: Set<string>
  infos: Set<string>
  warnings: Set<string>
  successes: Set<string>
  loadings: Set<string>
  loading: boolean
  termsAccepted: boolean
  setTermsAccepted: (val: boolean) => void
  currency: Currency
  setLoading: (val: boolean) => void
  addError: (content: string) => void
  addInfo: (content: string) => void
  addWarning: (content: string) => void
  addSuccess: (content: string) => void
  addLoading: (content: string) => void
  removeLoading: (content: string) => void
  removeError: (content: string) => void
  removeInfo: (content: string) => void
  removeWarning: (content: string) => void
  removeSuccess: (content: string) => void
  clearBanner: () => void
  setCurrency: (val: Currency) => void
}

export const AppContext = createContext<AppContextProps>({
  publicClient: null,
  walletClient: null,
  errors: new Set(),
  infos: new Set(),
  warnings: new Set(),
  successes: new Set(),
  loadings: new Set(),
  loading: false,
  termsAccepted: false,
  currency: 'WEI',
  setLoading: (val: boolean) => {},
  addError: (content: string) => {},
  removeError: (content: string) => {},
  addLoading: (content: string) => {},
  removeLoading: (content: string) => {},
  addInfo: (content: string) => {},
  removeInfo: (content: string) => {},
  addWarning: (content: string) => {},
  removeWarning: (content: string) => {},
  addSuccess: (content: string) => {},
  removeSuccess: (content: string) => {},
  setCurrency: (val: Currency) => {},
  setTermsAccepted: (val: boolean) => {},
  clearBanner: () => {},
})

export const AppProvider = ({ children }: React.PropsWithChildren) => {
  const [loading, setLoading] = useState<boolean>(false)
  const [termsAccepted, setTermsAccepted] = useLocalStorage('terms', false)
  const [currency, setCurrency] = useState<Currency>('WEI')
  const { chain } = useNetwork()
  const { isConnected } = useAccount()
  const { signer, address } = useAccountInfo()
  const { publicClient, walletClient } = useClient()

  const [errors, setErrors] = useState<Set<string>>(new Set())
  const [infos, setInfos] = useState<Set<string>>(new Set())
  const [warnings, setWarnings] = useState<Set<string>>(new Set())
  const [successes, setSuccesses] = useState<Set<string>>(new Set())
  const [loadings, setLoadings] = useState<Set<string>>(new Set())

  const router = useRouter()

  const addLoading = (content: string) => {
    setLoadings(new Set([...loadings, content]))
  }

  const removeLoading = (content: string) => {
    loadings.delete(content)
    setLoadings(loadings)
  }

  const addError = (content: string) => {
    setErrors(new Set([...errors, content]))
  }

  const removeError = (content: string) => {
    errors.delete(content)
    setErrors(errors)
  }

  const addWarning = (content: string) => {
    const newWarnings = new Set(warnings)
    newWarnings.add(content)
    setWarnings(newWarnings)
  }

  const removeWarning = (content: string) => {
    const newWarnings = new Set(warnings)
    newWarnings.delete(content)
    setWarnings(newWarnings)
  }

  const addSuccess = (content: string) => {
    setSuccesses(new Set([...successes, content]))
  }

  const removeSuccess = (content: string) => {
    successes.delete(content)
    setSuccesses(successes)
  }

  const addInfo = (content: string) => {
    setInfos(new Set([...infos, content]))
  }

  const removeInfo = (content: string) => {
    infos.delete(content)
    setInfos(infos)
  }

  const clearBanner = () => {
    successes.clear()
    infos.clear()
    warnings.clear()
    errors.clear()
  }

  useEffect(() => {
    ;(async function () {
      clearBanner()
      setLoading(true)
      const provider = await detectEthereumProvider()
      if (provider) {
        removeError(ERROR.WALLET_NOT_AVAILABLE)
        removeError(ERROR.WALLET_WRONG_NETWORK)
        if (!isConnected) {
          addWarning(ERROR.WALLET_CONNECTIONS_ERROR)
        } else {
          removeWarning(ERROR.WALLET_CONNECTIONS_ERROR)
          if (chain && chain.id != targetChainId) {
            addError(ERROR.WALLET_WRONG_NETWORK)
          } else {
            removeError(ERROR.WALLET_WRONG_NETWORK)
          }
        }
      } else {
        // addError(ERROR.WALLET_NOT_AVAILABLE)
      }
      setLoading(false)
    })()
  }, [chain, isConnected, signer, address, router.asPath])

  return (
    <AppContext.Provider
      value={{
        publicClient,
        walletClient,
        errors,
        currency,
        infos,
        warnings,
        successes,
        loadings,
        loading,
        termsAccepted,
        setLoading,
        setCurrency,
        setTermsAccepted,
        addWarning,
        addError,
        addInfo,
        addSuccess,
        addLoading,
        removeError,
        removeWarning,
        removeSuccess,
        removeInfo,
        removeLoading,
        clearBanner,
      }}
    >
      {children}
      {/* {loading && <LoadingModal open={loading} setOpen={setLoading} />} */}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext<AppContextProps>(AppContext)
