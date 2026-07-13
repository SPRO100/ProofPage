'use client'

import { useMemo, useState } from 'react'
import { filterMetricPoints, type MetricPeriod } from '@/lib/metrics/chart'
import styles from './metric-chart.module.css'

export type ChartPoint = { id: string; value: number; measured_at: string }

export function MetricChart({ points, locale = 'en' }: { points: ChartPoint[]; locale?: 'en' | 'ru' }) {
  const [period, setPeriod] = useState<MetricPeriod>('30d')
  const filtered = useMemo(() => filterMetricPoints(points, period), [period, points])

  const values = filtered.map((p) => Number(p.value))
  const min = Math.min(...values, 0)
  const max = Math.max(...values, 1)
  const range = Math.max(max - min, 1)
  const coords = filtered.map((p, i) => ({ ...p, x: filtered.length === 1 ? 50 : (i / (filtered.length - 1)) * 100, y: 88 - ((Number(p.value) - min) / range) * 72 }))
  const polyline = coords.map((p) => `${p.x},${p.y}`).join(' ')
  const area = coords.length ? `M ${coords.map((p) => `${p.x} ${p.y}`).join(' L ')} L ${coords.at(-1)?.x} 92 L ${coords[0].x} 92 Z` : ''

  return <div className={styles.wrap}>
    <div className={styles.periods} aria-label={locale === 'ru' ? 'Период графика' : 'Chart period'}>{(['7d','30d','12m'] as MetricPeriod[]).map((p) => <button type="button" key={p} className={p === period ? styles.active : ''} onClick={() => setPeriod(p)}>{p === '7d' ? (locale === 'ru' ? '7 дней' : '7 days') : p === '30d' ? (locale === 'ru' ? '30 дней' : '30 days') : (locale === 'ru' ? '12 месяцев' : '12 months')}</button>)}</div>
    {coords.length === 0 ? <div className={styles.empty}>{locale === 'ru' ? 'Нет данных за выбранный период' : 'No data for this period'}</div> : <svg className={styles.chart} viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-label={locale === 'ru' ? 'Динамика показателя' : 'Metric trend'}>
      <path d={area} fill="#FEDF89" opacity=".42"/><polyline points={polyline} fill="none" stroke="#FF5858" strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round"/>
      {coords.map((p) => <circle key={p.id} cx={p.x} cy={p.y} r="1.8" fill="#151B31"><title>{new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(new Date(p.measured_at))}: {Number(p.value).toLocaleString(locale)}</title></circle>)}
    </svg>}
  </div>
}
