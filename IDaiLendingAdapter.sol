pragma solidity ^0.6.6;

interface IYDaiToken is IERC20 {
    function save(uint256 amount, address account) external;

    function GetGrossRevenue(address account) external view returns (uint256);

    function GetNetRevenue(address account) external view returns (uint256);

    function Withdraw(uint256 amount, address owner) external;
}
