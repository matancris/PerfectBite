import { useEffect } from 'react'
import { useBusinessStore } from '@/stores/business.store'

export function useDocumentTitle(pageTitle?: string) {
  const business = useBusinessStore((state) => state.business)
  const businessName = business?.name || 'הזמנות אוכל'

  useEffect(() => {
    document.title = pageTitle 
      ? `${pageTitle} | ${businessName}`
      : businessName
  }, [pageTitle, businessName])
}
