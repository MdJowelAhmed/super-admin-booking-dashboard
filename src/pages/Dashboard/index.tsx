import { useState, useMemo } from 'react'
import { formatCurrency, formatCompactNumber } from '@/utils/formatters'
import { StatCard } from './StatCard'
import { SuperAdminPlatformChart } from './SuperAdminPlatformChart'
import {
  superAdminPlatformYearlyData,
  superAdminDashboardStats,
  defaultChartYear,
} from './dashboardData'
import {
  CircleDollarSign,
  Users,
  Home,
  Building2,
} from 'lucide-react'
import { useAppSelector } from '@/redux/hooks'
import { UserRole } from '@/types/roles'

export default function Dashboard() {
  const { user } = useAppSelector((state) => state.auth)
  const isSuperAdmin = user?.role === UserRole.SUPER_ADMIN

  const [selectedYear, setSelectedYear] = useState(defaultChartYear)

  const superAdminChartData = useMemo(
    () => superAdminPlatformYearlyData[selectedYear] ?? superAdminPlatformYearlyData[defaultChartYear],
    [selectedYear]
  )

  const stats = useMemo(() => {
    if (!isSuperAdmin) return []
    const s = superAdminDashboardStats
    return [
      {
        title: 'Total Users',
        value: formatCompactNumber(s.totalUsers),
        change: s.changeUsers,
        icon: Users,
        description: 'vs last month',
      },
      {
        title: 'Total Host',
        value: formatCompactNumber(s.totalHosts),
        change: s.changeHosts,
        icon: Home,
        description: 'vs last month',
      },
      {
        title: 'Total Business',
        value: formatCompactNumber(s.totalBusinesses),
        change: s.changeBusinesses,
        icon: Building2,
        description: 'vs last month',
      },
      {
        title: 'Total Revenue',
        value: formatCurrency(s.totalRevenue),
        change: s.changeRevenue,
        icon: CircleDollarSign,
        description: 'vs last month',
      },
    ]
  }, [isSuperAdmin])

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <StatCard key={stat.title} {...stat} index={index} />
        ))}
      </div>

      {/* Chart: full width for super admin (platform metrics) */}
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="col-span-12">
          <SuperAdminPlatformChart
            chartData={superAdminChartData}
            selectedYear={selectedYear}
            onYearChange={setSelectedYear}
          />
        </div>
      </div>

      {/* <div>
        <RecentActivityCard />
      </div> */}
    </div>
  )
}
