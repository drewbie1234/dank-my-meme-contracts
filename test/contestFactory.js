const { expect } = require("chai");
const hre = require("hardhat");

describe("ContestFactory", function () {
  let Token, token, ContestFactory, factory, Contest, owner, addr1, addr2, addr3;

  beforeEach(async function () {
    [owner, addr1, addr2, addr3] = await ethers.getSigners();

    // Deploy the Token (DankToken) using the fully qualified name
    Token = await hre.ethers.getContractFactory("contractsV1/Token.sol:Token");
    token = await Token.deploy();
    const dankTokenAddress = await token.getAddress();
    console.log("Token contract deployed by address (owner):", owner.address);
    console.log("Token contract deployed to address:", dankTokenAddress);

    // Deploy the ContestFactory contract
    ContestFactory = await ethers.getContractFactory("contractsV1/ContestFactory.sol:ContestFactory");
    factory = await ContestFactory.deploy();
    const factoryAddress = await factory.getAddress();
    console.log("ContestFactory contract deployed to address:", factoryAddress);
  });

  it("should create a new contest", async function () {
    const dankTokenAddress = await token.getAddress();
    console.log("Using DankToken address:", dankTokenAddress);

    // Create a new contest via the factory
    await factory.createContest(
      dankTokenAddress,
      "Test Contest",
      Math.floor(Date.now() / 1000), // start date
      Math.floor(Date.now() / 1000) + 3600, // end date
      ethers.parseEther("0.1"), // entry fee
      ethers.parseEther("0.01"), // voting fee
      70, // winner percentage
      3 // number of lucky voters
    );

    // Check if the contest was created
    const contests = await factory.getContests();
    console.log("Contests created:", contests);
    expect(contests.length).to.equal(1);
  });

  it("should handle submissions and voting via factory-created contest", async function () {
    const dankTokenAddress = await token.getAddress();
    console.log("Using DankToken address:", dankTokenAddress);

    // Create a new contest via the factory
    await factory.createContest(
      dankTokenAddress,
      "Test Contest",
      Math.floor(Date.now() / 1000), // start date
      Math.floor(Date.now() / 1000) + 3600, // end date
      1, // entry fee
      1, // voting fee
      70, // winner percentage
      3 // number of lucky voters
    );

    const contests = await factory.getContests();
    console.log("Contests array:", contests);
    const contestAddress = contests[0];
    console.log("Contest address:", contestAddress);

    // Connect to the created contest
    Contest = await ethers.getContractFactory("contractsV1/Contest.sol:Contest");
    const contest = await Contest.attach(contestAddress);

    // Transfer some tokens to addr1 and addr2 for submissions and voting
    console.log("Transferring tokens to addr1, addr2, and addr3");
    await token.transfer(addr1.address, 1000);
    await token.transfer(addr2.address, 1000);
    await token.transfer(addr3.address, 1000);

    // Log balances before submissions
    const addr1BalanceBefore = await token.balanceOf(addr1.address);
    const addr2BalanceBefore = await token.balanceOf(addr2.address);
    const addr3BalanceBefore = await token.balanceOf(addr3.address);
    console.log("Balance of addr1 before submission:", addr1BalanceBefore.toString());
    console.log("Balance of addr2 before submission:", addr2BalanceBefore.toString());
    console.log("Balance of addr3 before submission:", addr3BalanceBefore.toString());

    // Approve and submit entries
    console.log("Addr1 approving tokens for contest");
    await token.connect(addr1).approve(contestAddress, 10);
    console.log("Addr1 submitting entry");
    await contest.connect(addr1).submitEntry("Image1");

    console.log("Addr2 approving tokens for contest");
    await token.connect(addr2).approve(contestAddress, 10);
    console.log("Addr2 submitting entry");
    await contest.connect(addr2).submitEntry("Image2");

    // Approve and vote
    console.log("Addr3 approving tokens for voting on submission 0");
    await token.connect(addr3).approve(contestAddress, 10);
    console.log("Addr3 voting for submission 0");
    await contest.connect(addr3).voteForSubmission(0);

    console.log("Addr3 approving tokens for voting on submission 1");
    await token.connect(addr3).approve(contestAddress, 10);
    console.log("Addr3 voting for submission 1");
    await contest.connect(addr3).voteForSubmission(1);

    // Increase time to simulate the passage of time
    console.log("Increasing time to simulate contest end");
    await hre.network.provider.send("evm_increaseTime", [3600]);
    await hre.network.provider.send("evm_mine");

    // End contest
    console.log("Ending contest");
    await contest.endContest();
    console.log("Contest ended");

    // Check if the contest ended and prizes distributed
    const addr1BalanceAfter = await token.balanceOf(addr1.address);
    const addr2BalanceAfter = await token.balanceOf(addr2.address);

    console.log("Balance of addr1 after contest end:", addr1BalanceAfter.toString());
    console.log("Balance of addr2 after contest end:", addr2BalanceAfter.toString());

    expect(addr1BalanceAfter).to.be.above(0);
    expect(addr2BalanceAfter).to.be.above(0);
  });

  // Add more tests as needed
});
