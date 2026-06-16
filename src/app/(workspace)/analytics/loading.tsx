import { cn } from '@/lib/utils';
import { dash } from '@/components/dashboard/theme';

export default function AnalyticsLoading() {
  return (
    <div className={cn('mx-auto max-w-5xl px-6 py-8', dash.bg)}>
      <div className="mb-8 h-8 w-48 animate-pulse rounded-lg bg-[#303134]" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className={cn('h-28 animate-pulse rounded-2xl', dash.elevated)} />
        ))}
      </div>
    </div>
  );
}
