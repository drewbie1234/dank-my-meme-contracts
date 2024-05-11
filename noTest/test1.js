const { expect } = require("chai");
const hre = require("hardhat");
describe("Token contract deploymment, token transfer and event emitter", function() {
  let Token, token, owner, addr1, addr2;

  beforeEach(async function() {
    [owner, addr1, addr2] = await ethers.getSigners();

    // Deploy the Token contract
    Token = await hre.ethers.getContractFactory("Token");
    token = await Token.deploy();
    console.log("Token contract deployed by address (owner):", owner.address);
    const dankTokenAddress = await token.getAddress()
    console.log("Token contract deployed to address:", dankTokenAddress);
  });

  it("Deployment should assign the total supply of tokens to the owner", async function() {
    const ownerBalance = await token.balanceOf(owner.address);
    const totalSupply = await token.totalSupply();
    console.log("Owner token balance:", ownerBalance.toString());
    console.log("Total token supply:", totalSupply.toString());
    expect(totalSupply).to.equal(ownerBalance);
  });

  it("Should transfer tokens between accounts", async function() {
    const transferAmount = 50;
    await token.transfer(addr1.address, transferAmount);
    const addr1Balance = await token.balanceOf(addr1.address);
    expect(addr1Balance).to.equal(transferAmount);

    await token.connect(addr1).transfer(addr2.address, transferAmount);
    const addr2Balance = await token.balanceOf(addr2.address);
    const addr1BalanceAfter = await token.balanceOf(addr1.address);
    console.log("Address 2 balance after transfer:", addr2Balance.toString());
    expect(addr2Balance).to.equal(transferAmount);
    expect(addr1BalanceAfter).to.equal(0);
  });

  it("Should fail to transfer more tokens than the account holds", async function() {
    const addr1Balance = await token.balanceOf(addr1.address);
    const amountToTransfer = 1000;

    try {
        await token.connect(addr1).transfer(addr2.address, amountToTransfer);
        throw new Error("Expected transfer to fail, but it succeeded");
    } catch (error) {
        expect(error.message).to.include("Not enough tokens");
    }
    });

it("Should emit Transfer event on token transfer", async function() {
  const transferAmount = 50;

  await expect(token.transfer(addr1.address, transferAmount))
      .to.emit(token, "Transfer")
      .withArgs(owner.address, addr1.address, transferAmount);
  });
});

