// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.8.0;

interface IDaiLendingService {
    function getPricePerFullShare() external view returns (uint256);

    function save(uint256 amount) external;

    function userShares() external view returns (uint256);

    function userDaiBalance() external view returns (uint256);

    function GetUserGrossRevenue() external view returns (uint256);

    function GetNetRevenue() external view returns (uint256);

    function GetUserDepositedDaiBalance() external view returns (uint256);

    function Withdraw(uint256 amount) external;

    function WithdrawBySharesOnly(uint256 sharesAmount) external;
}
