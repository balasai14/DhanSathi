import { useState, useEffect } from 'react';
import {
  Sparkles,
  TrendingUp,
  PiggyBank,
  Shield,
  Zap,
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import './Recommendations.css';

const recommendations = [
  {
    id: 1,
    title: 'Increase Emergency Fund',
    description: 'Your emergency fund covers 2.3 months of expenses. Aim for 6 months (₹1,50,000). Set up automatic transfers of ₹5000/month.',
    category: 'Savings',
    priority: 'high',
    icon: Shield,
    progress: 38,
    impact: '+₹1.5L safety net',
    status: 'in-progress',
  },
  {
    id: 2,
    title: 'Consolidate High-Interest Debt',
    description: 'You have ₹45,000 across 2 credit cards at 18% APR. A balance transfer to a 0% APR card could save you ₹8,200 in interest.',
    category: 'Debt',
    priority: 'high',
    icon: AlertTriangle,
    progress: 0,
    impact: 'Save ₹8,200/year',
    status: 'pending',
  },
  {
    id: 3,
    title: 'Start Tax-Saving Investments',
    description: 'Invest under Section 80C to save up to ₹46,800 in taxes. ELSS funds or PPF are recommended based on your risk profile.',
    category: 'Tax',
    priority: 'medium',
    icon: Zap,
    progress: 0,
    impact: 'Save ₹46,800 in taxes',
    status: 'pending',
  },
  {
    id: 4,
    title: 'Rebalance Portfolio',
    description: 'Your portfolio has drifted 8% from target allocation. Stocks are overweighted at 68% vs. target 60%. Sell ₹52,000 in equities to buy debt.',
    category: 'Investing',
    priority: 'medium',
    icon: TrendingUp,
    progress: 15,
    impact: 'Optimize returns',
    status: 'in-progress',
  },
];

function SkeletonCard() {
  return (
    <div className="glass-card-static rec-card skeleton-card">
      <div className="skeleton-icon-wrap skeleton" />
      <div className="skeleton-title skeleton" />
      <div className="skeleton-text skeleton" />
      <div className="skeleton-text skeleton" />
      <div className="skeleton-footer skeleton" />
    </div>
  );
}

export default function Recommendations() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="recommendations">
      <div className="rec-header animate-slide-up">
        <div className="rec-header-left">
          <Sparkles size={24} className="rec-header-icon" />
          <div>
            <h2>AI Insights</h2>
            <p className="text-sm text-tertiary">Real-time analysis of your wealth profile</p>
          </div>
        </div>
      </div>

      <div className="rec-grid">
        {loading ? (
          Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          recommendations.map((rec, i) => (
            <div 
              key={rec.id} 
              className="glass-card rec-card animate-slide-up" 
              style={{ animationDelay: `${i * 100}ms`, animationFillMode: 'both' }}
            >
              <div className="rec-card-header">
                <div className="rec-card-icon-wrap">
                  <rec.icon size={18} />
                </div>
                <span className={`badge badge-primary`}>
                  {rec.priority.toUpperCase()}
                </span>
              </div>

              <h3 className="rec-card-title">{rec.title}</h3>
              <p className="rec-card-desc">{rec.description}</p>

              <div className="rec-card-footer">
                <span className="rec-impact">{rec.impact}</span>
                <button className="btn btn-outline rec-action-btn">
                  View Detail <ArrowRight size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
