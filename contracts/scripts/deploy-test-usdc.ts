import hre from "hardhat";

const DEAD_ADDRESS = "0x0000000000000000000000000000000000000000"

const deploy = async () => {
    const mintableTokenFactory = await hre.ethers.getContractFactory("MintableToken")
    const usdc = await mintableTokenFactory.deploy(DEAD_ADDRESS, "USDC", "Test - USDC")

    await usdc.waitForDeployment()

    const address = await usdc.getAddress()

    console.log(`usdc: ${address}`)
}

deploy();