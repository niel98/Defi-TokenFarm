const { assert } = require('chai')

const DaiToken = artifacts.require('DaiToken')
const DappToken = artifacts.require('DappToken')
const TokenFarm = artifacts.require('TokenFarm')

require('chai')
.use(require('chai-as-promised'))
.should()

function tokens(n) {
    return web3.utils.toWei(n, 'ether')
}

contract('TokenFarm', ([owner, investor]) => {
    
    let daiToken, dappToken, tokenFarm

    //The before hook, a function that runs before any test example starts...
    before(async () => {
        //Load contracts
        daiToken = await DaiToken.new()
        dappToken = await DappToken.new()
        tokenFarm = await TokenFarm.new(daiToken.address, dappToken.address)

        //Transfer the Dapp tokens to the TokenFarm (1 million)
        await dappToken.transfer(tokenFarm.address, tokens('1000000'))

        //Send tokens to the investor
        await daiToken.transfer(investor, tokens('100'), { from: owner})
    })

    describe('Mock DAI Deployment', async () => {
        it('has a name', async () => {
            const name = await daiToken.name()
            assert.equal(name, 'Mock DAI Token')
        })
    })

    describe('Dapp Token Deployment', async () => {
        it('has a name', async () => {
            const name = await dappToken.name()
            assert.equal(name, 'DApp Token')
        })
    })

    describe('Token Farm Deployment', async () => {
        it('has a name', async () => {
            const name = await tokenFarm.name()
            assert.equal(name, 'Dapp Token Farm')
        })

        it('contract has tokens', async () => {
            let balance = await dappToken.balanceOf(tokenFarm.address)
            assert.equal(balance.toString(), tokens('1000000'))
        })
    })

    describe('Farming Tokens', async () => {
        let result

        //Check that the investor balance is correct before staking
        it('rewards investors for staking tokens', async () => {
            result = await daiToken.balanceOf(investor)
            assert.equal(result.toString(), tokens('100'), 'Investor mDai token balance correct before staking.')

            //Stake Mock Dai Tokens
            await daiToken.approve(tokenFarm.address, tokens('100'), { from: investor})
            await tokenFarm.stakeTokens(tokens('100'), { from: investor})

            //Check StakingBalance
            result = await daiToken.balanceOf(investor)
            assert.equal(result.toString(), tokens('0'), 'Balance of investor correct after staking')

            result = await daiToken.balanceOf(tokenFarm.address)
            assert.equal(result.toString(), tokens('100'), 'TokenFarm mock Dai Balance correct after staking')

            result = await tokenFarm.stakingBalance(investor)
            assert.equal(result.toString(), tokens('100'), 'Investor staking balance correct after staking')

            result = await tokenFarm.isStaking(investor)
            assert.equal(result.toString(), 'true', 'Investor staking status correct after staking')

            //Issue tokens 
            await tokenFarm.issueTokens({ from: owner })

            //Check Balances after issuance
            result = await dappToken.balanceOf(investor)
            assert.equal(result.toString(), tokens('100'), 'Investor Dapp token balance correct after issuance')

            //Ensure that only the owner can issue tokens
            await tokenFarm.issueTokens({ from: investor }).should.be.rejected;

            //Unstake tokens
            await tokenFarm.unstakeTokens({ from: investor})

            //Check results after unstaking
            result = await daiToken.balanceOf(investor)
            assert.equal(result.toString(), tokens('100'), 'Investor mock Dai balance correct after unstaking')

            result = await daiToken.balanceOf(tokenFarm.address)
            assert.equal(result.toString(), tokens('0'), 'Token Farm mock Dai balance correct after unstaking')

            result = await tokenFarm.stakingBalance(investor)
            assert.equal(result.toString(), tokens('0'), 'Investor staking balance correct after staking')

            result = await tokenFarm.isStaking(investor)
            assert.equal(result.toString(), 'false', 'investor staking status correct after staking')
        })
    })

})
