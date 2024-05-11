describe("ContestFactory contract", function() {
  let ContestFactory, factory, owner, token;

  beforeEach(async function() {
      [owner] = await ethers.getSigners();

      const Token = await ethers.getContractFactory("Token");
      token = await Token.deploy();
      console.log("Token contract address:", token.address);
      if (!token.address) {
          throw new Error("Token deployment failed, address is null.");
      }

      ContestFactory = await ethers.getContractFactory("ContestFactory");
      factory = await ContestFactory.deploy(token.address);
      console.log("ContestFactory contract address:", factory.address);
  });

  it("Should deploy a contest correctly", async function() {
      // Example contest parameters
      const name = "Test Contest";
      const startDateTime = Math.floor(Date.now() / 1000); // Assuming the contest starts now
      const endDateTime = startDateTime + 86400; // 1 day later
      const entryFee = ethers.parseUnits("1", "ether"); // 1 token, assuming 18 decimal places
      const votingFee = ethers.parseUnits("0.1", "ether"); // 0.1 token
      const winnerPercentage = 50; // 50% of the total pot goes to the winner
      const numberOfLuckyVoters = 5; // 5 lucky voters

      const createTx = await factory.createContest(name, startDateTime, endDateTime, entryFee, votingFee, winnerPercentage, numberOfLuckyVoters);
      await createTx.wait();

      const contests = await factory.contests();
      expect(contests.length).to.be.greaterThan(0);
  });
});
