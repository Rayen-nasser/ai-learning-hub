/** Status color map — extend as your API adds new statuses */
const STATUS_META = {
  // Inscriptions
  pending:   { label: 'Pending',   color: '#c8a86e', bg: 'rgba(200,168,110,.1)' },
  confirmed: { label: 'Confirmed', color: '#4aa87d', bg: 'rgba(74,168,125,.1)'  },
  cancelled: { label: 'Cancelled', color: '#e07070', bg: 'rgba(220,110,110,.1)' },
  completed: { label: 'Completed', color: '#6a9fd8', bg: 'rgba(106,159,216,.1)' },
  // Paiements
  paid:      { label: 'Paid',      color: '#4aa87d', bg: 'rgba(74,168,125,.1)'  },
  failed:    { label: 'Failed',    color: '#e07070', bg: 'rgba(220,110,110,.1)' },
  refunded:  { label: 'Refunded',  color: '#6a9fd8', bg: 'rgba(106,159,216,.1)' },
};

/**
 * Pill badge for enrollment or payment status.
 *
 * @param {string} status  - e.g. 'pending' | 'confirmed' | 'paid'
 *
 * @example
 * <StatusBadge status={inscription.statut} />
 */
function StatusBadge({ status }) {
  const meta = STATUS_META[status] ?? STATUS_META.pending;
  return (
    <span
      style={{
        padding: '3px 10px', borderRadius: 20,
        fontSize: 10, letterSpacing: '0.08em',
        textTransform: 'uppercase', fontWeight: 500,
        color: meta.color, background: meta.bg,
      }}
    >
      {meta.label}
    </span>
  );
}

export default StatusBadge;