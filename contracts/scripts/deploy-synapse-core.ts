import hre from "hardhat";

const USDC = "0xBF90F0C5D30d2DebbC940369DA435687E4C2e701";
const PayMaster = "0x32C811643bD2eEC17DbDAb2c1eEbF32562f9bd9d"
const KnowledgeMaster = "0x32C811643bD2eEC17DbDAb2c1eEbF32562f9bd9d"
const fee = 100;


const deploy = async() => {
    const synapseCoreContract = await hre.ethers.getContractFactory("SynapseCore");
    const poolFactoryContract = await hre.ethers.getContractFactory("PoolFactory");

    const poolFactory = await poolFactoryContract.deploy();

    await poolFactory.waitForDeployment();

    const synapseCore = await synapseCoreContract.deploy(USDC, PayMaster, KnowledgeMaster, fee, poolFactory);

    await synapseCore.waitForDeployment();

    const address = await synapseCore.getAddress()

    console.log(`synapse core: ${address}`);
    console.log(`usdc: ${USDC}`);
    console.log(`pay master: ${PayMaster}`);
    console.log(`knowledge master: ${KnowledgeMaster}`);
}

deploy().then(() => { process.exit(); })