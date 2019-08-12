const PubNub = require('pubnub');

const credentials = {
    publishKey: 'pub-c-b73e917c-d355-4a81-9c4f-4e23a05762f7', 
    subscribeKey: 'sub-c-b8fa3bca-95e8-11e9-8994-3e832ec25d8b', 
    secretKey: 'sec-c-NzVhNGI4ZjYtZjA2OC00NzI2LWIxNDUtNWVmNTcyOTZjYTVi'
}

const   CHANNELS = {    
    TEST: 'TEST',
    BLOCKCHAIN: 'BLOCKCHAIN', 
    TRANSACTION: 'TRANSACTION'
}

class PubSub 
{
    constructor({blockchain, transactionPool, wallet})
    {
        this.blockchain = blockchain; //has a local blockchain
        this.transactionPool = transactionPool;
        this.wallet = wallet;
        this.pubnub = new PubNub(credentials); //pubnub object with our credentials

        //object.values returns an array
        this.pubnub.subscribe({channels: Object.values(CHANNELS)}); //array of channels to subscribe to 

        this.pubnub.addListener(this.listener());
    }

    listener() {
        return {
            message: messageObject => {
                const {channel, message} = messageObject;

                console.log(`Message recieved. Channel: ${channel}. Message: ${message}`);

                const parsedMessage = JSON.parse(message);

                switch(channel)
                {
                    case CHANNELS.BLOCKCHAIN:
                    {
                        this.blockchain.replaceChain(parsedMessage, true, () => {
                            this.transactionPool.clearBlockchainTransactions({
                                chain: parsedMessage
                            });
                        }); //message will be a chain
                        break;
                    }
                    case CHANNELS.TRANSACTION:
                    {
                        if(!this.transactionPool.existingTransaction({
                            inputAddress: this.wallet.publicKey
                        })){
                            this.transactionPool.setTransaction(parsedMessage);
                        }
            
                        break;
                    }
                    default:
                    {
                        return;
                    }
                }


            }
        };
    }

    publish({channel, message}) {
       // this.pubnub.unsubscribe(channel, () => {
            this.pubnub.publish({channel, message}, () => {
                //this.pubnub.subscribe(channel);
            });
        //});

        
    }

    subsribeToChannels()
    {
        this.pubnub.subscribe({
            channels: [Object.values(channels)]
        });
    }

    broadcastChain()
    {
       // console.log('something');
        this.publish({
            channel: CHANNELS.BLOCKCHAIN, 
            message: JSON.stringify(this.blockchain.chain) //stringify the array

        });
    }

    broadcastTransaction(transaction)
    {
        this.publish({
            channel: CHANNELS.TRANSACTION, 
            message: JSON.stringify(transaction)
        })
    }
}

// const testPubSub = new PubSub(); 
// testPubSub.publish({channel: CHANNELS.TEST, message: 'hello'});

module.exports = PubSub;