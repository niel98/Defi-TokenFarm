pragma solidity ^0.5.0;

import './DaiToken.sol';
import './Dapptoken.sol';

contract TokenFarm {
    //All the code for the smart contract goes here
    string public name = 'Dapp Token Farm';
    address public owner;
    DaiToken public daiToken;
    DappToken public dappToken;

    address[] public stakers;
    mapping(address => uint) public stakingBalance;
    mapping(address => bool) public hasStaked;
    mapping(address => bool) public isStaking;

    constructor(DaiToken _daiToken, DappToken _dappToken) public {
        daiToken = _daiToken;
        dappToken = _dappToken;
        owner = msg.sender;
    }

    //Stake tokens (Deposit)
    function stakeTokens (uint _amount) public {
        //The amount to be invested must be greater than 0
        require(_amount > 0, 'amount cannot be 0');
        //Send the mock Dai tokens to this smart contract
        daiToken.transferFrom(msg.sender, address(this), _amount);

        //Update the staking balance of the user
        stakingBalance[msg.sender] = stakingBalance[msg.sender] + _amount;

        //Add user to the stakers array *if only* user hasn't staked before
        if (!hasStaked[msg.sender]) {
            stakers.push(msg.sender);
        }
        //update the staking status
        isStaking[msg.sender] = true;
        hasStaked[msg.sender] = true;
    }

    //Umstake tokens (withdrawal)
    function unstakeTokens () public {
        //Fetch the staking balance
        uint balance = stakingBalance[msg.sender];

        //make sure the amount is greater than 0
        require(balance > 0, 'Balance must be greater than 0');

        //Transfer mock Dai tokens to this contract before staking
        daiToken.transfer(msg.sender, balance);

        //Reset staking balance
        stakingBalance[msg.sender] = 0;

        //Reset staking status
        isStaking[msg.sender] = false;
    }

    //Issuing tokens
    function issueTokens () public {
        //Only the owner calls the function
        require(msg.sender == owner, 'Caller must be the owner');

        for (uint i=0; i<stakers.length; i++) {
            address recipient = stakers[i];
            uint balance = stakingBalance[recipient];
            if (balance > 0) {
                dappToken.transfer(recipient, balance);
            }
        }
    }
}
