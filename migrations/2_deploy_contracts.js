const DaiToken = artifacts.require('DaiToken')
const DappToken = artifacts.require('DappToken')
const TokenFarm = artifacts.require('TokenFarm')

module.exports = async function(deployer, network, accounts) {
  //Deploy the mock DaiToken
  await deployer.deploy(DaiToken)
  const daiToken = await DaiToken.deployed()

  //Deploy the mock DappToken
  await deployer.deploy(DappToken)
  const dappToken = await DappToken.deployed()

  await deployer.deploy(TokenFarm, daiToken.address, dappToken.address)
  const tokenFarm = await TokenFarm.deployed()

  //Transfer all the Dapp tokens into the TokenFarm address
  await dappToken.transfer(tokenFarm.address, '1000000000000000000000000')

  //Transfer a 100 mock dai to the investor
  await daiToken.transfer(accounts[1], '100000000000000000000')
}