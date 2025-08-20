import hre from "hardhat";

const USDC = "0xBF90F0C5D30d2DebbC940369DA435687E4C2e701";
const PayMaster = "0xf33161532b37A3b9AC634248F31d3985bB579bBc"
const KnowledgeMaster = "0xf33161532b37A3b9AC634248F31d3985bB579bBc"
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