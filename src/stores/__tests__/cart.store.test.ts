import { describe, it, expect, beforeEach } from 'vitest'
import { useCartStore } from '../cart.store'
import type { MenuItem } from '@/types'

const mockMenuItem: MenuItem = {
  id: 'item-1',
  businessId: 'business-1',
  name: 'Test Pizza',
  description: 'Delicious pizza',
  price: 50,
  isActive: true,
  availableAnytime: false,
  createdAt: new Date().toISOString(),
}

describe('Cart Store', () => {
  beforeEach(() => {
    // Reset store before each test
    useCartStore.setState({ items: [], eventId: null })
  })

  it('should add item to cart', () => {
    const { addItem } = useCartStore.getState()
    
    addItem(mockMenuItem, 1)
    
    const updatedItems = useCartStore.getState().items
    expect(updatedItems).toHaveLength(1)
    expect(updatedItems[0].name).toBe('Test Pizza')
    expect(updatedItems[0].quantity).toBe(1)
  })

  it('should increase quantity when adding same item', () => {
    const { addItem } = useCartStore.getState()
    
    addItem(mockMenuItem, 1)
    addItem(mockMenuItem, 2)
    
    const updatedItems = useCartStore.getState().items
    expect(updatedItems).toHaveLength(1)
    expect(updatedItems[0].quantity).toBe(3)
  })

  it('should remove item from cart', () => {
    const { addItem, removeItem } = useCartStore.getState()
    
    addItem(mockMenuItem, 1)
    const items = useCartStore.getState().items
    removeItem(items[0].id)
    
    expect(useCartStore.getState().items).toHaveLength(0)
  })

  it('should update item quantity', () => {
    const { addItem, updateQuantity } = useCartStore.getState()
    
    addItem(mockMenuItem, 1)
    const items = useCartStore.getState().items
    updateQuantity(items[0].id, 5)
    
    expect(useCartStore.getState().items[0].quantity).toBe(5)
  })

  it('should remove item when quantity is set to 0', () => {
    const { addItem, updateQuantity } = useCartStore.getState()
    
    addItem(mockMenuItem, 1)
    const items = useCartStore.getState().items
    updateQuantity(items[0].id, 0)
    
    expect(useCartStore.getState().items).toHaveLength(0)
  })

  it('should calculate total items', () => {
    const { addItem } = useCartStore.getState()
    
    addItem(mockMenuItem, 2)
    addItem({ ...mockMenuItem, id: 'item-2', name: 'Another Item' }, 3)
    
    expect(useCartStore.getState().getTotalItems()).toBe(5)
  })

  it('should calculate total price', () => {
    const { addItem } = useCartStore.getState()
    
    addItem(mockMenuItem, 2) // 50 * 2 = 100
    addItem({ ...mockMenuItem, id: 'item-2', price: 30 }, 3) // 30 * 3 = 90
    
    expect(useCartStore.getState().getTotalPrice()).toBe(190)
  })

  it('should clear cart', () => {
    const { addItem, clearCart } = useCartStore.getState()
    
    addItem(mockMenuItem, 2)
    clearCart()
    
    expect(useCartStore.getState().items).toHaveLength(0)
  })
})
