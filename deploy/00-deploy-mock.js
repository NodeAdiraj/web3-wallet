const { network } = require("hardhat")

const DECIMALS = 8
const INITIAL_PRICE = 200000000000

module.exports = async ({ deployments, getNamedAccounts }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    if (network.config.chainId == 31337) {
        const mock = await deploy("MockV3Aggregator", {
            from: deployer, // Corrected access to deployer account
            log: true,
            args: [DECIMALS, INITIAL_PRICE],
        })

        log(`MockV3Aggregator deployed at ${mock.address}`)
    }
}

module.exports.tags = ["all", "mocks"]
