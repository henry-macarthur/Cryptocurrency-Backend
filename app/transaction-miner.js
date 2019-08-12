const Transaction = require('../wallet/transaction');
//add a block of transaction pool data
//wanna make sure to only get valid transactions from the pool
class TransactionMiner
{
    constructor({blockchain, transactionPool, wallet, pubsub})
    {
        this.blockchain = blockchain; 
        this.transactionPool = transactionPool;
        this.wallet = wallet;
        this.pubsub = pubsub;
    }

    mineTransactions()
    {
        //valid transactions
        const validTransactions = this.transactionPool.validTransactions(); //array of valid transactions

        //generate the reward
        validTransactions.push( //add this reward to the transaction
            Transaction.rewardTransaction({minerWallet: this.wallet}) //who to give reward too
        );
        
        //add a block consisting of these transacctions to the blockchain
        this.blockchain.addBlock({data: validTransactions});
        //broadcast the updated blockchain
        this.pubsub.broadcastChain();
        //clear the pool
        this.transactionPool.clear();
    }


}

module.exports = TransactionMiner;