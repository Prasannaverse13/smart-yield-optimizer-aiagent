import { GoogleGenerativeAI } from '@google/generative-ai';
import type { YieldStrategy, UserPreferences } from './ai';

export class GeminiAIAgent {
  private static instance: GeminiAIAgent;
  private genAI: GoogleGenerativeAI;
  private model: any;

  private constructor() {
    const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
    if (!API_KEY) {
      throw new Error('GEMINI_API_KEY is required in environment variables');
    }
    this.genAI = new GoogleGenerativeAI(API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }

  static getInstance(): GeminiAIAgent {
    if (!GeminiAIAgent.instance) {
      GeminiAIAgent.instance = new GeminiAIAgent();
    }
    return GeminiAIAgent.instance;
  }

  private async generateResponse(prompt: string): Promise<string> {
    try {
      const result = await this.model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
      });
      
      const response = await result.response;
      const text = response.text();
      
      // Clean up the response if it contains markdown code blocks
      return text.replace(/```json\n|\n```/g, '').trim();
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw error;
    }
  }

  async generateBaseStrategy(balance: string, preferences: UserPreferences): Promise<any> {
    const prompt = `Generate a DeFi yield optimization strategy as a JSON object with these parameters:
Balance: ${balance} ETH
Risk: ${preferences.riskAppetite}
Frequency: ${preferences.yieldFrequency}
AutoCompound: ${preferences.autoCompounding}
Chains: ${preferences.preferredChains.join(', ')}

Response must be a valid JSON object with this exact structure:
{
  "protocols": ["protocol1", "protocol2"],
  "chains": ["chain1", "chain2"],
  "expectedYield": "X%",
  "riskLevel": "low/medium/high",
  "marketConditions": {
    "trend": "bullish/bearish/neutral",
    "gasFees": "high/medium/low",
    "liquidity": "high/medium/low",
    "volatility": "high/medium/low"
  }
}

Only return the JSON object, no other text.`;

    try {
      const response = await this.generateResponse(prompt);
      return JSON.parse(response);
    } catch (error) {
      console.error('Error parsing base strategy:', error);
      throw new Error('Failed to generate valid strategy data');
    }
  }

  async generateYieldAdvice(strategy: Partial<YieldStrategy>): Promise<string> {
    const prompt = `Analyze this DeFi strategy and provide recommendations:
Risk Level: ${strategy.riskLevel}
Expected Yield: ${strategy.expectedYield}
Protocols: ${strategy.protocols?.join(', ')}
Chains: ${strategy.chains?.join(', ')}

Provide a clear, concise analysis of the strategy's strengths, risks, and optimization opportunities.
Focus on practical recommendations for maximizing yield while managing risk.
Return the analysis as plain text, no JSON formatting.`;

    return this.generateResponse(prompt);
  }

  async getMarketInsights(): Promise<string[]> {
    const prompt = `Provide 3-5 key DeFi market insights as a JSON array of strings.
Focus on current trends, opportunities, and risks.
Only return a valid JSON array, no other text.
Example: ["Insight 1", "Insight 2", "Insight 3"]`;

    try {
      const response = await this.generateResponse(prompt);
      return JSON.parse(response);
    } catch (error) {
      console.error('Error parsing market insights:', error);
      return [
        "Market analysis temporarily unavailable",
        "Please check back later for updated insights"
      ];
    }
  }

  async getRiskAlerts(protocols: string[]): Promise<string[]> {
    const prompt = `Generate 2-3 risk alerts for these DeFi protocols: ${protocols.join(', ')}
Return as a JSON array of alert strings.
Only return a valid JSON array, no other text.
Example: ["Alert 1", "Alert 2"]`;

    try {
      const response = await this.generateResponse(prompt);
      return JSON.parse(response);
    } catch (error) {
      console.error('Error parsing risk alerts:', error);
      return [
        "Risk assessment temporarily unavailable",
        "Monitor protocol status for updates"
      ];
    }
  }
}

export const geminiAgent = GeminiAIAgent.getInstance();