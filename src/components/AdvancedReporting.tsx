import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import { motion } from 'framer-motion';
import { TrendingUp, Compass as GasPump, Clock, ArrowDownToLine, BarChart3, Zap } from 'lucide-react';
import { GasOptimizer, type GasRecommendation, type GasData } from '../lib/gas';
import { ethers } from 'ethers';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

const chartOptions = {
  responsive: true,
  interaction: {
    mode: 'index' as const,
    intersect: false,
  },
  scales: {
    x: {
      type: 'time' as const,
      time: {
        unit: 'hour' as const,
      },
      title: {
        display: true,
        text: 'Time',
      },
    },
    y: {
      title: {
        display: true,
        text: 'Gas Price (Gwei)',
      },
    },
  },
  plugins: {
    legend: {
      position: 'top' as const,
    },
  },
};

export function AdvancedReporting() {
  const [gasData, setGasData] = useState<GasData[]>([]);
  const [gasRecommendation, setGasRecommendation] = useState<GasRecommendation | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeGasOptimizer = async () => {
      if (!window.ethereum) return;

      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        await GasOptimizer.getInstance().initialize(provider);
        
        // Get initial data
        await updateGasData();
        
        // Set up periodic updates
        const interval = setInterval(updateGasData, 30000); // Update every 30 seconds
        return () => clearInterval(interval);
      } catch (error) {
        console.error('Error initializing gas optimizer:', error);
        setIsLoading(false);
      }
    };

    initializeGasOptimizer();
  }, []);

  const updateGasData = async () => {
    try {
      const optimizer = GasOptimizer.getInstance();
      const historicalData = optimizer.getHistoricalData();
      const recommendation = await optimizer.getGasRecommendation();
      
      setGasData(historicalData);
      setGasRecommendation(recommendation);
    } catch (error) {
      console.error('Error updating gas data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const chartData = {
    datasets: [
      {
        label: 'Gas Price',
        data: gasData.map(d => ({ x: d.timestamp, y: d.price })),
        borderColor: 'rgb(0, 255, 157)',
        backgroundColor: 'rgba(0, 255, 157, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Priority Fee',
        data: gasData.map(d => ({ x: d.timestamp, y: d.priority })),
        borderColor: 'rgb(0, 184, 255)',
        backgroundColor: 'rgba(0, 184, 255, 0.1)',
        tension: 0.4,
      },
    ],
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-8 mb-8"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <BarChart3 className="w-6 h-6" />
          Advanced Analytics
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <GasPump className="w-5 h-5 text-[var(--neon-primary)]" />
            Gas Optimization
          </h3>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--neon-primary)]"></div>
            </div>
          ) : gasRecommendation ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Current Gas Price:</span>
                <span className="font-mono text-[var(--neon-primary)]">
                  {gasRecommendation.currentGwei} Gwei
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Historical Low:</span>
                <span className="font-mono text-[var(--neon-secondary)]">
                  {gasRecommendation.historicalLow} Gwei
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Potential Savings:</span>
                <span className="font-mono text-[var(--neon-accent)]">
                  {gasRecommendation.estimatedSavings}
                </span>
              </div>
              <div className="glass-card p-4 mt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-[var(--neon-primary)]" />
                  <span className="font-semibold">Recommended Transaction Time</span>
                </div>
                <p className="text-gray-300">{gasRecommendation.bestTime}</p>
              </div>
              <div className="glass-card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-[var(--neon-secondary)]" />
                  <span className="font-semibold">Optimization Strategy</span>
                </div>
                <p className="text-gray-300">{gasRecommendation.batchingRecommendation}</p>
              </div>
            </div>
          ) : (
            <p className="text-gray-400">Unable to fetch gas recommendations</p>
          )}
        </div>

        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[var(--neon-secondary)]" />
            Historical Gas Trends
          </h3>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--neon-secondary)]"></div>
            </div>
          ) : gasData.length > 0 ? (
            <div className="h-[300px]">
              <Line options={chartOptions} data={chartData} />
            </div>
          ) : (
            <p className="text-gray-400">No historical data available</p>
          )}
        </div>
      </div>

      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <ArrowDownToLine className="w-5 h-5 text-[var(--neon-accent)]" />
          Transaction Tips
        </h3>
        <ul className="space-y-3 text-gray-300">
          <li className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[var(--neon-primary)]"></div>
            Wait for gas prices below {gasRecommendation?.historicalLow} Gwei for optimal savings
          </li>
          <li className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[var(--neon-secondary)]"></div>
            Consider batching multiple transactions during low gas periods
          </li>
          <li className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[var(--neon-accent)]"></div>
            Monitor trends to identify recurring low-gas windows
          </li>
        </ul>
      </div>
    </motion.div>
  );
}