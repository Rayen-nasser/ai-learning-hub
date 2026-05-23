import { useState } from 'react';
import CardPaymentForm from './CardPaymentForm';

export default function PaymentModal({
  open,
  onClose,
  title = 'Secure Checkout',
  itemName = '',
  amount = 0,
  currency = 'DT',
  description = '',
  bankDetails = null,
  onPay,
  onPaymentSuccess,
  showCashMethod = false,
  processing = false,
  success = false,
}) {
  const [paymentMethod, setPaymentMethod] = useState('carte');
  const [cardValue, setCardValue] = useState({ number: '', holder: '', expiry: '', cvc: '' });
  const [cardErrors, setCardErrors] = useState({});
  const [proofFile, setProofFile] = useState(null);
  const [proofPreview, setProofPreview] = useState(null);
  const [error, setError] = useState('');

  const validateCard = () => {
    const errs = {};
    const digits = (cardValue.number || '').replace(/\s/g, '');
    if (digits.length < 16) errs.number = 'Enter a valid 16-digit card number';
    if (!(cardValue.holder || '').trim()) errs.holder = 'Cardholder name is required';
    const [mm, yy] = (cardValue.expiry || '').split('/').map(s => s?.trim());
    if (!mm || !yy || parseInt(mm) > 12 || parseInt(mm) < 1) errs.expiry = 'Enter a valid expiry date';
    if ((cardValue.cvc || '').replace(/\D/g, '').length < 3) errs.cvc = 'Enter a valid CVC';
    return errs;
  };

  const handleProofFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProofFile(file);
      setProofPreview(URL.createObjectURL(file));
    }
  };

  const handleConfirm = async () => {
    if (paymentMethod === 'carte') {
      const errs = validateCard();
      if (Object.keys(errs).length > 0) {
        setCardErrors(errs);
        return;
      }
    }

    setError('');
    try {
      await onPay(paymentMethod, cardValue, proofFile);
      onPaymentSuccess?.();
    } catch (err) {
      setError(err.response?.data?.message || 'Payment processing failed');
    }
  };

  const handleClose = () => {
    if (!processing) {
      setPaymentMethod('carte');
      setCardValue({ number: '', holder: '', expiry: '', cvc: '' });
      setCardErrors({});
      setProofFile(null);
      setProofPreview(null);
      setError('');
      onClose();
    }
  };

  if (!open) return null;

  return (
    <>
      <style>{`
        .pm-overlay {
          position: fixed; inset: 0; z-index: 1000;
          background: rgba(0,0,0,0.85); backdrop-filter: blur(8px);
          display: flex; align-items: center; justify-content: center;
          padding: 24px;
        }
        .pm-modal {
          width: 100%; max-width: 440px;
          background: var(--bg-card); border: 1px solid var(--border-main);
          border-radius: 20px; display: flex; flex-direction: column;
          max-height: 90vh;
        }
        .pm-header {
          padding: 24px 28px 20px; display: flex; align-items: center; justify-content: space-between;
          background: linear-gradient(135deg, #faf9f6, #f0eee8);
          border-bottom: 1px solid var(--border-main);
          flex-shrink: 0;
        }
        .pm-title { font-family: 'Cormorant Garamond', serif; font-size: 22px; font-weight: 400; color: var(--text-primary); margin: 0; }
        .pm-close { background: var(--bg-card); border: 1px solid var(--border-main); border-radius: 8px; width: 32px; height: 32px; color: var(--text-secondary); cursor: pointer; font-size: 20px; display: flex; align-items: center; justify-content: center; }
        .pm-close:hover { color: var(--text-primary); }
        .pm-body { padding: 28px; overflow-y: auto; flex: 1; min-height: 0; }
        .pm-course-info { text-align: center; margin-bottom: 20px; }
        .pm-course-title { font-size: 16px; color: var(--text-primary); margin-bottom: 4px; }
        .pm-course-desc { font-size: 12px; color: #555; margin-bottom: 8px; }
        .pm-course-price { font-family: 'Cormorant Garamond', serif; font-size: 32px; color: #b4915a; }
        .pm-divider { height: 1px; background: var(--border-main); margin: 20px 0; }
        .pm-method-section h4 { font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; color: var(--text-secondary); margin: 0 0 12px; }
        .pm-methods { display: flex; flex-direction: column; gap: 8px; }
        .pm-method { display: flex; align-items: center; gap: 12px; padding: 12px 16px; border: 1px solid var(--border-main); border-radius: 10px; cursor: pointer; transition: all 0.2s; }
        .pm-method:hover { border-color: rgba(180,145,90,0.3); }
        .pm-method.selected { border-color: #b4915a; background: rgba(180,145,90,0.08); }
        .pm-method input { display: none; }
        .pm-method-icon { font-size: 20px; }
        .pm-method span:last-child { font-size: 14px; color: var(--text-primary); }
        .pm-error { padding: 10px 14px; background: rgba(198,40,40,0.08); border: 1px solid rgba(198,40,40,0.25); border-radius: 8px; color: #c62828; font-size: 13px; margin: 16px 0; }
        .pm-pay-btn { width: 100%; padding: 14px; background: linear-gradient(135deg, #b4915a, #c8a86e); border: none; border-radius: 10px; color: #ffffff; font-size: 15px; font-weight: 500; cursor: pointer; margin-top: 20px; display: flex; align-items: center; justify-content: center; gap: 8px; }
        .pm-pay-btn:hover { opacity: 0.9; }
        .pm-pay-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .pm-cancel-btn { width: 100%; padding: 12px; background: transparent; border: 1px solid var(--border-main); border-radius: 10px; color: var(--text-secondary); font-size: 14px; cursor: pointer; margin-top: 10px; }
        .pm-cancel-btn:hover { border-color: var(--text-primary); color: var(--text-primary); }
        .pm-virement-section { margin-top: 16px; }
        .pm-bank-details { background: var(--bg-main); border-radius: 10px; padding: 14px; margin-bottom: 16px; }
        .pm-bank-row { display: flex; justify-content: space-between; align-items: center; padding: 6px 0; font-size: 13px; }
        .pm-bank-row + .pm-bank-row { border-top: 1px solid var(--border-main); }
        .pm-bank-label { color: var(--text-secondary); }
        .pm-bank-value { color: var(--text-primary); font-weight: 500; }
        .pm-bank-rib { font-family: monospace; font-size: 12px; letter-spacing: 0.05em; }
        .pm-proof-upload { }
        .pm-proof-dropzone { display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; min-height: 100px; border: 1px dashed var(--border-main); border-radius: 10px; cursor: pointer; transition: border-color 0.2s, background 0.2s; overflow: hidden; }
        .pm-proof-dropzone:hover { border-color: #b4915a; background: rgba(180,145,90,0.03); }
        .pm-proof-placeholder { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 24px; color: var(--text-secondary); font-size: 13px; }
        .pm-proof-hint { font-size: 11px; opacity: 0.6; }
        .pm-proof-preview { width: 100%; max-height: 160px; object-fit: contain; display: block; }
        .pm-proof-remove { position: absolute; top: 4px; right: 4px; width: 24px; height: 24px; border-radius: 50%; border: none; background: rgba(0,0,0,0.6); color: #fff; font-size: 16px; cursor: pointer; display: flex; align-items: center; justify-content: center; line-height: 1; }
        .pm-success { text-align: center; padding: 20px 0; }
        .pm-success-icon { width: 60px; height: 60px; border-radius: 50%; background: rgba(74,168,125,0.15); border: 2px solid #4aa87d; color: #4aa87d; font-size: 28px; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; }
        .pm-success h3 { font-family: 'Cormorant Garamond', serif; font-size: 22px; color: var(--text-primary); margin: 0 0 8px; }
        .pm-success p { font-size: 14px; color: var(--text-secondary); margin: 0; }
        @keyframes pm-bounce { 0% { transform: scale(0.8); } 50% { transform: scale(1.05); } 100% { transform: scale(1); } }
        @keyframes pm-fadein { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <div className="pm-overlay" onClick={(e) => e.target === e.currentTarget && handleClose()}>
        <div className="pm-modal">
          <div className="pm-header">
            <h2 className="pm-title">{title}</h2>
            {!success && !processing && (
              <button className="pm-close" onClick={handleClose}>×</button>
            )}
          </div>

          <div className="pm-body">
            {success ? (
              <div className="pm-success" style={{ animation: 'pm-bounce 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
                <div className="pm-success-icon">✓</div>
                <h3>Payment Confirmed!</h3>
                {description && <p>{description}</p>}
              </div>
            ) : (
              <>
                <div className="pm-course-info">
                  {itemName && <div className="pm-course-title">{itemName}</div>}
                  <div className="pm-course-price">{amount} <span style={{ fontSize: 14, fontWeight: 300 }}>{currency}</span></div>
                </div>

                <div className="pm-divider" />

                <div className="pm-method-section">
                  <h4>Select Payment Method</h4>
                  <div className="pm-methods">
                    <label className={`pm-method ${paymentMethod === 'carte' ? 'selected' : ''}`}>
                      <input type="radio" name="payment" value="carte" checked={paymentMethod === 'carte'} onChange={() => setPaymentMethod('carte')} />
                      <span className="pm-method-icon">💳</span>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>Credit or Debit Card</span>
                        <span style={{ fontSize: '11px', color: '#555' }}>Instant access granted</span>
                      </div>
                    </label>
                    <label className={`pm-method ${paymentMethod === 'virement' ? 'selected' : ''}`}>
                      <input type="radio" name="payment" value="virement" checked={paymentMethod === 'virement'} onChange={() => setPaymentMethod('virement')} />
                      <span className="pm-method-icon">🏛️</span>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>Bank Transfer</span>
                        <span style={{ fontSize: '11px', color: '#555' }}>Upload receipt — manual verification</span>
                      </div>
                    </label>
                    {showCashMethod && (
                      <label className={`pm-method ${paymentMethod === 'especes' ? 'selected' : ''}`}>
                        <input type="radio" name="payment" value="especes" checked={paymentMethod === 'especes'} onChange={() => setPaymentMethod('especes')} />
                        <span className="pm-method-icon">💵</span>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>Cash</span>
                          <span style={{ fontSize: '11px', color: '#555' }}>Pay at the centre</span>
                        </div>
                      </label>
                    )}
                  </div>
                </div>

                {paymentMethod === 'carte' && (
                  <CardPaymentForm
                    value={cardValue}
                    onChange={setCardValue}
                    errors={cardErrors}
                    onErrorChange={setCardErrors}
                  />
                )}

                {paymentMethod === 'virement' && (
                  <div className="pm-virement-section" style={{ animation: 'pm-fadein 0.3s ease' }}>
                    {bankDetails && (
                      <div className="pm-bank-details">
                        <h4 style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)', margin: '0 0 10px' }}>Transfer to</h4>
                        <div className="pm-bank-row">
                          <span className="pm-bank-label">Account Holder</span>
                          <span className="pm-bank-value">{bankDetails.accountHolder || '—'}</span>
                        </div>
                        <div className="pm-bank-row">
                          <span className="pm-bank-label">Bank</span>
                          <span className="pm-bank-value">{bankDetails.bankName || '—'}</span>
                        </div>
                        <div className="pm-bank-row">
                          <span className="pm-bank-label">RIB</span>
                          <span className="pm-bank-value pm-bank-rib">{bankDetails.rib}</span>
                        </div>
                      </div>
                    )}
                    <div className="pm-proof-upload">
                      <h4 style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)', margin: '0 0 10px' }}>Upload Transfer Receipt</h4>
                      <label className="pm-proof-dropzone">
                        {proofPreview ? (
                          <div style={{ position: 'relative' }}>
                            <img src={proofPreview} alt="Receipt preview" className="pm-proof-preview" />
                            <button type="button" className="pm-proof-remove" onClick={(e) => { e.preventDefault(); setProofFile(null); setProofPreview(null); }}>×</button>
                          </div>
                        ) : (
                          <div className="pm-proof-placeholder">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                            <span>Click to upload receipt image</span>
                            <span className="pm-proof-hint">PNG, JPG or PDF accepted</span>
                          </div>
                        )}
                        <input type="file" accept="image/*,application/pdf" onChange={handleProofFileChange} style={{ display: 'none' }} />
                      </label>
                    </div>
                  </div>
                )}

                {paymentMethod === 'especes' && (
                  <div className="pm-virement-section" style={{ animation: 'pm-fadein 0.3s ease' }}>
                    <div className="pm-proof-upload">
                      <h4 style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)', margin: '0 0 10px' }}>Upload Payment Receipt</h4>
                      <label className="pm-proof-dropzone">
                        {proofPreview ? (
                          <div style={{ position: 'relative' }}>
                            <img src={proofPreview} alt="Receipt preview" className="pm-proof-preview" />
                            <button type="button" className="pm-proof-remove" onClick={(e) => { e.preventDefault(); setProofFile(null); setProofPreview(null); }}>×</button>
                          </div>
                        ) : (
                          <div className="pm-proof-placeholder">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                            <span>Click to upload receipt image</span>
                            <span className="pm-proof-hint">PNG, JPG or PDF accepted</span>
                          </div>
                        )}
                        <input type="file" accept="image/*,application/pdf" onChange={handleProofFileChange} style={{ display: 'none' }} />
                      </label>
                    </div>
                  </div>
                )}

                {error && <div className="pm-error">{error}</div>}

                <button className="pm-pay-btn" onClick={handleConfirm} disabled={processing}>
                  {processing ? (
                    <><div className="fd-inline-spin" style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid rgba(0,0,0,0.1)', borderTopColor: '#000', animation: 'pm-spin 0.7s linear infinite' }} /> Processing...</>
                  ) : (
                    <>{paymentMethod === 'virement' || paymentMethod === 'especes' ? 'Submit & Await Confirmation' : `Pay ${amount} ${currency}`}</>
                  )}
                </button>

                <button className="pm-cancel-btn" onClick={handleClose} disabled={processing}>
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pm-spin { to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
}
