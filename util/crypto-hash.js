const crypto = require('crypto');
//const hexToBinary = require('hex-to-binary');

const cryptoHash = (...inputs) => { //store inputs in inputs array
	const hash = crypto.createHash('sha256');
	//console.log(hash);
	//joins it as a string
	//map over all the inputs and turn them into strigify form
	hash.update(inputs.map(input => JSON.stringify(input)).sort().join(' '));

	//digest = hash result
	return hash.digest('hex');
}; //gathers all inputs into inputs array

module.exports = cryptoHash;