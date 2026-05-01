import { useState } from 'react';
import centreService from '../services/centres';

export default function FixDocumentsModal({ centre, onClose, onRefresh }) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [files, setFiles] = useState({});

  const handleFileChange = (e) => {
    const { name, files: selectedFiles } = e.target;
    if (selectedFiles && selectedFiles[0]) {
      setFiles(prev => ({ ...prev, [name]: selectedFiles[0] }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Object.keys(files).length === 0) {
      setError('Please select at least one document to update.');
      return;
    }

    setSubmitting(true);
    setError('');

    const data = new FormData();
    Object.keys(files).forEach(key => data.append(key, files[key]));

    try {
      await centreService.updateDocuments(centre._id, data);
      onRefresh();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update documents.');
    } finally {
      setSubmitting(false);
    }
  };

  // Only show fields that are marked invalid or if the user wants to re-upload
  const docFields = [
    { key: 'registration', label: 'Trade Register', desc: 'Proof of legal entity registration' },
    { key: 'tax_id', label: 'Tax ID Card', desc: 'Your center\'s tax identification' },
    { key: 'identity', label: 'Manager ID', desc: 'Valid ID of the legal representative' },
    { key: 'authorization', label: 'Ministry Authorization', desc: 'Official permit to operate as a center' },
    { key: 'lease', label: 'Lease Agreement', desc: 'Proof of premises availability' },
  ];

  return (
    <div className="fd-modal-overlay">
      <style>{`
        .fd-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); backdrop-filter: blur(8px); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 20px; }
        .fd-modal { background: #1a1a1e; border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; width: 100%; max-width: 600px; max-height: 90vh; overflow-y: auto; box-shadow: 0 24px 64px rgba(0,0,0,0.5); }
        .fd-header { padding: 24px; border-bottom: 1px solid rgba(255,255,255,0.06); display: flex; justify-content: space-between; align-items: center; }
        .fd-header h2 { font-family: 'Cormorant Garamond', serif; font-size: 24px; color: #b4915a; }
        .fd-close { background: none; border: none; color: #555; cursor: pointer; font-size: 20px; }

        .fd-body { padding: 24px; }
        .fd-reason { background: rgba(224,112,112,0.1); border: 1px solid rgba(224,112,112,0.2); border-radius: 12px; padding: 16px; margin-bottom: 24px; color: #e07070; font-size: 14px; }
        .fd-reason strong { display: block; margin-bottom: 4px; text-transform: uppercase; font-size: 11px; letter-spacing: 0.05em; }

        .fd-doc-grid { display: flex; flex-direction: column; gap: 16px; }
        .fd-doc-item { display: flex; align-items: center; justify-content: space-between; padding: 16px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; }
        .fd-doc-info { display: flex; flex-direction: column; gap: 2px; }
        .fd-doc-label { font-size: 14px; color: #e8e4dc; font-weight: 500; }
        .fd-doc-desc { font-size: 12px; color: #555; }
        .fd-doc-status { font-size: 11px; margin-top: 4px; padding: 2px 6px; border-radius: 4px; display: inline-block; }
        .fd-status-invalid { background: rgba(224,112,112,0.1); color: #e07070; }
        .fd-status-valid { background: rgba(125,191,125,0.1); color: #7dbf7d; }

        .fd-file-btn { position: relative; padding: 8px 16px; background: rgba(180,145,90,0.1); border: 1px solid rgba(180,145,90,0.2); border-radius: 8px; color: #b4915a; font-size: 13px; font-weight: 500; cursor: pointer; }
        .fd-file-btn input { position: absolute; inset: 0; opacity: 0; cursor: pointer; }
        .fd-file-btn.selected { background: rgba(125,191,125,0.1); border-color: #7dbf7d; color: #7dbf7d; }

        .fd-footer { padding: 24px; border-top: 1px solid rgba(255,255,255,0.06); display: flex; justify-content: flex-end; gap: 12px; }
        .fd-btn-cancel { padding: 10px 20px; border-radius: 10px; background: none; border: 1px solid rgba(255,255,255,0.1); color: #888; cursor: pointer; }
        .fd-btn-submit { padding: 10px 24px; border-radius: 10px; background: #b4915a; color: #0c0c0e; font-weight: 600; border: none; cursor: pointer; display: flex; align-items: center; gap: 8px; }
        .fd-btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }

        .fd-spinner { width: 16px; height: 16px; border: 2px solid rgba(0,0,0,0.1); border-top-color: #000; border-radius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div className="fd-modal">
        <div className="fd-header">
          <h2>Fix Verification Documents</h2>
          <button className="fd-close" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="fd-body">
            {centre.adminMessage && (
              <div className="fd-reason">
                <strong>Rejection Reason:</strong>
                {centre.adminMessage}
              </div>
            )}

            <p style={{ color: '#aaa', fontSize: '14px', marginBottom: '20px' }}>
              Please re-upload the documents that were marked as invalid or missing.
            </p>

            <div className="fd-doc-grid">
              {docFields.map(doc => {
                // FIX: use d.type (not d.key) to match the API response field
                const existingDoc = centre.documents?.find(d => d.type === doc.key);
                const isInvalid = existingDoc?.status === 'invalid';
                const isSelected = !!files[doc.key];
                
                return (
                  <div 
                    key={doc.key} 
                    className="fd-doc-item"
                    style={isInvalid ? { borderColor: 'rgba(224,112,112,0.4)', background: 'rgba(224,112,112,0.04)' } : {}}
                  >
                    <div className="fd-doc-info">
                      <span className="fd-doc-label">
                        {isInvalid && <span style={{ marginRight: '6px' }}>⚠️</span>}
                        {doc.label}
                      </span>
                      <span className="fd-doc-desc">{doc.desc}</span>
                      {existingDoc?.adminNote && (
                        <span style={{ fontSize: '12px', color: '#e07070', marginTop: '4px' }}>
                          Admin note: {existingDoc.adminNote}
                        </span>
                      )}
                      {existingDoc && (
                        <span className={`fd-doc-status fd-status-${existingDoc.status}`}>
                          {existingDoc.status.toUpperCase()}
                        </span>
                      )}
                    </div>
                    
                    <div className={`fd-file-btn ${isSelected ? 'selected' : ''}`} style={isInvalid && !isSelected ? { borderColor: 'rgba(224,112,112,0.5)', color: '#e07070' } : {}}>
                      {isSelected ? files[doc.key].name : (isInvalid ? 'Re-upload ↑' : 'Select File')}
                      <input type="file" name={doc.key} accept=".pdf,image/*" onChange={handleFileChange} />
                    </div>
                  </div>
                );
              })}
            </div>

            {error && <div style={{ color: '#e07070', fontSize: '14px', marginTop: '16px', textAlign: 'center' }}>{error}</div>}
          </div>

          <div className="fd-footer">
            <button type="button" className="fd-btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="fd-btn-submit" disabled={submitting}>
              {submitting ? <><div className="fd-spinner" /> Updating...</> : 'Update Documents'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
