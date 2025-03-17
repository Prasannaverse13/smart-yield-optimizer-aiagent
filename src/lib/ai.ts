import { geminiAgent } from './gemini';

export interface YieldStrategy {
  recommendation: string;
  expectedYield: string;
  riskLevel: 'low' | 'medium' | 'high';
  chains: string[];
  protocols: string[];
  alerts: string[];
  insights: string[];
  autoCompounding: {
    enabled: boolean;
    frequency: string;
    estimatedAPY: string;
    nextRebalance?: string;
    lastCompounded?: string;
  };
  riskManagement: {
    protocolHealth: string;
    marketVolatility: string;
    securityStatus: string;
    liquidationThreshold?: string;
    stopLoss?: string;
    leverageRatio?: string;
  };
  performance?: {
    dailyYield: string;
    weeklyYield: string;
    monthlyYield: string;
    yearlyProjection: string;
    volatility: string;
    sharpeRatio: string;
  };
  marketConditions?: {
    trend: 'bullish' | 'bearish' | 'neutral';
    gasFees: 'high' | 'medium' | 'low';
    liquidity: 'high' | 'medium' | 'low';
    volatility: 'high' | 'medium' | 'low';
  };
  rebalancing?: {
    lastRebalance: string;
    nextRebalance: string;
    triggerConditions: string[];
  };
}

export interface UserPreferences {
  riskAppetite: 'low' | 'medium' | 'high';
  yieldFrequency: 'daily' | 'weekly' | 'monthly';
  autoCompounding: boolean;
  preferredChains: string[];
}

export async function generateYieldStrategy(balance: string, preferences: UserPreferences): Promise<YieldStrategy> {
  try {
    // Generate base strategy using Gemini AI
    const baseStrategy = await geminiAgent.generateBaseStrategy(balance, preferences);
    
    // Get detailed analysis and recommendations
    const geminiAdvice = await geminiAgent.generateYieldAdvice(baseStrategy);
    
    // Get market insights and risk alerts
    const insights = await geminiAgent.getMarketInsights();
    const alerts = await geminiAgent.getRiskAlerts(baseStrategy.protocols);

    // Calculate APY and performance metrics
    const baseAPY = parseFloat(baseStrategy.expectedYield);
    const compoundedAPY = preferences.autoCompounding ? baseAPY * 1.2 : baseAPY;

    // Combine all data into final strategy
    const strategy: YieldStrategy = {
      ...baseStrategy,
      recommendation: geminiAdvice,
      insights,
      alerts,
      autoCompounding: {
        enabled: preferences.autoCompounding,
        frequency: preferences.yieldFrequency,
        estimatedAPY: `${compoundedAPY.toFixed(1)}%`
      },
      performance: {
        dailyYield: `${(compoundedAPY / 365).toFixed(2)}%`,
        weeklyYield: `${(compoundedAPY / 52).toFixed(2)}%`,
        monthlyYield: `${(compoundedAPY / 12).toFixed(2)}%`,
        yearlyProjection: `${compoundedAPY.toFixed(1)}%`,
        volatility: baseStrategy.marketConditions.volatility === 'high' ? '5.2%' : 
                   baseStrategy.marketConditions.volatility === 'medium' ? '3.4%' : '1.8%',
        sharpeRatio: ((compoundedAPY - 2) / 5).toFixed(2)
      },
      riskManagement: {
        protocolHealth: "Protocols operating normally",
        marketVolatility: baseStrategy.marketConditions.volatility,
        securityStatus: "No immediate security concerns"
      },
      rebalancing: {
        lastRebalance: new Date().toISOString(),
        nextRebalance: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        triggerConditions: [
          'APY deviation > 2%',
          'Significant market volatility change',
          'Protocol health status change'
        ]
      }
    };

    return strategy;
  } catch (error) {
    console.error('Error generating strategy:', error);
    throw error;
  }
}

export async function analyzeMarketConditions(): Promise<string[]> {
  try {
    return await geminiAgent.getMarketInsights();
  } catch (error) {
    console.error('Error analyzing market conditions:', error);
    throw error;
  }
}

export async function getProtocolHealth(): Promise<string[]> {
  try {
    return await geminiAgent.getRiskAlerts(['Aave', 'Curve', 'Lido']);
  } catch (error) {
    console.error('Error getting protocol health:', error);
    throw error;
  }
}