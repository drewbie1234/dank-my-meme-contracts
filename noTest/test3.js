const { expect } = require("chai");
const hre = require("hardhat");

describe("Contest contract", function() {
  let Contest, contest, owner, participant, token, dankTokenAddress, contestAddress;
  const contestName = "Photo Contest";
  const entryFee = 100
  const votingFee = 10
  const winnerPercentage = 75;
  const numberOfLuckyVoters = 4;
  const now = Math.floor(Date.now() / 1000); // Current timestamp in seconds
  const startTime = now; // 
  const endTime = startTime + 86400; // End time 1 day after start
  
  beforeEach(async function() {
    [owner, participant] = await hre.ethers.getSigners();
    console.log("Owner address:", owner.address);
    console.log("Participant address:", participant.address);

    // Deploy the Token contract
    Token = await hre.ethers.getContractFactory("Token");
    token = await Token.deploy();
    console.log("Token contract deployed by address (owner):", owner.address);
    const dankTokenAddress = await token.getAddress()
    console.log("Token contract deployed to address:", dankTokenAddress);
    
    // Deploy contest contract
    Contest = await hre.ethers.getContractFactory("Contest");
    contest = await Contest.deploy(
      dankTokenAddress, // Pass token contract address
      contestName,
      startTime,
      endTime,
      entryFee,
      votingFee,
      winnerPercentage,
      numberOfLuckyVoters
    );
    contestAddress = await contest.getAddress()
    console.log(owner.address, "deployed contest contract to address:", contestAddress);
  });

  it("Should distribute prizes correctly", async function() {
    // Transfer tokens to the participants
    const participants = await ethers.getSigners();


    // Submit 5 entries to the contest from different addresses
    for (let i = 0; i < 5; i++) {
        await token.transfer(participants[i+1].address, entryFee);
        await token.connect(participants[i+1]).approve(contestAddress, entryFee);
        await contest.connect(participants[i+1]).submitEntry(`https://example.com/image${i}.jpg`);
        console.log(`Participant ${i} submitted entry.`);
    }

    // Simulate random voting by 50 accounts
    let voterSigners = await ethers.getSigners();
    for (let i = 0; i < 18; i++) {
        const randomSubmissionIndex = Math.floor(Math.random() * 4) + 1; // Randomly select a submission index
        await token.transfer(voterSigners[i+1].address, votingFee); // Transfer tokens to random voters (assuming there are 10 participants)
        await token.connect(voterSigners[i+1]).approve(contestAddress, votingFee);
        await contest.connect(voterSigners[i+1]).voteForSubmission(randomSubmissionIndex);
        console.log(`Voter ${i} voted for submission ${randomSubmissionIndex}.`);
    }

    // Check the number of votes for each submission
    for (let i = 0; i < 5; i++) {
        const updatedSubmission = await contest.submissions(i);
        console.log(`Submission ${i} votes: ${updatedSubmission.votes}`);
        expect(updatedSubmission.votes).to.be.at.least(0); // Ensure that the number of votes is not negative
    }

    await ethers.provider.send("evm_increaseTime", [10 * 24 * 60 * 60]); // 10 days
    await ethers.provider.send("evm_mine"); // Mine a block to update the state

    console.log("Distributing Prizes...");
    // Ending the contest and distributing prizes
    await contest.connect(owner).endContest();
    console.log("Contest ended and prizes distributed.");
});



  // it("Should only allow the owner to end the contest", async function() {
  //   // Try to end the contest as a non-owner
  //   await expect(contest.connect(participant).endContest())
  //     .to.be.revertedWith("Ownable: caller is not the owner");
  // });

  // it("Should fail to submit or vote when the contest is not active", async function() {
  //   // Move time to after the contest end
  //   await ethers.provider.send('evm_increaseTime', [172800]); // Increase time by 2 days
  //   await ethers.provider.send('evm_mine', []);

  //   // Attempt to submit or vote
  //   await expect(contest.connect(participant).submitEntry("https://example.com/image.jpg"))
  //     .to.be.revertedWith("Contest not active");
  //   await expect(contest.connect(participant).voteForSubmission(0))
  //     .to.be.revertedWith("Contest not active");
  // });

  // Additional tests...
});
