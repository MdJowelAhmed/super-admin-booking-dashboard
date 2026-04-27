import { useMemo, useState } from 'react'
import { formatCurrency, formatCompactNumber } from '@/utils/formatters'
import { StatCard } from './StatCard'
import { SuperAdminPlatformChart } from './SuperAdminPlatformChart'
import {
  defaultChartYear,
  getPlatformOverviewYearOptions,
  type SuperAdminPlatformChartPoint,
} from './dashboardData'
import {
  CircleDollarSign,
  Users,
  Home,
  Building2,
} from 'lucide-react'
import { useAppSelector } from '@/redux/hooks'
import { UserRole } from '@/types/roles'
import {
  useGetDashboardOverviewPlatformQuery,
  useGetDashboardOverviewStatsQuery,
  type DashboardStatMetric,
} from '@/redux/api/dashboardOverviewApi'

function signedStatChange(metric: DashboardStatMetric): number {
  const c = Math.abs(Number(metric.change) || 0)
  return metric.changeType === 'decrease' ? -c : c
}

const EMPTY_PLATFORM_CHART: SuperAdminPlatformChartPoint[] = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
].map((month) => ({ month, users: 0, hosts: 0, businesses: 0 }))

export default function Dashboard() {
  const { user } = useAppSelector((state) => state.auth)
  const isSuperAdmin = user?.role === UserRole.SUPER_ADMIN

  const platformYearOptions = useMemo(() => getPlatformOverviewYearOptions(), [])
  const [selectedYear, setSelectedYear] = useState(() => {
    const y = String(new Date().getFullYear())
    return platformYearOptions.includes(y) ? y : platformYearOptions[0] ?? defaultChartYear
  })

  const { data: statsRes, isFetching: statsLoading } =
    useGetDashboardOverviewStatsQuery(undefined, { skip: !isSuperAdmin })

  const { data: platformRes, isFetching: platformLoading } =
    useGetDashboardOverviewPlatformQuery(
      { year: selectedYear },
      { skip: !isSuperAdmin }
    )

  const superAdminChartData = useMemo((): SuperAdminPlatformChartPoint[] => {
    const rows = platformRes?.data
    if (!rows?.length) return EMPTY_PLATFORM_CHART
    return rows.map((r) => ({
      month: r.month,
      users: r.users ?? 0,
      hosts: r.hosts ?? 0,
      businesses: r.businesses ?? 0,
    }))
  }, [platformRes?.data])

  const stats = useMemo(() => {
    if (!isSuperAdmin) return []
    const d = statsRes?.data
    if (!d) return []

    return [
      {
        title: 'Total Users',
        value: formatCompactNumber(d.totalUsers.value),
        change: signedStatChange(d.totalUsers),
        icon: Users,
        description: 'vs last month',
      },
      {
        title: 'Total Host',
        value: formatCompactNumber(d.totalHosts.value),
        change: signedStatChange(d.totalHosts),
        icon: Home,
        description: 'vs last month',
      },
      {
        title: 'Total Business',
        value: formatCompactNumber(d.totalBusiness.value),
        change: signedStatChange(d.totalBusiness),
        icon: Building2,
        description: 'vs last month',
      },
      {
        title: 'Total Revenue',
        value: formatCurrency(d.totalRevenue.value),
        change: signedStatChange(d.totalRevenue),
        icon: CircleDollarSign,
        description: 'vs last month',
      },
    ]
  }, [isSuperAdmin, statsRes?.data])

  if (!isSuperAdmin) {
    return <div className="text-sm text-muted-foreground">No dashboard data for this role.</div>
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsLoading && stats.length === 0
          ? Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-[140px] rounded-xl border bg-muted/40 animate-pulse"
              />
            ))
          : stats.map((stat, index) => (
              <StatCard key={stat.title} {...stat} index={index} />
            ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <div className="col-span-12 relative">
          {platformLoading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-background/60 text-sm text-muted-foreground">
              Loading chart…
            </div>
          )}
          <SuperAdminPlatformChart
            chartData={superAdminChartData}
            yearOptions={platformYearOptions}
            selectedYear={selectedYear}
            onYearChange={setSelectedYear}
          />
        </div>
      </div>
    </div>
  )
}
