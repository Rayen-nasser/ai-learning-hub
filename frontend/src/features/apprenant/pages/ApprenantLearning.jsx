import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { formationService, leconService, contentService, inscriptionService } from '../../../services/api';
import ApprenantLayout from '../components/ApprenantLayout';

export default function ApprenantLearning() {
  const { formationId } = useParams();
  const navigate = useNavigate();
  const [formation, setFormation] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingContent, setLoadingContent] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);
  const [completedLessons, setCompletedLessons] = useState(() => {
    const saved = localStorage.getItem(`progress_${formationId}`);
    return saved ? JSON.parse(saved) : [];
  });
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [testState, setTestState] = useState(null);
  const [testAnswers, setTestAnswers] = useState({});
  const [testSubmitted, setTestSubmitted] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [draftSaved, setDraftSaved] = useState(false);

  useEffect(() => {
    fetchData();
  }, [formationId]);

  useEffect(() => {
    localStorage.setItem(`progress_${formationId}`, JSON.stringify(completedLessons));
  }, [completedLessons, formationId]);

  const fetchData = async () => {
    setLoading(true);
    setAccessDenied(false);
    
    try {
      const insRes = await inscriptionService.getMyInscriptions();
      const inscriptions = insRes.data.data || insRes.data || [];
      
      const myInscription = inscriptions.find(ins => 
        ins.formationId === formationId || 
        ins.formation?._id === formationId
      );
      
      if (!myInscription || myInscription.statut !== 'acceptee') {
        setAccessDenied(true);
        setLoading(false);
        return;
      }

      const [formationRes, lessonsRes] = await Promise.all([
        formationService.getById(formationId),
        leconService.getByFormation(formationId),
      ]);
      const formationData = formationRes.data.data || formationRes.data;
      const lessonsData = lessonsRes.data.data || lessonsRes.data || [];
      
      setFormation(formationData);
      setLessons(lessonsData);
      
      if (lessonsData.length > 0) {
        setCurrentLesson(lessonsData[0]);
        fetchLessonContent(lessonsData[0]._id);
      }
    } catch (e) {
      console.error('Failed to fetch data', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchLessonContent = async (lessonId) => {
    setLoadingContent(true);
    setTestState(null);
    setTestSubmitted(false);
    setTestAnswers({});
    setTestResults(null);
    setDraftSaved(false);
    
    const savedDraft = localStorage.getItem(`test_draft_${lessonId}`);
    if (savedDraft) {
      setTestAnswers(JSON.parse(savedDraft));
    }
    
    try {
      const res = await contentService.getByLesson(lessonId);
      setContents(res.data.data || res.data || []);
    } catch (e) {
      console.error('Failed to fetch content', e);
      setContents([]);
    } finally {
      setLoadingContent(false);
    }
  };

  const selectLesson = (lesson) => {
    setCurrentLesson(lesson);
    fetchLessonContent(lesson._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const markComplete = () => {
    if (currentLesson && !completedLessons.includes(currentLesson._id)) {
      setCompletedLessons([...completedLessons, currentLesson._id]);
    }
  };

  const markIncomplete = () => {
    setCompletedLessons(completedLessons.filter(id => id !== currentLesson._id));
  };

  const goToNextLesson = () => {
    const currentIndex = lessons.findIndex(l => l._id === currentLesson._id);
    if (currentIndex < lessons.length - 1) {
      selectLesson(lessons[currentIndex + 1]);
    }
  };

  const goToPrevLesson = () => {
    const currentIndex = lessons.findIndex(l => l._id === currentLesson._id);
    if (currentIndex > 0) {
      selectLesson(lessons[currentIndex - 1]);
    }
  };

  const handleTestAnswer = (questionIndex, answer) => {
    setTestAnswers({ ...testAnswers, [questionIndex]: answer });
    setDraftSaved(false);
  };

  const saveDraft = () => {
    if (currentLesson) {
      localStorage.setItem(`test_draft_${currentLesson._id}`, JSON.stringify(testAnswers));
      setDraftSaved(true);
      setTimeout(() => setDraftSaved(false), 3000);
    }
  };

  const submitTest = (contentItem) => {
    let questions = contentItem.questions;
    if (typeof questions === 'string') {
      try {
        questions = JSON.parse(questions);
      } catch {
        questions = [];
      }
    }

    let correct = 0;
    let total = 0;
    const results = questions.map((q, i) => {
      total += q.points || 1;
      const userAnswer = testAnswers[i];
      if (q.type === 'multiple_choice') {
        if (userAnswer === q.correctAnswer) {
          correct += q.points || 1;
          return { correct: true, points: q.points || 1 };
        }
        return { correct: false, correctAnswer: q.correctAnswer, points: 0 };
      }
      return { correct: null, points: 0 };
    });

    const score = total > 0 ? Math.round((correct / total) * 100) : 0;
    const passed = score >= (contentItem.passingGrade || 60);

    setTestSubmitted(true);
    setTestResults({ score, passed, correct, total, results });
    
    if (currentLesson) {
      localStorage.removeItem(`test_draft_${currentLesson._id}`);
    }
  };

  const getFullUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `http://localhost:5000${url}`;
  };

  const currentIndex = lessons.findIndex(l => l._id === currentLesson?._id);
  const progressPercent = lessons.length > 0 
    ? Math.round((completedLessons.length / lessons.length) * 100) 
    : 0;

  if (loading) {
    return (
      <ApprenantLayout title="Loading...">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
          <div className="learn-spinner" />
        </div>
      </ApprenantLayout>
    );
  }

  if (accessDenied) {
    return (
      <ApprenantLayout title="Access Denied">
        <div style={{ 
          textAlign: 'center', 
          padding: 60,
          background: 'rgba(255,255,255,0.02)',
          borderRadius: 16,
          border: '1px solid rgba(255,255,255,0.06)',
          maxWidth: 480,
          margin: '40px auto',
        }}>
          <div style={{ 
            width: 80, 
            height: 80, 
            borderRadius: '50%', 
            background: 'rgba(200,168,110,0.1)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            margin: '0 auto 24px',
          }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#c8a86e" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <h2 style={{ 
            fontFamily: "'Cormorant Garamond', serif", 
            fontSize: 28, 
            fontWeight: 400, 
            color: '#f0ebe0', 
            marginBottom: 12 
          }}>
            Payment Pending
          </h2>
          <p style={{ color: '#888', fontSize: 15, marginBottom: 24, lineHeight: 1.6 }}>
            Your enrollment is still pending. You'll have access to the course content once your payment is confirmed.
          </p>
          <Link 
            to="/apprenant/paiements" 
            style={{ 
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #7ca8d4, #5a9fd4)',
              borderRadius: 8,
              color: '#fff',
              textDecoration: 'none',
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            View Payment Status
          </Link>
        </div>
      </ApprenantLayout>
    );
  }

  if (!formation) {
    return (
      <ApprenantLayout title="Course not found">
        <div style={{ textAlign: 'center', padding: 60 }}>
          <p style={{ color: '#888', marginBottom: 20 }}>This course doesn't exist or you don't have access.</p>
          <Link to="/apprenant/formations" style={{ color: '#7ca8d4' }}>Back to My Courses</Link>
        </div>
      </ApprenantLayout>
    );
  }

  return (
    <ApprenantLayout title={formation.titre || formation.title}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500&family=DM+Sans:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        
        .learn-root {
          font-family: 'DM Sans', sans-serif;
          color: #e8e4dc;
          min-height: calc(100vh - 120px);
        }
        
        .learn-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 24px;
          padding-bottom: 20px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        
        .learn-back {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #666;
          text-decoration: none;
          font-size: 13px;
          transition: color 0.2s;
          padding: 8px 12px;
          border-radius: 8px;
          background: rgba(255,255,255,0.02);
        }
        .learn-back:hover { color: #7ca8d4; }
        
        .learn-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 24px;
          font-weight: 400;
          color: #f0ebe0;
          margin: 0;
        }
        
        .learn-progress-bar {
          height: 6px;
          background: rgba(255,255,255,0.08);
          border-radius: 3px;
          overflow: hidden;
          margin-bottom: 8px;
        }
        
        .learn-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #7ca8d4, #5a9fd4);
          border-radius: 3px;
          transition: width 0.4s ease;
        }
        
        .learn-progress-text {
          font-size: 12px;
          color: #666;
        }
        
        .learn-layout {
          display: grid;
          grid-template-columns: ${sidebarOpen ? '280px' : '0'} 1fr;
          gap: 24px;
          transition: grid-template-columns 0.3s ease;
        }
        
        .learn-sidebar {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 12px;
          overflow: hidden;
          height: fit-content;
          position: sticky;
          top: 20px;
        }
        
        .learn-sidebar-header {
          padding: 16px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        
        .learn-sidebar-title {
          font-size: 13px;
          font-weight: 500;
          color: #e8e4dc;
        }
        
        .learn-toggle {
          background: rgba(255,255,255,0.05);
          border: none;
          color: #888;
          cursor: pointer;
          padding: 6px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .learn-toggle:hover { background: rgba(255,255,255,0.1); color: #e8e4dc; }
        
        .learn-lessons-list {
          max-height: 60vh;
          overflow-y: auto;
        }
        
        .learn-lesson-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 16px;
          cursor: pointer;
          transition: all 0.15s;
          border-bottom: 1px solid rgba(255,255,255,0.03);
        }
        .learn-lesson-item:hover { background: rgba(255,255,255,0.03); }
        .learn-lesson-item.active { background: rgba(124,168,212,0.1); border-left: 3px solid #7ca8d4; }
        .learn-lesson-item.completed .learn-lesson-check { background: #4aa87d; border-color: #4aa87d; }
        
        .learn-lesson-check {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 0.2s;
        }
        
        .learn-lesson-num {
          font-size: 11px;
          color: #555;
          min-width: 24px;
        }
        
        .learn-lesson-info { flex: 1; min-width: 0; }
        .learn-lesson-name {
          font-size: 13px;
          color: #e8e4dc;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .learn-lesson-item.active .learn-lesson-name { color: #7ca8d4; }
        .learn-lesson-dur { font-size: 11px; color: #555; margin-top: 2px; }
        
        .learn-main {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 16px;
          overflow: hidden;
        }
        
        .learn-lesson-header {
          padding: 24px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }
        
        .learn-lesson-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 28px;
          font-weight: 400;
          color: #f0ebe0;
          margin: 0 0 8px;
        }
        
        .learn-lesson-meta {
          display: flex;
          gap: 16px;
          font-size: 12px;
          color: #666;
        }
        
        .learn-content-area {
          padding: 24px;
          min-height: 400px;
        }
        
        .learn-content-item {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 16px;
        }
        
        .learn-content-title {
          font-size: 16px;
          font-weight: 500;
          color: #e8e4dc;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .learn-content-desc {
          font-size: 14px;
          color: #888;
          line-height: 1.7;
        }
        
        .learn-video {
          width: 100%;
          border-radius: 8px;
          background: #000;
          max-height: 500px;
        }
        
        .learn-image {
          max-width: 100%;
          border-radius: 8px;
        }
        
        .learn-file-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          background: rgba(124,168,212,0.1);
          border: 1px solid rgba(124,168,212,0.2);
          border-radius: 8px;
          color: #7ca8d4;
          text-decoration: none;
          font-size: 14px;
          transition: all 0.2s;
        }
        .learn-file-link:hover { background: rgba(124,168,212,0.2); }
        
        .learn-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: #7ca8d4;
          text-decoration: none;
          font-size: 14px;
        }
        .learn-link:hover { text-decoration: underline; }
        
        .learn-question {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 16px;
        }
        
        .learn-question-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 16px;
        }
        
        .learn-question-text {
          font-size: 15px;
          color: #e8e4dc;
          font-weight: 400;
          line-height: 1.5;
        }
        
        .learn-question-type {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          padding: 4px 8px;
          border-radius: 4px;
          background: rgba(124,168,212,0.1);
          color: #7ca8d4;
          flex-shrink: 0;
        }
        
        .learn-question-points {
          font-size: 11px;
          color: #666;
          margin-left: 8px;
        }
        
        .learn-option {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 8px;
          margin-bottom: 8px;
          cursor: pointer;
          transition: all 0.15s;
        }
        .learn-option:hover { border-color: rgba(124,168,212,0.3); }
        .learn-option.selected { border-color: #7ca8d4; background: rgba(124,168,212,0.1); }
        .learn-option.correct { border-color: #4aa87d; background: rgba(74,168,125,0.15); }
        .learn-option.wrong { border-color: #e07070; background: rgba(224,112,112,0.1); }
        .learn-option.disabled { cursor: default; pointer-events: none; }
        
        .learn-option-letter {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: rgba(255,255,255,0.05);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 500;
          color: #888;
          flex-shrink: 0;
        }
        .learn-option.selected .learn-option-letter { background: #7ca8d4; color: #0c0c0e; }
        .learn-option.correct .learn-option-letter { background: #4aa87d; color: #fff; }
        .learn-option.wrong .learn-option-letter { background: #e07070; color: #fff; }
        
        .learn-open-answer {
          width: 100%;
          padding: 14px 16px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          color: #e8e4dc;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          resize: vertical;
          min-height: 120px;
          line-height: 1.6;
          transition: border-color 0.2s;
        }
        .learn-open-answer:focus {
          outline: none;
          border-color: #7ca8d4;
        }
        .learn-open-answer::placeholder {
          color: #555;
        }
        
        .learn-char-count {
          text-align: right;
          font-size: 11px;
          color: #555;
          margin-top: 6px;
        }
        
        .learn-test-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          background: rgba(124,168,212,0.05);
          border: 1px solid rgba(124,168,212,0.15);
          border-radius: 12px;
          margin-bottom: 20px;
        }
        
        .learn-test-info {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        
        .learn-test-stat {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #888;
        }
        
        .learn-test-stat svg {
          opacity: 0.6;
        }
        
        .learn-test-actions {
          display: flex;
          gap: 10px;
        }
        
        .learn-save-btn {
          padding: 10px 18px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 8px;
          color: #888;
          font-size: 13px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s;
          font-family: 'DM Sans', sans-serif;
        }
        .learn-save-btn:hover {
          background: rgba(255,255,255,0.08);
          color: #e8e4dc;
          border-color: rgba(255,255,255,0.2);
        }
        .learn-save-btn.saved {
          background: rgba(74,168,125,0.1);
          border-color: rgba(74,168,125,0.3);
          color: #4aa87d;
        }
        
        .learn-submit-btn {
          padding: 10px 24px;
          background: linear-gradient(135deg, #7ca8d4, #5a9fd4);
          border: none;
          border-radius: 8px;
          color: #fff;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s;
          font-family: 'DM Sans', sans-serif;
        }
        .learn-submit-btn:hover:not(:disabled) {
          opacity: 0.9;
          transform: translateY(-1px);
        }
        .learn-submit-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .learn-nav {
          padding: 20px 24px;
          border-top: 1px solid rgba(255,255,255,0.06);
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: rgba(0,0,0,0.1);
        }
        
        .learn-nav-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          border: 1px solid rgba(255,255,255,0.1);
          background: transparent;
          color: #888;
          font-family: 'DM Sans', sans-serif;
        }
        .learn-nav-btn:hover:not(:disabled) { background: rgba(255,255,255,0.05); color: #e8e4dc; }
        .learn-nav-btn:disabled { opacity: 0.3; cursor: not-allowed; }
        
        .learn-complete-btn {
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
          font-family: 'DM Sans', sans-serif;
        }
        .learn-complete-btn.done { background: #4aa87d; color: #fff; }
        .learn-complete-btn.undone { background: rgba(255,255,255,0.05); color: #888; border: 1px solid rgba(255,255,255,0.1); }
        .learn-complete-btn.undone:hover { background: rgba(74,168,125,0.2); color: #4aa87d; }
        
        .learn-spinner {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.06);
          border-top-color: #7ca8d4;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        
        .learn-empty {
          text-align: center;
          padding: 60px 20px;
          color: #555;
        }
        
        .learn-test-result {
          text-align: center;
          padding: 40px;
          background: rgba(255,255,255,0.02);
          border-radius: 12px;
          margin-top: 20px;
        }
        
        .learn-test-score {
          font-family: 'Cormorant Garamond', serif;
          font-size: 64px;
          font-weight: 400;
          margin-bottom: 8px;
        }
        
        .learn-test-score.passed { color: #4aa87d; }
        .learn-test-score.failed { color: #e07070; }
        
        .learn-test-message {
          font-size: 16px;
          color: #888;
        }
        
        .learn-test-details {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 12px;
          margin-top: 24px;
          padding-top: 24px;
          border-top: 1px solid rgba(255,255,255,0.06);
        }
        
        .learn-test-detail {
          padding: 16px;
          background: rgba(255,255,255,0.03);
          border-radius: 10px;
          text-align: center;
        }
        
        .learn-test-detail-value {
          font-family: 'Cormorant Garamond', serif;
          font-size: 28px;
          color: #e8e4dc;
          margin-bottom: 4px;
        }
        
        .learn-test-detail-label {
          font-size: 11px;
          color: #555;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        
        .learn-retry-btn {
          padding: 12px 28px;
          background: linear-gradient(135deg, #7ca8d4, #5a9fd4);
          border: none;
          border-radius: 8px;
          color: #fff;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          margin-top: 20px;
          font-family: 'DM Sans', sans-serif;
        }
        
        .learn-question-result {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
          padding: 12px 16px;
          border-radius: 8px;
          font-size: 13px;
        }
        
        .learn-question-result.correct {
          background: rgba(74,168,125,0.1);
          border: 1px solid rgba(74,168,125,0.2);
          color: #4aa87d;
        }
        
        .learn-question-result.wrong {
          background: rgba(224,112,112,0.1);
          border: 1px solid rgba(224,112,112,0.2);
          color: #e07070;
        }
        
        .learn-question-result.pending {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          color: #888;
        }
        
        @media (max-width: 768px) {
          .learn-layout { grid-template-columns: 1fr; }
          .learn-sidebar { display: ${sidebarOpen ? 'block' : 'none'}; }
        }
      `}</style>

      <div className="learn-root">
        <div className="learn-header">
          <Link to="/apprenant/formations" className="learn-back">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
            My Courses
          </Link>
          <h1 className="learn-title">{formation.titre || formation.title}</h1>
          <div style={{ marginLeft: 'auto' }}>
            <button className="learn-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {sidebarOpen ? (
                  <><path d="M11 19l-7-7 7-7M4 12h16"/></>
                ) : (
                  <><path d="M13 5l7 7-7 7M20 12H4"/></>
                )}
              </svg>
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <div style={{ flex: 1 }}>
            <div className="learn-progress-bar">
              <div className="learn-progress-fill" style={{ width: `${progressPercent}%` }} />
            </div>
            <div className="learn-progress-text">
              {completedLessons.length} of {lessons.length} lessons completed ({progressPercent}%)
            </div>
          </div>
        </div>

        <div className="learn-layout">
          <aside className="learn-sidebar">
            <div className="learn-sidebar-header">
              <span className="learn-sidebar-title">Course Content</span>
            </div>
            <div className="learn-lessons-list">
              {lessons.map((lesson, index) => (
                <div
                  key={lesson._id}
                  className={`learn-lesson-item ${currentLesson?._id === lesson._id ? 'active' : ''} ${completedLessons.includes(lesson._id) ? 'completed' : ''}`}
                  onClick={() => selectLesson(lesson)}
                >
                  <div className="learn-lesson-check">
                    {completedLessons.includes(lesson._id) && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    )}
                  </div>
                  <span className="learn-lesson-num">{String(index + 1).padStart(2, '0')}</span>
                  <div className="learn-lesson-info">
                    <div className="learn-lesson-name">{lesson.titre || lesson.title}</div>
                    <div className="learn-lesson-dur">{lesson.duree || lesson.duration || 0} min</div>
                  </div>
                </div>
              ))}
            </div>
          </aside>

          <main className="learn-main">
            {currentLesson && (
              <>
                <div className="learn-lesson-header">
                  <div>
                    <h2 className="learn-lesson-title">{currentLesson.titre || currentLesson.title}</h2>
                    <div className="learn-lesson-meta">
                      <span>Lesson {currentIndex + 1} of {lessons.length}</span>
                      <span>{(currentLesson.duree || currentLesson.duration || 0) * 60} min</span>
                    </div>
                  </div>
                  <button
                    className={`learn-complete-btn ${completedLessons.includes(currentLesson._id) ? 'done' : 'undone'}`}
                    onClick={() => completedLessons.includes(currentLesson._id) ? markIncomplete() : markComplete()}
                  >
                    {completedLessons.includes(currentLesson._id) ? (
                      <>✓ Completed</>
                    ) : (
                      <>Mark Complete</>
                    )}
                  </button>
                </div>

                <div className="learn-content-area">
                  {loadingContent ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
                      <div className="learn-spinner" />
                    </div>
                  ) : contents.length === 0 ? (
                    <div className="learn-empty">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="1.5" style={{ marginBottom: 16, opacity: 0.5 }}>
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                      </svg>
                      <p>No content available for this lesson yet.</p>
                      <p style={{ fontSize: 12, marginTop: 8 }}>The instructor hasn't added any content to this lesson.</p>
                    </div>
                  ) : (
                    contents.map(content => (
                      <div key={content._id} className="learn-content-item">
                        <div className="learn-content-title">
                          {content.type === 'video' && (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7ca8d4" strokeWidth="2">
                              <polygon points="5 3 19 12 5 21 5 3"/>
                            </svg>
                          )}
                          {content.type === 'image' && (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7ca8d4" strokeWidth="2">
                              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                              <circle cx="8.5" cy="8.5" r="1.5"/>
                              <polyline points="21 15 16 10 5 21"/>
                            </svg>
                          )}
                          {content.type === 'file' && (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7ca8d4" strokeWidth="2">
                              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                              <polyline points="14 2 14 8 20 8"/>
                            </svg>
                          )}
                          {content.type === 'link' && (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7ca8d4" strokeWidth="2">
                              <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
                              <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
                            </svg>
                          )}
                          {content.type === 'test' && (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7ca8d4" strokeWidth="2">
                              <path d="M9 11l3 3L22 4"/>
                              <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
                            </svg>
                          )}
                          {content.title}
                        </div>
                        
                        {content.description && (
                          <p className="learn-content-desc">{content.description}</p>
                        )}

                        {content.type === 'video' && content.url && (
                          <video
                            className="learn-video"
                            src={getFullUrl(content.url)}
                            controls
                          />
                        )}

                        {content.type === 'image' && content.url && (
                          <img
                            className="learn-image"
                            src={getFullUrl(content.url)}
                            alt={content.title}
                          />
                        )}

                        {content.type === 'file' && content.url && (
                          <a
                            className="learn-file-link"
                            href={getFullUrl(content.url)}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                              <polyline points="7 10 12 15 17 10"/>
                              <line x1="12" y1="15" x2="12" y2="3"/>
                            </svg>
                            Download File
                          </a>
                        )}

                        {content.type === 'link' && content.url && (
                          <a
                            className="learn-link"
                            href={content.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
                              <polyline points="15 3 21 3 21 9"/>
                              <line x1="10" y1="14" x2="21" y2="3"/>
                            </svg>
                            Open Link
                          </a>
                        )}

                        {content.type === 'test' && (
                          <div style={{ marginTop: 16 }}>
                            {!testSubmitted ? (
                              <>
                                <div className="learn-test-header">
                                  <div className="learn-test-info">
                                    <div className="learn-test-stat">
                                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10"/>
                                        <polyline points="12 6 12 12 16 14"/>
                                      </svg>
                                      Test
                                    </div>
                                    <div className="learn-test-stat">
                                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M9 11l3 3L22 4"/>
                                        <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
                                      </svg>
                                      Passing: {content.passingGrade || 60}%
                                    </div>
                                  </div>
                                  <div className="learn-test-actions">
                                    <button
                                      className={`learn-save-btn ${draftSaved ? 'saved' : ''}`}
                                      onClick={saveDraft}
                                    >
                                      {draftSaved ? (
                                        <>
                                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <polyline points="20 6 9 17 4 12"/>
                                          </svg>
                                          Saved
                                        </>
                                      ) : (
                                        <>
                                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
                                            <polyline points="17 21 17 13 7 13 7 21"/>
                                            <polyline points="7 3 7 8 15 8"/>
                                          </svg>
                                          Save Draft
                                        </>
                                      )}
                                    </button>
                                  </div>
                                </div>

                                {(() => {
                                  let questions = content.questions;
                                  if (typeof questions === 'string') {
                                    try {
                                      questions = JSON.parse(questions);
                                    } catch {
                                      questions = [];
                                    }
                                  }
                                  return questions.map((q, qIndex) => (
                                    <div key={qIndex} className="learn-question">
                                      <div className="learn-question-header">
                                        <div className="learn-question-text">
                                          {qIndex + 1}. {q.questionText}
                                          <span className="learn-question-points">({q.points || 1} pts)</span>
                                        </div>
                                        <span className="learn-question-type">
                                          {q.type === 'multiple_choice' ? 'Choice' : 'Essay'}
                                        </span>
                                      </div>
                                      
                                      {q.type === 'multiple_choice' && q.options?.map((opt, oIndex) => (
                                        <div
                                          key={oIndex}
                                          className={`learn-option ${testAnswers[qIndex] === oIndex ? 'selected' : ''}`}
                                          onClick={() => !testSubmitted && handleTestAnswer(qIndex, oIndex)}
                                        >
                                          <span className="learn-option-letter">{String.fromCharCode(65 + oIndex)}</span>
                                          <span>{opt}</span>
                                          {testAnswers[qIndex] === oIndex && (
                                            <svg style={{ marginLeft: 'auto' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7ca8d4" strokeWidth="2">
                                              <polyline points="20 6 9 17 4 12"/>
                                            </svg>
                                          )}
                                        </div>
                                      ))}

                                      {q.type === 'open' && (
                                        <div>
                                          <textarea
                                            className="learn-open-answer"
                                            placeholder="Write your answer here..."
                                            value={testAnswers[qIndex] || ''}
                                            onChange={(e) => handleTestAnswer(qIndex, e.target.value)}
                                            maxLength={2000}
                                          />
                                          <div className="learn-char-count">
                                            {(testAnswers[qIndex] || '').length} / 2000 characters
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  ));
                                })()}

                                <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
                                  <button
                                    className="learn-submit-btn"
                                    onClick={() => submitTest(content)}
                                  >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
                                      <polyline points="22 4 12 14.01 9 11.01"/>
                                    </svg>
                                    Submit Test
                                  </button>
                                </div>
                              </>
                            ) : testResults && (
                              <div className="learn-test-result">
                                <div style={{ marginBottom: 20 }}>
                                  <div className={`learn-test-score ${testResults.passed ? 'passed' : 'failed'}`}>
                                    {testResults.score}%
                                  </div>
                                  <div className="learn-test-message">
                                    {testResults.passed ? (
                                      <>Congratulations! You passed the test!</>
                                    ) : (
                                      <>You need {content.passingGrade || 60}% to pass. Keep trying!</>
                                    )}
                                  </div>
                                </div>

                                <div className="learn-test-details">
                                  <div className="learn-test-detail">
                                    <div className="learn-test-detail-value" style={{ color: '#4aa87d' }}>
                                      {testResults.correct}
                                    </div>
                                    <div className="learn-test-detail-label">Correct</div>
                                  </div>
                                  <div className="learn-test-detail">
                                    <div className="learn-test-detail-value" style={{ color: '#e07070' }}>
                                      {testResults.total - testResults.correct}
                                    </div>
                                    <div className="learn-test-detail-label">Wrong</div>
                                  </div>
                                  <div className="learn-test-detail">
                                    <div className="learn-test-detail-value">
                                      {testResults.total}
                                    </div>
                                    <div className="learn-test-detail-label">Total Points</div>
                                  </div>
                                </div>

                                <div style={{ marginTop: 24, textAlign: 'left' }}>
                                  <div style={{ fontSize: 14, fontWeight: 500, color: '#e8e4dc', marginBottom: 12 }}>
                                    Question Results
                                  </div>
                                  {(() => {
                                    let questions = content.questions;
                                    if (typeof questions === 'string') {
                                      try {
                                        questions = JSON.parse(questions);
                                      } catch {
                                        questions = [];
                                      }
                                    }
                                    return questions.map((q, i) => {
                                      const result = testResults.results?.[i];
                                      const isCorrect = result?.correct === true;
                                      const isPending = result?.correct === null || result?.correct === undefined;
                                      return (
                                        <div key={i} className={`learn-question-result ${isCorrect ? 'correct' : isPending ? 'pending' : 'wrong'}`}>
                                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            {isCorrect ? (
                                              <polyline points="20 6 9 17 4 12"/>
                                            ) : isPending ? (
                                              <circle cx="12" cy="12" r="10"/>
                                            ) : (
                                              <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
                                            )}
                                          </svg>
                                          <span style={{ flex: 1 }}>
                                            Q{i + 1}: {q.questionText?.substring(0, 50)}{q.questionText?.length > 50 ? '...' : ''}
                                          </span>
                                          <span style={{ fontSize: 11 }}>
                                            {isCorrect ? '+' + (q.points || 1) + ' pts' : isPending ? 'Pending review' : '0 pts'}
                                          </span>
                                        </div>
                                      );
                                    });
                                  })()}
                                </div>

                                {!testResults.passed && (
                                  <button
                                    className="learn-retry-btn"
                                    onClick={() => {
                                      setTestSubmitted(false);
                                      setTestAnswers({});
                                      setTestResults(null);
                                    }}
                                  >
                                    Try Again
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>

                <div className="learn-nav">
                  <button
                    className="learn-nav-btn"
                    onClick={goToPrevLesson}
                    disabled={currentIndex === 0}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M19 12H5M12 5l-7 7 7 7"/>
                    </svg>
                    Previous
                  </button>

                  <button
                    className={`learn-complete-btn ${completedLessons.includes(currentLesson._id) ? 'done' : 'undone'}`}
                    onClick={() => completedLessons.includes(currentLesson._id) ? markIncomplete() : markComplete()}
                  >
                    {completedLessons.includes(currentLesson._id) ? '✓ Completed' : 'Mark Complete'}
                  </button>

                  <button
                    className="learn-nav-btn"
                    onClick={goToNextLesson}
                    disabled={currentIndex === lessons.length - 1}
                  >
                    Next
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </button>
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </ApprenantLayout>
  );
}
