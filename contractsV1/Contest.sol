// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Contest is Ownable {
    struct Submission {
        address wallet;
        string image;
        uint256 votes;
    }

    error ContestNotActive();
    error FeeTransferFailed();
    error SubmissionDoesNotExist();
    error AlreadyVoted();
    error ContestNotEnded();
    error NoSubmissionsMade();
    error NoVotesCast();
    error WinnerPrizeTransferFailed();
    error PrizeTransferFailed();
    error NoFundsToWithdraw();
    error WithdrawalFailed();

    string public name;
    uint256 public startDateTime;
    uint256 public endDateTime;
    uint256 public entryFee;
    uint256 public votingFee;
    uint256 public winnerPercentage;
    uint256 public numberOfLuckyVoters;
    Submission[] public submissions;
    mapping(address => bool) public voterRegistry;
    address[] private voters;
    uint256[] private winningSubmissionIndices;

    IERC20 public dankToken;

    uint256 public highestVotes;
    uint256 private winningSubmissionIndex;

    mapping(uint256 => mapping(address => bool)) public hasVotedOnSubmission;

    event SubmissionMade(address indexed wallet, string image);
    event VoteCasted(address indexed voter, uint submissionIndex, string image);
    event ContestEnded(address winner, uint256 winnerPrize, uint256 luckyVoterPrize);
    event ParametersUpdated(uint256 entryFee, uint256 votingFee, uint256 winnerPercentage, uint256 numberOfLuckyVoters);

    constructor(
        address _tokenAddress,
        string memory _name,
        uint256 _startDateTime,
        uint256 _endDateTime,
        uint256 _entryFee,
        uint256 _votingFee,
        uint256 _winnerPercentage,
        uint256 _numberOfLuckyVoters
    ) {
        dankToken = IERC20(_tokenAddress);
        name = _name;
        startDateTime = _startDateTime;
        endDateTime = _endDateTime;
        entryFee = _entryFee;
        votingFee = _votingFee;
        winnerPercentage = _winnerPercentage;
        numberOfLuckyVoters = _numberOfLuckyVoters;
        highestVotes = 0;
        winningSubmissionIndex = 0;
    }

    function submitEntry(string memory image) public {
        if (!(block.timestamp >= startDateTime && block.timestamp <= endDateTime))
            revert ContestNotActive();
        
        if (!dankToken.transferFrom(msg.sender, address(this), entryFee))
            revert FeeTransferFailed();
        
        submissions.push(Submission({wallet: msg.sender, image: image, votes: 0}));
         emit SubmissionMade(msg.sender, image);
       
    }

    function voteForSubmission(uint submissionIndex) public {
        if (!(block.timestamp >= startDateTime && block.timestamp <= endDateTime))
            revert ContestNotActive();
        
        if (submissionIndex >= submissions.length)
            revert SubmissionDoesNotExist();
        
        if (hasVotedOnSubmission[submissionIndex][msg.sender])
            revert AlreadyVoted();
        
        uint256 feeInDank = votingFee;
        if (!dankToken.transferFrom(msg.sender, address(this), feeInDank))
            revert FeeTransferFailed();
        
        submissions[submissionIndex].votes++;
        if (submissions[submissionIndex].votes > highestVotes) {
            highestVotes = submissions[submissionIndex].votes;
            winningSubmissionIndices = [submissionIndex]; 
        } else if (submissions[submissionIndex].votes == highestVotes) {
            bool isAlreadyAdded = false;
            for (uint i = 0; i < winningSubmissionIndices.length; i++) {
                if (winningSubmissionIndices[i] == submissionIndex) {
                    isAlreadyAdded = true;
                    break;
                }
            }
            if (!isAlreadyAdded) {
                winningSubmissionIndices.push(submissionIndex);
            }
        }
        
        if (!voterRegistry[msg.sender]) {
            voterRegistry[msg.sender] = true;
            voters.push(msg.sender);
        }
        emit VoteCasted(msg.sender, submissionIndex, submissions[submissionIndex].image);
    }

    function endContest() public onlyOwner {
        if (block.timestamp < endDateTime)
            revert ContestNotEnded();
        if (submissions.length == 0)
            revert NoSubmissionsMade();
        if (highestVotes == 0)
            revert NoVotesCast();
        
        uint256 totalPrize = dankToken.balanceOf(address(this));
        uint256 winnerPrize = (totalPrize * winnerPercentage) / 100 / winningSubmissionIndices.length;

        for (uint256 i = 0; i < winningSubmissionIndices.length; i++) {
            address winnerAddress = submissions[winningSubmissionIndices[i]].wallet;
            if (!dankToken.transfer(winnerAddress, winnerPrize))
                revert WinnerPrizeTransferFailed();
        }

        uint256 remainingPrize = totalPrize - (winnerPrize * winningSubmissionIndices.length);
        distributePrizeToLuckyVoters(remainingPrize);
        for (uint256 i = 0; i < winningSubmissionIndices.length; i++) {
            address winnerAddress = submissions[winningSubmissionIndices[i]].wallet;
            emit ContestEnded(winnerAddress, winnerPrize, remainingPrize / numberOfLuckyVoters);
        }

    }

    function distributePrizeToLuckyVoters(uint256 remainingPrize) internal {
        uint256 numberOfVoters = voters.length;
        uint256 numberOfPrizeWinners = numberOfLuckyVoters < numberOfVoters ? numberOfLuckyVoters : numberOfVoters;
        uint256 prizePerLuckyVoter = remainingPrize / numberOfPrizeWinners;
        for (uint256 i = 0; i < numberOfPrizeWinners; i++) {
            uint256 randomIndex = uint256(keccak256(abi.encodePacked(block.timestamp, block.prevrandao, i))) % voters.length;
            address luckyVoter = voters[randomIndex];
            if (!dankToken.transfer(luckyVoter, prizePerLuckyVoter))
                revert PrizeTransferFailed();
        }
    }

    function withdrawUnclaimedPrize() public onlyOwner {
        uint256 unclaimedPrize = dankToken.balanceOf(address(this));
        if (unclaimedPrize == 0)
            revert NoFundsToWithdraw();
        
        if (!dankToken.transfer(msg.sender, unclaimedPrize))
            revert WithdrawalFailed();
    }

    function updateContestParameters(
        uint256 _entryFee, 
        uint256 _votingFee, 
        uint256 _winnerPercentage, 
        uint256 _numberOfLuckyVoters
    ) public onlyOwner {
        if (block.timestamp >= startDateTime && block.timestamp <= endDateTime)
            revert ContestNotActive();
        
        entryFee = _entryFee;
        votingFee = _votingFee;
        winnerPercentage = _winnerPercentage;
        numberOfLuckyVoters = _numberOfLuckyVoters;
        emit ParametersUpdated(entryFee, votingFee, winnerPercentage, numberOfLuckyVoters);
    }
}