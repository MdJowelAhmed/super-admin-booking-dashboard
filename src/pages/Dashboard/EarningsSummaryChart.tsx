import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts'
import { motion } from 'framer-motion'
import { years, type ChartDataPoint } from './dashboardData'

interface EarningsSummaryChartProps {
    chartData: ChartDataPoint[]
    selectedYear: string
    onYearChange: (year: string) => void
}


const generateTicks = (max: number) => {
    if (max === 0) return [0, 25, 50, 75, 100];

    // Calculate a nice step size
    // We want 5 intervals (0 to max split 4 times) so 5 ticks total including 0
    const roughStep = max / 10;

    // Round step to a "nice" number (like 10, 20, 25, 50, 100 etc)
    const magnitude = Math.pow(10, Math.floor(Math.log10(roughStep)));
    const normalizedStep = roughStep / magnitude;

    let niceStep;
    if (normalizedStep <= 1) niceStep = 1;
    else if (normalizedStep <= 2) niceStep = 2;
    else if (normalizedStep <= 2.5) niceStep = 2.5;
    else if (normalizedStep <= 5) niceStep = 5;
    else if (normalizedStep <= 10) niceStep = 10;
    else niceStep = 10;

    const step = niceStep * magnitude;

    const ticks = [];
    for (let i = 0; i <= 10; i++) {
        ticks.push(i * step);
    }
    return ticks;
};

const strKFormatter = (num: number) => {
    if (num > 999) {
        return (num / 1000).toFixed(0) + 'k'
    }
    return num.toString()
}

const CHART_GREEN = '#70B72B'

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="relative rounded-md bg-[#364355] px-3 py-1.5 text-sm font-medium text-white shadow-lg">
                <p>{strKFormatter(payload[0].value)}</p>
                <div className="absolute bottom-0 left-1/2 h-2 w-2 -translate-x-1/2 translate-y-1/2 rotate-45 bg-[#364355]" />
            </div>
        )
    }
    return null
}

export function EarningsSummaryChart({ chartData, selectedYear, onYearChange }: EarningsSummaryChartProps) {

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
        >
            <Card className="border-0 shadow-md">
                <CardHeader className="pb-2">
                    <div className="flex items-center justify-between gap-4">
                        <CardTitle className="text-lg font-bold text-card-foreground">Sales Overview</CardTitle>
                        <Select value={selectedYear} onValueChange={onYearChange}>
                            <SelectTrigger className="h-9 w-[100px] shrink-0 border-border bg-background text-sm font-medium text-card-foreground">
                                <SelectValue placeholder="Year" />
                            </SelectTrigger>
                            <SelectContent>
                                {years.map((year) => (
                                    <SelectItem key={year} value={year}>
                                        {year}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent className="pt-2">
                    <div className="h-[350px] w-full sm:h-[480px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                                data={chartData}
                                margin={{ top: 12, right: 8, left: 4, bottom: 4 }}
                            >
                                <defs>
                                    <linearGradient id="salesAreaGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor={CHART_GREEN} stopOpacity={0.45} />
                                        <stop offset="55%" stopColor={CHART_GREEN} stopOpacity={0.12} />
                                        <stop offset="100%" stopColor={CHART_GREEN} stopOpacity={0.02} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid
                                    strokeDasharray="4 4"
                                    vertical={false}
                                    horizontal
                                    stroke="#E5E7EB"
                                />
                                <XAxis
                                    dataKey="month"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#6B7280', fontSize: 12 }}
                                    dy={8}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#6B7280', fontSize: 12 }}
                                    tickFormatter={(value) => strKFormatter(value)}
                                    allowDataOverflow={false}
                                    domain={[0, 'dataMax']}
                                    ticks={generateTicks(Math.max(...chartData.map((d) => d.revenue), 1))}
                                />
                                <Tooltip content={<CustomTooltip />} cursor={{ stroke: CHART_GREEN, strokeWidth: 1, strokeDasharray: '4 4' }} />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke={CHART_GREEN}
                                    strokeWidth={2.5}
                                    fill="url(#salesAreaGradient)"
                                    dot={false}
                                    activeDot={{ r: 5, fill: CHART_GREEN, stroke: '#fff', strokeWidth: 2 }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}
