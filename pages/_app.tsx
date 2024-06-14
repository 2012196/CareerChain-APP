import "@/styles/globals.css"
import type { AppProps } from "next/app"
import { SessionProvider } from "next-auth/react"
import { QueryClient, QueryClientProvider } from "react-query"
import RootLayout from "@/components/layouts/RootLayout"

import { WagmiConfig, configureChains, createConfig, sepolia } from "wagmi"
import { createWeb3Modal } from "@web3modal/wagmi/react"
import { alchemyProvider } from 'wagmi/providers/alchemy'
import { publicProvider } from 'wagmi/providers/public'

import { InjectedConnector } from 'wagmi/connectors/injected'
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect'
import { walletConnectProvider } from "@web3modal/wagmi"

const projectId = "558ff7b6663857ed8eca49309edf4802"


const metadata = {
  name: "CareerChain",
  description: "Empower your career with blockchain",
  url: 'https://web3modal.com',
  icons: ['https://avatars.githubusercontent.com/u/37784886']
}

const { chains, publicClient } = configureChains(
  [sepolia],
  [walletConnectProvider({ projectId }), alchemyProvider({ apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY as string}), publicProvider()],
)


const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: [
    new WalletConnectConnector({ chains, options: { projectId, showQrModal: false, metadata } }),
    new InjectedConnector({ chains, options: { shimDisconnect: true } }),
  ],
  publicClient
})

createWeb3Modal({ wagmiConfig, projectId, chains, defaultChain: sepolia })

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  const queryClient = new QueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      <WagmiConfig config={wagmiConfig}>
        <SessionProvider session={session}>
          <RootLayout>
            <Component {...pageProps} />
          </RootLayout>
        </SessionProvider>
      </WagmiConfig>
    </QueryClientProvider>
  )
}

