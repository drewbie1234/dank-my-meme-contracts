// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

contract Token is Ownable {
    string public name = "DANK TOKEN";
    string public symbol = "DANK";
    uint256 public totalSupply = 100000000000;
   
    mapping(address => uint256) public balances;
    mapping(address => mapping(address => uint256)) public allowances;
    
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    constructor() {
        balances[msg.sender] = totalSupply;
        transferOwnership(msg.sender);
    }

    function transfer(address to, uint256 amount) external returns(bool){
        console.log("Sender's address:", msg.sender);   
        console.log("Recipient's address:", to);   
        console.log("Sender's balance before transfer:", balances[msg.sender]);
        console.log("Recipient's balance before transfer:", balances[to]);
        require(balances[msg.sender] >= amount, "Not enough tokens");

        balances[msg.sender] -= amount;
        balances[to] += amount;

        console.log("Sender's balance after transfer:", balances[msg.sender]);
        console.log("Recipient's balance after transfer:", balances[to]);

        emit Transfer(msg.sender, to, amount);
        return true; // Indicate that the transfer was successful
    }

    function approve(address spender, uint256 amount) public {
        require(spender != address(0), "Approve to the zero address");
        allowances[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
    }

    function transferFrom(address from, address to, uint256 amount) public returns (bool) {
        require(balances[from] >= amount, "Not enough tokens");
        require(allowances[from][msg.sender] >= amount, "Transfer amount exceeds allowance");

        console.log("Sender's address:", from);   
        console.log("Recipient's address:", to);   
        console.log("Sender's balance before transfer:", balances[from]);
        console.log("Recipient's balance before transfer:", balances[to]);

        balances[from] -= amount;
        balances[to] += amount;
        allowances[from][msg.sender] -= amount;

        console.log("Sender's balance after transfer:", balances[from]);
        console.log("Recipient's balance after transfer:", balances[to]);

        emit Transfer(from, to, amount);

        return true; // Indicate that the transfer was successful
    }

    function balanceOf(address account) public view returns (uint256) {
        return balances[account];
    }

    function allowance(address owner, address spender) public view returns (uint256) {
        return allowances[owner][spender];
    }
}
