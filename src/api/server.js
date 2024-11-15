const express = require('express');
const { ethers } = require('ethers');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const LENDING_PROTOCOL_ABI = require('../contracts/LendingProtocol.json');
const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
const contract = new ethers.Contract(
    process.env.LENDING_PROTOCOL_ADDRESS,
    LENDING_PROTOCOL_ABI,
    provider
);

app.get('/api/rates', async (req, res) => {
    try {
        // Get current rates and requirements from the protocol
        const collateralRatio = await contract.getCurrentCollateralRatio(req.query.address);
        
        res.json({
            collateralRatio: collateralRatio.toString(),
            minimumCollateral: ethers.utils.parseEther('1').toString(), // Example minimum
            interestRate: '3.5' // Example fixed rate
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/position/:address', async (req, res) => {
    try {
        const position = await contract.positions(req.params.address);
        const maxBorrow = await contract.getMaxBorrowAmount(req.params.address);
        
        res.json({
            collateralAmount: position.collateralAmount.toString(),
            borrowedAmount: position.borrowedAmount.toString(),
            timestamp: position.timestamp.toString(),
            maxBorrowAmount: maxBorrow.toString()
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`API server running on port ${PORT}`);
}); 