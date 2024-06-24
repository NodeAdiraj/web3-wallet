// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

library converter {
    function convert(
        uint256 ethAmount,
        address exchange
    ) internal view returns (int256) {
        AggregatorV3Interface rateObject = AggregatorV3Interface(exchange);
        (, int256 rateInt, , , ) = rateObject.latestRoundData();
        int256 rate = rateInt * 1e10;
        return ((int256(ethAmount) * rate) / 1e18);
    }
}
