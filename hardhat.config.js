require("@nomicfoundation/hardhat-chai-matchers");
require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.4",
  paths: {
    sources: "./contractsV1", // Default: "./contracts"
    tests: "./test", // Default: "./test"
    cache: "./cache", // Default: "./cache"
    artifacts: "./artifacts" // Default: "./artifacts"
  },
  networks: {
    hardhat: {
      chainId: 1337,
    },
  },
};
