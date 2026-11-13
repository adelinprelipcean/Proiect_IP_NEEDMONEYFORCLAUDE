import {useEffect, useState} from 'react';
import {Link, useParams} from 'react-router-dom';
import {
  getCategories,
  getResource,
  getResourceMaintenance,
} from '../api/resources.js';
import {formatInterval, formatPrice} from '../utils/format.js';

/**
 * Pagina de detalii a unei resurse.
 * @return {JSX.Element}
 */
export default function ResourceDetailsPage() {
  const {resourceId} = useParams();
  const [resource, setResource] = useState(null);
  const [categoryName, setCategoryName] = useState('');
  const [maintenance, setMaintenance] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    setError('');
    Promise.all([
      getResource(resourceId),
      getCategories(),
      getResourceMaintenance(resourceId),
    ])
        .then(([resourceData, categories, maintenanceData]) => {
          setResource(resourceData);
          const category = categories.find(
              (c) => c.id === resourceData.category_id);
          setCategoryName(category ? category.name : '');
          const now = new Date();
          setMaintenance(
              maintenanceData.filter((m) => new Date(m.end_time) > now));
        })
        .catch((e) => setError(e.status === 404 ?
          'Resursa nu exista.' :
          e.message));
  }, [resourceId]);

  if (error) {
    return (
      <section>
        <Link to="/">&larr; Inapoi la catalog</Link>
        <p className="message message-error">{error}</p>
      </section>
    );
  }
  if (!resource) {
    return <p className="muted">Se incarca...</p>;
  }

  return (
    <section className="details">
      <Link to="/">&larr; Inapoi la catalog</Link>
      <div className="card details-card">
        <div className="details-header">
          <div>
            {categoryName && <span className="badge">{categoryName}</span>}
            <h1>{resource.name}</h1>
          </div>
          <div className="details-price">
            {formatPrice(resource.price_per_hour)}
            <span className="muted"> / ora</span>
          </div>
        </div>
        <p>{resource.description || 'Fara descriere'}</p>
        <p className="muted">
          Echipele cu vechime primesc reducere de loyalty la rezervare.
        </p>
      </div>

      <div className="card">
        <h2>Perioade de mentenanta programate</h2>
        {maintenance.length === 0 ? (
          <p className="muted">Nu exista mentenanta programata.</p>
        ) : (
          <ul className="simple-list">
            {maintenance.map((m) => (
              <li key={m.id}>
                <strong>{formatInterval(m.start_time, m.end_time)}</strong>
                {m.reason && <span className="muted"> &ndash; {m.reason}</span>}
              </li>
            ))}
          </ul>
        )}
      </div>
      {/* NEED-27: aici vine calendarul resursei + dialogul de rezervare */}
    </section>
  );
}
