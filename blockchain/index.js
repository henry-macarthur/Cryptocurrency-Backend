const Block = require('./block');
const {cryptoHash} = require('../util');
const {REWARD_INPUT, MINING_REWARD} = require('../config');
const Transaction = require('../wallet/transaction');
const Wallet = require('../wallet');

class Blockchain
{
	constructor()
	{
		this.chain = [Block.genesis()];
	}

	addBlock({data})
	{
		const newBlock = Block.mineBlock({
			lastBlock: this.chain[this.chain.length -1], 
			data
		});

		this.chain.push(newBlock);
	}

	replaceChain(chain, validateTransactions, onSuccess) 
	{
		if(chain.length <= this.chain.length)
		{
			console.error('the incomming chain must be longer');
			return;
		}

		if(!Blockchain.isValidChain(chain))
		{
			console.error('the incoming chain must be valid')
			return;
		}

		if (validateTransactions && !this.validTransactionData({chain}))
		{
			console.error('the incomming chain has invalid data')
			return;
		}

		if(onSuccess) onSuccess();
		console.log('replacing the chain with', chain);
		this.chain = chain;
	}

	validTransactionData({chain})
	{
		for(let i =1; i < chain.length; i++)
		{
			const block = chain[i];
			const transactionSet = new Set(); //no duplicates
			let rewardTransactionCount = 0; 

			for(let transaction of block.data)
			{
				if(transaction.input.address === REWARD_INPUT.address)
				{
					rewardTransactionCount += 1;

					if(rewardTransactionCount > 1)
					{
						console.error('Miner reward exceeds limit');
						return false;
					}

					if(Object.values(transaction.outputMap)[0] != MINING_REWARD)//gets the first value of the map
					{
					console.error('Miner reward amount is invalid');
					return false;
					}
				}
				else
				{
					if(!Transaction.validTransaction(transaction))
					{
						console.error('Invalid transaction')
						return false;
					}

					const trueBalance = Wallet.calculateBalance({
						chain: this.chain, //has to be current chain and not faked chain
						address: transaction.input.address
					});

					if(transaction.input.amount !== trueBalance)
					{
						console.error('invalid input amount')
						return false;
					}

					if(transactionSet.has(transaction))
					{
						console.error('an identical transaction appears more than once in this block')
						return false;
					}
					else
					{
						transactionSet.add(transaction);
					}
				}
			}
		}

		return true;
	}

	static isValidChain(chain) {
		if(JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis())) return false;

		for(let i = 1; i < chain.length; i++) //start at 1 bc the chain starts w 1 block 
		{
			const {timestamp, lastHash, hash, nonce, difficulty, data} = chain[i];
			const actualLastHash = chain[i-1].hash; 

			const lastDifficulty = chain[i-1].difficulty;

			if(Math.abs(lastDifficulty - difficulty) > 1) return false; //prevebts people from adding bad difficulty blocks 

			//const {timestamp, lastHash, hash, data} = block; 

			if(lastHash != actualLastHash) return false;

			const validatedHash = cryptoHash(timestamp, lastHash, data, nonce, difficulty);

			if(hash !== validatedHash) return false;
		}

		return true;
	}


}

module.exports = Blockchain;