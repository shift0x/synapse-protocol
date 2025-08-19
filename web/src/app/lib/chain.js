import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { baseSepolia } from "viem/chains";

const localhost = {
  id: 31337,
  name: 'Localhost',
  iconUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/5805.png',
  iconBackground: '#fff',
  nativeCurrency: { name: 'Local', symbol: 'LOCAL', decimals: 18 },
  rpcUrls: {
    default: { http: ['http://127.0.0.1:8545/'] },
  },
};

const base = baseSepolia
const testnet = localhost


export const chain = base
export const config = getDefaultConfig({
  appName: 'Infinita Bank',
  projectId: '254bbd81d790f1832819800b79cd23b2',
  chains: [chain]
});
