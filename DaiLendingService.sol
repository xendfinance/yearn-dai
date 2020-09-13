pragma solidity ^0.6.6;

import "./DaiLendingAdapter.sol";



contract DaiLendingService{
    
    address _owner;
    DaiLendingAdapter _daiLendingAdapter;
    
    
    mapping(address => uint) userDaiDeposits;   

    constructor() public {
        _owner = msg.sender;
    }
    
    function transferOwnership(address account) onlyOwner() external{
        _owner = account;
    }
    
    function updateAdapter(address adapterAddress) onlyOwner() external{
        _daiLendingAdapter = DaiLendingAdapter(adapterAddress);   
    }
    
    function getCurrentAdapter() external view returns(address){
        return address(_daiLendingAdapter);
    }
    
    function getPricePerFullShare() external view returns (uint){
        return _daiLendingAdapter.GetPricePerFullShare();
    }
    
    /*
        -   Before calling this function, ensure that the msg.sender or caller has given this contract address
            approval to transfer money on its behalf to another address
    */
    function save(uint amount) external{
        _daiLendingAdapter.save(amount, msg.sender);
         
        //  add deposited dai to userDaiDeposits mapping
        userDaiDeposits[msg.sender] += amount;
    }
    
    //  Get the user's shares or the yDai tokens
    function userShares() external view returns (uint){
       return _daiLendingAdapter.GetYDaiBalance(msg.sender);
    }
    
    //  Get the user's Dai balance
    function userDaiBalance() external view returns (uint){
        return _daiLendingAdapter.GetDaiBalance(msg.sender);
    }
    
    //  Get the gross revenue the user has made ( shares * current share price )
    function GetUserGrossRevenue() external view returns (uint){
        return _daiLendingAdapter.GetGrossRevenue(msg.sender);
    }
    
    //  Get the net revenue the user has made ( (shares * current share price) - total invested amount)
    function GetNetRevenue() external view returns (uint){
        return _daiLendingAdapter.GetNetRevenue(msg.sender);
    }
    
    function GetUserDepositedDaiBalance() external view returns (uint){
        return userDaiDeposits[msg.sender];
    }
    
    function Withdraw(uint amount) external {

        _daiLendingAdapter.Withdraw(amount, msg.sender);
        
        //   remove withdrawn dai of this owner from userDaiDeposits mapping
        if(userDaiDeposits[msg.sender] >= amount){
            userDaiDeposits[msg.sender] = userDaiDeposits[msg.sender] - amount;
        }else{
            userDaiDeposits[msg.sender] = 0;
        }
    }
    
    modifier onlyOwner(){
        require(_owner == msg.sender, "Only owner can make this call");
        _;
    }
    
    
}