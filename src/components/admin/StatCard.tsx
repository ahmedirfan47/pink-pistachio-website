import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  color?: 'pink' | 'pistachio' | 'gold' | 'charcoal';
}

const colorMap = {
  pink: 'bg-pink-100 text-pink-600',
  pistachio: 'bg-pistachio-100 text-pistachio-600',
  gold: 'bg-amber-100 text-amber-600',
  charcoal: 'bg-charcoal/10 text-charcoal',
};

export default function StatCard({ label, value, icon: Icon, trend, trendUp, color = 'pink' }: StatCardProps) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <div className={cn('flex h-11 w-11 items-center justify-center rounded-xl', colorMap[color])}>
          <Icon className="h-5 w-5" />
        </div>
        {trend && (
          <span className={cn('text-xs font-semibold', trendUp ? 'text-pistachio-600' : 'text-red-500')}>
            {trend}
          </span>
        )}
      </div>
      <p className="mt-4 font-display text-2xl font-bold text-charcoal">{value}</p>
      <p className="text-sm text-charcoal-600">{label}</p>
    </div>
  );
}