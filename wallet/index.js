const {STARTING_BALANCE} = require('../config');
const {ec, cryptoHash} = require('../util');
const Transaction = require('./transaction');

//const cryptoHash = require('../util/crypto-hash');

class Wallet 
{
    constructor()
    {
        this.balance =  STARTING_BALANCE;

        //running in node so it cant be base don web environment
        this.keyPair = ec.genKeyPair(); //private and public key in keypair

        this.publicKey = this.keyPair.getPublic().encode('hex');
    }

    sign(data)
    {
        return this.keyPair.sign(cryptoHash(data));
    }

    createTransaction({recipient, amount, chain})
    {
        if(chain)
        {
            this.balance = Wallet.calculateBalance({
                chain, 
                address: this.publicKey
            })
        }
        if(amount > this.balance)
        {
            throw new Error('Amount exceeds balance');
        }

        return new Transaction({senderWallet: this, recipient, amount});
    }

    static calculateBalance({chain, address})
    {
        let hasConductedTransaction = false;
        let outputsTotal = 0;

        for(let i = chain.length-1; i > 0; i--)
        {
            const block = chain[i];

            for(let transaction of block.data)
            {

                if(transaction.input.address === address)
                {
                    hasConductedTransaction = true;
                }
                const addressOutput = transaction.outputMap[address];

                if(addressOutput) //defined
                {
                    outputsTotal += addressOutput;
                }
            }

            if(hasConductedTransaction)
            {
                break;
            }
        }


        return hasConductedTransaction ? 
        outputsTotal: STARTING_BALANCE + outputsTotal;
    }

}

module.exports = Wallet;