import { Signer, ethers } from 'ethers'
import { useEffect, useState } from 'react'
import { Chain, useAccount, useNetwork } from 'wagmi'

interface AccountProps {
  signer?: Signer
  balance: number
  address: string
  chain?: Chain
  loading: boolean
  isConnected: boolean
}

const useAccountInfo = (): AccountProps => {
  const [signer, setSigner] = useState<Signer>()
  const [balance, setBalance] = useState<number>(0)
  const [address, setAddress] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const { isConnected, address: wagmiAddress } = useAccount()
  const { chain } = useNetwork()
  useEffect(() => {
    const query = async () => {
      setLoading(true)
      if (!window.ethereum) return
      try {
        const provider = new ethers.BrowserProvider(
          window.ethereum as any,
          'any'
        )
        const user = await provider.getSigner()
        if (!isConnected || !user) {
          return
        }
        let caller_pubkey
        let bal
        try {
          caller_pubkey = await user.getAddress()
          bal = await provider.getBalance(caller_pubkey)
        } catch (e) {
          return
        }
        if (wagmiAddress === undefined) {
          setAddress('')
        } else {
          setAddress(wagmiAddress)
        }
        setSigner(user)
        setBalance(Number(bal))
        setLoading(false)
      } catch (error) {
        console.error(error)
      }
    }
    query()
  }, [setLoading, isConnected])

  return {
    signer,
    balance,
    address,
    loading,
    chain,
    isConnected,
  }
}

export default useAccountInfo
