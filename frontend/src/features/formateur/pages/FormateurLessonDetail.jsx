import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { leconService } from '../services/lecon';
import { contentService } from '../services/content';
import FormateurLayout from '../components/FormateurLayout';

const CONTENT_TYPES = [
  { type: 'video', label: 'Video', icon: 'M23 7l-7 5 7 5V7zM14 5H3a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2z' },
  { type: 'image', label: 'Image', icon: 'M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2zM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z' },
  { type: 'file', label: 'File', icon: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8' },
  { type: 'test', label: 'Test', icon: 'M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11' },
  { type: 'link', label: 'Link', icon: 'M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71' },
];

const QUESTION_TYPES = [
  { type: 'multiple_choice', label: 'Multiple Choice' },
  { type: 'open', label: 'Open Question' },
];

function QuestionEditor({ question, index, onChange, onDelete }) {
  const [options, setOptions] = useState(question.options || ['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState(question.correctAnswer ?? 0);

  useEffect(() => {
    setOptions(question.options || ['', '', '', '']);
    setCorrectAnswer(question.correctAnswer ?? 0);
  }, [question]);

  useEffect(() => {
    if (question.type === 'open') {
      setOptions(['', '', '', '']);
      setCorrectAnswer(0);
    }
  }, [question.type]);

  const updateOption = (i, value) => {
    const newOptions = [...options];
    newOptions[i] = value;
    setOptions(newOptions);
    onChange({ ...question, options: newOptions, correctAnswer });
  };

  const updateCorrect = (i) => {
    setCorrectAnswer(i);
    onChange({ ...question, options, correctAnswer: i });
  };

  const updateText = (field, value) => {
    const updated = { ...question, [field]: value };
    onChange(updated);
  };

  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 16, marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(200,168,110,0.15)', color: '#c8a86e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600 }}>
            {index + 1}
          </span>
          <select 
            value={question.type || 'multiple_choice'} 
            onChange={e => updateText('type', e.target.value)}
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: '#e8e4dc', padding: '4px 8px', fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}
          >
            {QUESTION_TYPES.map(qt => (
              <option key={qt.type} value={qt.type}>{qt.label}</option>
            ))}
          </select>
        </div>
        <button onClick={onDelete} style={{ background: 'rgba(224,112,112,0.1)', border: '1px solid rgba(224,112,112,0.2)', borderRadius: 6, color: '#e07070', padding: '4px 10px', fontSize: 12, cursor: 'pointer' }}>
          Remove
        </button>
      </div>

      <div style={{ marginBottom: 12 }}>
        <input
          type="text"
          value={question.questionText || ''}
          onChange={e => updateText('questionText', e.target.value)}
          placeholder="Question text..."
          style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#e8e4dc', fontSize: 14, fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box' }}
        />
      </div>

      {question.type === 'multiple_choice' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {options.map((opt, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                onClick={() => updateCorrect(i)}
                style={{ width: 24, height: 24, borderRadius: '50%', border: `2px solid ${correctAnswer === i ? '#c8a86e' : 'rgba(255,255,255,0.2)'}`, background: correctAnswer === i ? '#c8a86e' : 'transparent', color: correctAnswer === i ? '#0c0c0e' : '#666', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}
              >
                {correctAnswer === i && '✓'}
              </button>
              <input
                type="text"
                value={opt}
                onChange={e => updateOption(i, e.target.value)}
                placeholder={`Option ${String.fromCharCode(65 + i)}`}
                style={{ flex: 1, padding: '8px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: '#e8e4dc', fontSize: 13, fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box' }}
              />
            </div>
          ))}
          <div style={{ fontSize: 11, color: '#555', marginTop: 4 }}>Click the circle to mark correct answer</div>
        </div>
      )}

      {question.type === 'open' && (
        <div>
          <textarea
            value={question.sampleAnswer || ''}
            onChange={e => updateText('sampleAnswer', e.target.value)}
            placeholder="Sample answer (optional - for grading reference)"
            rows={2}
            style={{ width: '100%', padding: '8px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: '#e8e4dc', fontSize: 13, fontFamily: "'DM Sans', sans-serif", resize: 'vertical', boxSizing: 'border-box' }}
          />
          <div style={{ fontSize: 11, color: '#555', marginTop: 4 }}>This is for instructor reference only</div>
        </div>
      )}

      <div style={{ marginTop: 12 }}>
        <label style={{ fontSize: 11, color: '#555' }}>Points</label>
        <input
          type="number"
          value={question.points || 1}
          onChange={e => updateText('points', parseInt(e.target.value) || 1)}
          min={1}
          max={100}
          style={{ width: 80, padding: '6px 10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: '#e8e4dc', fontSize: 13, fontFamily: "'DM Sans', sans-serif", marginLeft: 8 }}
        />
      </div>
    </div>
  );
}

export default function FormateurLessonDetail() {
  const { id, lessonId } = useParams();
  const [lesson, setLesson] = useState(null);
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingContent, setEditingContent] = useState(null);
  const [contentType, setContentType] = useState('video');
  const [formData, setFormData] = useState({ title: '', url: '', description: '' });
  const [questions, setQuestions] = useState([]);
  const [passingGrade, setPassingGrade] = useState(60);
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    fetchData();
  }, [id, lessonId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [lessonRes, contentsRes] = await Promise.all([
        leconService.getById(lessonId),
        contentService.getByLesson(lessonId),
      ]);
      setLesson(lessonRes.data.data);
      setContents(contentsRes.data.data || []);
    } catch (e) {
      console.error('Failed to fetch data', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    setSaving(true);
    try {
      const data = new FormData();
      data.append('leconId', lessonId);
      data.append('title', formData.title);
      data.append('type', contentType);
      data.append('description', formData.description);
      
      if (contentType === 'link') {
        data.append('url', formData.url);
      } else if (contentType === 'test') {
        const validQuestions = questions.filter(q => q.questionText?.trim());
        const testData = {
          questions: validQuestions,
          passingGrade,
        };
        data.append('questions', JSON.stringify(testData.questions));
        data.append('passingGrade', passingGrade.toString());
      } else if (file) {
        data.append('fichier', file);
      } else if (editingContent) {
        data.append('url', formData.url);
      } else {
        alert('Please select a file');
        setSaving(false);
        return;
      }

      if (editingContent) {
        await contentService.update(editingContent._id, data);
      } else {
        await contentService.create(data);
      }
      setShowModal(false);
      setEditingContent(null);
      setFormData({ title: '', url: '', description: '' });
      setQuestions([]);
      setPassingGrade(60);
      setFile(null);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save content');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await contentService.delete(confirmDelete._id);
      setConfirmDelete(null);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete content');
    }
  };

  const openCreate = (type = 'video') => {
    setEditingContent(null);
    setContentType(type);
    setFormData({ title: '', url: '', description: '' });
    setQuestions([{ type: 'multiple_choice', questionText: '', options: ['', '', '', ''], correctAnswer: 0, points: 1 }]);
    setPassingGrade(60);
    setFile(null);
    setShowModal(true);
  };

  const getFullUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `http://localhost:5000${url}`;
  };

  const openEdit = (content) => {
    setEditingContent(content);
    setContentType(content.type);
    setFormData({ title: content.title || '', url: content.url || '', description: content.description || '' });
    
    let questionsData = content.questions;
    
    if (typeof questionsData === 'string') {
      try {
        questionsData = JSON.parse(questionsData);
      } catch {
        questionsData = [];
      }
    }
    
    if (questionsData && Array.isArray(questionsData) && questionsData.length > 0) {
      setQuestions(questionsData.map(q => ({
        type: q.type || 'multiple_choice',
        questionText: q.questionText || '',
        options: q.options || ['', '', '', ''],
        correctAnswer: q.correctAnswer ?? 0,
        points: q.points || 1,
        sampleAnswer: q.sampleAnswer || '',
      })));
    } else {
      setQuestions([]);
    }
    setPassingGrade(content.passingGrade || 60);
    setFile(null);
    setShowModal(true);
  };

  const addQuestion = () => {
    setQuestions([...questions, { type: 'multiple_choice', questionText: '', options: ['', '', '', ''], correctAnswer: 0, points: 1 }]);
  };

  const updateQuestion = (index, updated) => {
    const newQuestions = [...questions];
    newQuestions[index] = updated;
    setQuestions(newQuestions);
  };

  const deleteQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <FormateurLayout title="Loading...">
        <div style={{ textAlign: 'center', padding: 60, color: '#555' }}>Loading...</div>
      </FormateurLayout>
    );
  }

  if (!lesson) {
    return (
      <FormateurLayout title="Lesson not found">
        <div style={{ textAlign: 'center', padding: 60, color: '#555' }}>
          <p>This lesson doesn't exist or you don't have access.</p>
          <Link to={`/formateur/formations/${id}`} style={{ color: '#c8a86e' }}>Back to formation</Link>
        </div>
      </FormateurLayout>
    );
  }

  return (
    <FormateurLayout title={lesson.title || lesson.titre} subtitle="Manage lesson content">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Link to={`/formateur/formations/${id}`} style={{ color: '#888', textDecoration: 'none', fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Back to formation
        </Link>
        <button onClick={openCreate} style={{
          padding: '10px 20px',
          background: 'linear-gradient(135deg, #c8a86e, #b4915a)',
          color: '#0c0c0e',
          border: 'none',
          borderRadius: 8,
          fontSize: 14,
          fontWeight: 500,
          cursor: 'pointer',
          fontFamily: "'DM Sans', sans-serif",
        }}>
          + Add Content
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {CONTENT_TYPES.map(ct => (
          <div key={ct.type} onClick={() => openCreate(ct.type)} style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px dashed rgba(255,255,255,0.1)',
            borderRadius: 12,
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12,
            cursor: 'pointer',
            transition: 'all 0.15s',
            textAlign: 'center',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(200,168,110,0.5)'; e.currentTarget.style.background = 'rgba(200,168,110,0.05)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#c8a86e" strokeWidth="1.5">
              <path d={ct.icon}/>
            </svg>
            <div style={{ fontSize: 14, color: '#888' }}>{ct.label}</div>
          </div>
        ))}
      </div>

      {contents.length > 0 && (
        <>
          <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 400, color: '#f0ebe0', margin: '32px 0 16px' }}>
            Existing Content ({contents.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {contents.map(content => (
              <div key={content._id} style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 12,
                padding: 16,
                display: 'flex',
                alignItems: 'center',
                gap: 16,
              }}>
                <div style={{ width: 40, height: 40, borderRadius: 8, background: 'rgba(200,168,110,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c8a86e" strokeWidth="2">
                    <path d={CONTENT_TYPES.find(c => c.type === content.type)?.icon || 'M12 2L2 7l10 5 10-5-10-5z'}/>
                  </svg>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: '#f0ebe0', marginBottom: 4 }}>{content.title}</div>
                  <div style={{ fontSize: 12, color: '#666' }}>
                    <span style={{ padding: '2px 6px', background: 'rgba(200,168,110,0.1)', borderRadius: 4, color: '#c8a86e', textTransform: 'capitalize' }}>
                      {content.type}
                    </span>
                    {(() => {
                      let qCount = 0;
                      if (content.questions) {
                        if (Array.isArray(content.questions)) {
                          qCount = content.questions.length;
                        } else if (typeof content.questions === 'string') {
                          try {
                            const parsed = JSON.parse(content.questions);
                            qCount = Array.isArray(parsed) ? parsed.length : 0;
                          } catch {
                            qCount = 0;
                          }
                        }
                      }
                      return qCount > 0 && <span style={{ marginLeft: 8 }}>· {qCount} questions</span>;
                    })()}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => openEdit(content)} style={{
                    padding: '6px 14px',
                    background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 6,
                    color: '#888',
                    fontSize: 13,
                    cursor: 'pointer',
                  }}>
                    Edit
                  </button>
                  <button onClick={() => setConfirmDelete(content)} style={{
                    padding: '6px 14px',
                    background: 'transparent',
                    border: '1px solid rgba(224,112,112,0.3)',
                    borderRadius: 6,
                    color: '#e07070',
                    fontSize: 13,
                    cursor: 'pointer',
                  }}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 200, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: 20, overflow: 'auto' }} onClick={() => setShowModal(false)}>
          <div style={{ background: '#1a1a1e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, maxWidth: 600, width: '100%', marginTop: 40, marginBottom: 40 }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontFamily: "'Cormorant Garamond', serif", fontSize: 24, color: '#f0ebe0', fontWeight: 400 }}>
                {editingContent ? 'Edit' : 'Add'} {CONTENT_TYPES.find(c => c.type === contentType)?.label}
              </h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: '#555', fontSize: 24, cursor: 'pointer' }}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ padding: 24, maxHeight: 'calc(100vh - 200px)', overflow: 'auto' }}>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#555', marginBottom: 8 }}>Title *</label>
                  <input type="text" value={formData.title} onChange={e => setFormData(d => ({ ...d, title: e.target.value }))} required style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#e8e4dc', fontSize: 14, fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box' }} />
                </div>

                {editingContent && formData.url && (
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#555', marginBottom: 8 }}>Current Content</label>
                    {contentType === 'image' && (
                      <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <img src={getFullUrl(formData.url)} alt="Preview" style={{ width: '100%', maxHeight: 200, objectFit: 'contain', background: '#000' }} />
                      </div>
                    )}
                    {contentType === 'video' && (
                      <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', background: '#000' }}>
                        <video src={getFullUrl(formData.url)} controls style={{ width: '100%', maxHeight: 200 }} />
                      </div>
                    )}
                    {contentType === 'file' && (
                      <div style={{ padding: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#c8a86e" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                          <div>
                            <div style={{ fontSize: 14, color: '#e8e4dc' }}>{formData.url.split('/').pop()}</div>
                          </div>
                        </div>
                        {formData.url.toLowerCase().endsWith('.pdf') ? (
                          <iframe 
                            src={getFullUrl(formData.url)} 
                            style={{ width: '100%', height: 400, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
                            title="PDF Preview"
                          />
                        ) : (
                          <button 
                            onClick={() => window.open(getFullUrl(formData.url), '_blank')}
                            style={{ padding: '10px 16px', background: 'rgba(200,168,110,0.1)', border: '1px solid rgba(200,168,110,0.3)', borderRadius: 8, color: '#c8a86e', cursor: 'pointer', fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}
                          >
                            Open File in New Tab
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {contentType === 'link' && (
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#555', marginBottom: 8 }}>URL *</label>
                    <input type="url" value={formData.url} onChange={e => setFormData(d => ({ ...d, url: e.target.value }))} placeholder="https://..." style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#e8e4dc', fontSize: 14, fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box' }} />
                  </div>
                )}

                {contentType === 'test' && (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <label style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#555' }}>Questions ({questions.length})</label>
                      <button type="button" onClick={addQuestion} style={{ padding: '6px 12px', background: 'rgba(200,168,110,0.1)', border: '1px solid rgba(200,168,110,0.3)', borderRadius: 6, color: '#c8a86e', fontSize: 12, cursor: 'pointer' }}>
                        + Add Question
                      </button>
                    </div>
                    {questions.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: 20, background: 'rgba(255,255,255,0.02)', borderRadius: 8, color: '#555' }}>
                        No questions yet. Click "Add Question" to create one.
                      </div>
                    ) : (
                      questions.map((q, i) => (
                        <QuestionEditor
                          key={i}
                          question={q}
                          index={i}
                          onChange={(updated) => updateQuestion(i, updated)}
                          onDelete={() => deleteQuestion(i)}
                        />
                      ))
                    )}
                    <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
                      <label style={{ fontSize: 13, color: '#888' }}>Passing Grade:</label>
                      <input
                        type="number"
                        value={passingGrade}
                        onChange={e => setPassingGrade(parseInt(e.target.value) || 0)}
                        min={0}
                        max={100}
                        style={{ width: 80, padding: '8px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#e8e4dc', fontSize: 14, fontFamily: "'DM Sans', sans-serif", textAlign: 'center' }}
                      />
                      <span style={{ fontSize: 13, color: '#888' }}>%</span>
                    </div>
                  </div>
                )}

                {contentType !== 'link' && contentType !== 'test' && (
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#555', marginBottom: 8 }}>
                      {editingContent ? 'File (optional - select to replace)' : 'File *'}
                    </label>
                    {editingContent && formData.url && (
                      <div style={{ marginBottom: 8, padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 6, fontSize: 12, color: '#888', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                        Current file: {formData.url.split('/').pop()}
                      </div>
                    )}
                    <input type="file" onChange={e => setFile(e.target.files[0])} accept={contentType === 'image' ? 'image/*' : contentType === 'video' ? 'video/*' : '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar,*'} style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.04)', border: '1px dashed rgba(255,255,255,0.2)', borderRadius: 8, color: '#888', fontSize: 14, fontFamily: "'DM Sans', sans-serif", cursor: 'pointer' }} />
                    {file && <div style={{ marginTop: 8, fontSize: 12, color: '#c8a86e' }}>New file selected: {file.name}</div>}
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#555', marginBottom: 8 }}>Description</label>
                  <textarea value={formData.description} onChange={e => setFormData(d => ({ ...d, description: e.target.value }))} rows={2} style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#e8e4dc', fontSize: 14, fontFamily: "'DM Sans', sans-serif", resize: 'vertical', boxSizing: 'border-box' }} />
                </div>
              </div>
              <div style={{ padding: '20px 24px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '10px 20px', borderRadius: 8, fontSize: 14, cursor: 'pointer', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#888', fontFamily: "'DM Sans', sans-serif" }}>Cancel</button>
                <button type="submit" disabled={saving} style={{ padding: '10px 20px', borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: 'pointer', border: 'none', background: 'linear-gradient(135deg, #c8a86e, #b4915a)', color: '#0c0c0e', fontFamily: "'DM Sans', sans-serif", opacity: saving ? 0.5 : 1 }}>
                  {saving ? 'Saving...' : (editingContent ? 'Update' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={() => setConfirmDelete(null)}>
          <div style={{ background: '#1a1a1e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, maxWidth: 400, width: '100%', padding: 24, textAlign: 'center' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 8px', color: '#f0ebe0', fontWeight: 500 }}>Delete Content?</h3>
            <p style={{ margin: '0 0 20px', color: '#888', fontSize: 14 }}>Are you sure you want to delete "{confirmDelete.title}"?</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button onClick={() => setConfirmDelete(null)} style={{ padding: '10px 20px', borderRadius: 8, fontSize: 14, cursor: 'pointer', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: '#888', fontFamily: "'DM Sans', sans-serif" }}>Cancel</button>
              <button onClick={handleDelete} style={{ padding: '10px 20px', borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: 'pointer', border: 'none', background: '#e07070', color: '#fff', fontFamily: "'DM Sans', sans-serif" }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </FormateurLayout>
  );
}
