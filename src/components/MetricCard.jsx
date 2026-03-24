import { TrendingUp, TrendingDown } from 'lucide-react';
import './MetricCard.css';

export default function MetricCard({ icon: Icon, label, value, change, trend, delay = 0 }) {
  return (
    <div
      className="metric-card glass-card animate-slide-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="metric-card-header">
        <div className="metric-card-icon">
          <Icon size={20} />
        </div>
        <div className={`metric-card-trend ${trend === 'up' ? 'trend-up' : 'trend-down'}`}>
          {trend === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          <span>{change}</span>
        </div>
      </div>
      <div className="metric-card-value">{value}</div>
      <div className="metric-card-label">{label}</div>
    </div>
  );
}
