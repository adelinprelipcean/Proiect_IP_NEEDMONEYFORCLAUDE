import {useEffect, useState} from 'react';
import {
  createMaintenance,
  getAffectedReservations,
} from '../api/maintenance.js';
import {formatInterval} from '../utils/format.js';
import StatusBadge from './StatusBadge.jsx';

/**
 * Dialogul in care adminul seteaza o perioada de mentenanta.
 * Inainte de salvare arata rezervarile care vor fi anulate.
 * @param {{
 *   resource: Object,
 *   onClose: function(),
 *   onSaved: function(Object),
 * }} props
 * @return {JSX.Element}
 */
export default function MaintenanceDialog({resource, onClose, onSaved}) {
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [reason, setReason] = useState('');
  const [affected, setAffected] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const intervalValid = startTime && endTime && endTime > startTime;

  // Recalculam rezervarile afectate cand se schimba intervalul.
  useEffect(() => {
    setAffected(null);
    if (!intervalValid) {
      return;
    }
    let active = true;
    const timer = setTimeout(() => {
      getAffectedReservations(resource.id, startTime, endTime)
          .then((data) => active && setAffected(data))
          .catch((e) => active && setError(e.message));
    }, 300);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [resource.id, startTime, endTime, intervalValid]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!intervalValid) {
      setError('Ora de sfarsit trebuie sa fie dupa ora de start.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const result = await createMaintenance(resource.id, {
        start_time: startTime,
        end_time: endTime,
        reason: reason.trim() || null,
      });
      onSaved(result);
    } catch (e) {
      setError(e.status === 405 ?
        'Salvarea mentenantei nu este inca disponibila in backend.' :
        e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="dialog-backdrop" onClick={onClose}>
      <form
        className="dialog"
        onClick={(event) => event.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <h2>Mentenanta: {resource.name}</h2>

        <div className="form-row">
          <label>
            Inceput
            <input
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
            />
          </label>
          <label>
            Sfarsit
            <input
              type="datetime-local"
              value={endTime}
              min={startTime || undefined}
              onChange={(e) => setEndTime(e.target.value)}
              required
            />
          </label>
        </div>
        <label>
          Motiv
          <input
            type="text"
            maxLength={255}
            placeholder="ex. update drivere, calibrare"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </label>

        {intervalValid && affected && (
          <div className="affected">
            {affected.length === 0 ? (
              <p className="muted">
                Nicio rezervare nu este afectata de aceasta perioada.
              </p>
            ) : (
              <>
                <p className="affected-warning">
                  {affected.length === 1 ?
                    '1 rezervare va fi anulata' :
                    `${affected.length} rezervari vor fi anulate`}
                  {' '}si echipele vor fi notificate:
                </p>
                <ul className="simple-list">
                  {affected.map((reservation) => (
                    <li key={reservation.id}>
                      {formatInterval(reservation.start_time,
                          reservation.end_time)}
                      {' '}&ndash; echipa #{reservation.team_id}{' '}
                      <StatusBadge status={reservation.status} />
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}

        {error && <p className="message message-error">{error}</p>}

        <div className="dialog-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Renunta
          </button>
          <button
            type="submit"
            className={affected?.length ? 'btn btn-danger' : 'btn'}
            disabled={saving || !intervalValid}
          >
            {saving ? 'Se salveaza...' : 'Salveaza mentenanta'}
          </button>
        </div>
      </form>
    </div>
  );
}
