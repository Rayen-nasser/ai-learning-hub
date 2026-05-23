import { useState } from 'react';

const formatCardNumber = (val) => {
  const digits = val.replace(/\D/g, '').slice(0, 16);
  return digits.replace(/(\d{4})/g, '$1 ').trim();
};

const formatExpiry = (val) => {
  const digits = val.replace(/\D/g, '').slice(0, 4);
  if (digits.length >= 3) return digits.slice(0, 2) + ' / ' + digits.slice(2);
  return digits;
};

const getCardBrand = (num) => {
  const n = num.replace(/\s/g, '');
  if (/^4/.test(n)) return 'visa';
  if (/^5[1-5]/.test(n) || /^2[2-7]/.test(n)) return 'mastercard';
  if (/^3[47]/.test(n)) return 'amex';
  return 'unknown';
};

export default function CardPaymentForm({ value, onChange, errors, onErrorChange }) {
  const [flipped, setFlipped] = useState(false);
  const brand = getCardBrand(value?.number || '');

  const set = (field, raw) => {
    let formatted = raw;
    if (field === 'number') formatted = formatCardNumber(raw);
    if (field === 'expiry') formatted = formatExpiry(raw);
    if (field === 'cvc') formatted = raw.replace(/\D/g, '').slice(0, 4);
    onChange?.({ ...value, [field]: formatted });
    onErrorChange?.({ ...errors, [field]: '' });
  };

  const numDisplay = (value?.number || '•••• •••• •••• ••••').padEnd(19, '•');

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ perspective: '1000px', marginBottom: 20 }}>
        <div style={{
          width: '100%', aspectRatio: '1.586', borderRadius: 14, position: 'relative',
          transformStyle: 'preserve-3d',
          transition: 'transform 0.6s cubic-bezier(0.4,0.2,0.2,1)',
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}>
          {/* Front */}
          <div style={{
            position: 'absolute', inset: 0, borderRadius: 14, backfaceVisibility: 'hidden',
            background: brand === 'mastercard'
              ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'
              : 'linear-gradient(135deg, #1c1c1e 0%, #2a1f3d 50%, #1a0a2e 100%)',
            padding: '22px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            overflow: 'hidden',
          }}>
            <div style={{ position:'absolute', inset:0, background:'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 60%)', pointerEvents:'none', borderRadius:14 }} />
            <div style={{ position:'absolute', right:-30, top:-30, width:160, height:160, borderRadius:'50%', background:'rgba(255,255,255,0.04)' }} />
            <div style={{ position:'absolute', right:20, top:20, width:80, height:80, borderRadius:'50%', background:'rgba(255,255,255,0.03)' }} />

            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', zIndex:1 }}>
              <div style={{ width:40, height:30, borderRadius:5, background:'linear-gradient(135deg,#d4a843,#f5d47a,#b8892e)', boxShadow:'inset 0 0 4px rgba(0,0,0,0.3)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <div style={{ width:26, height:20, borderRadius:3, border:'1px solid rgba(0,0,0,0.25)', display:'grid', gridTemplateColumns:'1fr 1fr', gap:2, padding:3 }}>
                  {[0,1,2,3].map(i=><div key={i} style={{ background:'rgba(0,0,0,0.2)', borderRadius:1 }} />)}
                </div>
              </div>
              {brand === 'visa' && (
                <div style={{ fontFamily:'serif', fontSize:24, fontStyle:'italic', fontWeight:700, color:'#fff', letterSpacing:'-1px', textShadow:'0 1px 3px rgba(0,0,0,0.5)' }}>VISA</div>
              )}
              {brand === 'mastercard' && (
                <div style={{ display:'flex', position:'relative', width:44, height:28 }}>
                  <div style={{ width:28, height:28, borderRadius:'50%', background:'#eb001b', opacity:0.9, position:'absolute', left:0 }} />
                  <div style={{ width:28, height:28, borderRadius:'50%', background:'#f79e1b', opacity:0.9, position:'absolute', left:16 }} />
                </div>
              )}
              {brand === 'unknown' && (
                <div style={{ width:36, height:24, border:'1px solid rgba(255,255,255,0.2)', borderRadius:4 }} />
              )}
            </div>

            <div style={{ fontFamily:'monospace', fontSize:19, color:'rgba(255,255,255,0.9)', letterSpacing:'0.18em', zIndex:1, textShadow:'0 1px 3px rgba(0,0,0,0.5)' }}>
              {numDisplay}
            </div>

            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', zIndex:1 }}>
              <div>
                <div style={{ fontSize:8, color:'rgba(255,255,255,0.4)', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:2 }}>Card Holder</div>
                <div style={{ fontSize:13, color:'rgba(255,255,255,0.85)', fontWeight:500, letterSpacing:'0.05em', textTransform:'uppercase' }}>
                  {value?.holder || 'FULL NAME'}
                </div>
              </div>
              <div style={{ textAlign:'right' }}>
                <div style={{ fontSize:8, color:'rgba(255,255,255,0.4)', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:2 }}>Expires</div>
                <div style={{ fontSize:13, color:'rgba(255,255,255,0.85)', fontFamily:'monospace', letterSpacing:'0.08em' }}>
                  {value?.expiry || 'MM / YY'}
                </div>
              </div>
            </div>
          </div>

          {/* Back */}
          <div style={{
            position: 'absolute', inset: 0, borderRadius: 14, backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            background: 'linear-gradient(135deg, #1c1c1e 0%, #2a1f3d 100%)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            overflow: 'hidden',
          }}>
            <div style={{ width:'100%', height:44, background:'#111', marginTop:24, marginBottom:16 }} />
            <div style={{ padding:'0 20px', display:'flex', flexDirection:'column', gap:6 }}>
              <div style={{ height:36, background:'rgba(255,255,255,0.08)', borderRadius:4, display:'flex', alignItems:'center', justifyContent:'flex-end', paddingRight:12 }}>
                <span style={{ fontFamily:'monospace', fontSize:15, color:'rgba(255,255,255,0.7)', letterSpacing:'0.15em' }}>{value?.cvc || '•••'}</span>
              </div>
              <div style={{ fontSize:9, color:'rgba(255,255,255,0.3)', textAlign:'right', letterSpacing:'0.05em' }}>CVC / CVV</div>
            </div>
          </div>
        </div>
      </div>

      {/* Input Fields */}
      <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
        <div>
          <label style={{ fontSize:11, color:'#777', letterSpacing:'0.08em', textTransform:'uppercase', display:'block', marginBottom:6 }}>Card Number</label>
          <div style={{ position:'relative' }}>
            <input
              type="text" inputMode="numeric"
              placeholder="1234 5678 9012 3456"
              style={{
                width:'100%', padding:'12px 44px 12px 16px',
                background:'var(--bg-card)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8,
                color:'var(--text-primary)', fontSize:14, fontFamily:'DM Sans, sans-serif',
                outline:'none', boxSizing:'border-box',
                ...(errors?.number ? { borderColor:'#e07070' } : {}),
              }}
              value={value?.number || ''}
              maxLength={19}
              onChange={e => set('number', e.target.value)}
            />
            <div style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', fontSize:18 }}>
              {brand==='visa' && <span style={{fontFamily:'serif',fontStyle:'italic',fontWeight:700,fontSize:14,color:'#1a1fe0'}}>VISA</span>}
              {brand==='mastercard' && <span style={{fontSize:14}}>🔴🟡</span>}
              {brand==='unknown' && <svg width="18" height="14" viewBox="0 0 24 18" fill="none" stroke="#555" strokeWidth="1.5"><rect x="1" y="1" width="22" height="16" rx="2"/><line x1="1" y1="7" x2="23" y2="7"/></svg>}
            </div>
          </div>
          {errors?.number && <div style={{ fontSize:11, color:'#e07070', marginTop:4 }}>{errors.number}</div>}
        </div>

        <div>
          <label style={{ fontSize:11, color:'#777', letterSpacing:'0.08em', textTransform:'uppercase', display:'block', marginBottom:6 }}>Cardholder Name</label>
          <input
            type="text" placeholder="As it appears on the card"
            style={{
              width:'100%', padding:'12px 16px',
              background:'var(--bg-card)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8,
              color:'var(--text-primary)', fontSize:14, fontFamily:'DM Sans, sans-serif',
              outline:'none', boxSizing:'border-box',
              ...(errors?.holder ? { borderColor:'#e07070' } : {}),
            }}
            value={value?.holder || ''}
            onChange={e => set('holder', e.target.value.toUpperCase())}
          />
          {errors?.holder && <div style={{ fontSize:11, color:'#e07070', marginTop:4 }}>{errors.holder}</div>}
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
          <div>
            <label style={{ fontSize:11, color:'#777', letterSpacing:'0.08em', textTransform:'uppercase', display:'block', marginBottom:6 }}>Expiry Date</label>
            <input
              type="text" inputMode="numeric" placeholder="MM / YY"
              style={{
                width:'100%', padding:'12px 16px',
                background:'var(--bg-card)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8,
                color:'var(--text-primary)', fontSize:14, fontFamily:'DM Sans, sans-serif',
                outline:'none', boxSizing:'border-box',
                ...(errors?.expiry ? { borderColor:'#e07070' } : {}),
              }}
              value={value?.expiry || ''}
              maxLength={7}
              onChange={e => set('expiry', e.target.value)}
            />
            {errors?.expiry && <div style={{ fontSize:11, color:'#e07070', marginTop:4 }}>{errors.expiry}</div>}
          </div>
          <div>
            <label style={{ fontSize:11, color:'#777', letterSpacing:'0.08em', textTransform:'uppercase', display:'block', marginBottom:6 }}>CVC / CVV</label>
            <input
              type="text" inputMode="numeric" placeholder="123"
              style={{
                width:'100%', padding:'12px 16px',
                background:'var(--bg-card)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8,
                color:'var(--text-primary)', fontSize:14, fontFamily:'DM Sans, sans-serif',
                outline:'none', boxSizing:'border-box',
                ...(errors?.cvc ? { borderColor:'#e07070' } : {}),
              }}
              value={value?.cvc || ''}
              maxLength={4}
              onChange={e => set('cvc', e.target.value)}
              onFocus={() => setFlipped(true)}
              onBlur={() => setFlipped(false)}
            />
            {errors?.cvc && <div style={{ fontSize:11, color:'#e07070', marginTop:4 }}>{errors.cvc}</div>}
          </div>
        </div>

        <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:11, color:'#555', marginTop:4 }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4aa87d" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          Your card details are encrypted and never stored
        </div>
      </div>
    </div>
  );
}