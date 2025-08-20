import { getDefaultConfig } from "@rainbow-me/rainbowkit";

const seiAtlantic = {
  id: 1328,
  name: 'Sei - Atlantic',
  iconUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/23149.png',
  iconBackground: '#fff',
  nativeCurrency: { name: 'SEI', symbol: 'SEI', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://evm-rpc-testnet.sei-apis.com'] },
  },
};



export const config = getDefaultConfig({
  appName: 'Synapse Protocol',
  projectId: '2c93cfbb327c11e15c19d5cf553b846a',
  chains: [seiAtlantic]
});
