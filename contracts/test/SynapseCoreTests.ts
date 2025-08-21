import {loadFixture} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import { contributeExpertKnowledge, getAccountTokenBalances, depositAPICredits, getAPIAccount, getPoolById, getPools, getExperts, pay, setupTestContributorAndExpert, withdrawAPICredits } from "./helpers/synapse-core";
import { parseEther } from "ethers";
import { balanceOf, transferERC20 } from "./helpers/erc20";
import { buy, getAmountOut, getTokenHolderEarnings, sell } from "./helpers/knowledge-expert-pool";

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
        
        const usdcAddress = await usdc.getAddress();
        const deployerAddress = await deployer.getAddress();

        return { deployer, synapseCore, usdc, usdcAddress, deployerAddress }
    }

    describe("API Credit Management", () => {

        it("should deposit api credits", async () => {
            const { synapseCore, deployer, usdc } = await loadFixture(setup);
            
            const depositAmount = 100;

            await depositAPICredits(deployer, synapseCore, depositAmount, usdc);
            
            const account = await getAPIAccount(synapseCore, deployer);

            expect(account.balance).is.equal(depositAmount);
        });

        it("should create api account", async () => {
            const { synapseCore, deployer, usdc } = await loadFixture(setup);
            
            const depositAmount = 100;
            const deployerAddress = await deployer.getAddress()

            await depositAPICredits(deployer, synapseCore, depositAmount, usdc);
            
            const account = await getAPIAccount(synapseCore, deployer);

            expect(account.account).is.equal(deployerAddress);
            expect(account.active).is.true;
            expect(account.lifetimeUsage).is.equal(0)
        });

        it("should withdraw api credits", async () => {
            const { synapseCore, deployer, usdc } = await loadFixture(setup);
            
            const depositAmount = 100;
            const withdrawAmount = 20;

            await depositAPICredits(deployer, synapseCore, depositAmount, usdc);
            await withdrawAPICredits(synapseCore, withdrawAmount);

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

            const pools = await getPools(synapseCore);

            expect(pools.length).is.equal(1);

            const createdPool = pools[0];

            expect(createdPool.contributor).is.equal(deployer);
            expect(createdPool.earnings).is.equal(0);
            expect(createdPool.swapFeesToken0).is.equal(0);
            expect(createdPool.swapFeesToken1).is.equal(0);
            expect(createdPool.totalSupply).is.equal(100000);
            expect(createdPool.name).is.equal(contributorDisplayName);
        });

        it("should contribute expert knowledge", async () => {
            const { synapseCore, deployer, usdc } = await loadFixture(setup);
            const depositAmount = parseEther("100");
            
            await usdc.mint(depositAmount, deployer);
            await usdc.approve(synapseCore, depositAmount);
            await synapseCore.createContributor(contributorDisplayName, depositAmount);

            const poolInfo = await getPoolById(synapseCore, 1);
            const weight = .5

            await contributeExpertKnowledge(synapseCore, 0, poolInfo.pool, weight);

            const expertInfo = (await getExperts(synapseCore))[0];

            expect(expertInfo.id).is.equal(1);
            expect(expertInfo.lifetimeEarnings).is.equal(0);
            expect(expertInfo.totalWeight).is.equal(weight);
            expect(expertInfo.contributors.length).is.equal(1);
            expect(expertInfo.contributors[0]).is.equal(poolInfo.pool);
        })

    })

    describe("Payments", () => {

        it("should record fee revenue", async () => {
            const { synapseCore, deployer, usdc } = await loadFixture(setup);
            const { contributor, expert } = await setupTestContributorAndExpert(deployer, synapseCore, usdc);

            const accountBalance = 100;
            const feeAmount = 20;

            await depositAPICredits(deployer, synapseCore, accountBalance, usdc);
            await pay(synapseCore, expert.id, deployer, feeAmount);

            const poolInfo = await getPoolById(synapseCore, contributor.id);

            expect(poolInfo.earnings).is.equal(feeAmount);
        });

        it("should distribute payments to token holders by holdings amounts", async () => {
            const { synapseCore, deployer, usdc, usdcAddress, deployerAddress } = await loadFixture(setup);
            const { expert } = await setupTestContributorAndExpert(deployer, synapseCore, usdc);

            const accountBalance = 100;
            const feeAmount = 20;

            await depositAPICredits(deployer, synapseCore, accountBalance, usdc);

            const pool = await getPoolById(synapseCore, 1);

            // transfer 10% of tokens to another address
            const tokenBalance = await balanceOf(pool.pool, deployerAddress)
            const transferAmount = tokenBalance*.1;

            const signers = await hre.ethers.getSigners();
            const otherSignerAddress = await signers[1].getAddress();

            await transferERC20(pool.pool, transferAmount, otherSignerAddress);
            await pay(synapseCore, expert.id, deployer, feeAmount);

            // ensure token holders have received payouts in USDC amounts
            const expectedPayoutAmount0 = feeAmount * .9;
            const expectedPayoutAmount1 = feeAmount * .1;

            const actualBalance0 = await balanceOf(usdcAddress, deployerAddress)
            const actualBalance1 = await balanceOf(usdcAddress, otherSignerAddress)

            expect(expectedPayoutAmount0).is.equal(actualBalance0);
            expect(expectedPayoutAmount1).is.equal(actualBalance1);

            // ensure the pool has properly recorded earnings for token holders
            const earnings0 = await getTokenHolderEarnings(pool.pool, deployer);
            const earnings1 = await getTokenHolderEarnings(pool.pool, otherSignerAddress)

            expect(earnings0).is.equal(expectedPayoutAmount0);
            expect(earnings1).is.equal(expectedPayoutAmount1);
        })

        it("should log api usage", async () => {
            const { synapseCore, deployer, usdc } = await loadFixture(setup);
            const { expert } = await setupTestContributorAndExpert(deployer, synapseCore, usdc);

            const accountBalance = 100;
            const feeAmount = 20;

            await depositAPICredits(deployer, synapseCore, accountBalance, usdc);
            await pay(synapseCore, expert.id, deployer, feeAmount);

            const account = await getAPIAccount(synapseCore, deployer);

            expect(account.lifetimeUsage).is.equal(feeAmount);
        });

        it("should split contributor payments by weight", async () => {
            const { synapseCore, deployer, usdc } = await loadFixture(setup);
            const [signer0, signer1] = await hre.ethers.getSigners();

            const { contributor: pool0, expert } = await setupTestContributorAndExpert(signer0, synapseCore, usdc, {
                expertId: 0,
                weight: .9
            });

            const { contributor: pool1 } = await setupTestContributorAndExpert(signer1, synapseCore, usdc, {
                expertId: expert.id,
                weight: .1
            });

            const accountBalance = 100;
            const feeAmount = 20;

            await depositAPICredits(deployer, synapseCore, accountBalance, usdc);
            await pay(synapseCore, expert.id, deployer, feeAmount);

            const pool0AfterPayments = await getPoolById(synapseCore, pool0.id);
            const pool1AfterPayments = await getPoolById(synapseCore, pool1.id);

            expect(pool0AfterPayments.earnings).is.equal(feeAmount * .9);
            expect(pool1AfterPayments.earnings).is.equal(feeAmount * .1);
        })
    })

    describe("Swapping", () => {

        it("should buy tokens", async () => {
            const { synapseCore, deployer, usdc, usdcAddress } = await loadFixture(setup);
            const { contributor } = await setupTestContributorAndExpert(deployer, synapseCore, usdc);
            const [account0, account1] = await hre.ethers.getSigners()
            
            const swapAmount = 100;
            const account1Address = await account1.getAddress();
            const swapperStartingBalance = await balanceOf(contributor.pool, account1Address);
            const feeCollectorStartingBalance = await balanceOf(usdcAddress, contributor.contributor);

            const {amountOut, feeAmount} = await getAmountOut(contributor.pool, usdcAddress, contributor.pool, swapAmount);

            await buy(account1, usdc, contributor.pool, swapAmount);

            const swapperEndingBalance = await balanceOf(contributor.pool, account1Address);
            const feeCollectorEndingBalance = await balanceOf(usdcAddress, contributor.contributor);

            const poolInfo = await getPoolById(synapseCore, 1);

            expect(swapperEndingBalance).is.equal(amountOut + swapperStartingBalance);
            expect(feeCollectorEndingBalance).is.equal(feeCollectorStartingBalance + feeAmount);
            expect(poolInfo.swapFeesToken0).is.equal(feeAmount);
            expect(poolInfo.swapFeesToken1).is.equal(0);
            
        });

        it("should sell tokens", async () => {
            const { synapseCore, deployer, usdc, usdcAddress } = await loadFixture(setup);
            const { contributor } = await setupTestContributorAndExpert(deployer, synapseCore, usdc);
            const [account0, account1] = await hre.ethers.getSigners()
            
            const swapAmount = 10;
            const account1Address = await account1.getAddress();

            await transferERC20(contributor.pool, swapAmount, account1Address);

            const swapperStartingBalance = await balanceOf(usdcAddress, account1Address);
            const feeCollectorStartingBalance = await balanceOf(contributor.pool, contributor.contributor);

            const {amountOut, feeAmount} = await getAmountOut(contributor.pool, contributor.pool, usdcAddress, swapAmount);

            await sell(account1, contributor.pool, swapAmount);

            const swapperEndingBalance = await balanceOf(usdcAddress, account1Address);
            const feeCollectorEndingBalance = await balanceOf(contributor.pool, contributor.contributor);

            const poolInfo = await getPoolById(synapseCore, 1);

            expect(swapperEndingBalance).is.equal(amountOut + swapperStartingBalance);
            expect(feeCollectorEndingBalance).is.equal(feeCollectorStartingBalance + feeAmount);
            expect(poolInfo.swapFeesToken0).is.equal(0);
            expect(poolInfo.swapFeesToken1).is.equal(feeAmount);
        })

    })

    describe("View Tests", () => {

        it("should get token holder balances", async () => {
            const { synapseCore, deployer, usdc, usdcAddress } = await loadFixture(setup);
            
            const { contributor } = await setupTestContributorAndExpert(deployer, synapseCore, usdc);

            const amount = 100;
            const amountAsBig = parseEther(amount.toString());
        
            await usdc.mint(amountAsBig, deployer);

            const balances = await getAccountTokenBalances(synapseCore, deployer);

            expect(balances[0].balance).is.equal(amount);
            expect(balances[0].account).is.equal(usdcAddress);
            expect(balances[1].balance).is.equal(5000);
            expect(balances[1].account).is.equal(contributor.pool);
        });
    })

});