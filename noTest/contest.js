
const { expect } = require("chai");

describe("Contest contract", function() {
    let Contest, contest, owner, participant;
    const dankTokenAddress = '0xe12154f598138d7B77179739DABEDf4AaD80f824'
    const contestName = "Photo Contest";
    const entryFee = ethers.parseEther("1"); // 1 DANK token
    const votingFee = ethers.parseEther("0.1"); // 0.1 DANK token
    const winnerPercentage = 50;
    const numberOfLuckyVoters = 1;
    const contestDuration = 86400; // 1 day in seconds
    
  
    beforeEach(async function() {
      [owner, participant] = await ethers.getSigners();
      console.log("Owner address:", owner.address);
      console.log("Participant address:", participant.address);
  
      const startTime = (await ethers.provider.getBlock('latest')).timestamp ; // 5 minutes from now
      const endTime = startTime + contestDuration;
  
      Contest = await ethers.getContractFactory("Contest");
      contest = await Contest.deploy(
        dankTokenAddress,
        contestName,
        startTime,
        endTime,
        entryFee,
        votingFee,
        winnerPercentage,
        numberOfLuckyVoters
      );
      console.log("Contest address:", contest.address);
    });
  
    it("Should allow creating a new contest", async function() {
      console.log("Testing contest creation...");
      expect(await contest.name()).to.equal(contestName);
      expect(await contest.entryFee()).to.equal(entryFee);
      expect(await contest.votingFee()).to.equal(votingFee);
    });
  
    it("Should allow submissions with valid entry fee", async function() {
      const submissionImage = "https://example.com/image.jpg";
      console.log("Testing submission with valid entry fee...");
  
      await token.transfer(participant.address, 1000000);
      console.log("Transferred tokens to participant for submission.");
  
      await token.connect(participant).approve(contest.address, entryFee);
      console.log("Participant approved contest to spend tokens.");
  
      await expect(contest.connect(participant).submitEntry(submissionImage))
        .to.emit(contest, "SubmissionMade").withArgs(participant.address, submissionImage);
    });  
});
 