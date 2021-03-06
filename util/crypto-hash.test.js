const cryptoHash = require('./crypto-hash');


describe('cryptoHash()', () => {
	//"b5bb9d8014a0f9b1d61e21e796d78dccdf1352f23cd32812f4850b878ae4944c"
	//console.log(cryptoHash('foo'));
	it('Generates a SHA-256 hashed output', () => {
		expect(cryptoHash('foo')).toEqual('b2213295d564916f89a6a42455567c87c3f480fcd7a1c15e220f17d7169a790b');
	});

	it('produces the same hash with the same input in any order', () => {
		expect(cryptoHash('one', 'two', 'three')).toEqual(cryptoHash('three', 'two', 'one'));
	});

	it('produces a unique hah when the properties have changed on an inout', () => {
		const foo = {};
		const originalHash = cryptoHash(foo);
		foo['a'] = 'a';

		expect(cryptoHash(foo)).not.toEqual(originalHash);
	})
});