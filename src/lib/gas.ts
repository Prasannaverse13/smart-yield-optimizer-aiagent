import { ethers } from 'ethers';

export interface GasData {
  timestamp: number;
  price: number;
  priority: number;
}

export interface GasRecommendation {
  bestTime: string;
  estimatedSavings: string;
  currentGwei: number;
  historicalLow: number;
  batchingRecommendation: string;
}

export class GasOptimizer {
  private static instance: GasOptimizer;
  private historicalData: GasData[] = [];
  private provider: ethers.BrowserProvider | null = null;

  private constructor() {}

  static getInstance(): GasOptimizer {
    if (!GasOptimizer.instance) {
      GasOptimizer.instance = new GasOptimizer();
    }
    return GasOptimizer.instance;
  }

  async initialize(provider: ethers.BrowserProvider) {
    this.provider = provider;
    await this.updateHistoricalData();
  }

  private async updateHistoricalData() {
    if (!this.provider) return;

    try {
      const currentBlock = await this.provider.getBlockNumber();
      const blocks = [];

      // Get last 100 blocks for analysis
      for (let i = 0; i < 100; i++) {
        const block = await this.provider.getBlock(currentBlock - i);
        if (block) {
          blocks.push({
            timestamp: block.timestamp * 1000,
            price: Number(block.baseFeePerGas) / 1e9, // Convert to Gwei
            priority: Math.random() * 2 + 0.5 // Simulated priority fee
          });
        }
      }

      this.historicalData = blocks;
    } catch (error) {
      console.error('Error updating gas data:', error);
    }
  }

  async getGasRecommendation(): Promise<GasRecommendation> {
    if (!this.provider || this.historicalData.length === 0) {
      throw new Error('Gas optimizer not initialized');
    }

    const currentFeeData = await this.provider.getFeeData();
    const currentGwei = Number(currentFeeData.gasPrice) / 1e9;

    const historicalLow = Math.min(...this.historicalData.map(d => d.price));
    const avgPrice = this.historicalData.reduce((sum, d) => sum + d.price, 0) / this.historicalData.length;

    // Analyze patterns to find optimal time
    const hourlyAverages = new Array(24).fill(0).map(() => ({ sum: 0, count: 0 }));
    this.historicalData.forEach(data => {
      const hour = new Date(data.timestamp).getHours();
      hourlyAverages[hour].sum += data.price;
      hourlyAverages[hour].count++;
    });

    const bestHour = hourlyAverages.reduce((best, current, hour) => {
      const avg = current.count > 0 ? current.sum / current.count : Infinity;
      return avg < best.avg ? { hour, avg } : best;
    }, { hour: 0, avg: Infinity }).hour;

    // Calculate potential savings
    const potentialSavings = ((currentGwei - historicalLow) / currentGwei) * 100;

    // Determine if batching would be beneficial
    const shouldBatch = currentGwei > avgPrice * 1.2;

    return {
      bestTime: `${bestHour}:00 - ${(bestHour + 1) % 24}:00 UTC`,
      estimatedSavings: `${potentialSavings.toFixed(1)}%`,
      currentGwei: Math.round(currentGwei),
      historicalLow: Math.round(historicalLow),
      batchingRecommendation: shouldBatch
        ? 'Batching transactions recommended for optimal gas savings'
        : 'Individual transactions acceptable at current gas prices'
    };
  }

  getHistoricalData(): GasData[] {
    return this.historicalData;
  }
}

export const gasOptimizer = GasOptimizer.getInstance();