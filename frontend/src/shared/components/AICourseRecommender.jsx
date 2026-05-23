import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

const AICourseRecommender = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [interests, setInterests] = useState('');
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState(null);
  const [error, setError] = useState(null);

  const handleRecommend = async () => {
    if (!interests.trim()) return;

    setLoading(true);
    setError(null);
    setRecommendation(null);

    try {
      const response = await axios.get('http://localhost:5678/webhook/recommend', {
        params: {
          interests: interests,
          userId: user?._id || user?.id || 'visitor',
          language: 'en',
        }
      });

      if (response.data.success) {
        setRecommendation(response.data.recommendation);
      } else {
        setError(t('admin.aiRecalibrating', 'Our AI advisor is currently recalibrating. Please try again in a moment.'));
      }
    } catch (err) {
      console.error('Recommendation API error:', err);
      setError(t('admin.aiConnectionLost', 'Connection lost. Please ensure the AI service is active.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto my-12 md:my-20 font-sans">
      <style>{`
        .ar-input {
          width: 100%; background: transparent; border: none;
          padding: 24px 32px; color: var(--text-primary);
          font-size: 18px; font-weight: 300; outline: none;
        }
        .ar-input::placeholder { color: var(--text-secondary); opacity: 0.5; }
        .ar-btn {
          padding: 20px 40px; border-radius: 28px; font-weight: 500;
          white-space: nowrap; display: flex; align-items: center; justify-content: center; gap: 12px;
          border: none; cursor: pointer; font-family: inherit;
          transition: all 0.5s;
        }
        .ar-btn-ready {
          background: linear-gradient(135deg, #b4915a, #c8a86e);
          color: #ffffff;
        }
        .ar-btn-ready:hover { opacity: 0.9; }
        .ar-btn-ready:active { transform: scale(0.95); }
        .ar-btn-loading {
          background: var(--bg-card);
          color: var(--text-secondary);
          cursor: not-allowed;
        }
        .ar-btn:disabled { opacity: 0.2; cursor: not-allowed; }
        .ar-dot {
          width: 6px; height: 6px; background: #b4915a; border-radius: 50%;
          animation: ar-bounce 1s ease infinite;
        }
        .ar-dot:nth-child(2) { animation-delay: -0.15s; }
        .ar-dot:nth-child(3) { animation-delay: -0.3s; }
        @keyframes ar-bounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>

      {/* HEADER */}
      <div className="text-center mb-12 animate-fade-in-up">
        <h2 className="text-4xl md:text-6xl font-serif mb-4 tracking-tight" style={{ color: 'var(--text-primary)' }}>
          {t('admin.whatIsYourNext', 'What is your next ')}
          <span className="italic" style={{ color: '#b4915a' }}>
            {t('admin.masterpiece', 'masterpiece')}
          </span>?
        </h2>
        <p className="text-lg font-light max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
          {t('admin.describeYourAspirations', 'Describe your aspirations, and our AI will architect the perfect learning path for you.')}
        </p>
      </div>

      {/* INPUT AREA */}
      <div className="relative max-w-3xl mx-auto z-20">
        <div className={`premium-border rounded-[2.5rem] overflow-hidden transition-all duration-700 ${loading ? 'scale-[0.98] opacity-80' : 'scale-100'}`}>
          <div style={{ background: 'var(--bg-card)', backdropFilter: 'blur(24px)' }} className="p-2 md:p-3 flex flex-col md:flex-row items-stretch md:items-center gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
                placeholder={t('admin.aiRecommenderPlaceholder', 'Ex: I want to master digital architecture and sustainable design...')}
                className="ar-input"
                onKeyDown={(e) => e.key === 'Enter' && handleRecommend()}
              />
              {loading && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-1">
                  <div className="ar-dot" />
                  <div className="ar-dot" />
                  <div className="ar-dot" />
                </div>
              )}
            </div>
            <button
              onClick={handleRecommend}
              disabled={loading || !interests.trim()}
              className={`ar-btn ${loading ? 'ar-btn-loading' : 'ar-btn-ready'}`}
            >
              {loading ? t('admin.synthesizing', 'Synthesizing...') : t('admin.architectMyPath', 'Architect My Path')}
              {!loading && (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              )}
            </button>
          </div>
        </div>

        {error && (
          <p className="text-center text-sm mt-4 animate-fade-in-up font-light tracking-wide" style={{ color: '#c62828' }}>
            {error}
          </p>
        )}
      </div>

      {/* RESULTS */}
      {recommendation && (
        <div className="mt-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center animate-fade-in-up">
          {/* Match Score Indicator (Circular Progress Ring) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center order-2 lg:order-1">
            <div className="relative group">
              {/* Soft Radial Ambient Glow */}
              <div className="absolute inset-0 rounded-full" style={{ background: 'rgba(180,145,90,0.15)', filter: 'blur(100px)' }} />
              
              {/* Circular SVG Progress Ring */}
              <div className="relative flex items-center justify-center w-64 h-64 md:w-80 md:h-80 mx-auto rounded-full bg-neutral-900/5 dark:bg-white/5 border border-neutral-200/30 dark:border-white/5 backdrop-blur-xl transition-transform duration-700 hover:scale-[1.02]">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
                  <defs>
                    <linearGradient id="premiumScoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#b4915a" />
                      <stop offset="100%" stopColor="#d4af37" />
                    </linearGradient>
                  </defs>
                  
                  {/* Track Circle */}
                  <circle
                    cx="100"
                    cy="100"
                    r="85"
                    className="stroke-neutral-200/50 dark:stroke-white/5"
                    strokeWidth="6"
                    fill="transparent"
                  />
                  
                  {/* Glowing Score Progress Circle */}
                  <circle
                    cx="100"
                    cy="100"
                    r="85"
                    stroke="url(#premiumScoreGradient)"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={534}
                    strokeDashoffset={534 - (534 * (parseInt(recommendation.match_score) || 0)) / 100}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                    style={{ filter: 'drop-shadow(0px 0px 8px rgba(180,145,90,0.3))' }}
                  />
                </svg>

                {/* Inner Text Info */}
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-[10px] md:text-xs uppercase tracking-[0.3em] font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
                    {t('admin.matchAccuracy', 'Match Accuracy')}
                  </span>
                  <span className="text-6xl md:text-7xl font-serif leading-none font-semibold relative" style={{ color: 'var(--text-primary)' }}>
                    {recommendation.match_score}
                    <span className="text-2xl md:text-3xl font-serif absolute -top-1 -right-6" style={{ color: '#b4915a' }}>%</span>
                  </span>
                  
                  {/* Dynamic Compatibility Tag */}
                  <div className="mt-4 px-3 py-1 rounded-full text-[9px] tracking-[0.2em] uppercase font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    {parseInt(recommendation.match_score) >= 80 
                      ? t('admin.highMatch', 'High Compatibility') 
                      : t('admin.moderateMatch', 'Moderate Match')}
                  </div>
                </div>
              </div>

              {/* Orbital Rings / Particles for premium feel */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full blur-[2px] animate-[spin_8s_linear_infinite] origin-[0_160px] md:origin-[0_200px]" style={{ background: '#b4915a' }} />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full blur-[1px] animate-[spin_12s_linear_infinite_reverse] origin-[0_140px] md:origin-[0_180px]" style={{ background: '#2e7d32' }} />
            </div>
          </div>

          {/* Stepper Learning Path details */}
          <div className="lg:col-span-7 space-y-6 order-1 lg:order-2">
            
            {/* Step 1: Course Destination */}
            <div className="p-6 md:p-8 rounded-3xl bg-neutral-900/5 dark:bg-white/5 border border-neutral-200/50 dark:border-white/5 backdrop-blur-xl relative overflow-hidden group hover:border-[#b4915a]/30 transition-all duration-500">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#b4915a]/10 to-transparent rounded-bl-full pointer-events-none" />
              
              <div className="flex items-center gap-3 mb-4">
                <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-[#b4915a]/10 text-[#b4915a] font-serif text-sm font-bold border border-[#b4915a]/20">
                  1
                </span>
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold" style={{ color: '#b4915a' }}>
                  {t('admin.aiRecommendedPath', 'AI RECOMMENDED PATH')}
                </span>
              </div>
              
              <h3 className="text-3xl md:text-5xl font-serif leading-tight font-semibold" style={{ color: 'var(--text-primary)' }}>
                {recommendation.course_name}
              </h3>
            </div>

            {/* Steps 2 & 3 in Responsive Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Step 2: The Reasoning (Quote design) */}
              <div className="p-6 md:p-8 rounded-3xl bg-neutral-900/5 dark:bg-white/5 border border-neutral-200/50 dark:border-white/5 backdrop-blur-xl hover:border-[#b4915a]/30 transition-all duration-500 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-serif text-sm font-bold border border-indigo-500/20">
                      2
                    </span>
                    <span className="text-[10px] uppercase tracking-[0.2em] font-extrabold text-indigo-600 dark:text-indigo-400">
                      {t('admin.theReasoning', 'THE REASONING')}
                    </span>
                  </div>
                  
                  <p className="leading-relaxed font-light italic text-base md:text-lg relative pl-2" style={{ color: 'var(--text-primary)' }}>
                    <span className="absolute -left-1 -top-2 text-4xl text-[#b4915a]/20 font-serif">“</span>
                    {recommendation.reasoning}
                    <span className="text-4xl text-[#b4915a]/20 font-serif leading-none align-bottom ml-1">”</span>
                  </p>
                </div>
              </div>

              {/* Step 3: Skills & Action */}
              <div className="p-6 md:p-8 rounded-3xl bg-neutral-900/5 dark:bg-white/5 border border-neutral-200/50 dark:border-white/5 backdrop-blur-xl hover:border-[#b4915a]/30 transition-all duration-500 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-serif text-sm font-bold border border-emerald-500/20">
                      3
                    </span>
                    <span className="text-[10px] uppercase tracking-[0.2em] font-extrabold text-emerald-600 dark:text-emerald-400">
                      {t('admin.expertiseEarned', 'EXPERTISE EARNED')}
                    </span>
                  </div>
                  
                  <p className="leading-relaxed font-light text-sm md:text-base mb-6" style={{ color: 'var(--text-primary)' }}>
                    {recommendation.what_they_will_learn}
                  </p>
                </div>
                
                <div className="pt-4 border-t border-neutral-200/30 dark:border-white/5">
                  <button
                    onClick={() => navigate(`/formations/${recommendation.course_id}`)}
                    className="w-full group relative flex items-center justify-center gap-3 py-3 px-5 rounded-2xl bg-gradient-to-r from-[#b4915a] to-[#c8a86e] text-white hover:opacity-95 active:scale-[0.98] transition-all duration-300 shadow-[0_4px_15px_rgba(180,145,90,0.2)] hover:shadow-[0_8px_25px_rgba(180,145,90,0.3)]"
                  >
                    <span className="text-xs uppercase tracking-widest font-bold">
                      {t('admin.initializeEnrollment', 'Start Journey')}
                    </span>
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center transition-all group-hover:translate-x-1">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                      </svg>
                    </div>
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* BACKGROUND DECOR */}
      <div className="fixed inset-0 pointer-events-none -z-10 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full blur-[120px]" style={{ background: 'rgba(180,145,90,0.08)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] rounded-full blur-[150px]" style={{ background: 'rgba(46,125,50,0.05)' }} />
      </div>
    </div>
  );
};

export default AICourseRecommender;
