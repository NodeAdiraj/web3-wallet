const { networkConfig } = require("../helper-hardhat-config")

module.exports = async ({ deployments, getNamedAccounts, network }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    let feedAddress

    if (network.config.chainId == 31337) {
        const feed = await deployments.get("MockV3Aggregator")
        feedAddress = feed.address
    } else {
        feedAddress = networkConfig[network.config.chainId]["ethUsdPriceFeed"]
    }

    const wallet = await deploy("wallet", {
        from: deployer,
        args: [feedAddress],
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    log(`Wallet deployed at ${wallet.address}`)
}

module.exports.tags = ["all", "wallet"]
