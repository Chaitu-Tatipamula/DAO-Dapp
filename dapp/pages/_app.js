import "@rainbow-me/rainbowkit/styles.css";
import "@/styles/globals.css";
import { darkTheme } from "@rainbow-me/rainbowkit";
import { ConnectButton, getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { configureChains, createConfig, WagmiConfig } from "wagmi";
import { sepolia } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";

const { chains, publicClient } = configureChains([sepolia], [publicProvider()]);

const { connectors } = getDefaultWallets({
  appName: "CryptoDevs DAO",
  chains,
  projectId: "b32d4fd1b8cf57f57e660af07191c0fd"
  
});

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
});

export default function App({ Component, pageProps }) {
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider chains={chains} theme={darkTheme()}>
        <Component {...pageProps} />
        
      </RainbowKitProvider>
    </WagmiConfig>
  );
}