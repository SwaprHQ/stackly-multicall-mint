const { ethers } = require('ethers');
require('dotenv').config();

// Provider & Signer
const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
const signer = new ethers.Wallet(process.env.PRIVATE_KEY).connect(provider);

// Contract ABI and Address
const contractABI = require('./abis/StacklyWhitelist.json');
const contractAddress = "0x610a4F6f4A9fDf5c715d60a65758d2fd9B6Ee138";

const multicallABI = require('./abis/multicall.json');
const multicallAddress = '0xcA11bde05977b3631167028862bE2a173976CA11';

// Instantiate Contract
const contract = new ethers.Contract(contractAddress, contractABI, 
signer);

// Multicall setup
const multicall = new ethers.Contract(multicallAddress, multicallABI, wallet);

// Addresses to which tokens are to be minted
const addresses = ["0x...", "0x...", "0x..."]; // replace with your addresses

async function mintBatch() {
  // Generate calls
  const calls = addresses.map((address) => {
    return {
      target: contractAddress,
      callData: contract.interface.encodeFunctionData('mintTo', [address])
    };
  });

  // Execute the multicall
  const tx = await multicall.aggregate(calls);
  const receipt = await tx.wait(); // wait for the transaction to be mined
  console.log(`Transaction hash: ${receipt.transactionHash}`);
  return tx;
}

mintBatch().catch(console.error);
