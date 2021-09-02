require('dotenv').config();
//const API_URL = process.env.API_URL;
const API_URL = "http://eth-ropsten.alchemyapi.io/v2/abmhm41Hf-Rmb0kWQ4aokLfgDllvR4xT";
const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
const alchemyWeb3 = createAlchemyWeb3(API_URL);
const contract = require("../artifacts/contracts/FUNDayliNFT.sol/FundNFT.json");
const contractAddress = "0xA3D44Ee997Acd0E2eA72E60cEC05dA74aF828823";
const nftContract = new alchemyWeb3.eth.Contract(contract.abi, contractAddress);
//const METAMASK_PUBLIC_KEY = process.env.METAMASK_PUBLIC_KEY;
//const METAMASK_PRIVATE_KEY = process.env.METAMASK_PRIVATE_KEY;
const METAMASK_PUBLIC_KEY = "0x8b162C397F2aD47aa55C9747437f738c0231076a";
const METAMASK_PRIVATE_KEY = "7a5fddf2dc2683259677c6282a62de99f50f6d92d75c8138aaade75808efcf7e";

async function mintNFT(owner,tokenURI) {
  // get the nonce - nonce is needed for security reasons. It keeps track of the number of transactions sent from our address and prevent replay attacks.
  const nonce = await alchemyWeb3.eth.getTransactionCount(METAMASK_PUBLIC_KEY, 'latest');
  const tx = {
    from: METAMASK_PUBLIC_KEY, //our MetaMask public key
    to: contractAddress, // the smart contract address we want to interact with
    nonce: nonce, // nonce with the no of transactions from our account
    gas: 1000000, // fee estimate to complete the transaction
    data: nftContract.methods
     .createNFT(owner, tokenURI)
     .encodeABI() // call the createNFT function from our FUNDailyNFT.sol file and pass the account that should receive the minted NFT.
  };

  const signPromise = alchemyWeb3.eth.accounts.signTransaction(
	  tx,
	  METAMASK_PRIVATE_KEY
  );
  signPromise
	  .then((signedTx) => {
		  alchemyWeb3.eth.sendSignedTransaction(
			  signedTx.rawTransaction,
			  function (err, hash) {
				  if(!err) {
					  console.log(
						  "The hash of our transaction is: ",
						  hash,
						  "\nCheck Alchemy's Mempool to view the status of our transaction!"
					  );
				  } else {
					  console.log(
						  "Something went wrong when submitting our transaction:",
						  err
					  );

				  }
			  }
		  )
	  })
	  .catch((err) => {
		  console.log(" Promise faile:", err);
	  });
}

module.exports = {
	mintNFT
}

//mintNFT("https://ipfs.io/ipfs/QmPmQDhp8SD9FGXBRC4y3aWhBm7pm3b3zBFNW9RncE2ewz");
