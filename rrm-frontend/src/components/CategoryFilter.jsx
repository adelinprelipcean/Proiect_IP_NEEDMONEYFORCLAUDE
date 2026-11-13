/**
 * Butoanele de filtrare pe categorii din partea de sus a catalogului.
 * @param {{
 *   categories: !Array<{id: number, name: string}>,
 *   selectedId: ?number,
 *   onSelect: function(?number),
 * }} props
 * @return {JSX.Element}
 */
export default function CategoryFilter({categories, selectedId, onSelect}) {
  return (
    <div className="category-filter">
      <button
        className={selectedId == null ? 'chip chip-active' : 'chip'}
        onClick={() => onSelect(null)}
      >
        Toate
      </button>
      {categories.map((category) => (
        <button
          key={category.id}
          className={selectedId === category.id ? 'chip chip-active' : 'chip'}
          onClick={() => onSelect(category.id)}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
}
