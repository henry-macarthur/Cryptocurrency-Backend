const MINE_RATE = 1000; // -> 1 second, 1000 milisenconds
const INITIAL_DIFFICULTY = 3; //can increase this

const GENESIS_DATA = {
	timestamp: 1, 
	lastHash: '-----', 
	hash: 'hash-one', 
	difficulty: INITIAL_DIFFICULTY, 
	nonce: 0,
	data: []
}; 

const STARTING_BALANCE  = 1000; 

const REWARD_INPUT = {
	address: '*authorized-reward*'
};

const MINING_REWARD = 50;

module.exports = {GENESIS_DATA, MINE_RATE, STARTING_BALANCE, REWARD_INPUT, MINING_REWARD}