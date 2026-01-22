import type { MenuCategory } from '@/types'

interface CategoriesPanelProps {
  categories: MenuCategory[]
  selectedId: string | null
  onSelect: (id: string | null) => void
}

export function CategoriesPanel({ categories, selectedId, onSelect }: CategoriesPanelProps) {
  return (
    <div className="categories-panel">
      <h3 className="categories-panel__title">קטגוריות</h3>
      <ul className="categories-panel__list">
        <li>
          <button
            className={`categories-panel__item ${selectedId === null ? 'categories-panel__item--active' : ''}`}
            onClick={() => onSelect(null)}
          >
            הכל
          </button>
        </li>
        {categories.map((category) => (
          <li key={category.id}>
            <button
              className={`categories-panel__item ${selectedId === category.id ? 'categories-panel__item--active' : ''}`}
              onClick={() => onSelect(category.id)}
            >
              {category.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
