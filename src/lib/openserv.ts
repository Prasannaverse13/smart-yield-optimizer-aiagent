import type { YieldStrategy, UserPreferences } from './ai';

export class OpenServAgent {
  private static instance: OpenServAgent;
  private apiKey: string;
  private apiUrl: string;

  private constructor() {
    this.apiKey = import.meta.env.VITE_OPENSERV_API_KEY;
    this.apiUrl = import.meta.env.VITE_BACKEND_URL + '/agents/smart-yield-optimizer';
  }

  static getInstance(): OpenServAgent {
    if (!OpenServAgent.instance) {
      OpenServAgent.instance = new OpenServAgent();
    }
    return OpenServAgent.instance;
  }

  private async fetchFromOpenServ(endpoint: string, data: any) {
    try {
      const response = await fetch(`${this.apiUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'X-Agent-Version': '1.0.0',
          'X-Request-ID': crypto.randomUUID()
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`OpenServ API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('OpenServ API Error:', error);
      throw error;
    }
  }

  async initialize(): Promise<void> {
    try {
      await this.fetchFromOpenServ('/initialize', {
        capabilities: [
          'market_analysis',
          'risk_assessment',
          'yield_optimization',
          'protocol_health',
          'transaction_simulation'
        ],
        supportedChains: ['ethereum', 'arbitrum', 'optimism'],
        supportedProtocols: ['aave', 'curve', 'lido', 'gmx']
      });
    } catch (error) {
      console.error('Failed to initialize OpenServ agent:', error);
      throw error;
    }
  }

  async analyzeMarket(): Promise<any> {
    try {
      const analysis = await this.fetchFromOpenServ('/market/analyze', {
        timestamp: Date.now(),
        includeMetrics: ['trend', 'volatility', 'liquidity', 'gas']
      });
      return {
        trend: analysis.trend,
        opportunities: analysis.opportunities,
        risks: analysis.risks,
        conditions: {
          trend: analysis.trend.direction,
          gasFees: analysis.network.gasFees,
          liquidity: analysis.market.liquidity,
          volatility: analysis.market.volatility
        }
      };
    } catch (error) {
      console.error('Market analysis failed:', error);
      throw error;
    }
  }

  async optimizeYield(balance: string, preferences: UserPreferences): Promise<YieldStrategy> {
    try {
      const result = await this.fetchFromOpenServ('/strategy/optimize', {
        balance,
        preferences,
        marketData: await this.analyzeMarket(),
        protocolHealth: await this.getProtocolHealth()
      });

      return result.strategy;
    } catch (error) {
      console.error('Yield optimization failed:', error);
      throw error;
    }
  }

  async getProtocolHealth(): Promise<any> {
    try {
      return await this.fetchFromOpenServ('/protocol/health', {
        protocols: ['aave', 'curve', 'lido', 'gmx'],
        metrics: ['tvl', 'utilization', 'risks', 'security']
      });
    } catch (error) {
      console.error('Protocol health check failed:', error);
      throw error;
    }
  }

  async simulateStrategy(strategy: YieldStrategy): Promise<any> {
    try {
      return await this.fetchFromOpenServ('/strategy/simulate', {
        strategy,
        simulationPeriod: '30d',
        includeMetrics: ['returns', 'risks', 'costs']
      });
    } catch (error) {
      console.error('Strategy simulation failed:', error);
      throw error;
    }
  }
}

export const openServAgent = OpenServAgent.getInstance();