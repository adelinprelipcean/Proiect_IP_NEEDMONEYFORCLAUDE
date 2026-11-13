import {useEffect, useState} from 'react';
import {useOutletContext} from 'react-router-dom';
import {getResources} from '../api/resources.js';
import MaintenanceDialog from '../components/MaintenanceDialog.jsx';
import {formatPrice} from '../utils/format.js';

/**
 * Zona de admin: lista resurselor si setarea perioadelor de mentenanta.
 * @return {JSX.Element}
 */
export default function AdminMaintenancePage() {
  const {user, loading} = useOutletContext();
  const [resources, setResources] = useState([]);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    getResources().then(setResources).catch((e) => setError(e.message));
  }, []);

  if (loading) {
    return <p className="muted">Se incarca...</p>;
  }
  if (user?.role !== 'ADMIN') {
    return (
      <p className="message">
        Aceasta pagina este disponibila doar administratorilor.
      </p>
    );
  }

  const handleSaved = (result) => {
    const cancelled = result?.cancelled_reservations ??
      result?.cancelledReservations ?? 0;
    setSuccess(`Mentenanta pentru ${selected.name} a fost salvata. ` +
      `Rezervari anulate: ${cancelled}.`);
    setSelected(null);
  };

  return (
    <section>
      <h1>Mentenanta resurse</h1>
      <p className="muted">
        Alege resursa pe care vrei sa o scoti din uz pentru o perioada.
      </p>
      {error && <p className="message message-error">{error}</p>}
      {success && <p className="message message-success">{success}</p>}
      <div className="card table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>Resursa</th>
              <th>Pret / ora</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {resources.map((resource) => (
              <tr key={resource.id}>
                <td>{resource.name}</td>
                <td>{formatPrice(resource.price_per_hour)}</td>
                <td className="table-actions">
                  <button
                    className="btn btn-secondary"
                    onClick={() => {
                      setSuccess('');
                      setSelected(resource);
                    }}
                  >
                    Seteaza mentenanta
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {selected && (
        <MaintenanceDialog
          resource={selected}
          onClose={() => setSelected(null)}
          onSaved={handleSaved}
        />
      )}
    </section>
  );
}
