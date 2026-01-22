import { useEffect, useState } from 'react'
import { useMenuStore } from '@/stores/menu.store'
import { MenuItemsTable } from '@/components/admin/MenuItemsTable'
import { MenuItemDialog } from '@/components/admin/MenuItemDialog'
import { CategoriesPanel } from '@/components/admin/CategoriesPanel'
import { AppButton } from '@/components/ui'
import type { MenuItem } from '@/types'

export function AdminMenuPage() {
  const { items, categories, isLoading, fetchMenu, fetchCategories } = useMenuStore()
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)

  useEffect(() => {
    fetchMenu()
    fetchCategories()
  }, [fetchMenu, fetchCategories])

  const handleAddItem = () => {
    setSelectedItem(null)
    setIsDialogOpen(true)
  }

  const handleEditItem = (item: MenuItem) => {
    setSelectedItem(item)
    setIsDialogOpen(true)
  }

  const filteredItems = selectedCategoryId
    ? items.filter((item) => item.categoryId === selectedCategoryId)
    : items

  return (
    <div className="menu-admin-page">
      <div className="menu-admin-page__header">
        <h1 className="menu-admin-page__title">ניהול תפריט</h1>
        <AppButton variant="primary" onClick={handleAddItem}>
          + הוסף פריט
        </AppButton>
      </div>

      <div className="menu-admin-page__content">
        <aside className="menu-admin-page__sidebar">
          <CategoriesPanel
            categories={categories}
            selectedId={selectedCategoryId}
            onSelect={setSelectedCategoryId}
          />
        </aside>

        <main className="menu-admin-page__main">
          {isLoading ? (
            <div className="menu-admin-page__loading">
              <div className="spinner" />
              <p>טוען תפריט...</p>
            </div>
          ) : (
            <MenuItemsTable
              items={filteredItems}
              onEdit={handleEditItem}
            />
          )}
        </main>
      </div>

      {isDialogOpen && (
        <MenuItemDialog
          item={selectedItem}
          categories={categories}
          onClose={() => setIsDialogOpen(false)}
        />
      )}
    </div>
  )
}
