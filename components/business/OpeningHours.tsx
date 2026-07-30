import type { DayKey, OpeningHours as OpeningHoursType } from '@/types'
import { cn } from '@/utils/cn'
import { DAY_LABELS, DAY_ORDER, formatDayRanges } from '@/utils/opening-hours'

interface OpeningHoursProps {
  hours: OpeningHoursType
  /** Jour à mettre en évidence, calculé par la page (rendu déterministe). */
  todayKey?: DayKey
  className?: string
}

/** Tableau des horaires hebdomadaires, jour courant mis en évidence. */
export function OpeningHours({ hours, todayKey, className }: OpeningHoursProps) {
  return (
    <table className={cn('w-full text-sm', className)}>
      <caption className="sr-only">Horaires d’ouverture hebdomadaires</caption>
      <tbody>
        {DAY_ORDER.map((day) => {
          const ranges = hours[day]
          const isToday = day === todayKey
          const isClosed = ranges.length === 0

          return (
            <tr key={day} className={cn('border-b border-ink-100 last:border-0', isToday && 'bg-brand-50')}>
              <th
                scope="row"
                className={cn('py-2 pl-2 text-left font-medium', isToday ? 'text-brand-800' : 'text-ink-600')}
              >
                {DAY_LABELS[day]}
                {isToday && <span className="ml-1.5 text-xs font-normal text-brand-600">(aujourd’hui)</span>}
              </th>
              <td
                className={cn(
                  'py-2 pr-2 text-right tabular-nums',
                  isClosed ? 'text-ink-400' : isToday ? 'font-semibold text-brand-800' : 'text-ink-800',
                )}
              >
                {formatDayRanges(ranges)}
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
