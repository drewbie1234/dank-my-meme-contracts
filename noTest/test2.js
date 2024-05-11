const { expect } = require("chai");
const hre = require("hardhat");

describe("Contest contract", function() {
  let Contest, contest, owner, participant, token, dankTokenAddress, contestAddress;
  const contestName = "Photo Contest";
  const entryFee = 1000
  const votingFee = 10
  const winnerPercentage = 50;
  const numberOfLuckyVoters = 1;
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

  it("Should create contest with correct input parameters", async function() {
    console.log("Testing contest creation...");

    const actualName = await contest.name();
    console.log("Checking Contest Name:", actualName, contestName);
    
  
    const actualEntryFee = await contest.entryFee();
    const actualEntryFeeConverted = parseInt(actualEntryFee.toString()); // Convert from nanoether to wei
    console.log("Checking Entry Fee:", actualEntryFee, actualEntryFeeConverted, entryFee);
    expect(actualEntryFeeConverted).to.equal(entryFee);

    const actualVotingFee = await contest.votingFee();
    const actualVotingFeeConverted =  parseInt(actualVotingFee.toString()); // Convert from nanoether to wei
    console.log("Checking Voting Fee:", actualVotingFee, actualVotingFeeConverted, votingFee);
    expect(actualVotingFeeConverted).to.equal(votingFee);

    const actualWinnerPercentage = await contest.winnerPercentage();
    const actualWinnerPercentageConverted =  parseInt(actualWinnerPercentage.toString());
    console.log("Checking Winner Percentage:", actualWinnerPercentage,  actualWinnerPercentageConverted, winnerPercentage);
    expect(actualWinnerPercentageConverted).to.equal(winnerPercentage);

    const actualNumberOfLuckyVoters = await contest.numberOfLuckyVoters();
    const actualNumberOfLuckyVotersConverted = parseInt(actualNumberOfLuckyVoters.toString());
    console.log("Checking Number of Lucky Voters:", actualNumberOfLuckyVoters, actualNumberOfLuckyVotersConverted, numberOfLuckyVoters);
    expect(actualNumberOfLuckyVotersConverted).to.equal(numberOfLuckyVoters);
    
    const actualStartTime = await contest.startDateTime();
    const actualStartTimeConverted = parseInt(actualStartTime.toString())
    console.log("Checking Start Time:", actualStartTimeConverted, startTime);
    expect(actualStartTimeConverted).to.equal(startTime);

    const actualEndTime = await contest.endDateTime();
    const actualEndTimeConverted = parseInt(actualEndTime.toString())
    console.log("Checking Start Time:", actualEndTimeConverted, endTime);
    expect(actualEndTimeConverted).to.equal(endTime);
});

  it("Should allow submissions with valid entry fee", async function() {
    const submissionImage = "https://example.com/image.jpg";
    console.log("Testing submission with valid entry fee...");

    // Transfer tokens to the participant
    await token.transfer(participant.address, entryFee );
    console.log("Transferred tokens to participant for submission.");
    console.log("Participant initial token balance:", (await token.balanceOf(participant.address)).toString());


    // Approve the contest contract to spend tokens on behalf of the participant
    await token.connect(participant).approve(contestAddress, entryFee);
    console.log("Participant approved contest to spend tokens.");


    // Submit entry to the contest
    await expect(contest.connect(participant).submitEntry(submissionImage))
      .to.emit(contest, "SubmissionMade").withArgs(participant.address, submissionImage);
    console.log("Participant token balance after entry:", (await token.balanceOf(participant.address)).toString())
  });
  
  it("Should allow valid submission and vote", async function() {
    // Transfer tokens to the participant
    await token.transfer(participant.address, 1000);
    console.log("Transferred tokens to participant for submission.");

    // Log the initial balance to verify the transfer
    const participantInitialBalance = await token.balanceOf(participant.address);
    console.log("Participant initial token balance:", participantInitialBalance.toString());

    // Approving the contest contract to spend tokens on behalf of the participant
    await token.connect(participant).approve(contestAddress, entryFee);
    console.log("Participant approved contest contract for entry fee.");

    // Submit entry and expect the SubmissionMade event
    await expect(contest.connect(participant).submitEntry("https://example.com/image.jpg"))
        .to.emit(contest, 'SubmissionMade');
    console.log("Submission made and SubmissionMade event emitted.");

    // Verify the submission details
    const submission = await contest.submissions(0);
    console.log(`Submission 0 details - Wallet: ${submission.wallet}, Image: ${submission.image}, Votes: ${submission.votes}`);

    // Transfer tokens to the owner for voting
    await token.transfer(participant.address, 1000);
    console.log("Transferred tokens to owner for voting.");

    // Log owner's token balance after transfer
    const ownerBalancePostTransfer = await token.balanceOf(participant.address);
    console.log("participant token balance after transfer for voting:", ownerBalancePostTransfer.toString());

    // Approving the contest contract to spend tokens on behalf of the owner
    await token.connect(participant).approve(contestAddress, votingFee);
    console.log("participant approved contest contract for voting fee.");

    // Owner votes for the first submission
    await contest.connect(participant).voteForSubmission(0);
    console.log("participant has voted for submission 0.");

    // Verify the vote count after voting
    const updatedSubmission = await contest.submissions(0);
    console.log(`Updated votes for submission 0: ${updatedSubmission.votes}`);

    // Expecting the vote count to be 1 after one valid vote
    expect(updatedSubmission.votes).to.equal(1);

  });
  // // Try voting again for the same submission by the same owner
  // await expect(contest.connect(participant).voteForSubmission(0))
  //   .to.be.revertedWith("Already voted for this submission");
  // console.log("Confirmed that the same owner cannot vote twice for the same submission.");

 

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
