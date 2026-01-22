import { Icon } from '@/components/ui'

interface StatCardProps {
  title: string
  value: string | number
  icon: string
  trend?: number
}

export function StatCard({ title, value, icon, trend }: StatCardProps) {
  const trendClass =
    trend !== undefined
      ? trend > 0
        ? 'stat-card__trend--up'
        : trend < 0
          ? 'stat-card__trend--down'
          : ''
      : ''

  return (
    <div className="stat-card">
      <div className="stat-card__icon">
        <Icon name={icon} size="lg" />
      </div>
      <div className="stat-card__content">
        <h3 className="stat-card__title">{title}</h3>
        <p className="stat-card__value">{value}</p>
        {trend !== undefined && trend !== 0 && (
          <span className={`stat-card__trend ${trendClass}`}>
            <Icon name={trend > 0 ? 'trending_up' : 'trending_down'} size="sm" />
            {Math.abs(trend)}%
          </span>
        )}
      </div>
    </div>
  )
}
