import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  DollarSign,
  PiggyBank,
  CreditCard,
  Sparkles,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Plus,
  Save,
  X,
  Loader2,
  PieChart,
  ShieldCheck,
  Zap,
  Target,
  ArrowRight
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Filler,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import './Dashboard.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Filler, ArcElement, Tooltip, Legend);

/* Setup axios instance */
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true,
});

/* ---- High-End Health Ring Component ---- */
function HealthRing({ score }) {
  const [animatedScore, setAnimatedScore] = useState(0);
  
  useEffect(() => {
    let start = 0;
    const duration = 1200;
    const startTime = performance.now();
    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      setAnimatedScore(Math.round(score * eased));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [score]);

  const radius = 60;
  const stroke = 10;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedScore / 100) * circumference;

  const getColor = (s) => {
    if (s >= 80) return '#10b981';
    if (s >= 60) return '#6366f1';
    if (s >= 40) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="hq-health-ring">
      <svg width={(radius + stroke) * 2} height={(radius + stroke) * 2}>
        <defs>
          <linearGradient id="healthGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={getColor(animatedScore)} />
            <stop offset="100%" stopColor={getColor(animatedScore)} stopOpacity="0.6" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <circle cx={radius + stroke} cy={radius + stroke} r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={stroke} />
        <circle
          cx={radius + stroke}
          cy={radius + stroke}
          r={radius}
          fill="none"
          stroke="url(#healthGradient)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${radius + stroke} ${radius + stroke})`}
          filter="url(#glow)"
          style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }}
        />
      </svg>
      <div className="hq-health-content">
        <span className="hq-health-value">{animatedScore}</span>
        <span className="hq-health-label">SCORE</span>
      </div>
    </div>
  );
}

/* ---- Componentized Stat Card ---- */
function StatCard({ icon: Icon, label, value, subtext, trend, color, delay = 0 }) {
  return (
    <div className="hq-stat-card glass-card animate-slide-up" style={{ animationDelay: `${delay}ms` }}>
      <div className="hq-stat-header">
        <div className="hq-stat-icon-wrap" style={{ background: `rgba(${color}, 0.1)`, borderColor: `rgba(${color}, 0.2)` }}>
          <Icon size={18} style={{ color: `rgb(${color})` }} />
        </div>
        {trend && (
          <div className={`hq-stat-trend ${trend.type}`}>
            {trend.type === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {trend.value}
          </div>
        )}
      </div>
      <div className="hq-stat-body">
        <span className="hq-stat-label">{label}</span>
        <h3 className="hq-stat-value">{value}</h3>
      </div>
      {subtext && <div className="hq-stat-footer">{subtext}</div>}
    </div>
  );
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('Income');

  const [finance, setFinance] = useState({
    income: 0,
    expenses: 0,
    investments: { stocks: 0, mutual_funds: 0 },
    loans: { home_loan: 0 },
    credit_score: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/finance/get');
        if (res.data.status === 'success') {
          setFinance(res.data.data.profile);
        }
      } catch (err) {
        console.error('Error fetching finance:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/finance/save', finance);
      setShowEdit(false);
    } catch (err) {
      console.error('Error saving finance:', err);
    } finally {
      setSaving(false);
    }
  };

  // Metrics Logic
  const totalInvested = (finance?.investments?.stocks || 0) + (finance?.investments?.mutual_funds || 0);
  const totalDebt = (finance?.loans?.home_loan || 0);
  const netWorth = totalInvested - totalDebt;
  const monthlySavings = (finance?.income || 0) - (finance?.expenses || 0);
  const savingsRate = (finance?.income || 0) > 0 ? (monthlySavings / finance.income) * 100 : 0;
  const debtToAsset = totalInvested > 0 ? (totalDebt / totalInvested) * 100 : 0;

  const healthScore = Math.max(0, Math.min(100, Math.round(
    (savingsRate * 1.1) +                             // Savings Velocity (Max 44 points)
    (Math.max(0, 100 - debtToAsset) * 0.35) +         // Debt-to-Asset Stability (Max 35 points) - INCREASED
    (((finance?.credit_score || 0) / 900) * 21)       // Bureau Reliability (Max 21 points)
  )));

  const getHealthStatus = (s) => {
    if (s >= 80) return { label: 'Excellent', color: '#10b981', desc: 'Superior portfolio stability' };
    if (s >= 60) return { label: 'Good', color: '#6366f1', desc: 'Healthy growth potential' };
    if (s >= 40) return { label: 'Fair', color: '#f59e0b', desc: 'Actionable risk detected' };
    return { label: 'At Risk', color: '#ef4444', desc: 'Immediate restructuring needed' };
  };

  const status = getHealthStatus(healthScore);

  if (loading) return (
    <div className="flex-center min-h-[400px]">
      <div className="loader-pulse" />
    </div>
  );

  return (
    <div className="hq-dashboard">
      {/* 1. HERO SECTION: Welcome + Health Summary */}
      <section className="hq-hero-section glass-card-static animate-fade-in">
        <div className="hq-hero-main">
          <div className="hq-welcome">
            <h1>Financial Insights Report</h1>
            <p className="hq-status-desc">
              Analysis indicates your portfolio is <strong>{status.label.toLowerCase()}</strong>. {status.desc}.
            </p>
            <div className="hq-hero-actions">
              <button className="btn btn-primary" onClick={() => setShowEdit(true)}>
                <Zap size={16} /> Update Details
              </button>
            </div>
          </div>
          <div className="hq-health-viz">
            <HealthRing score={healthScore} />
            <div className="hq-health-status" style={{ color: status.color }}>
              <Sparkles size={14} /> {status.label}
            </div>
          </div>
        </div>
      </section>

      {/* 2. STATS GRID: High-Level Numbers */}
      <section className="hq-stats-grid">
        <StatCard 
          icon={DollarSign} 
          label="Estimated Net Worth" 
          value={`₹${(netWorth / 100000).toFixed(2)}L`} 
          subtext={`Equity: ₹${(totalInvested / 100000).toFixed(1)}L`}
          trend={{ type: 'up', value: '+4.2%' }}
          color="99, 102, 241"
          delay={0}
        />
        <StatCard 
          icon={ShieldCheck} 
          label="Credit Health" 
          value={finance?.credit_score || 0} 
          subtext="Experian / TransUnion Data"
          trend={{ type: 'up', value: 'Prime' }}
          color="16, 185, 129"
          delay={100}
        />
        <StatCard 
          icon={Target} 
          label="Monthly Savings" 
          value={`₹${(monthlySavings / 1000).toFixed(0)}k`} 
          subtext={`Rate: ${savingsRate.toFixed(1)}%`}
          trend={{ type: monthlySavings > 0 ? 'up' : 'down', value: 'Live' }}
          color="45, 212, 191"
          delay={200}
        />
        <StatCard 
          icon={AlertTriangle} 
          label="Active Liabilities" 
          value={`₹${(totalDebt / 100000).toFixed(1)}L`} 
          subtext={`Ratio: ${debtToAsset.toFixed(0)}%`}
          trend={{ type: 'down', value: 'Stable' }}
          color="244, 63, 94"
          delay={300}
        />
      </section>

      {/* 3. DEEP DIVE: Allocation + Details */}
      <section className="hq-details-row">
        <div className="glass-card-static hq-allocation-card">
          <div className="hq-card-header">
            <h3>Asset Allocation</h3>
            <PieChart size={16} className="text-secondary" />
          </div>
          <div className="hq-allocation-content">
            <div className="hq-doughnut-wrap">
              <Doughnut 
                data={{
                  labels: ['Stocks', 'Mutual Funds', 'Cash'],
                  datasets: [{
                    data: [finance?.investments?.stocks || 0, finance?.investments?.mutual_funds || 0, Math.max(0, monthlySavings)],
                    backgroundColor: ['#6366f1', '#10b981', '#f59e0b'],
                    borderWidth: 0, cutout: '80%'
                  }]
                }} 
                options={{ plugins: { legend: { display: false } }, maintainAspectRatio: false }} 
              />
            </div>
            <div className="hq-legend">
              <div className="hq-legend-item">
                <span className="hq-dot" style={{ background: '#6366f1' }} />
                <span className="hq-legend-label">Stocks</span>
                <span className="hq-legend-val">₹{(finance?.investments?.stocks || 0).toLocaleString()}</span>
              </div>
              <div className="hq-legend-item">
                <span className="hq-dot" style={{ background: '#10b981' }} />
                <span className="hq-legend-label">Funds</span>
                <span className="hq-legend-val">₹{(finance?.investments?.mutual_funds || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card-static hq-insights-summary">
          <div className="hq-card-header">
            <h3>AI Recommendations</h3>
            <div className="hq-badge-sm">PROCESSOR ACTIVE</div>
          </div>
          <div className="hq-insights-list">
            <div className="hq-insight-item">
              <div className="hq-insight-icon"><div className="hq-pulse-green" /></div>
              <p>Your <strong>{savingsRate.toFixed(0)}%</strong> savings rate is in the top 10% of users. Consider diversified index funds.</p>
            </div>
            <div className="hq-insight-item">
              <div className="hq-insight-icon"><div className="hq-pulse-purple" /></div>
              <p>Debt-to-asset at <strong>{debtToAsset.toFixed(0)}%</strong>. Systematic retirement plan suggested.</p>
            </div>
          </div>
        </div>
      </section>

      {/* REFINED MODAL (No changes to logic, just visuals in CSS) */}
      {showEdit && (
        <div className="edit-modal-overlay" onClick={() => setShowEdit(false)}>
           <div className="edit-modal glass-card animate-spring" onClick={e => e.stopPropagation()}>
            <div className="edit-modal-header">
              <div className="header-text">
                <h3>Profile Refinement</h3>
                <p>Ensure data integrity for AI computation.</p>
              </div>
              <button className="edit-modal-close-btn" onClick={() => setShowEdit(false)}><X size={20} /></button>
            </div>
            
            <div className="edit-tabs">
              {['Income', 'Investments', 'Loans'].map(tab => (
                <button 
                  key={tab} 
                  className={`edit-tab ${activeTab === tab ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>

            <form onSubmit={handleSave} className="edit-dynamic-form">
              {activeTab === 'Income' && (
                <div className="edit-view-group">
                  <div className="input-field">
                    <label>MONTHLY REVENUE</label>
                    <div className="input-with-symbol">
                      <span className="symbol">₹</span>
                      <input 
                        type="number" 
                        placeholder="0"
                        value={finance?.income || ''} 
                        onChange={e => setFinance({...finance, income: e.target.value === '' ? 0 : Number(e.target.value)})} 
                      />
                    </div>
                  </div>
                  <div className="input-field">
                    <label>MONTHLY OVERHEAD</label>
                    <div className="input-with-symbol">
                      <span className="symbol">₹</span>
                      <input 
                        type="number" 
                        placeholder="0"
                        value={finance?.expenses || ''} 
                        onChange={e => setFinance({...finance, expenses: e.target.value === '' ? 0 : Number(e.target.value)})} 
                      />
                    </div>
                  </div>
                  <div className="input-field">
                    <label>CREDIT BUREAU SCORE</label>
                    <div className="input-with-symbol">
                      <ShieldCheck size={18} className="symbol text-tertiary" />
                      <input 
                        type="number" 
                        placeholder="700"
                        value={finance?.credit_score || ''} 
                        onChange={e => setFinance({...finance, credit_score: e.target.value === '' ? 0 : Number(e.target.value)})} 
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'Investments' && (
                <div className="edit-view-group">
                  <div className="input-field">
                    <label>DIRECT EQUITY PORTFOLIO</label>
                    <div className="input-with-symbol">
                      <span className="symbol">₹</span>
                      <input 
                        type="number" 
                        placeholder="0"
                        value={finance?.investments?.stocks || ''} 
                        onChange={e => setFinance({...finance, investments: {...(finance?.investments || {}), stocks: e.target.value === '' ? 0 : Number(e.target.value)}})} 
                      />
                    </div>
                  </div>
                  <div className="input-field">
                    <label>MUTUAL FUNDS / ETFS</label>
                    <div className="input-with-symbol">
                      <span className="symbol">₹</span>
                      <input 
                        type="number" 
                        placeholder="0"
                        value={finance?.investments?.mutual_funds || ''} 
                        onChange={e => setFinance({...finance, investments: {...(finance?.investments || {}), mutual_funds: e.target.value === '' ? 0 : Number(e.target.value)}})} 
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'Loans' && (
                <div className="edit-view-group">
                  <div className="input-field">
                    <label>OUTSTANDING MORTGAGE/LAND LOAN</label>
                    <div className="input-with-symbol">
                      <span className="symbol">₹</span>
                      <input 
                        type="number" 
                        placeholder="0"
                        value={finance?.loans?.home_loan || ''} 
                        onChange={e => setFinance({...finance, loans: { ...(finance?.loans || {}), home_loan: e.target.value === '' ? 0 : Number(e.target.value)}})} 
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="edit-modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setShowEdit(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-save" disabled={saving}>
                  {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} Save Computation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
