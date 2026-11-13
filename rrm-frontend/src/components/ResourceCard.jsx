import {Link} from 'react-router-dom';
import {formatPrice} from '../utils/format.js';

/**
 * Cardul unei resurse din catalog.
 * @param {{resource: Object, categoryName: ?string}} props
 * @return {JSX.Element}
 */
export default function ResourceCard({resource, categoryName}) {
  return (
    <Link to={`/resources/${resource.id}`} className="card resource-card">
      {categoryName && <span className="badge">{categoryName}</span>}
      <h3>{resource.name}</h3>
      <p className="muted resource-description">
        {resource.description || 'Fara descriere'}
      </p>
      <p className="resource-price">
        {formatPrice(resource.price_per_hour)} <span className="muted">/ ora</span>
      </p>
    </Link>
  );
}
