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
        <div className="mt-20 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center animate-fade-in-up">
          <div className="lg:col-span-5 flex flex-col items-center lg:items-end order-2 lg:order-1">
            <div className="relative group">
              <div className="absolute inset-0 rounded-full" style={{ background: 'rgba(180,145,90,0.15)', filter: 'blur(100px)' }} />
              <div className="relative floating-glass w-64 h-64 md:w-80 md:h-80 rounded-full flex flex-col items-center justify-center premium-border">
                <span className="text-xs uppercase tracking-[0.4em] mb-2 font-bold" style={{ color: 'var(--text-secondary)' }}>
                  {t('admin.matchAccuracy', 'Match Accuracy')}
                </span>
                <span className="text-7xl md:text-8xl font-serif leading-none" style={{ color: 'var(--text-primary)' }}>
                  {recommendation.match_score}
                  <span className="text-3xl ml-1" style={{ color: '#b4915a' }}>%</span>
                </span>
              </div>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full blur-[2px] animate-[spin_8s_linear_infinite] origin-[0_160px] md:origin-[0_200px]" style={{ background: '#b4915a' }} />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full blur-[1px] animate-[spin_12s_linear_infinite_reverse] origin-[0_140px] md:origin-[0_180px]" style={{ background: '#2e7d32' }} />
            </div>
          </div>

          <div className="lg:col-span-7 space-y-8 order-1 lg:order-2">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-[1px] w-12" style={{ background: 'rgba(180,145,90,0.5)' }} />
                <span className="text-xs uppercase tracking-[0.5em] font-bold" style={{ color: '#b4915a' }}>
                  {t('admin.aiRecommendedPath', 'AI Recommended Path')}
                </span>
              </div>
              <h3 className="text-5xl md:text-7xl font-serif leading-[0.95] tracking-tight" style={{ color: 'var(--text-primary)' }}>
                {recommendation.course_name}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
              <div className="space-y-4">
                <h4 className="text-[10px] uppercase tracking-[0.3em] font-black" style={{ color: 'var(--text-secondary)' }}>
                  {t('admin.theReasoning', 'The Reasoning')}
                </h4>
                <p className="leading-relaxed font-light italic text-xl border-l pl-6" style={{ color: 'var(--text-secondary)', borderColor: 'rgba(180,145,90,0.2)' }}>
                  "{recommendation.reasoning}"
                </p>
              </div>
              <div className="space-y-4">
                <h4 className="text-[10px] uppercase tracking-[0.3em] font-black" style={{ color: 'var(--text-secondary)' }}>
                  {t('admin.expertiseEarned', 'Expertise Earned')}
                </h4>
                <div className="leading-relaxed font-light text-lg" style={{ color: 'var(--text-secondary)' }}>
                  {recommendation.what_they_will_learn}
                </div>
                <div className="pt-6">
                  <button
                    onClick={() => navigate(`/formations/${recommendation.course_id}`)}
                    className="group flex items-center gap-4 transition-colors"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    <span className="text-sm uppercase tracking-widest font-bold">{t('admin.initializeEnrollment', 'Initialize Enrollment')}</span>
                    <div className="w-12 h-12 rounded-full flex items-center justify-center transition-all" style={{ border: '1px solid var(--border-main)' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
