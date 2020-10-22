
//  1. Ensure you have done truffle compile to ensure the contract ABI has been added to the artifact
const DaiLendingAdapterContract = artifacts.require("DaiLendingAdapter");
const DaiLendingServiceContract = artifacts.require("DaiLendingService");

module.exports = function (deployer) {
  
  console.log("********************** Running Dai Lending Migrations *****************************");

  deployer.then(async () => {

     await deployer.deploy(DaiLendingServiceContract);

     await deployer.deploy(DaiLendingAdapterContract,DaiLendingServiceContract.address);

     console.log("DaiLendingService Contract address: " + DaiLendingServiceContract.address);

     console.log("DaiLendingAdapterContract address: "+DaiLendingAdapterContract.address );
  })
  
};


