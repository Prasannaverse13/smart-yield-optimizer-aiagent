import { create } from 'zustand';
import { ethers } from 'ethers';

interface WalletState {
  address: string | null;
  balance: string;
  isConnected: boolean;
  provider: any;
  connect: () => Promise<void>;
  disconnect: () => void;
}

export const useWallet = create<WalletState>((set) => ({
  address: null,
  balance: '0',
  isConnected: false,
  provider: null,
  connect: async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send('eth_requestAccounts', []);
        const balance = await provider.getBalance(accounts[0]);
        const formattedBalance = ethers.formatEther(balance);
        
        set({
          address: accounts[0],
          balance: formattedBalance,
          isConnected: true,
          provider
        });
      } catch (error) {
        console.error('Error connecting wallet:', error);
      }
    } else {
      window.open('https://metamask.io/download/', '_blank');
    }
  },
  disconnect: () => {
    set({
      address: null,
      balance: '0',
      isConnected: false,
      provider: null
    });
  }
}));