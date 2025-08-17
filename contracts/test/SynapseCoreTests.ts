import {loadFixture} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import { contributeExpertKnowledge, depositAPICredits, getAPIAccount, getContributors, getExperts, withdrawAPICredits } from "./helpers/synapse-core";
import { parseEther } from "ethers";

const contributorDisplayName = "TEST CONTRIBUTOR"

describe ("Synapse Core Tests", () => {

    async function setup(){
        const [deployer] = await hre.ethers.getSigners();

        const mintableTokenContract = await hre.ethers.getContractFactory("MintableToken");
        const usdc = await mintableTokenContract.deploy(deployer, "USDC", "USDC");
        
        await usdc.waitForDeployment();

        const poolFactoryContract = await hre.ethers.getContractFactory("PoolFactory");
        const poolFactory = await poolFactoryContract.deploy();

        await poolFactory.waitForDeployment()

        const poolFactoryAddress = await poolFactory.getAddress()

        const synapseCoreContract = await hre.ethers.getContractFactory("SynapseCore");
        const synapseCore = await synapseCoreContract.deploy(usdc, deployer, deployer, 100, poolFactoryAddress);

        await synapseCore.waitForDeployment();
        
        return { deployer, synapseCore, usdc }
    }

    describe("API Credit Management", () => {

        it("should deposit api credits", async () => {
            const { synapseCore, deployer, usdc } = await loadFixture(setup);
            
            const depositAmount = 100;

            await depositAPICredits(deployer, synapseCore, depositAmount.toString(), usdc);
            
            const account = await getAPIAccount(synapseCore, deployer);

            expect(account.balance).is.equal(depositAmount);
        });

        it("should create api account", async () => {
            const { synapseCore, deployer, usdc } = await loadFixture(setup);
            
            const depositAmount = 100;
            const deployerAddress = await deployer.getAddress()

            await depositAPICredits(deployer, synapseCore, depositAmount.toString(), usdc);
            
            const account = await getAPIAccount(synapseCore, deployer);

            expect(account.account).is.equal(deployerAddress);
            expect(account.active).is.true;
            expect(account.lifetimeUsage).is.equal(0)
        });

        it("should withdraw api credits", async () => {
            const { synapseCore, deployer, usdc } = await loadFixture(setup);
            
            const depositAmount = 100;
            const withdrawAmount = 20;

            await depositAPICredits(deployer, synapseCore, depositAmount.toString(), usdc);
            await withdrawAPICredits(synapseCore, withdrawAmount.toString());

            const account = await getAPIAccount(synapseCore, deployer)

            expect(account.balance).is.equal(depositAmount-withdrawAmount);
        })
    })

    describe("Contribute expert knowledge", () => {

        it("should create new contributor", async () => {
            const { synapseCore, deployer, usdc } = await loadFixture(setup);

            const depositAmount = parseEther("100000");
            
            await usdc.mint(depositAmount, deployer);
            await usdc.approve(synapseCore, depositAmount);
            await synapseCore.createContributor(contributorDisplayName, depositAmount);

            const pools = await getContributors(synapseCore);

            expect(pools.length).is.equal(1);

            const createdPool = pools[0];

            expect(createdPool.contributor).is.equal(deployer);
            expect(createdPool.earnings).is.equal(0);
            expect(createdPool.swapFeesCollected).is.equal(0);
            expect(createdPool.totalSupply).is.equal(100000);
            expect(createdPool.name).is.equal(contributorDisplayName);
        });

        it("should contribute expert knowledge", async () => {
            const { synapseCore, deployer, usdc } = await loadFixture(setup);
            const depositAmount = parseEther("100");
            
            await usdc.mint(depositAmount, deployer);
            await usdc.approve(synapseCore, depositAmount);
            await synapseCore.createContributor(contributorDisplayName, depositAmount);

            const contributorInfo = (await getContributors(synapseCore))[0];
            const weight = .5

            await contributeExpertKnowledge(synapseCore, 0, contributorInfo.pool, weight);

            const expertInfo = (await getExperts(synapseCore))[0];

            expect(expertInfo.id).is.equal(1);
            expect(expertInfo.lifetimeEarnings).is.equal(0);
            expect(expertInfo.totalWeight).is.equal(weight);
            expect(expertInfo.contributors.length).is.equal(1);
            expect(expertInfo.contributors[0]).is.equal(contributorInfo.pool);
        })

    })

});