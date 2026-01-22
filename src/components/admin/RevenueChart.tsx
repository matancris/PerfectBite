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
    return date.toLocaleDateString('he-IL', { weekday: 'short', day: 'numeric' })
  }

  if (data.length === 0) {
    return (
      <div className="revenue-chart revenue-chart--empty">
        <p>אין נתונים להצגה</p>
      </div>
    )
  }

  return (
    <div className="revenue-chart">
      <div className="revenue-chart__bars">
        {data.map((item) => {
          const heightPercent = (item.amount / maxAmount) * 100
          return (
            <div key={item.date} className="revenue-chart__bar-container">
              <div
                className="revenue-chart__bar"
                style={{ height: `${heightPercent}%` }}
                title={`₪${item.amount.toFixed(0)}`}
              >
                {item.amount > 0 && (
                  <span className="revenue-chart__bar-value">
                    ₪{item.amount.toFixed(0)}
                  </span>
                )}
              </div>
              <span className="revenue-chart__label">{formatDate(item.date)}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
