import {useCallback, useEffect, useState} from 'react';
import {useOutletContext} from 'react-router-dom';
import {getToken} from '../api/client.js';
import {cancelReservation, getTeamReservations} from '../api/reservations.js';
import StatusBadge from '../components/StatusBadge.jsx';
import {formatInterval, formatPrice} from '../utils/format.js';

const FILTERS = [
  {value: '', label: 'Toate'},
  {value: 'PENDING', label: 'In asteptare'},
  {value: 'CONFIRMED', label: 'Confirmate'},
  {value: 'CANCELLED', label: 'Anulate'},
];

/**
 * Rezervarile echipei utilizatorului logat.
 * @return {JSX.Element}
 */
export default function TeamReservationsPage() {
  const {user} = useOutletContext();
  const [status, setStatus] = useState('');
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [cancellingId, setCancellingId] = useState(null);

  const loadReservations = useCallback(() => {
    setLoading(true);
    return getTeamReservations(status)
        .then((data) => {
          setReservations(data);
          setError('');
        })
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false));
  }, [status]);

  useEffect(() => {
    if (getToken()) {
      loadReservations();
    }
  }, [loadReservations]);

  const canCancel = (reservation) =>
    user?.role === 'LEAD' &&
    reservation.status !== 'CANCELLED' &&
    new Date(reservation.start_time) > new Date();

  const handleCancel = async (reservation) => {
    const confirmed = window.confirm(
        `Anulezi rezervarea pentru ${reservation.resource_name}?`);
    if (!confirmed) {
      return;
    }
    setCancellingId(reservation.id);
    setSuccess('');
    try {
      await cancelReservation(reservation.id);
      setSuccess('Rezervarea a fost anulata. Echipa a fost notificata.');
      await loadReservations();
    } catch (e) {
      setError(e.message);
    } finally {
      setCancellingId(null);
    }
  };

  if (!getToken()) {
    return (
      <p className="message">
        Trebuie sa fii autentificat ca sa vezi rezervarile echipei.
      </p>
    );
  }

  return (
    <section>
      <h1>Rezervarile echipei</h1>
      <div className="category-filter">
        {FILTERS.map((filter) => (
          <button
            key={filter.value}
            className={status === filter.value ? 'chip chip-active' : 'chip'}
            onClick={() => setStatus(filter.value)}
          >
            {filter.label}
          </button>
        ))}
      </div>
      {error && <p className="message message-error">{error}</p>}
      {success && <p className="message message-success">{success}</p>}
      {loading ? (
        <p className="muted">Se incarca rezervarile...</p>
      ) : reservations.length === 0 ? (
        <p className="message">Echipa nu are rezervari.</p>
      ) : (
        <div className="card table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Resursa</th>
                <th>Interval</th>
                <th>Pret final</th>
                <th>Stare</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((reservation) => (
                <tr key={reservation.id}>
                  <td>{reservation.resource_name}</td>
                  <td>
                    {formatInterval(reservation.start_time,
                        reservation.end_time)}
                  </td>
                  <td>
                    {reservation.final_price != null ?
                      formatPrice(reservation.final_price) :
                      '-'}
                    {reservation.discount > 0 && (
                      <span className="muted"> (-{reservation.discount}%)</span>
                    )}
                  </td>
                  <td><StatusBadge status={reservation.status} /></td>
                  <td className="table-actions">
                    {canCancel(reservation) && (
                      <button
                        className="btn btn-danger"
                        disabled={cancellingId === reservation.id}
                        onClick={() => handleCancel(reservation)}
                      >
                        {cancellingId === reservation.id ?
                          'Se anuleaza...' :
                          'Anuleaza'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {user && user.role !== 'LEAD' && (
        <p className="muted">Doar Team Lead-ul poate anula rezervari.</p>
      )}
    </section>
  );
}
