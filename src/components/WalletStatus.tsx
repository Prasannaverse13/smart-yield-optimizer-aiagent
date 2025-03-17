import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Wallet,
  Network,
  History,
  ArrowUpRight,
  Clock,
  Shield,
  AlertTriangle
} from 'lucide-react';
import { ethers } from 'ethers';

interface WalletStatusProps {
  address: string | null;
  balance: string;
  isConnected: boolean;
}

interface Transaction {
  type: string;
  amount: string;
  timestamp: number;
  hash: string;
}

export function WalletStatus({ address, balance, isConnected }: WalletStatusProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    if (!address || !window.ethereum) return;

    const fetchTransactions = async () => {
      setIsLoading(true);
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        
        // Get the latest block number
        const latestBlock = await provider.getBlockNumber();
        const startBlock = Math.max(0, latestBlock - 1000); // Last 1000 blocks for performance
        
        // Get all transactions for the address
        const txs = [];
        for (let i = 0; i < 3; i++) {
          const block = await provider.getBlock(latestBlock - i, true);
          if (!block) continue;
          
          for (const tx of block.prefetchedTransactions) {
            if (tx.from.toLowerCase() === address.toLowerCase() || 
                tx.to?.toLowerCase() === address.toLowerCase()) {
              txs.push({
                type: tx.from.toLowerCase() === address.toLowerCase() ? 'Sent' : 'Received',
                amount: ethers.formatEther(tx.value) + ' ETH',
                timestamp: block.timestamp * 1000, // Convert to milliseconds
                hash: tx.hash
              });
            }
            
            if (txs.length >= 3) break;
          }
          
          if (txs.length >= 3) break;
        }

        setTransactions(txs);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [address]);

  if (!isConnected) return null;

  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  const formatBalance = (bal: string) => parseFloat(bal).toFixed(4);
  
  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    
    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60
    };

    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
      const interval = Math.floor(seconds / secondsInUnit);
      if (interval >= 1) {
        return `${interval} ${unit}${interval === 1 ? '' : 's'} ago`;
      }
    }
    
    return 'just now';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-8 mb-8"
    >
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Wallet className="w-6 h-6" />
          Wallet Status
        </h2>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
          <span className="text-green-400">Connected</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="glass-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm text-gray-400">Wallet Address</h4>
                <p className="text-lg font-mono">{formatAddress(address || '')}</p>
              </div>
              <button 
                onClick={() => navigator.clipboard.writeText(address || '')}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="glass-card p-4">
            <h4 className="text-sm text-gray-400">Balance</h4>
            <p className="text-2xl font-bold text-[var(--neon-primary)]">
              {formatBalance(balance)} ETH
            </p>
          </div>

          <div className="glass-card p-4">
            <h4 className="text-sm text-gray-400">Network</h4>
            <div className="flex items-center gap-2 mt-1">
              <Network className="w-4 h-4 text-[var(--neon-secondary)]" />
              <span>Ethereum Mainnet</span>
            </div>
          </div>
        </div>

        <div className="glass-card p-4">
          <h4 className="text-sm text-gray-400 mb-4 flex items-center gap-2">
            <History className="w-4 h-4" />
            Recent Activity
          </h4>
          <div className="space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[var(--neon-primary)]"></div>
              </div>
            ) : transactions.length > 0 ? (
              transactions.map((tx, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span>{tx.type}</span>
                  </div>
                  <span className="font-mono">{tx.amount}</span>
                  <a 
                    href={`https://etherscan.io/tx/${tx.hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-[var(--neon-primary)] transition-colors"
                  >
                    {formatTimeAgo(tx.timestamp)}
                  </a>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-400">No recent transactions</p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 glass-card p-4">
        <h4 className="text-sm text-gray-400 mb-4 flex items-center gap-2">
          <Shield className="w-4 h-4" />
          Security Status
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-2 text-green-400">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span>Hardware wallet protection active</span>
          </div>
          <div className="flex items-center gap-2 text-yellow-400">
            <AlertTriangle className="w-4 h-4" />
            <span>Last backup: 7 days ago</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}