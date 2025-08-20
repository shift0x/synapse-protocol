import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  networks: {
    sei_testnet: {
      url: "https://evm-rpc-testnet.sei-apis.com",
      accounts: [ vars.get("SMART_CONTRACT_DEPLOYER") ],
    }
  }
};

export default config;
