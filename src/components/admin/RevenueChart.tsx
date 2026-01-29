import { useMemo } from 'react'

interface RevenueChartProps {
  data: { date: string; amount: number }[]
}

export function RevenueChart({ data }: RevenueChartProps) {
  const maxAmount = useMemo(() => {
    return Math.max(...data.map((d) => d.amount), 1)
  }, [data])

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('he-IL', { weekday: 'short', day: 'numeric', month: 'numeric' })
  }

  // Calculate grid lines (4 horizontal lines)
  const gridLines = useMemo(() => {
    const lines = []
    for (let i = 0; i <= 4; i++) {
      const value = (maxAmount / 4) * i
      lines.push({
        percentage: (i / 4) * 100,
        value: Math.round(value)
      })
    }
    return lines.reverse()
  }, [maxAmount])

  if (data.length === 0) {
    return (
      <div className="revenue-chart revenue-chart--empty">
        <div className="revenue-chart__empty-state">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p>אין נתונים להצגה</p>
        </div>
      </div>
    )
  }

  return (
    <div className="revenue-chart">
      <div className="revenue-chart__grid">
        {gridLines.map((line, index) => (
          <div 
            key={index} 
            className="revenue-chart__grid-line"
            style={{ bottom: `${line.percentage}%` }}
          >
            <span className="revenue-chart__grid-label">₪{line.value}</span>
            <div className="revenue-chart__grid-line-border" />
          </div>
        ))}
      </div>
      
      <div className="revenue-chart__bars">
        {data.map((item, index) => {
          const heightPercent = (item.amount / maxAmount) * 100
          const hasData = item.amount > 0
          
          return (
            <div key={item.date} className="revenue-chart__bar-container">
              <div className="revenue-chart__bar-wrapper">
                <div
                  className={`revenue-chart__bar ${hasData ? 'revenue-chart__bar--has-data' : ''}`}
                  style={{ 
                    height: `${Math.max(heightPercent, 2)}%`,
                    animationDelay: `${index * 0.1}s`
                  }}
                  title={`${formatDate(item.date)}: ₪${item.amount.toFixed(0)}`}
                >
                  {hasData && (
                    <span className="revenue-chart__bar-value">
                      ₪{item.amount.toFixed(0)}
                    </span>
                  )}
                </div>
              </div>
              <span className="revenue-chart__label">{formatDate(item.date)}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
