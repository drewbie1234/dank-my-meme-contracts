// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Contest.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


contract ContestFactory is Ownable {
    // Array to store addresses of deployed contest contracts
    address[] public contests;

    // Address of the DankToken used for the contests
    address public dankTokenAddress;

    event ContestDeployed(address indexed contestAddress, string name);

    constructor(address _dankTokenAddress) {
        dankTokenAddress = _dankTokenAddress;
    }

    function createContest(
    string memory _name,
    uint256 _startDateTime,
    uint256 _endDateTime,
    uint256 _entryFee,
    uint256 _votingFee,
    uint256 _winnerPercentage,
    uint256 _numberOfLuckyVoters
) public onlyOwner {
    require(_endDateTime > _startDateTime, "End date must be after start date");
    require(_entryFee > 0 && _entryFee <= 1 ether, "Entry fee must be between 1 and 1 ether");
    require(_votingFee > 0 && _votingFee <= 1 ether, "Voting fee must be between 1 and 1 ether");
    require(_winnerPercentage > 0 && _winnerPercentage <= 100, "Winner percentage must be between 1 and 100");
    require(_numberOfLuckyVoters > 0, "There must be at least one lucky voter");

    Contest newContest = new Contest(
        dankTokenAddress,
        _name,
        _startDateTime,
        _endDateTime,
        _entryFee,
        _votingFee,
        _winnerPercentage,
        _numberOfLuckyVoters
    );
    newContest.transferOwnership(owner());
    contests.push(address(newContest));
    emit ContestDeployed(address(newContest), _name);
}

    function getContests() public view returns (address[] memory) {
        return contests;
    }
}
