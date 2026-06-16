import { AnalyticsLoader } from '@/components/dashboard/loading/DashboardLoaders';
import { cn } from '@/lib/utils';
import { dash } from '@/components/dashboard/theme';

export default function AnalyticsLoading() {
  return (
    <div className={cn('relative mx-auto min-h-0 flex-1 overflow-y-auto px-6 py-8 max-w-5xl', dash.bg)}>
      <AnalyticsLoader />
    </div>
  );
}
