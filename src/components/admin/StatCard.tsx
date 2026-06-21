import { type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label:    string;
  value:    string;
  icon:     LucideIcon;
  trend?:   string;
  trendUp?: boolean;
  color?:   'pink' | 'pistachio' | 'gold' | 'charcoal';
}

export default function StatCard({
  label, value, icon: Icon, trend, trendUp, color = 'pink',
}: StatCardProps) {
  const styles = {
    pink:      { bg: 'bg-pink-50',           icon: 'text-pink-600'       },
    pistachio: { bg: 'bg-pistachio-50',       icon: 'text-pistachio-600'  },
    gold:      { bg: 'bg-amber-50',           icon: 'text-amber-600'      },
    charcoal:  { bg: 'bg-charcoal/5',         icon: 'text-charcoal'       },
  }[color];

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-charcoal-600">{label}</p>
          <p className="mt-1 font-display text-2xl font-bold text-charcoal">{value}</p>
          {trend && (
            <p className={cn('mt-1 text-xs font-medium', trendUp ? 'text-pistachio-600' : 'text-charcoal-600')}>
              {trend}
            </p>
          )}
        </div>
        <div className={cn('ml-4 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl', styles.bg)}>
          <Icon className={cn('h-6 w-6', styles.icon)} />
        </div>
      </div>
    </div>
  );
}