// useClient.ts

import { useEffect, useState } from 'react'
import {
  createPublicClient,
  createTestClient,
  createWalletClient,
  custom,
  http,
  publicActions,
  walletActions,
} from 'viem'
import { foundry, mainnet } from 'viem/chains'
import { useAccount, useNetwork } from 'wagmi'

// TODO:
// ethereum public client should use private rpc
// ethereum wallet client should use public rpc (or flashbots)
// testnet public client should use public rpc
// testnet wallet client should use public rpc
const useClient = () => {
  const account = useAccount()

  const [publicClient, setPublicClient] = useState<any>(null)
  const [walletClient, setWalletClient] = useState<any>(null)

  const { chain: returnedChain } = useNetwork()
  const chain = returnedChain === undefined ? mainnet : returnedChain

  const initializePublicClient = (): any => {
    // Setting up the public client used for fetching data for the webapp.
    const publicClient = createPublicClient({
      chain: chain,
      // chain: chain,
      transport: http(chain.rpcUrls.public.http[0]),
      // transport: http(chain.rpcUrls.public.http[0]),
      batch: {
        multicall: true,
      },
    }).extend(publicActions)
    return publicClient
  }

  const initializeWalletClient = (): any => {
    // Setting up the wallet client used for transactions sent by user wallet
    // If using local rpc, connect to foundry and anvil
    // If non-local, connect to injected wallet
    let walletClient: any
    const rpcUrl = chain.rpcUrls.public.http[0]
    if (typeof window !== 'undefined') {
      if (!rpcUrl || rpcUrl.includes('localhost')) {
        walletClient = createTestClient({
          chain: foundry,
          mode: 'anvil',
          transport: http(rpcUrl ?? 'http://localhost:8545'),
        })
          .extend(publicActions)
          .extend(walletActions)
      } else {
        const injectedProvider = (window as Window)?.ethereum
        if (!injectedProvider) {
          console.error('Ethereum provider not found in window')
        } else {
          walletClient = createWalletClient({
            chain: chain,
            transport: custom(injectedProvider),
          }).extend(publicActions)
        }
      }
    }
    return walletClient
  }

  useEffect(() => {
    const walletClient = initializeWalletClient()
    const publicClient = initializePublicClient()
    if (publicClient == null) {
      console.error('Error useClient publicClient is null')
    } else {
      setPublicClient(publicClient)
    }
    if (walletClient == null) {
      console.error('Error: useClient walletClient is null')
    } else {
      setWalletClient(walletClient)
    }
  }, [chain])

  return { publicClient, walletClient }
}

export default useClient
