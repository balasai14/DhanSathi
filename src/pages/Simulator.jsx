import { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import {
  TrendingUp,
  RotateCcw,
  DollarSign,
  Calendar,
  Percent,
  ArrowRight,
  ShieldCheck,
  Zap,
  HelpCircle,
  Loader2
} from 'lucide-react';
import './Simulator.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true,
});

export default function Simulator() {
  const [monthlyInvest, setMonthlyInvest] = useState(25000);
  const [years, setYears] = useState(20);
  const [returnRate, setReturnRate] = useState(12);
  const [compareMode, setCompareMode] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  
  const [dataA, setDataA] = useState([]);
  const [dataB, setDataB] = useState([]);

  // Scenarios Logic
  useEffect(() => {
    const fetchSim = async () => {
      setIsLoading(true);
      try {
        // Parallel fetch for A and B
        const [resA, resB] = await Promise.all([
          api.post('/simulate', { monthlyInvestment: monthlyInvest, years, returnRate, repayDebtFirst: false }),
          api.post('/simulate', { monthlyInvestment: monthlyInvest, years, returnRate, repayDebtFirst: true })
        ]);

        setDataA(resA.data.data.timeSeries);
        setDataB(resB.data.data.timeSeries);
      } catch (err) {
        console.error('Sim Error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(fetchSim, 300); // Debounce
    return () => clearTimeout(timer);
  }, [monthlyInvest, years, returnRate]);

  const chartData = {
    labels: dataA.map(d => `Year ${d.year}`),
    datasets: [
      {
        label: 'A: Investing Only',
        data: dataA.map(d => d.value),
        borderColor: '#6366f1',
        backgroundColor: (ctx) => {
          const g = ctx.chart.ctx.createLinearGradient(0, 0, 0, 400);
          g.addColorStop(0, 'rgba(99, 102, 241, 0.15)');
          g.addColorStop(1, 'rgba(99, 102, 241, 0)');
          return g;
        },
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 6,
        borderWidth: 3,
      },
      compareMode && {
        label: 'B: Loan Repay + Invest',
        data: dataB.map(d => d.value),
        borderColor: '#2dd4bf',
        backgroundColor: (ctx) => {
          const g = ctx.chart.ctx.createLinearGradient(0, 0, 0, 400);
          g.addColorStop(0, 'rgba(45, 212, 191, 0.1)');
          g.addColorStop(1, 'rgba(45, 212, 191, 0)');
          return g;
        },
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 6,
        borderWidth: 3,
        borderDash: [5, 5],
      },
    ].filter(Boolean),
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(17, 17, 24, 0.98)',
        padding: 12,
        cornerRadius: 12,
        titleFont: { size: 13, weight: 'bold' },
        callbacks: {
          label: (ctx) => `₹${ctx.parsed.y.toLocaleString()}`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: 'rgba(255,255,255,0.4)', font: { size: 11 } },
      },
      y: {
        grid: { color: 'rgba(255,255,255,0.03)' },
        ticks: {
          color: 'rgba(255,255,255,0.4)',
          font: { size: 11 },
          callback: (v) => {
            if (v >= 10000000) return `₹${(v / 10000000).toFixed(1)}Cr`;
            if (v >= 100000) return `₹${(v / 100000).toFixed(0)}L`;
            return `₹${v}`;
          },
        },
      },
    },
  };

  const finalA = dataA[dataA.length - 1]?.value || 0;
  const finalB = dataB[dataB.length - 1]?.value || 0;

  const formatCurrency = (val) => {
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
    return `₹${val.toLocaleString()}`;
  };

  return (
    <div className="simulator-v2">
      <div className="sim-header-v2">
        <div className="sim-title-group">
          <h2>What If Simulator</h2>
          <p>Deterministic backend projections based on your real path parameters.</p>
        </div>
        <div className="sim-toggle-wrap">
          <button 
            className={`sim-toggle ${compareMode ? 'toggled' : ''}`}
            onClick={() => setCompareMode(!compareMode)}
          >
            <div className="toggle-thumb" />
          </button>
          <span className="toggle-label active">Comparison Mode</span>
        </div>
      </div>

      <div className="sim-grid">
        <div className="sim-controls-v2 glass-card-static">
          <div className="control-group">
            <div className="control-header">
              <label><DollarSign size={16} /> Monthly Amount</label>
              <span className="control-value">₹{monthlyInvest.toLocaleString()}</span>
            </div>
            <input 
              type="range" min="5000" max="250000" step="5000" 
              value={monthlyInvest} onChange={(e) => setMonthlyInvest(Number(e.target.value))}
              className="sim-slider-input"
            />
          </div>

          <div className="control-group">
            <div className="control-header">
              <label><Calendar size={16} /> Time Period</label>
              <span className="control-value">{years} Years</span>
            </div>
            <input 
              type="range" min="1" max="40" step="1" 
              value={years} onChange={(e) => setYears(Number(e.target.value))}
              className="sim-slider-input"
            />
          </div>

          <div className="control-group">
            <div className="control-header">
              <label><Percent size={16} /> Expected Return</label>
              <span className="control-value">{returnRate}% p.a.</span>
            </div>
            <input 
              type="range" min="1" max="25" step="0.5" 
              value={returnRate} onChange={(e) => setReturnRate(Number(e.target.value))}
              className="sim-slider-input"
            />
          </div>

          <div className="sim-info-box">
            <HelpCircle size={14} />
            <p>Scenario B models the impact of clearing a ₹15L home loan @10.5% first.</p>
          </div>
          
          <button className="btn btn-primary sim-cta" onClick={() => setMonthlyInvest(25000)}>
            <RotateCcw size={16} /> Reset Default
          </button>
        </div>

        <div className="sim-graph-v2 glass-card-static">
          <div className="graph-header">
            <h3>Calculated Wealth Trajectory</h3>
            {isLoading && <Loader2 size={16} className="animate-spin text-tertiary" />}
          </div>
          <div className="chart-container-v2">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>
      </div>

      <div className="sim-comparison-area">
        <div className="comp-card glass-card">
          <div className="comp-card-header">
            <div className="comp-icon-box bg-indigo">
              <TrendingUp size={20} />
            </div>
            <h4>Scenario A: Invest Only</h4>
          </div>
          <div className="comp-stats">
            <div className="comp-stat">
              <span className="label">Projected Exit</span>
              <span className="value">{formatCurrency(finalA)}</span>
            </div>
          </div>
        </div>

        {compareMode && (
          <div className="comp-card glass-card highlighted-card">
            <div className="comp-card-header">
              <div className="comp-icon-box bg-teal">
                <ShieldCheck size={20} />
              </div>
              <h4>Scenario B: Repay + Invest</h4>
            </div>
            <div className="comp-stats">
              <div className="comp-stat">
                <span className="label">Projected Exit</span>
                <span className="value">{formatCurrency(finalB)}</span>
              </div>
            </div>
            <div className="comp-badge badge-success">
              <Zap size={12} /> Live Simulation Successful
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
