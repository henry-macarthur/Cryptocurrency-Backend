const hexToBinary = require('hex-to-binary');
const {GENESIS_DATA, MINE_RATE} = require('../config');
const {cryptoHash} = require('../util');


class Block
{
	constructor({timestamp, lastHash, hash, data, nonce, difficulty})
	{
		this.timestamp = timestamp; 
		this.lastHash = lastHash;
		this.hash = hash; 
		this.data = data; 
		this.nonce = nonce; 
		this.difficulty = difficulty;
	}

	static genesis() //factory method
	{
		return new this(GENESIS_DATA);
	}

	static mineBlock({lastBlock, data}) 
	{
		let hash, timestamp
		//const timestamp = Date.now(); 
		const lastHash = lastBlock.hash;
		let {difficulty} = lastBlock; //set a local difficulty to last block difficulty 
		let nonce = 0;

		do 
		{
			nonce++;
			timestamp = Date.now();
			difficulty = Block.adjustDifficulty({originalBlock:lastBlock, timestamp});
			hash = cryptoHash(timestamp, lastHash, data, nonce, difficulty); //nonce gets incremented so we may eventually get desired leading 0's
		}
		while(hexToBinary(hash).substring(0, difficulty) !== '0'.repeat(difficulty)); //keep doing compuations till leading 0's satisfied

		return new this({
			timestamp, 
			lastHash,
			data, 
			difficulty, 
			nonce,
			hash
			//hash: cryptoHash(timestamp, lastHash, data, nonce, difficulty)
		});
	}

	static adjustDifficulty({originalBlock, timestamp})
	{
		const {difficulty} = originalBlock; 

		if(difficulty < 1) return 1;
		const difference = timestamp - originalBlock.timestamp; 

		if(difference > MINE_RATE) return difficulty - 1;
		return difficulty + 1;
	}
}

module.exports = Block; //node.js sharing code between files