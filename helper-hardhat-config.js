const networkConfig = {
    11155111: {
        name: "sepolia",
        subscriptionId: "2732",
        gasLane: "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c", // 30 gwei
        interval: "30", //30 sec
        callbackGasLimit: "500000", // 500,000 gas
        vrfCoordinatorV2: "0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625",
        mintFee: "10000000000000000", //0.01 ether
    },
    31337: {
        name: "hardhat",
        gasLane: "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c", // 30 gwei
        interval: "30",
        callbackGasLimit: "500000",
        mintFee: "10000000000000000", //0.01 ether
    },
}
const DECIMALS = "18"
const INITIAL_PRICE = "200000000000000000000"

const developmentChains = ["hardhat", "localhost"]

module.exports = {
    networkConfig,
    developmentChains,
    DECIMALS,
    INITIAL_PRICE,
}
