    // TODO
    //  should send dai to account 1 and account 2 before this whole tests - Done
    //  should get yDai balance of account - DaiLending Adapter - Done
    //  should get dai balance of account - DaiLending Adapter - Done
    //  should save - DaiLending Service
    //  should withdraw - DaiLending Service
    //  should withdraw by shares - DaiLending Service
    //  should withdraw by exact amount - DaiLending Service

console.log("********************** Running Dai Lending Deployments Test *****************************");
const Web3 = require('web3');
const { assert } = require('console');
const web3 = new Web3("HTTP://127.0.0.1:8545");

const DaiLendingAdapterContract = artifacts.require("DaiLendingAdapter");
const DaiLendingServiceContract = artifacts.require("DaiLendingService");

/** External contracts definition for DAI and YDAI
 *  1. I have unlocked an address from Ganache-cli that contains a lot of dai
 *  2. We will use the DAI contract to enable transfer and also balance checking of the generated accounts
 *  3. We will use the YDAI contract to enable transfer and also balance checking of the generated accounts
*/
const DaiContractABI = require("../abi/DAIContract.json");
const YDaiContractABI = require("../abi/YDAIContractABI.json");

const DaiContractAddress = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
const yDaiContractAddress = "0x16de59092dAE5CcF4A1E6439D611fd0653f0Bd01"
const unlockedAddress = "0xdcd024536877075bfb2ffb1db9655ae331045b4e";   //  Has lots of DAI

const daiContract = new web3.eth.Contract(DaiContractABI,DaiContractAddress);
const yDaiContract = new web3.eth.Contract(YDaiContractABI,yDaiContractAddress);


var account1;   
var account2;

var account1Balance;
var account2Balance;


//  Send Dai from our constant unlocked address to any recipient
async function sendDai(amount, recipient){

    var amountToSend = BigInt(amount); //  1000 Dai

    console.log(`Sending  ${ amountToSend } x 10^-18 Dai to  ${recipient}`);

    await daiContract.methods.transfer(recipient,amountToSend).send({from: unlockedAddress});

    let recipientBalance = await daiContract.methods.balanceOf(recipient).call();
    
    console.log(`Recipient: ${recipient} DAI Balance: ${recipientBalance}`);


}

//  Approve a smart contract address or normal address to spend on behalf of the owner
async function approveDai(spender,  owner,  amount){

    await daiContract.methods.approve(spender,amount).send({from: owner});

    console.log(`Address ${spender}  has been approved to spend ${ amount } x 10^-18 Dai by Owner:  ${owner}`);

};

//  Approve a smart contract address or normal address to spend on behalf of the owner
async function approveYDai(spender,  owner,  amount){

    await yDaiContract.methods.approve(spender,amount).send({from: owner});

    console.log(`Address ${spender}  has been approved to spend ${ amount } x 10^-18 YDai by Owner:  ${owner}`);

};


contract('DaiLendingService', () => {
    let daiLendingAdapterContract = null;
    let daiLendingServiceContract = null;

    before(async () =>{
        daiLendingAdapterContract = await DaiLendingAdapterContract.deployed();
        daiLendingServiceContract = await DaiLendingServiceContract.deployed();

        //  Update the adapter
        await daiLendingServiceContract.updateAdapter(daiLendingAdapterContract.address);


        //  Get the addresses and Balances of at least 2 accounts to be used in the test
        //  Send DAI to the addresses
        web3.eth.getAccounts().then(function(accounts){

            account1 = accounts[0];
            account2 = accounts[1];

            //  send money from the unlocked dai address to accounts 1 and 2
            var amountToSend = BigInt(10000000000000000000000); //   10,000 Dai

            //  get the eth balance of the accounts
            web3.eth.getBalance(account1, function(err, result) {
                if (err) {
                    console.log(err)
                } else {
        
                    account1Balance = web3.utils.fromWei(result, "ether");
                    console.log("Account 1: "+ accounts[0] + "  Balance: " + account1Balance + " ETH");
                    sendDai(amountToSend,account1);

                }
            });
    
            web3.eth.getBalance(account2, function(err, result) {
                if (err) {
                    console.log(err)
                } else {
                    account2Balance = web3.utils.fromWei(result, "ether");
                    console.log("Account 2: "+ accounts[1] + "  Balance: " + account2Balance + " ETH");
                    sendDai(amountToSend,account2);                              

                }
            });


        });


    });

    it('DaiLendingService Contract: Should deploy  smart contract properly', async () => {
        console.log(daiLendingServiceContract.address);
        assert(daiLendingServiceContract.address !== '');
    });

    
    it('DaiLendingService Contract: Should Get Current Price Per Full Share', async () => {

        var price = await daiLendingServiceContract.getPricePerFullShare();
        var value = BigInt(price);

        console.log(value);
        assert(value > 0);
    });

    it('Should ensure we have ETH on each generated account', async () => {
        
        assert(account1Balance > 0);
        assert(account2Balance > 0);

    });

    it('DaiLendingService Contract: Should Save some Dai in the Yearn Finance', async() => {

        //  First we have to approve the adapter to spend money on behlaf of the owner of the DAI, in this case account 1 and 2
        var approvedAmountToSpend = BigInt(10000000000000000000000); //   10,000 Dai
        await approveDai(daiLendingAdapterContract.address,account1,approvedAmountToSpend);
        await approveDai(daiLendingAdapterContract.address,account2,approvedAmountToSpend);

        //  Save 5,000 dai
        //  Amount is deducted from sender which is account 1
        //  TODO: find a way to make request from account 2
        var approvedAmountToSave = "5000000000000000000000"; // NOTE: Use amount as string. It is a bug from web3.js. If you use BigInt it will fail
        await daiLendingServiceContract.save(approvedAmountToSave); 

        //  Get YDai Shares balance and Dai balance after saving
        var YDaibalanceAfterSaving = BigInt(await daiLendingAdapterContract.GetYDaiBalance(account1));
        var DaiBalanceAfterSaving = BigInt(await daiLendingAdapterContract.GetDaiBalance(account1));


        console.log("DaiLendingService Contract - YDai Balance After Saving: "+YDaibalanceAfterSaving);
        console.log("DaiLendingService Contract - Dai Balance After Saving: "+DaiBalanceAfterSaving);

        assert(YDaibalanceAfterSaving > 0);
        assert(DaiBalanceAfterSaving > 0);
    });


    it('DaiLendingService Contract: Should Withdraw Dai From Yearn Finance', async() => {

        //  Get YDai Shares balance
        var yDaiBlanceBeforeWithdrawal = BigInt(await daiLendingAdapterContract.GetYDaiBalance(account1));
        
        //  Run this test only if we have yDai shares already in the address
        if(yDaiBlanceBeforeWithdrawal > 0){
            
            //  First we have to approve the adapter to spend money on behlaf of the owner of the YDAI, in this case account 1 and 2
            var approvedAmountToSpend = BigInt(10000000000000000000000); //   10,000 YDai
            await approveYDai(daiLendingAdapterContract.address,account1,approvedAmountToSpend);
            await approveYDai(daiLendingAdapterContract.address,account2,approvedAmountToSpend);

            //  Get Dai balance before withdrawal
            var balanceBeforeWithdrawal = BigInt(await daiLendingAdapterContract.GetDaiBalance(account1));

            //  Withdraw 2,000  Dai. 
            //  TODO: find a way to make request from account 2
            var approvedAmountToWithdraw = "2000000000000000000000"; // NOTE: Use amount as string. It is a bug from web3.js. If you use BigInt it will fail
            await daiLendingServiceContract.Withdraw(approvedAmountToWithdraw);

            //  Get Dai balance after withdrawal
            var balanceAfterWithdrawal = BigInt(await daiLendingAdapterContract.GetDaiBalance(account1));
            
            assert(balanceBeforeWithdrawal > 0);
            assert(balanceAfterWithdrawal > 0);
            assert(balanceAfterWithdrawal > balanceBeforeWithdrawal);
            console.log("balance before withdrawal: " + balanceBeforeWithdrawal);
            console.log("Withdrawing:  " + approvedAmountToWithdraw + " DAI");
            console.log("balance after withdrawal: " + balanceAfterWithdrawal);
        }else{
            console.log("Savings has not been made!!!")
        }

    });

    it('DaiLendingService Contract: Should Withdraw By Specifying YDaiShares Amount and DAI Amount', async() => {
        //  This function is used by EsusuAdapter when you need to only specify the share amount of the cycle and then
        //  the dai amount that should be sent to a member of that cycle. 

        //  Get YDai Shares balance
        var yDaiBlanceBeforeWithdrawal = BigInt(await daiLendingAdapterContract.GetYDaiBalance(account1));
        
        //  Run this test only if we have yDai shares already in the address
        if(yDaiBlanceBeforeWithdrawal > 0){
            
            //  First we have to approve the adapter to spend money on behlaf of the owner of the YDAI, in this case account 1 and 2
            var approvedAmountToSpend = BigInt(10000000000000000000000); //   10,000 YDai
            await approveYDai(daiLendingAdapterContract.address,account1,approvedAmountToSpend);
            await approveYDai(daiLendingAdapterContract.address,account2,approvedAmountToSpend);

            //  Get Dai balance before withdrawal
            var balanceBeforeWithdrawal = BigInt(await daiLendingAdapterContract.GetDaiBalance(account1));

            //  Withdraw 1,000 Dai. 
            //  TODO: find a way to make request from account 2
            var approvedAmountToWithdrawInDai = "1000000000000000000000"; // NOTE: Use amount as string. It is a bug from web3.js. If you use BigInt it will fail
            var YDaibalanceOfAddress = BigInt(await daiLendingAdapterContract.GetYDaiBalance(account1));
            await daiLendingServiceContract.WithdrawByShares(approvedAmountToWithdrawInDai,YDaibalanceOfAddress.toString() );

            //  Get Dai balance after withdrawal
            var balanceAfterWithdrawal = BigInt(await daiLendingAdapterContract.GetDaiBalance(account1));
            
            assert(balanceBeforeWithdrawal > 0);
            assert(balanceAfterWithdrawal > 0);
            assert(balanceAfterWithdrawal > balanceBeforeWithdrawal);
            console.log("balance before withdrawal by shares: " + balanceBeforeWithdrawal);
            console.log("Withdrawing:  " + approvedAmountToWithdrawInDai + " DAI");
            console.log("balance after withdrawal by shares: " + balanceAfterWithdrawal);  

        }else{
            console.log("Savings has not been made!!!")
        }

    });

    it('DaiLendingService Contract: Should Withdraw By Specifying YDaiShares Amount Only', async() => {
        //  This function is used when you need to only specify the share amount 

        //  Get YDai Shares balance
        var yDaiBlanceBeforeWithdrawal = BigInt(await daiLendingAdapterContract.GetYDaiBalance(account1));
        
        //  Run this test only if we have yDai shares already in the address
        if(yDaiBlanceBeforeWithdrawal > 0){
            
            //  First we have to approve the adapter to spend money on behlaf of the owner of the YDAI, in this case account 1 and 2
            var approvedAmountToSpend = BigInt(10000000000000000000000); //   10,000 YDai
            await approveYDai(daiLendingAdapterContract.address,account1,approvedAmountToSpend);
            await approveYDai(daiLendingAdapterContract.address,account2,approvedAmountToSpend);

            //  Get Dai balance before withdrawal
            var balanceBeforeWithdrawal = BigInt(await daiLendingAdapterContract.GetDaiBalance(account1));

            //  Withdraw  
            //  TODO: find a way to make request from account 2
            var YDaibalanceOfAddress = BigInt(await daiLendingAdapterContract.GetYDaiBalance(account1));
            await daiLendingServiceContract.WithdrawBySharesOnly(YDaibalanceOfAddress.toString());

            //  Get Dai balance after withdrawal
            var balanceAfterWithdrawal = BigInt(await daiLendingAdapterContract.GetDaiBalance(account1));
            
            assert(balanceBeforeWithdrawal > 0);
            assert(balanceAfterWithdrawal > 0);
            assert(balanceAfterWithdrawal > balanceBeforeWithdrawal);
            console.log("balance before withdrawal by shares: " + balanceBeforeWithdrawal);
            console.log("Withdrawing Everything Plus Interest :D");
            console.log("balance after withdrawal by shares: " + balanceAfterWithdrawal);  

        }else{
            console.log("Savings has not been made!!!")
        }

    });
});
