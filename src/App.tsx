import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wallet, 
  Brain, 
  Shield, 
  Sparkles,
  BarChart3,
  Settings,
  AlertTriangle,
  ArrowRightLeft,
  Gauge,
  Loader,
  Download,
  Share2
} from 'lucide-react';
import { useWallet } from './lib/wallet';
import { generateYieldStrategy, analyzeMarketConditions, getProtocolHealth, type UserPreferences, type YieldStrategy } from './lib/ai';
import { WalletStatus } from './components/WalletStatus';
import { AdvancedReporting } from './components/AdvancedReporting';
import { generatePDF, shareOnTwitter } from './lib/report';

function App() {
  const { isConnected, connect, disconnect, balance, address } = useWallet();
  const [strategy, setStrategy] = useState<YieldStrategy | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [preferences, setPreferences] = useState<UserPreferences>({
    riskAppetite: 'medium',
    yieldFrequency: 'daily',
    autoCompounding: true,
    preferredChains: ['Ethereum', 'Arbitrum', 'Optimism']
  });

  const handleConnectWallet = async () => {
    if (isConnected) {
      disconnect();
    } else {
      await connect();
    }
  };

  const generateStrategy = async () => {
    if (!balance) return;
    setIsLoading(true);
    setStrategy(null);
    
    try {
      const newStrategy = await generateYieldStrategy(balance, preferences);
      setStrategy(newStrategy);
    } catch (error) {
      console.error('Error generating strategy:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadReport = async () => {
    if (!strategy) return;
    setIsDownloading(true);
    try {
      const pdfUrl = await generatePDF(strategy, 'strategy-report');
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `yield-strategy-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(pdfUrl);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShareOnTwitter = () => {
    if (!strategy) return;
    shareOnTwitter(strategy);
  };

  return (
    <div className="min-h-screen p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 mb-8"
      >
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold neon-text flex items-center gap-2">
            <Sparkles className="w-8 h-8" />
            Smart Yield Optimizer AI Agent
          </h1>
          <button
            onClick={handleConnectWallet}
            className={`glass-card px-6 py-3 hover-glow flex items-center gap-2 ${
              isConnected ? 'border-[var(--neon-primary)]' : 'border-white/10'
            }`}
          >
            <Wallet className="w-5 h-5" />
            {isConnected ? 'Disconnect Wallet' : 'Connect Wallet'}
          </button>
        </div>
        
        <p className="text-xl text-gray-300 mb-8">
          Autonomous AI Agent for Dynamic DeFi Yield Optimization
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6 hover-glow">
            <div className="flex items-center gap-3 mb-4">
              <Brain className="w-6 h-6 text-[var(--neon-primary)]" />
              <h3 className="text-lg font-semibold">AI Analysis</h3>
            </div>
            <p className="text-gray-400">Smart market analysis and predictions</p>
          </div>

          <div className="glass-card p-6 hover-glow">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-6 h-6 text-[var(--neon-secondary)]" />
              <h3 className="text-lg font-semibold">Risk Management</h3>
            </div>
            <p className="text-gray-400">Automated risk monitoring and alerts</p>
          </div>

          <div className="glass-card p-6 hover-glow">
            <div className="flex items-center gap-3 mb-4">
              <ArrowRightLeft className="w-6 h-6 text-[var(--neon-accent)]" />
              <h3 className="text-lg font-semibold">Cross-Chain</h3>
            </div>
            <p className="text-gray-400">Optimal yields across networks</p>
          </div>
        </div>
      </motion.div>

      {isConnected && (
        <>
          <WalletStatus
            address={address}
            balance={balance}
            isConnected={isConnected}
          />

          <AdvancedReporting />

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-8 mb-8"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Strategy Preferences</h2>
              <button
                onClick={generateStrategy}
                disabled={isLoading}
                className="glass-card px-6 py-3 hover-glow flex items-center gap-2 border-[var(--neon-primary)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader className="w-5 h-5 animate-spin" />
                ) : (
                  <Brain className="w-5 h-5" />
                )}
                {isLoading ? 'Generating...' : 'Generate Strategy'}
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass-card p-4">
                <h4 className="text-sm text-gray-400 mb-2">Risk Appetite</h4>
                <select
                  value={preferences.riskAppetite}
                  onChange={(e) => setPreferences(prev => ({ ...prev, riskAppetite: e.target.value as UserPreferences['riskAppetite'] }))}
                  className="w-full bg-transparent border border-white/10 rounded-lg p-2"
                >
                  <option value="low">Conservative</option>
                  <option value="medium">Balanced</option>
                  <option value="high">Aggressive</option>
                </select>
              </div>

              <div className="glass-card p-4">
                <h4 className="text-sm text-gray-400 mb-2">Yield Frequency</h4>
                <select
                  value={preferences.yieldFrequency}
                  onChange={(e) => setPreferences(prev => ({ ...prev, yieldFrequency: e.target.value as UserPreferences['yieldFrequency'] }))}
                  className="w-full bg-transparent border border-white/10 rounded-lg p-2"
                >
                  <option value="daily">Daily Compounding</option>
                  <option value="weekly">Weekly Harvesting</option>
                  <option value="monthly">Monthly Rebalancing</option>
                </select>
              </div>

              <div className="glass-card p-4">
                <h4 className="text-sm text-gray-400 mb-2">Auto-Compounding</h4>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={preferences.autoCompounding}
                    onChange={(e) => setPreferences(prev => ({ ...prev, autoCompounding: e.target.checked }))}
                    className="form-checkbox h-5 w-5 text-[var(--neon-primary)]"
                  />
                  <span>Enable auto-compounding</span>
                </label>
              </div>
            </div>
          </motion.div>

          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="glass-card p-8 flex flex-col items-center justify-center space-y-4"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Brain className="w-12 h-12 text-[var(--neon-primary)]" />
                </motion.div>
                <p className="text-lg text-gray-300">AI is analyzing market conditions...</p>
                <div className="w-full max-w-md h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-[var(--neon-primary)]"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </div>
              </motion.div>
            ) : strategy ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                <div id="strategy-report" className="glass-card p-8">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold flex items-center gap-2">
                      <Brain className="w-6 h-6" />
                      AI Strategy Recommendation
                    </h3>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={handleDownloadReport}
                        disabled={isDownloading}
                        className="glass-card px-4 py-2 hover-glow flex items-center gap-2 text-sm"
                      >
                        {isDownloading ? (
                          <Loader className="w-4 h-4 animate-spin" />
                        ) : (
                          <Download className="w-4 h-4" />
                        )}
                        {isDownloading ? 'Generating PDF...' : 'Download Report'}
                      </button>
                      <button
                        onClick={handleShareOnTwitter}
                        className="glass-card px-4 py-2 hover-glow flex items-center gap-2 text-sm"
                      >
                        <Share2 className="w-4 h-4" />
                        Share on X
                      </button>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="glass-card p-6">
                      <pre className="whitespace-pre-wrap text-gray-300">{strategy.recommendation}</pre>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="glass-card p-4">
                        <h4 className="text-sm text-gray-400">Expected Yield</h4>
                        <p className="text-xl font-bold text-[var(--neon-primary)]">{strategy.expectedYield}</p>
                      </div>
                      <div className="glass-card p-4">
                        <h4 className="text-sm text-gray-400">Risk Level</h4>
                        <p className="text-xl font-bold text-[var(--neon-secondary)]">{strategy.riskLevel}</p>
                      </div>
                      <div className="glass-card p-4">
                        <h4 className="text-sm text-gray-400">Auto-Compound APY</h4>
                        <p className="text-xl font-bold text-[var(--neon-accent)]">{strategy.autoCompounding.estimatedAPY}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="glass-card p-8">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                      <AlertTriangle className="w-6 h-6" />
                      Active Alerts
                    </h3>
                    <ul className="space-y-4">
                      {strategy.alerts.map((alert, index) => (
                        <li key={index} className="flex items-center gap-2 text-gray-300">
                          <span className="text-[var(--neon-accent)]">•</span>
                          {alert}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="glass-card p-8">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                      <Gauge className="w-6 h-6" />
                      Market Insights
                    </h3>
                    <ul className="space-y-4">
                      {strategy.insights.map((insight, index) => (
                        <li key={index} className="flex items-center gap-2 text-gray-300">
                          <span className="text-[var(--neon-secondary)]">•</span>
                          {insight}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="glass-card p-8">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Shield className="w-6 h-6" />
                    Risk Management
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="glass-card p-4">
                      <h4 className="text-sm text-gray-400 mb-2">Protocol Health</h4>
                      <p className="text-gray-300">{strategy.riskManagement.protocolHealth}</p>
                    </div>
                    <div className="glass-card p-4">
                      <h4 className="text-sm text-gray-400 mb-2">Market Volatility</h4>
                      <p className="text-gray-300">{strategy.riskManagement.marketVolatility}</p>
                    </div>
                    <div className="glass-card p-4">
                      <h4 className="text-sm text-gray-400 mb-2">Security Status</h4>
                      <p className="text-gray-300">{strategy.riskManagement.securityStatus}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}

export default App;