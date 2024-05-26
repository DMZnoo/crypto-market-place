import Layout from '@/components/Layout'
import { chainsToShow } from '@/config'
import { AppProvider } from '@/contexts/AppProvider'
import { AssetValueProvider } from '@/contexts/AssetValueProvider'
import { MarketsProvider } from '@/contexts/MarketsProvider'
import { ThemeProvider } from '@/contexts/ThemeProvider'
import { WhitelistProvider } from '@/contexts/WhitelistProvider'
import '@/styles/globals.css'
import {
  RainbowKitProvider,
  connectorsForWallets,
  darkTheme,
  getDefaultWallets,
} from '@rainbow-me/rainbowkit'
import '@rainbow-me/rainbowkit/styles.css'
import { ledgerWallet } from '@rainbow-me/rainbowkit/wallets'
import type { AppProps } from 'next/app'
import { useRouter } from 'next/router'
import { WagmiConfig, configureChains, createConfig } from 'wagmi'
import { alchemyProvider } from 'wagmi/providers/alchemy'
import { publicProvider } from 'wagmi/providers/public'

const { chains, publicClient } = configureChains(chainsToShow, [
  // Wraps the RPC provider here to viem's fallback Transport.
  alchemyProvider({
    apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY!,
  }),
  publicProvider(),
])

// const connector = new WalletConnectConnector({
//   options: {
//     projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID as string,
//     showQrModal: true
//   }
// })

const WALLET_CONNECT_PROJECT_ID: string = process.env
  .NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID as string

const { wallets } = getDefaultWallets({
  appName: 'Ion Protocol',
  projectId: WALLET_CONNECT_PROJECT_ID as string,
  chains,
})

const connectors = connectorsForWallets([
  ...wallets,
  {
    groupName: 'Hardware Wallets',
    wallets: [
      ledgerWallet({
        projectId: WALLET_CONNECT_PROJECT_ID,
        walletConnectOptions: {
          projectId: WALLET_CONNECT_PROJECT_ID,
        },
        chains,
      }),
    ],
  },
])

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  // provider,
})

const rainbowKitTheme = darkTheme({
  accentColor: '#01718f',
  accentColorForeground: 'white',
  borderRadius: 'small',
  fontStack: 'system',
  overlayBlur: 'small',
})

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter()

  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider
        chains={chains}
        theme={rainbowKitTheme}
        showRecentTransactions
      >
        <ThemeProvider>
          <AppProvider>
            <Layout>
              <MarketsProvider>
                <AssetValueProvider>
                  <WhitelistProvider>
                    <Component {...pageProps} />
                  </WhitelistProvider>
                </AssetValueProvider>
              </MarketsProvider>
            </Layout>
          </AppProvider>
        </ThemeProvider>
      </RainbowKitProvider>
    </WagmiConfig>
  )
}
