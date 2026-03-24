import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Sparkles,
  MessageSquare,
  TrendingUp,
  Activity,
  Lock,
  ArrowRight,
  Shield,
  Server,
  Eye,
  ChevronRight,
  Send,
  User,
  Github,
  Twitter,
  Linkedin,
} from 'lucide-react';
import './Landing.css';

/* ---- Animated counter hook ---- */
function useCountUp(end, duration = 2000, start = 0) {
  const [value, setValue] = useState(start);
  const ref = useRef(null);
  const triggered = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !triggered.current) {
          triggered.current = true;
          const startTime = performance.now();
          const step = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setValue(Math.round(start + (end - start) * eased));
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration, start]);

  return [value, ref];
}

/* ---- Chat demo data ---- */
const chatMessages = [
  { role: 'user', text: 'Can I afford to buy a $35,000 car?' },
  {
    role: 'assistant',
    text: "Based on your financial profile, here's my analysis:",
    details: [
      { label: 'Monthly Payment', value: '$580/mo', color: 'var(--primary-400)' },
      { label: 'Impact on Savings', value: '-12%', color: 'var(--warning)' },
      { label: 'Debt-to-Income', value: '28% → 36%', color: 'var(--danger)' },
      { label: 'Recommendation', value: 'Wait 6 months', color: 'var(--success)' },
    ],
  },
  {
    role: 'assistant',
    text: '💡 If you save $800/mo for 6 months, you can put 15% down and keep your debt ratio healthy at 31%.',
  },
];

/* ---- Features ---- */
const features = [
  {
    icon: MessageSquare,
    title: 'AI Financial Advisor',
    desc: 'Chat naturally about any financial decision. Get personalized analysis backed by your real data.',
    gradient: 'linear-gradient(135deg, #6366f1, #818cf8)',
  },
  {
    icon: TrendingUp,
    title: 'Scenario Simulation',
    desc: 'Model any what-if scenario — buying a house, changing jobs, or retiring early — in seconds.',
    gradient: 'linear-gradient(135deg, #2dd4bf, #14b8a6)',
  },
  {
    icon: Activity,
    title: 'Financial Health Score',
    desc: 'A dynamic score that tracks your overall financial wellness across income, debt, savings, and investments.',
    gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
  },
  {
    icon: Lock,
    title: 'Privacy-First Architecture',
    desc: 'End-to-end encryption. Zero data selling. Your financial data never leaves your control.',
    gradient: 'linear-gradient(135deg, #22c55e, #16a34a)',
  },
];

/* ---- Trust items ---- */
const trustItems = [
  { icon: Shield, title: 'End-to-End Encryption', desc: 'AES-256 encryption at rest and in transit' },
  { icon: Server, title: 'On-Device Processing', desc: 'AI runs locally — your data stays on your device' },
  { icon: Eye, title: 'Zero Data Selling', desc: 'We never sell, share, or monetize your data' },
  { icon: Lock, title: 'SOC 2 Compliant', desc: 'Enterprise-grade security and audit controls' },
];

export default function Landing() {
  const navigate = useNavigate();
  const [visibleMessages, setVisibleMessages] = useState(0);
  const chatRef = useRef(null);
  const chatTriggered = useRef(false);

  const [usersCount, usersRef] = useCountUp(48000, 2200);
  const [decisionsCount, decisionsRef] = useCountUp(2400000, 2500);
  const [savingsCount, savingsRef] = useCountUp(12, 1800);

  /* Animate chat messages on scroll */
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !chatTriggered.current) {
          chatTriggered.current = true;
          let i = 0;
          const interval = setInterval(() => {
            i++;
            setVisibleMessages(i);
            if (i >= chatMessages.length) clearInterval(interval);
          }, 900);
        }
      },
      { threshold: 0.2 }
    );
    if (chatRef.current) observer.observe(chatRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="landing">
      {/* =============== HERO =============== */}
      <section className="hero">
        {/* Animated grid background */}
        <div className="hero-grid" />
        <div className="hero-glow hero-glow-1" />
        <div className="hero-glow hero-glow-2" />
        <div className="hero-glow hero-glow-3" />

        <div className="hero-content">
          <div className="hero-badge animate-fade-in">
            <Sparkles size={14} />
            <span>Powered by Advanced AI</span>
          </div>

          <h1 className="hero-title animate-slide-up">
            Your AI<br />
            <span className="hero-title-gradient">Financial Brain</span>
          </h1>

          <p className="hero-subtitle animate-slide-up stagger-1">
            Simulate decisions. Optimize wealth. Stay in control.
          </p>

          <div className="hero-cta animate-slide-up stagger-2">
            <button className="btn-hero-primary" onClick={() => navigate('/auth')}>
              Get Started <ArrowRight size={18} />
            </button>
            <button 
              className="btn-hero-secondary" 
              onClick={async () => {
                try {
                  const res = await axios.post('http://localhost:5000/api/auth/demo', {}, { withCredentials: true });
                  if (res.data.status === 'success') {
                    window.location.href = '/dashboard';
                  }
                } catch (err) {
                  console.error('Demo Login Error:', err);
                  navigate('/auth'); // Fallback
                }
              }}
            >
              Try Demo <ChevronRight size={18} />
            </button>
          </div>

          {/* Stats bar */}
          <div className="hero-stats animate-slide-up stagger-3">
            <div className="hero-stat" ref={usersRef}>
              <span className="hero-stat-value">{usersCount.toLocaleString()}+</span>
              <span className="hero-stat-label">Active Users</span>
            </div>
            <div className="hero-stat-sep" />
            <div className="hero-stat" ref={decisionsRef}>
              <span className="hero-stat-value">{(decisionsCount / 1000000).toFixed(1)}M+</span>
              <span className="hero-stat-label">Decisions Analyzed</span>
            </div>
            <div className="hero-stat-sep" />
            <div className="hero-stat" ref={savingsRef}>
              <span className="hero-stat-value">${savingsCount}B+</span>
              <span className="hero-stat-label">User Savings</span>
            </div>
          </div>
        </div>
      </section>

      {/* =============== FEATURES =============== */}
      <section className="section features-section" id="features">
        <div className="section-container">
          <div className="section-header">
            <span className="section-badge">Features</span>
            <h2 className="section-title">Everything you need to<br /><span className="gradient-text">master your finances</span></h2>
            <p className="section-subtitle">Four powerful modules working together to give you complete financial intelligence.</p>
          </div>

          <div className="features-grid">
            {features.map((f, i) => (
              <div key={f.title} className="feature-card" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="feature-icon" style={{ background: f.gradient }}>
                  <f.icon size={22} color="white" />
                </div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
                <a className="feature-link" href="#">
                  Learn more <ArrowRight size={14} />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =============== INTERACTIVE DEMO =============== */}
      <section className="section demo-section" id="demo">
        <div className="section-container">
          <div className="section-header">
            <span className="section-badge">Live Demo</span>
            <h2 className="section-title">See the AI <span className="gradient-text">in action</span></h2>
            <p className="section-subtitle">Ask any financial question — our AI analyzes your data and responds in real time.</p>
          </div>

          <div className="demo-window" ref={chatRef}>
            {/* Window chrome */}
            <div className="demo-topbar">
              <div className="demo-dots">
                <span className="demo-dot demo-dot-red" />
                <span className="demo-dot demo-dot-yellow" />
                <span className="demo-dot demo-dot-green" />
              </div>
              <span className="demo-topbar-title">Finova AI Assistant</span>
              <div style={{ width: 60 }} />
            </div>

            {/* Chat body */}
            <div className="demo-chat">
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`demo-msg demo-msg-${msg.role} ${i < visibleMessages ? 'demo-msg-visible' : ''}`}
                >
                  <div className={`demo-avatar ${msg.role === 'assistant' ? 'demo-avatar-ai' : 'demo-avatar-user'}`}>
                    {msg.role === 'assistant' ? <Sparkles size={14} /> : <User size={14} />}
                  </div>
                  <div className={`demo-bubble demo-bubble-${msg.role}`}>
                    <p>{msg.text}</p>
                    {msg.details && (
                      <div className="demo-details-grid">
                        {msg.details.map((d) => (
                          <div key={d.label} className="demo-detail-item">
                            <span className="demo-detail-label">{d.label}</span>
                            <span className="demo-detail-value" style={{ color: d.color }}>{d.value}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Typing indicator (shows after all messages) */}
              {visibleMessages >= chatMessages.length && (
                <div className="demo-msg demo-msg-assistant demo-msg-visible">
                  <div className="demo-avatar demo-avatar-ai"><Sparkles size={14} /></div>
                  <div className="demo-typing-wrap">
                    <span className="demo-typing-dot" />
                    <span className="demo-typing-dot" />
                    <span className="demo-typing-dot" />
                  </div>
                </div>
              )}
            </div>

            {/* Input bar */}
            <div className="demo-input-bar">
              <input type="text" placeholder="Ask about any financial decision..." disabled />
              <button className="demo-send-btn"><Send size={16} /></button>
            </div>
          </div>
        </div>
      </section>

      {/* =============== TRUST =============== */}
      <section className="section trust-section" id="trust">
        <div className="section-container">
          <div className="section-header">
            <span className="section-badge">Security</span>
            <h2 className="section-title">Your data stays <span className="gradient-text">private</span></h2>
            <p className="section-subtitle">Built from the ground up with privacy and security as core principles — not afterthoughts.</p>
          </div>

          <div className="trust-grid">
            {trustItems.map((t, i) => (
              <div key={t.title} className="trust-card" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="trust-icon">
                  <t.icon size={24} />
                </div>
                <h3 className="trust-card-title">{t.title}</h3>
                <p className="trust-card-desc">{t.desc}</p>
              </div>
            ))}
          </div>

          {/* Visual lock graphic */}
          <div className="trust-visual">
            <div className="trust-shield">
              <Shield size={48} />
            </div>
            <div className="trust-ring trust-ring-1" />
            <div className="trust-ring trust-ring-2" />
            <div className="trust-ring trust-ring-3" />
          </div>
        </div>
      </section>

      {/* =============== CTA BANNER =============== */}
      <section className="cta-banner">
        <div className="cta-glow" />
        <h2 className="cta-title">Ready to take control of your finances?</h2>
        <p className="cta-subtitle">Join thousands of users already making smarter financial decisions with AI.</p>
        <div className="cta-buttons">
          <button className="btn-hero-primary" onClick={() => navigate('/auth')}>
            Get Started Free <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* =============== FOOTER =============== */}
      <footer className="landing-footer">
        <div className="footer-container">
          <div className="footer-brand">
            <div className="footer-logo">
              <Sparkles size={18} />
            </div>
            <span className="footer-brand-name gradient-text">Finova AI</span>
          </div>

          <div className="footer-links">
            <a href="#features">Features</a>
            <a href="#demo">Demo</a>
            <a href="#trust">Security</a>
            <a href="#">Pricing</a>
          </div>

          <div className="footer-socials">
            <a href="#" className="footer-social-icon"><Github size={18} /></a>
            <a href="#" className="footer-social-icon"><Twitter size={18} /></a>
            <a href="#" className="footer-social-icon"><Linkedin size={18} /></a>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 Finova AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
