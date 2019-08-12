const EC = require('elliptic').ec; //ec class
const cryptoHash = require('./crypto-hash');

const ec = new EC('secp256k1'); //new instance of EC class we required --256 bit prime number

const verifySignature = ({ publicKey, data, signature})=> {
    const keyFromPublic = ec.keyFromPublic(publicKey, 'hex'); 

    return keyFromPublic.verify(cryptoHash(data), signature);
}


module.exports = { ec , verifySignature, cryptoHash};