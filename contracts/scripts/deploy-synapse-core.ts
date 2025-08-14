import hre from "hardhat";

const USDC = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const PayMaster = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
const KnowledgeMaster = "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"

const deploy = async() => {
    const synapseCoreContract = await hre.ethers.getContractFactory("SynapseCore");

    const synapseCore = await synapseCoreContract.deploy(USDC, PayMaster, KnowledgeMaster);

    await synapseCore.waitForDeployment();

    const address = await synapseCore.getAddress()

    console.log(`synapse core: ${address}`)
    console.log(`pay master: ${PayMaster}`)
    console.log(`knowledge master: ${KnowledgeMaster}`)
}

deploy();