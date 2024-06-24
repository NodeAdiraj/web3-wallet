require("@nomiclabs/hardhat-waffle")
require("hardhat-gas-reporter")
require("@nomiclabs/hardhat-etherscan")
require("dotenv").config()
require("solidity-coverage")
require("hardhat-deploy")
const SEPOLIA_RPC = process.env.SEPOLIA_RPC
const SEPOLIA_PK = process.env.SEPOLIA_PK
module.exports = {
    defaultNetwork: "hardhat",
    networks: {
        hardhat: {
            chainId: 31337,
        },

        sepolia: {
            url: SEPOLIA_RPC,
            accounts: [SEPOLIA_PK],
            chainId: 11155111,
            blockConfirmation: 6,
        },
    },
    namedAccounts: {
        deployer: {
            default: 0,
        },
    },
    solidity: {
        compilers: [
            {
                version: "0.8.7",
            },
            {
                version: "0.6.6",
            },
        ],
    },

    gasReporter: {
        enabled: true,
        currency: "USD",
        outputFile: "gas-report.txt",
        noColors: true,
        // coinmarketcap: COINMARKETCAP_API_KEY,
    },

    mocha: {
        timeout: 500000,
    },
}
