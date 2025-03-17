import type { YieldStrategy } from './ai';

export interface GoatTransaction {
  chainId: number;
  protocol: string;
  action: 'deposit' | 'withdraw' | 'harvest' | 'compound';
  amount: string;
  asset: string;
}

export class GoatAgent {
  private static instance: GoatAgent;
  private apiKey: string;
  private apiUrl: string;

  private constructor() {
    this.apiKey = import.meta.env.VITE_OPENSERV_API_KEY;
    this.apiUrl = import.meta.env.VITE_BACKEND_URL;
  }

  static getInstance(): GoatAgent {
    if (!GoatAgent.instance) {
      GoatAgent.instance = new GoatAgent();
    }
    return GoatAgent.instance;
  }

  private async fetchFromGoat(endpoint: string, data: any) {
    try {
      const response = await fetch(`${this.apiUrl}/goat${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'X-GOAT-Version': '1.0.0',
          'X-Request-ID': crypto.randomUUID()
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`GOAT API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('GOAT API Error:', error);
      throw error;
    }
  }

  async initialize(): Promise<void> {
    try {
      await this.fetchFromGoat('/initialize', {
        supportedChains: [1, 42161, 10], // Ethereum, Arbitrum, Optimism
        supportedProtocols: ['aave', 'curve', 'lido', 'gmx'],
        features: ['simulation', 'execution', 'monitoring']
      });
    } catch (error) {
      console.error('Failed to initialize GOAT agent:', error);
      throw error;
    }
  }

  async simulateTransaction(tx: GoatTransaction): Promise<boolean> {
    try {
      const result = await this.fetchFromGoat('/simulate', {
        transaction: tx,
        options: {
          gasEstimation: true,
          slippageSimulation: true,
          impactAnalysis: true
        }
      });
      return result.success;
    } catch (error) {
      console.error('Transaction simulation failed:', error);
      throw error;
    }
  }

  async executeTransaction(tx: GoatTransaction): Promise<string> {
    try {
      const result = await this.fetchFromGoat('/execute', {
        transaction: tx,
        options: {
          gasOptimization: true,
          slippageTolerance: '0.5',
          deadline: Math.floor(Date.now() / 1000) + 3600
        }
      });
      return result.txHash;
    } catch (error) {
      console.error('Transaction execution failed:', error);
      throw error;
    }
  }

  async executeStrategy(strategy: YieldStrategy): Promise<string[]> {
    try {
      const result = await this.fetchFromGoat('/execute-strategy', {
        strategy,
        options: {
          sequential: true,
          revertOnFailure: true,
          gasOptimization: true
        }
      });
      return result.txHashes;
    } catch (error) {
      console.error('Strategy execution failed:', error);
      throw error;
    }
  }

  async getProtocolAPY(protocol: string, chainId: number): Promise<number> {
    try {
      const result = await this.fetchFromGoat('/apy', {
        protocol,
        chainId,
        options: {
          includeRewards: true,
          timeframe: '7d'
        }
      });
      return result.apy;
    } catch (error) {
      console.error('Failed to get protocol APY:', error);
      throw error;
    }
  }

  async validateProtocolHealth(protocol: string): Promise<boolean> {
    try {
      const result = await this.fetchFromGoat('/health', {
        protocol,
        metrics: ['tvl', 'utilization', 'risks']
      });
      return result.isHealthy;
    } catch (error) {
      console.error('Protocol health validation failed:', error);
      throw error;
    }
  }

  async monitorTransaction(txHash: string): Promise<any> {
    try {
      return await this.fetchFromGoat('/monitor', {
        txHash,
        options: {
          confirmations: 2,
          timeout: 300
        }
      });
    } catch (error) {
      console.error('Transaction monitoring failed:', error);
      throw error;
    }
  }
}

export const goatAgent = GoatAgent.getInstance();