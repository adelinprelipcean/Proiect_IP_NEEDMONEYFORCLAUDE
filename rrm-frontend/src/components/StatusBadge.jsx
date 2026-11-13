const STATUS_LABELS = {
  PENDING: 'In asteptare',
  CONFIRMED: 'Confirmata',
  CANCELLED: 'Anulata',
  COMPLETED: 'Finalizata',
};

/**
 * @param {{status: string}} props
 * @return {JSX.Element}
 */
export default function StatusBadge({status}) {
  return (
    <span className={`badge status-${status.toLowerCase()}`}>
      {STATUS_LABELS[status] || status}
    </span>
  );
}
