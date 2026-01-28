'use client'

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { supabase } from '@/lib/supabase-client'
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  ShoppingCart,
  Download,
  RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/useToast'

// Components
import KPICards from './components/KPICards'
import SalesVelocityChart from './components/SalesVelocityChart'
import RegionalHeatmap from './components/RegionalHeatmap'
import AISummary from './components/AISummary'
import ExportButton from './components/ExportButton'

export default function DashboardPage() {
  const { toast } = useToast()
  const [timeRange, setTimeRange] = useState('last_30_days')
  const [forecastEnabled, setForecastEnabled] = useState(false)

  // Fetch sales data
  const { data: salesData, isLoading, refetch } = useQuery({
    queryKey: ['sales', timeRange],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      const { data, error } = await supabase
        .from('sales')
        .select('*')
        .eq('user_id', user?.id)
        .gte('date', getDateRange(timeRange))
        .order('date', { ascending: true })

      if (error) throw error
      return data
    }
  })

  // KPI Calculations
  const calculateKPIs = () => {
    if (!salesData) return null
    
    const totalRevenue = salesData.reduce((sum, sale) => sum + sale.amount, 0)
    const avgOrderValue = totalRevenue / salesData.length
    const uniqueCustomers = new Set(salesData.map(s => s.customer)).size
    
    // Calculate growth (simplified)
    const currentPeriod = salesData.slice(-15)
    const previousPeriod = salesData.slice(-30, -15)
    const currentRevenue = currentPeriod.reduce((sum, s) => sum + s.amount, 0)
    const previousRevenue = previousPeriod.reduce((sum, s) => sum + s.amount, 0)
    const growth = previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0

    return {
      revenue: totalRevenue,
      growth,
      avgOrderValue,
      uniqueCustomers,
      totalTransactions: salesData.length
    }
  }

  const kpis = calculateKPIs()

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
            Sales Intelligence Dashboard
          </h1>
          <p className="text-gray-400 mt-2">Real-time insights & predictive analytics for 2026</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => refetch()}
            className="border-blue-500/30 hover:bg-blue-500/10"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <ExportButton data={salesData} />
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="flex gap-2 mb-6">
        {['last_7_days', 'last_30_days', 'last_quarter', 'ytd'].map((range) => (
          <Button
            key={range}
            variant={timeRange === range ? "default" : "outline"}
            onClick={() => setTimeRange(range)}
            className={timeRange === range ? "bg-blue-600" : "border-gray-700"}
          >
            {range.replace('_', ' ')}
          </Button>
        ))}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 bg-gray-800" />
          ))
        ) : (
          <KPICards kpis={kpis} />
        )}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Sales Velocity Chart */}
        <Card className="lg:col-span-2 bg-gray-900 border-gray-800">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Sales Velocity</CardTitle>
                <CardDescription>Current vs Previous Period Performance</CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setForecastEnabled(!forecastEnabled)}
                className={forecastEnabled ? "bg-blue-500/20" : ""}
              >
                {forecastEnabled ? "Hide Forecast" : "Show 3-Month Forecast"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <SalesVelocityChart 
              data={salesData} 
              forecastEnabled={forecastEnabled}
            />
          </CardContent>
        </Card>

        {/* Regional Heatmap */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle>Regional Performance</CardTitle>
            <CardDescription>Sales distribution by geography</CardDescription>
          </CardHeader>
          <CardContent>
            <RegionalHeatmap data={salesData} />
          </CardContent>
        </Card>
      </div>

      {/* AI Insights Section */}
      <Card className="bg-gradient-to-br from-gray-900 to-blue-950/30 border-blue-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse" />
            AI-Powered Insights
          </CardTitle>
          <CardDescription>Natural language analysis of your sales data</CardDescription>
        </CardHeader>
        <CardContent>
          <AISummary salesData={salesData} />
        </CardContent>
      </Card>
    </div>
  )
}

function getDateRange(range: string): string {
  const now = new Date()
  switch (range) {
    case 'last_7_days':
      now.setDate(now.getDate() - 7)
      break
    case 'last_30_days':
      now.setDate(now.getDate() - 30)
      break
    case 'last_quarter':
      now.setMonth(now.getMonth() - 3)
      break
    case 'ytd':
      now.setMonth(0, 1)
      break
  }
  return now.toISOString()
}