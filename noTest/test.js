const { expect } = require("chai");
const hre = require("hardhat");

describe("Token and Contest Contracts", function() {

  let Contest, contest,contestAddress, owner, participant, token, Token, participants ;

  const contestName = "Photo Contest";
  const entryFee = 10;
  const votingFee = 10;
  const winnerPercentage = 50;
  const numberOfLuckyVoters = 1;

  beforeEach(async function() {
    [owner, participant, ...participants] = await hre.ethers.getSigners();
    Token = await hre.ethers.getContractFactory("Token");
    token = await Token.deploy();
    console.log("Contract deployed by:", owner.address);
    const tokenAddress = await token.getAddress()
    console.log("Token successfully deployed at:", tokenAddress);

    const now = Math.floor(Date.now() / 1000);
    startTime = now; // Contest starts now
    endTime = startTime + 10000; // Contest ends 10,000 seconds after it starts

    Contest = await hre.ethers.getContractFactory("Contest");
    contest = await Contest.deploy(
      tokenAddress,
      contestName,
      startTime,
      endTime,
      entryFee,
      votingFee,
      winnerPercentage,
      numberOfLuckyVoters
    );
    contestAddress = await contest.getAddress();
    console.log("Contest successfully deployed at:", contestAddress);

    
});

  // it("Deployment should assign the total supply of tokens to the owner", async function() {
  //   const ownerBalance = await token.balanceOf(owner.address);
  //   const totalSupply = await token.totalSupply();
  //   console.log("Checking total supply matches owner's balance...");
  //   expect(totalSupply).to.equal(ownerBalance);
  //   console.log("Deployment check passed: Total supply is equal to owner balance.");
  // });

  // it("Should allow creating a new contest", async function() {
  //   console.log("Verifying contest setup...");
  //   expect(await contest.name()).to.equal(contestName);
  //   expect(await contest.entryFee()).to.equal(entryFee);
  //   expect(await contest.votingFee()).to.equal(votingFee);
  //   console.log("Contest created with correct parameters.");
  // });

  // it("allows valid submissions and vote", async function() {
  //   console.log("Preparing to transfer tokens for submission and voting...");
  //   await token.transfer(participant.address, 1000);
  //   await token.connect(participant).approve(contestAddress, 1000);
  //   console.log("Tokens transferred and approved for participant.");

  //   await expect(contest.connect(participant).submitEntry("https://example.com/image.jpg"))
  //     .to.emit(contest, 'SubmissionMade');
  //   console.log("Submission made and confirmed by event emission.");

  //   await token.connect(participant).approve(contestAddress, votingFee);
  //   await contest.connect(participant).voteForSubmission(0);
  //   console.log("Vote casted for the first submission.");

  //   const updatedSubmission = await contest.submissions(0);
  //   console.log(`Updated vote count for first submission: ${updatedSubmission.votes}`);
  //   expect(updatedSubmission.votes).to.equal(1);
  // });

  // it("Should distribute prizes correctly with multiple submissions and varied voting", async function() {
  //   console.log("Distributing tokens and setting up multiple submissions...");
  //   await token.transfer(participant.address, 3000);
  //   console.log(`Transferred 3000 tokens to participant at address ${participant.address}.`);

  //   await token.connect(participant).approve(contestAddress, 3000);
  //   console.log(`Participant approved 3000 tokens for the contest at address ${contestAddress}.`);

  //   for (let i = 0; i < 3; i++) {
  //     await contest.connect(participant).submitEntry(`https://example.com/image${i + 1}.jpg`);
  //     console.log(`Submission ${i + 1} created.`);
  //     const submission = await contest.submissions(i);
  //     console.log(`Submission ${i + 1} details: `, submission);
  //   }

  //   let voterSigners = await hre.ethers.getSigners();
  //   let ownerBalance = await token.balanceOf(owner.address);
  //   console.log(`dank contract wallet balance: ${ownerBalance}`)
  //   for (let i = 1; i <= 9; i++) {
  //     await token.transfer(voterSigners[i].address, 1000);
  //     console.log(`Transferred 1000 tokens to voter ${i} at address ${voterSigners[i].address}.`);

  //     await token.connect(voterSigners[i]).approve(contestAddress, votingFee);
  //     console.log(`Voter ${i} approved ${votingFee} tokens for the contest.`);

  //     const submissionIndex = i % 3;
  //     await contest.connect(voterSigners[i]).voteForSubmission(submissionIndex);
  //     console.log(`Voter ${i} voted for submission ${submissionIndex + 1}.`);
      
  //     const updatedSubmission = await contest.submissions(submissionIndex);
  //     console.log(`Updated vote count for submission ${submissionIndex + 1}: ${updatedSubmission.votes}`);
  //   }

  //   console.log("Advancing time to after the contest end...");
  //   await hre.ethers.provider.send("evm_increaseTime", [86401]); // Advance time by just over a day
  //   await hre.ethers.provider.send("evm_mine", []); // Mine a new block to confirm the time change

  //   console.log("Attempting to end contest and distribute prizes...");
  //   const endTx = await contest.connect(owner).endContest();
  //   await endTx.wait();  // Wait for the transaction to be mined
  //   console.log("Contest ended and prizes should be distributed now.");

  //   // Optionally, check balances after prize distribution
  //   const winnerBalance = await token.balanceOf(participant.address);
  //   console.log(`Winner balance after prize distribution: ${winnerBalance}`);
    
  // });

  // it("Should only allow the owner to end the contest", async function() {
  //   console.log("Testing permission control for ending contest...");
  //   await expect(contest.connect(participant).endContest()).to.be.revertedWith("Ownable: caller is not the owner");
  //   console.log("Permission test passed: Only the owner can end the contest.");
  // });

  // it("Should fail to submit or vote when the contest is not active", async function() {
  //     console.log("Testing submission and voting outside active contest period...");
  //     await hre.ethers.provider.send('evm_increaseTime', [100]); // Increase time by 2 days
  //     await hre.ethers.provider.send('evm_mine');

  //     // Check for the custom error when submitting an entry
  //     await expect(contest.connect(participant).submitEntry("https://example.com/image.jpg"))
  //         .to.be.revertedWithCustomError(contest, "ContestNotActive")
  //         .withArgs(); // If your custom error has arguments, they can be checked here.
  //     console.log("Submission test passed: Contest is not active.");

  //     // Check for the custom error when voting
  //     await expect(contest.connect(participant).voteForSubmission(0))
  //         .to.be.revertedWithCustomError(contest, "ContestNotActive")
  //         .withArgs(); // If your custom error has arguments, they can be checked here.
  //     console.log("Voting test passed: Contest is not active.");
  // });

  // it("Should fail to submit before the contest starts", async function() {
  //   // Rewind time to before the contest
    
  //   await expect(contest.connect(participant).submitEntry("https://example.com/image.jpg"))
  //       .to.be.revertedWithCustomError(contest, "ContestNotActive");
  //   console.log("Failed to submit before contest start as expected.");
  // });

  // it("Should fail to vote for a non-existent submission", async function() {

  //   await expect(contest.connect(participant).voteForSubmission(999))  // Assuming index 999 does not exist
  //       .to.be.revertedWithCustomError(contest, "SubmissionDoesNotExist");
  //   console.log("Failed to vote for a non-existent submission as expected.");
  // });

//   it("Should handle the scenario where no votes are cast", async function() {
//     // Setup a contest and do not cast any votes
    
//     // Distribute tokens and set approvals for each participant
//     const tokenAmount = 1000; // Amount of tokens each participant will receive
//     for (const user of participants) {
//         await token.transfer(user.address, tokenAmount);
//         await token.connect(user).approve(contestAddress, tokenAmount);
//     }  

//     // Create submissions and make each have the same number of votes
//       for (let i = 0; i < 3; i++) {
//           await contest.connect(participants[i]).submitEntry(`https://example.com/image${i}.jpg`);
//       }


//     await hre.ethers.provider.send('evm_increaseTime', [10000000]); // Increase time by 2 days
//     await hre.ethers.provider.send('evm_mine');
//     await expect(contest.connect(owner).endContest())
//         .to.be.revertedWithCustomError(contest, "NoVotesCast");
//     console.log("Handled no votes cast correctly.");
// });

// it("Should correctly distribute prizes in the event of a tie", async function() {
//   // Distribute tokens and set approvals for each participant
//   const tokenAmount = 40; // Amount of tokens each participant will receive
//   for (const user of participants) {
//       await token.transfer(user.address, tokenAmount);
//       await token.connect(user).approve(contestAddress, tokenAmount);
//   }  

//   // Create submissions and ensure each receives the same number of votes
//   const numberOfSubmissions = 3;
//   const votesPerSubmission = 3;
//   for (let i = 0; i < numberOfSubmissions; i++) {
//       await contest.connect(participants[i]).submitEntry(`https://example.com/image${i}.jpg`);
//       for (let j = 0; j < votesPerSubmission; j++) {
//           await contest.connect(participants[j % numberOfSubmissions]).voteForSubmission(i);
//       }
//   }

//   // Advance time and end the contest
//   await hre.ethers.provider.send("evm_increaseTime", [1000000]); // Far enough in the future to ensure contest is over
//   await hre.ethers.provider.send("evm_mine");

//   // End the contest and calculate expected prize distribution
//   await contest.connect(owner).endContest();

//   // Fetch total prize from the contract if it's not yet defined
//   let totalPrize = await contract.getTotalPrize();
//   if (!(totalPrize instanceof ethers.BigNumber)) {
//       totalPrize = ethers.BigNumber.from(totalPrize.toString()); // Convert to BigNumber if necessary
//   }

//   const expectedPrizePerWinner = totalPrize
//       .mul(ethers.BigNumber.from(winnerPercentage))
//       .div(100)
//       .div(numberOfSubmissions);

//   // Check each winner's balance to confirm even distribution
//   for (let i = 0; i < numberOfSubmissions; i++) {
//       const winnerAddress = (await contest.submissions(i)).wallet;
//       const winnerBalance = await token.balanceOf(winnerAddress);
//        console.log(winnerBalance)
//        console.log(expectedPrizePerWinner)
//       expect(winnerBalance).to.equal(expectedPrizePerWinner);
//   }

//   console.log("Prizes distributed evenly among all tied winners.");
// });

});
