import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { 
  Send, 
  Sparkles, 
  User, 
  Bot, 
  Loader2, 
  History, 
  Trash2, 
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Zap,
  Target,
  BarChart3,
  CheckCircle2,
  Lock,
  Unlock,
  AlertCircle,
  RotateCcw
} from 'lucide-react';
import './AIChat.css';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true,
});

export default function AIChat() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: "Hello! I'm **Finova**, your personal financial intelligence advisor. \n\nI have access to your dashboard metrics. Ask me anything about your **savings**, **debt strategy**, or **future investments**.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [privacyMode, setPrivacyMode] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (e, retryQuery = null) => {
    if (e) e.preventDefault();
    const query = retryQuery || input;
    if (!query.trim() || isLoading) return;

    setError(null);
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    if (!retryQuery) {
      setMessages(prev => [...prev, userMessage]);
      setInput('');
    }
    setIsLoading(true);

    try {
      const res = await api.post('/ai/analyze', { 
        query, 
        privacyMode 
      });
      
      if (res.data.status === 'success') {
        const aiMessage = {
          id: Date.now() + 1,
          type: 'ai',
          content: res.data.data.recommendation,
          reasoning: res.data.data.reasoning,
          comparison: res.data.data.comparison,
          confidence: res.data.data.confidence,
          metrics: res.data.data.metrics,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages(prev => [...prev, aiMessage]);
      }
    } catch (err) {
      console.error('Chat Error:', err);
      setError({
        msg: "I encountered a barrier in my intelligence core. Would you like to retry?",
        query: query
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="hq-chat-container animate-fade-in">
      <div className="hq-chat-sidebar glass-card-static">
        <div className="hq-sidebar-header">
          <h3>Intelligence Core</h3>
          <button className="btn-icon" onClick={() => setMessages([messages[0]])} title="Clear Chat">
            <Trash2 size={16} />
          </button>
        </div>
        
        <div className="hq-privacy-toggle glass-card" onClick={() => setPrivacyMode(!privacyMode)}>
          <div className={`privacy-icon-bg ${privacyMode ? 'active' : ''}`}>
             {privacyMode ? <Lock size={14} /> : <Unlock size={14} />}
          </div>
          <div className="privacy-text">
            <p className="font-bold">Privacy Masking</p>
            <span className="text-xs opacity-60">{privacyMode ? 'Strict: Ratios Only' : 'Full Transparency'}</span>
          </div>
          <div className={`privacy-switch ${privacyMode ? 'on' : ''}`} />
        </div>

        <div className="hq-suggestions">
          <p className="text-xs text-tertiary mb-3 uppercase font-bold tracking-wider">Strategic Prompts</p>
          <button className="hq-suggest-btn" onClick={() => setInput("Analyze my current savings structure.")}>
            <TrendingUp size={14} /> Analyze Savings 
          </button>
          <button className="hq-suggest-btn" onClick={() => setInput("Should I pay off my home loan or invest more?")}>
            <ShieldCheck size={14} /> Debt Strategy
          </button>
          <button className="hq-suggest-btn" onClick={() => setInput("Simulate 10 year growth with current assets.")}>
            <Target size={14} /> Wealth Forecast
          </button>
        </div>

        <div className="hq-sidebar-footer">
          <div className="hq-ai-status">
            <div className={`hq-pulse-${isLoading ? 'blue' : 'green'}`} />
            <span className="text-xs font-bold uppercase">{isLoading ? 'Computing...' : 'Gemini Core Active'}</span>
          </div>
        </div>
      </div>

      <div className="hq-chat-main">
        <div className="hq-chat-messages">
          {messages.map((msg) => (
            <div key={msg.id} className={`hq-message-wrapper ${msg.type}`}>
              <div className={`hq-message-avatar ${msg.type}`}>
                {msg.type === 'ai' ? <Bot size={18} /> : <User size={18} />}
              </div>
              <div className="hq-message-content">
                <div className="hq-message-bubble">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                  
                  {msg.reasoning && (
                    <div className="hq-ai-analysis-card glass-card-static">
                      <div className="hq-card-header">
                        <BarChart3 size={14} className="text-primary" />
                        <span>Core Insights</span>
                      </div>
                      <div className="hq-reasoning-list">
                        {msg.reasoning.map((r, i) => (
                          <div key={i} className="hq-reasoning-item">
                            <CheckCircle2 size={12} className="text-success" />
                            <p>{r}</p>
                          </div>
                        ))}
                      </div>

                      {msg.comparison && (
                        <div className="hq-comparison-widget">
                          <div className="hq-comp-bar-row">
                            <div className="hq-comp-label">{msg.comparison.labelA || 'Current'}</div>
                            <div className="hq-comp-val">₹{(msg.comparison.optionA / 100000).toFixed(1)}L</div>
                            <div className="hq-comp-progress-wrap">
                              <div className="hq-comp-progress" style={{ width: '100%', opacity: 0.3 }} />
                            </div>
                          </div>
                          <div className="hq-comp-bar-row highlight">
                            <div className="hq-comp-label">{msg.comparison.labelB || 'Target'}</div>
                            <div className="hq-comp-val">₹{(msg.comparison.optionB / 100000).toFixed(1)}L</div>
                            <div className="hq-comp-progress-wrap">
                              <div className="hq-comp-progress" style={{ width: `${Math.min(100, (msg.comparison.optionB / msg.comparison.optionA) * 100)}%` }} />
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div className="hq-card-footer">
                        <div className="hq-confidence">
                          <Zap size={10} /> {msg.confidence}% Confidence
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <span className="hq-message-time">{msg.timestamp}</span>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="hq-message-wrapper ai">
              <div className="hq-message-avatar ai pulse">
                <Bot size={18} />
              </div>
              <div className="hq-message-content">
                <div className="hq-message-bubble loading-skeleton-wrap">
                  <div className="skeleton skeleton-text" />
                  <div className="skeleton skeleton-text" style={{ width: '80%' }} />
                  <div className="skeleton skeleton-card" />
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="hq-error-bubble glass-card-static">
               <AlertCircle size={20} className="text-danger" />
               <div className="error-text">
                 <p>{error.msg}</p>
                 <button onClick={() => handleSend(null, error.query)}>
                    <RotateCcw size={14} /> Retry Query
                 </button>
               </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        <div className="hq-chat-input-area">
          <form onSubmit={handleSend} className="hq-chat-form glass-card-static">
            <input
              type="text"
              placeholder={privacyMode ? "Privacy Masking Active..." : "Ask Finova about your finances..."}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
            />
            <button type="submit" className="hq-send-btn" disabled={!input.trim() || isLoading}>
              <Send size={18} />
            </button>
          </form>
          <div className="hq-chat-disclaimer">
            {privacyMode ? '🛡️ Strict Privacy Enabled: Absolute values are redacted.' : '🔍 Balanced Mode: Analysis driven by real-time dashboard parameters.'}
          </div>
        </div>
      </div>
    </div>
  );
}
