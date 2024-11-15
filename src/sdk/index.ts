import { ethers } from 'ethers';
import axios from 'axios';

export class LendingProtocolSDK {
    private apiUrl: string;
    private contract: ethers.Contract;
    
    constructor(
        apiUrl: string,
        contractAddress: string,
        provider: ethers.providers.Provider,
        signer?: ethers.Signer
    ) {
        this.apiUrl = apiUrl;
        this.contract = new ethers.Contract(
            contractAddress,
            LENDING_PROTOCOL_ABI,
            signer || provider
        );
    }
    
    async getLendingRates(address: string) {
        const response = await axios.get(`${this.apiUrl}/rates?address=${address}`);
        return response.data;
    }
    
    async deposit(amount: ethers.BigNumber) {
        const tx = await this.contract.deposit(amount);
        return await tx.wait();
    }
    
    async borrow(amount: ethers.BigNumber) {
        const tx = await this.contract.borrow(amount);
        return await tx.wait();
    }
    
    async getPosition(address: string) {
        const response = await axios.get(`${this.apiUrl}/position/${address}`);
        return response.data;
    }
} 