const Transaction = require('./transaction');

class TransactionPool {
    constructor() {
      this.transactionMap = {};
    }
  
    clear() {
      this.transactionMap = {};
    }
  
    setTransaction(transaction) {
      this.transactionMap[transaction.id] = transaction;
    }

    setMap(transactionMap)
    {
      this.transactionMap = transactionMap;
    }

    existingTransaction({inputAddress})
    {
      const transactions = Object.values(this.transactionMap); //returns an array

      return transactions.find(transaction => transaction.input.address == inputAddress); //looks through every value, returns first value
    }
    
    validTransactions()
    {
      return Object.values(this.transactionMap).filter((transaction) => {
        return Transaction.validTransaction(transaction);
      });
    }
    
    clearBlockchainTransactions({chain})
    {
      //loop through the entire blockchain
      for(let i = 1; i < chain.length; i++)
      {
        const block = chain[i];

        //look through each blocks transaction data
        for(let transaction of block.data)
        {
          if(this.transactionMap[transaction.id])
          {
            //if local transaction map contains values on the blockchain then we shpuld delete it
            delete this.transactionMap[transaction.id];
          }
        }
      }
    }
  }
  
  module.exports = TransactionPool;

  //