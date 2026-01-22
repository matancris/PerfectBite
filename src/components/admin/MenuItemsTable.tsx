import type { MenuItem } from '@/types'
import { formatCurrency } from '@/utils/formatters'
import { AppButton, AppBadge, Icon } from '@/components/ui'
import { useMenuStore } from '@/stores/menu.store'
import { useToast } from '@/hooks/useToast'

interface MenuItemsTableProps {
  items: MenuItem[]
  onEdit: (item: MenuItem) => void
}

export function MenuItemsTable({ items, onEdit }: MenuItemsTableProps) {
  const deleteItem = useMenuStore((state) => state.deleteItem)
  const { showSuccess, showError } = useToast()

  const handleDelete = async (item: MenuItem) => {
    if (!confirm(`האם למחוק את "${item.name}"?`)) return

    try {
      await deleteItem(item.id)
      showSuccess('הפריט נמחק בהצלחה')
    } catch {
      showError('שגיאה במחיקת הפריט')
    }
  }

  if (items.length === 0) {
    return (
      <div className="menu-items-table menu-items-table--empty">
        <p>אין פריטים בתפריט</p>
      </div>
    )
  }

  return (
    <div className="menu-items-table">
      <table>
        <thead>
          <tr>
            <th>תמונה</th>
            <th>שם</th>
            <th>מחיר</th>
            <th>סטטוס</th>
            <th>זמינות</th>
            <th>פעולות</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="menu-items-table__image"
                  />
                ) : (
                  <Icon name="restaurant" size="lg" className="menu-items-table__no-image" />
                )}
              </td>
              <td>{item.name}</td>
              <td>{formatCurrency(item.price)}</td>
              <td>
                <AppBadge variant={item.isActive ? 'success' : 'default'}>
                  {item.isActive ? 'פעיל' : 'לא פעיל'}
                </AppBadge>
              </td>
              <td>
                <AppBadge variant={item.availableAnytime ? 'info' : 'warning'}>
                  {item.availableAnytime ? 'תמיד' : 'אירועים'}
                </AppBadge>
              </td>
              <td>
                <div className="menu-items-table__actions">
                  <AppButton variant="ghost" size="sm" onClick={() => onEdit(item)}>
                    ערוך
                  </AppButton>
                  <AppButton
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(item)}
                  >
                    <Icon name="delete" size="sm" />
                  </AppButton>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
