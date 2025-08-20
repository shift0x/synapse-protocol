import hre from "hardhat";
import { sleep } from "./utils";

const DEAD_ADDRESS = "0x0000000000000000000000000000000000000000"

export const deployUSDC = async () : Promise<string> => {
    const mintableTokenFactory = await hre.ethers.getContractFactory("MintableToken")
    const usdc = await mintableTokenFactory.deploy(DEAD_ADDRESS, "USDC", "Test - USDC")

    await usdc.waitForDeployment()

    await sleep(10)

    const address = await usdc.getAddress()

    return address
}



deployUSDC();