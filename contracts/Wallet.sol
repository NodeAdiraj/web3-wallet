// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;
import "./GetConversion.sol";

error wallet_not_owner();
error wallet_not_enough_balance();
error wallet_withdraw_error();

contract wallet {
    using converter for uint256;
    address private immutable owner;
    address private exchange;
    int256 converted;

    struct record {
        int256 usdAmount;
        address sender;
    }
    record[] public transactions;
    modifier only_owner() {
        if (msg.sender != owner) revert wallet_not_owner();
        _;
    }

    constructor(address enteredExchange) {
        owner = msg.sender;
        exchange = enteredExchange;
    }

    function send() public payable {
        converted = msg.value.convert(exchange);
        transactions.push(
            record({usdAmount: msg.value.convert(exchange), sender: msg.sender})
        );
    }

    function given_by(address prsn) public view returns (int256) {
        int256 fund;
        for (uint256 i = 0; i < transactions.length; i++) {
            if (transactions[i].sender == prsn) {
                fund = fund + transactions[i].usdAmount;
            }
        }
        return fund;
    }

    function withdraw(uint256 amount) public only_owner returns (uint256) {
        int256 withdrew;
        if (!(address(this).balance >= amount))
            revert wallet_not_enough_balance();
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        if (!success) revert wallet_withdraw_error();
        withdrew = -int256(amount);
        transactions.push(record({usdAmount: withdrew, sender: owner}));
        return (address(this).balance);
    }

    function getfeed() public view returns (address) {
        return exchange;
    }

    function getowner() public view returns (address) {
        return owner;
    }

    function gettransactions() public view returns (record[] memory) {
        return transactions;
    }

    function getamount() public view returns (int256) {
        return converted;
    }
}
