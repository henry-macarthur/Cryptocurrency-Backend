//process.env['GENERATE_PEER_PORT'] = true;
const express = require('express'); //express object 
const request = require('request');
const Blockchain = require('./blockchain/index');
const bodyParser = require('body-parser'); //middleware
const PubSub = require('./app/pubsub');
const TransactionPool = require('./wallet/transaction-pool');
const Wallet = require('./wallet');
const TransactionMiner = require('./app/transaction-miner');

const app = express();
const blockchain = new Blockchain();
const transactionPool = new TransactionPool();
const wallet = new Wallet();
const pubsub = new PubSub({blockchain, transactionPool, wallet}); //want to interact with other blockchains
const transactionMiner = new TransactionMiner({blockchain, transactionPool, wallet, pubsub});

const DEFAULT_PORT = 3000; 
const ROOT_NODE_ADDRESS = `http://localhost:${DEFAULT_PORT}`;
//pubsub.broadcastChain();
//setTimeout(() => pubsub.broadcastChain(), 1000);

app.use(bodyParser.json()); //to use the json middleware from body parser module

 //get http request, used to read data from backend
 //1: api endpoint, where they get it
 //2: callback 
    //request: info about the requesters request
    //response: allows us to define how the get request responds
app.get('/api/blocks', (req, res) => {
    res.json(blockchain.chain); //sends blockchain in json form to whomever makes the request
}); 

app.post('/api/mine', (req, res) => {
    const {data} = req.body; //get data from the user

    blockchain.addBlock({data});

    pubsub.broadcastChain();

    res.redirect('/api/blocks'); //after you make a post request, it redirects you to blockchain page to show that the block was added

});

//create a transaction
app.post('/api/transact', (req, res) => {
    const {amount, recipient} = req.body;
    //specify recipeint and amount in the req body

    let transaction = transactionPool.existingTransaction({inputAddress: wallet.publicKey});

    try
    {
        if(transaction)
        {
            transaction.update({senderWallet: wallet, recipient, amount})
        }
        else
        {
            transaction = wallet.createTransaction({recipient, amount, chain}); //created a transaction
        }
        
    } 
    catch(error)
    {
        //if error is thrown
        return res.status(400).json({type: 'error', message: error.message}); //to make sure none of the code applies
        //400 says its a bad request
    }
   

    transactionPool.setTransaction(transaction); //add a transaction to the pool!

    //console.log('transactionPool', transactionPool);

    pubsub.broadcastTransaction(transaction); //interested parties will have a transaction set with this id

    res.status(200).json({'type': 'success', transaction}); //respond with json object of the transaction
});

app.get('/api/transaction-pool-map', (req, res) => { //get data from transaction map
    res.json(transactionPool.transactionMap);
});

app.get('/api/mine-transactions', (req, res) => {
    transactionMiner.mineTransactions();

    res.redirect('/api/blocks');
});

app.get('/api/wallet-info', (req, res) => {
    //console.log(blck.nonce)
    res.json({
        address: wallet.publicKey,
        balance: Wallet.calculateBalance({chain: blockchain.chain, address: wallet.publicKey})
    })
});

const syncWithRootState = () => 
{
    request({ url: `${ROOT_NODE_ADDRESS}/api/blocks`}, (error, response, body) => {
        //body = stringify json respo9nse from endpoint
        //response: meta details
        if(!error && response.statusCode === 200)
        {
            const rootChain = JSON.parse(body); //becomes a js object

            console.log('replace chain on a sync with', rootChain);
            blockchain.replaceChain(rootChain);
        }
    });

    request({url: `${ROOT_NODE_ADDRESS}/api/transaction-pool-map`}, (error, response, body) => {
        if(!error && response.statusCode === 200)
        {
            const rootTransactionPoolMap = JSON.parse(body);

            console.log('replace transaction pool map on sync with', rootTransactionPoolMap);
            transactionPool.setMap(rootTransactionPoolMap);
        }
    });
}

let PEER_PORT; 

if (process.env.GENERATE_PEER_PORT === 'true') {
    PEER_PORT = DEFAULT_PORT + Math.ceil(Math.random() * 1000);
}

const PORT = PEER_PORT || DEFAULT_PORT;


app.listen(PORT, () => {
    console.log(`listening at localhost:${PORT}`);
    if(PORT !== DEFAULT_PORT)
    {
        syncWithRootState();
    }
    
});