import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AICourseRecommender = () => {
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
        setError('Our AI advisor is currently recalibrating. Please try again in a moment.');
      }
    } catch (err) {
      console.error('Recommendation API error:', err);
      setError('Connection lost. Please ensure the AI service is active.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto my-12 md:my-20 font-sans">
      {/* --- HEADER --- */}
      <div className="text-center mb-12 animate-fade-in-up">
        <h2 className="text-4xl md:text-6xl font-serif text-white mb-4 tracking-tight">
          What is your next <span className="italic text-primary-400">masterpiece</span>?
        </h2>
        <p className="text-gray-500 text-lg font-light max-w-2xl mx-auto">
          Describe your aspirations, and our AI will architect the perfect learning path for you.
        </p>
      </div>

      {/* --- INPUT AREA --- */}
      <div className="relative max-w-3xl mx-auto z-20">
        <div className={`
          premium-border rounded-[2.5rem] overflow-hidden transition-all duration-700
          ${loading ? 'scale-[0.98] opacity-80' : 'scale-100 shadow-[0_0_50px_rgba(180,145,90,0.1)]'}
        `}>
          <div className="bg-[#0c0c0e]/80 backdrop-blur-3xl p-2 md:p-3 flex flex-col md:flex-row items-stretch md:items-center gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
                placeholder="Ex: I want to master digital architecture and sustainable design..."
                className="w-full bg-transparent border-none py-6 px-8 text-white placeholder:text-gray-700 focus:outline-none text-lg font-light"
                onKeyPress={(e) => e.key === 'Enter' && handleRecommend()}
              />
              {loading && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-1">
                  <div className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce" />
                </div>
              )}
            </div>
            <button
              onClick={handleRecommend}
              disabled={loading || !interests.trim()}
              className={`
                px-10 py-5 md:py-0 md:h-[70px] rounded-[1.8rem] font-medium transition-all duration-500 whitespace-nowrap flex items-center justify-center gap-3
                ${loading 
                  ? 'bg-gray-900 text-gray-600 cursor-not-allowed' 
                  : 'bg-white text-black hover:bg-primary-400 hover:text-white active:scale-95 disabled:opacity-20'}
              `}
            >
              {loading ? 'Synthesizing...' : 'Architect My Path'}
              {!loading && (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              )}
            </button>
          </div>
        </div>

        {error && (
          <p className="text-center text-red-500/70 text-sm mt-4 animate-fade-in-up font-light tracking-wide">
            {error}
          </p>
        )}
      </div>

      {/* --- RESULTS --- */}
      {recommendation && (
        <div className="mt-20 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center animate-fade-in-up">
          {/* Left: Match Visualization */}
          <div className="lg:col-span-5 flex flex-col items-center lg:items-end order-2 lg:order-1">
             <div className="relative group">
                <div className="absolute inset-0 bg-primary-500/20 blur-[100px] rounded-full group-hover:bg-primary-500/30 transition-colors" />
                <div className="relative floating-glass w-64 h-64 md:w-80 md:h-80 rounded-full flex flex-col items-center justify-center border-white/10 premium-border">
                   <span className="text-gray-500 text-xs uppercase tracking-[0.4em] mb-2 font-bold">Match Accuracy</span>
                   <span className="text-7xl md:text-8xl font-serif text-white leading-none">
                      {recommendation.match_score}
                      <span className="text-3xl text-primary-400 ml-1">%</span>
                   </span>
                </div>
                {/* Orbital dots */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-primary-400 rounded-full blur-[2px] animate-[spin_8s_linear_infinite] origin-[0_160px] md:origin-[0_200px]" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-blue-400 rounded-full blur-[1px] animate-[spin_12s_linear_infinite_reverse] origin-[0_140px] md:origin-[0_180px]" />
             </div>
          </div>

          {/* Right: Content */}
          <div className="lg:col-span-7 space-y-8 order-1 lg:order-2">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-[1px] w-12 bg-primary-500/50" />
                <span className="text-xs uppercase tracking-[0.5em] text-primary-400 font-bold">AI Recommended Path</span>
              </div>
              <h3 className="text-5xl md:text-7xl font-serif text-white leading-[0.95] tracking-tight">
                {recommendation.course_name}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
              <div className="space-y-4">
                <h4 className="text-[10px] uppercase tracking-[0.3em] text-gray-500 font-black">The Reasoning</h4>
                <p className="text-gray-400 leading-relaxed font-light italic text-xl border-l border-primary-500/20 pl-6">
                  "{recommendation.reasoning}"
                </p>
              </div>
              <div className="space-y-4">
                <h4 className="text-[10px] uppercase tracking-[0.3em] text-gray-500 font-black">Expertise Earned</h4>
                <div className="text-gray-400 leading-relaxed font-light text-lg">
                  {recommendation.what_they_will_learn}
                </div>
                <div className="pt-6">
                   <button 
                    onClick={() => navigate(`/formations/${recommendation.course_id}`)}
                    className="group flex items-center gap-4 text-white hover:text-primary-400 transition-colors"
                   >
                      <span className="text-sm uppercase tracking-widest font-bold">Initialize Enrollment</span>
                      <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center group-hover:border-primary-400/50 group-hover:bg-primary-400/5 transition-all">
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

      {/* --- BACKGROUND DECOR --- */}
      <div className="fixed inset-0 pointer-events-none -z-10 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary-500/5 rounded-full blur-[120px] animate-neural-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[150px] animate-neural-pulse [animation-delay:2s]" />
      </div>
    </div>
  );
};

export default AICourseRecommender;
