const { assert, expect } = require("chai")
const { network, deployments, ethers, getNamedAccounts } = require("hardhat")

describe("wallet", () => {
    let contract
    let mock
    let owner
    const sendValue = ethers.utils.parseEther("1")
    const withdrawAmount = ethers.utils.parseEther("0.5")

    beforeEach(async () => {
        await deployments.fixture(["all"])
        owner = (await getNamedAccounts()).deployer
        contract = await ethers.getContract("wallet", owner)
        mock = await ethers.getContract("MockV3Aggregator", owner)
    })

    describe("constructor", () => {
        it("assigns correct owner", async () => {
            const _owner = await contract.getowner() // Ensure method name is correct
            assert.equal(_owner, owner)
        })

        it("assigns correct feed", async () => {
            const _feed = await contract.getfeed() // Ensure method name is correct
            assert.equal(_feed, mock.address) // Make sure to compare the address
        })
    })

    describe("send", () => {
        it("checks if transactions are updated", async () => {
            const accounts = await ethers.getSigners()
            const ewcontract = await contract.connect(accounts[1])
            const txx = await ewcontract.send({ value: sendValue })
            await txx.wait()
            const newcontract = await contract.connect(accounts[2])
            const tx = await newcontract.send({ value: sendValue })
            await tx.wait()
            const transactions = await newcontract.gettransactions()
            expect(transactions[transactions.length - 1].sender).to.equal(
                accounts[2].address
            )
        })

        it("checks if the value corresponded is correct", async () => {
            const accounts = await ethers.getSigners()
            const newcontract = await contract.connect(accounts[1])
            const tx = await newcontract.send({ value: sendValue })
            await tx.wait() // Ensure to await tx.wait()
            const money = await newcontract.getamount()
            const transactions = await newcontract.gettransactions()
            assert.equal(
                money,
                transactions[transactions.length - 1].usdAmount.toString()
            )
            expect(transactions[transactions.length - 1].sender).to.equal(
                accounts[1].address
            )
        })
    })

    describe("given_by", () => {
        it("checks given_by function", async () => {
            const accounts = await ethers.getSigners()
            const newcontract = await contract.connect(accounts[1])
            const tx = await newcontract.send({ value: sendValue })
            await tx.wait()
            const money = await newcontract.getamount()
            const txx = await newcontract.send({ value: sendValue })
            await txx.wait()
            const moneyy = await newcontract.getamount()
            const response = await newcontract.given_by(accounts[1].address)
            assert.equal(response.toString(), money.add(moneyy).toString()) // Ensure correct comparison
        })
    })
    describe("withdraw", () => {
        it("allows the owner to withdraw and updates the balance correctly", async () => {
            const tx = await contract.send({ value: sendValue })
            await tx.wait()

            const startingContractBalance = await ethers.provider.getBalance(
                contract.address
            )
            const startingOwnerBalance = await ethers.provider.getBalance(owner)

            const transactionResponse = await contract.withdraw(withdrawAmount)
            const transactionReceipt = await transactionResponse.wait()
            const { gasUsed, effectiveGasPrice } = transactionReceipt
            const gasCost = gasUsed.mul(effectiveGasPrice)

            const endingContractBalance = await ethers.provider.getBalance(
                contract.address
            )
            const endingOwnerBalance = await ethers.provider.getBalance(owner)
            assert.equal(
                endingContractBalance.toString(),
                startingContractBalance.sub(withdrawAmount).toString(),
                "Contract balance should decrease by withdraw amount"
            )
            assert.equal(
                endingOwnerBalance.add(gasCost).toString(),
                startingOwnerBalance.add(withdrawAmount).toString(),
                "Owner balance should increase by withdraw amount minus gas cost"
            )

            const transactions = await contract.gettransactions()
            const lastTransaction = transactions[transactions.length - 1]
            assert.equal(
                lastTransaction.usdAmount.toString(),
                (-withdrawAmount).toString(),
                "Transaction record should store the correct amount"
            )
            assert.equal(
                lastTransaction.sender,
                owner,
                "Transaction record should store the correct sender"
            )
        })

        it("reverts if non-owner tries to withdraw", async () => {
            const [_, nonOwner] = await ethers.getSigners()

            // Send some ETH to the contract to have a balance to withdraw from
            const tx = await contract.send({ value: sendValue })
            await tx.wait()

            await expect(
                contract.connect(nonOwner).withdraw(withdrawAmount)
            ).to.be.revertedWith("wallet_not_owner")
        })

        it("reverts if the contract balance is insufficient", async () => {
            await expect(contract.withdraw(sendValue)).to.be.revertedWith(
                "wallet_not_enough_balance"
            )
        })
    })
})
