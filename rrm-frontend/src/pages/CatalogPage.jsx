import {useEffect, useMemo, useState} from 'react';
import {useSearchParams} from 'react-router-dom';
import {getCategories, getResources} from '../api/resources.js';
import CategoryFilter from '../components/CategoryFilter.jsx';
import ResourceCard from '../components/ResourceCard.jsx';

/**
 * Catalogul de resurse, cu filtrare dupa categorie (?category=ID).
 * @return {JSX.Element}
 */
export default function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedId = searchParams.get('category') ?
    Number(searchParams.get('category')) :
    null;

  const [categories, setCategories] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getCategories().then(setCategories).catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    setLoading(true);
    getResources(selectedId)
        .then((data) => {
          setResources(data);
          setError('');
        })
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false));
  }, [selectedId]);

  const categoryNames = useMemo(
      () => Object.fromEntries(categories.map((c) => [c.id, c.name])),
      [categories],
  );

  const handleSelect = (categoryId) => {
    setSearchParams(categoryId == null ? {} : {category: categoryId});
  };

  return (
    <section>
      <h1>Catalog resurse</h1>
      <CategoryFilter
        categories={categories}
        selectedId={selectedId}
        onSelect={handleSelect}
      />
      {error && <p className="message message-error">{error}</p>}
      {loading ? (
        <p className="muted">Se incarca resursele...</p>
      ) : resources.length === 0 ? (
        <p className="message">Nu exista resurse in aceasta categorie.</p>
      ) : (
        <div className="resource-grid">
          {resources.map((resource) => (
            <ResourceCard
              key={resource.id}
              resource={resource}
              categoryName={categoryNames[resource.category_id]}
            />
          ))}
        </div>
      )}
    </section>
  );
}
