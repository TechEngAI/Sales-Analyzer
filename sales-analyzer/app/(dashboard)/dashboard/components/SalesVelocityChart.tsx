'use client'

import { useState, useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area } from 'recharts'
import { SalesRecord } from '@/lib/supabase-client'

interface SalesVelocityChartProps {
  data: SalesRecord[] | null
  forecastEnabled: boolean
}

export default function SalesVelocityChart({ data, forecastEnabled }: SalesVelocityChartProps) {
  const [view, setView] = useState<'revenue' | 'volume'>('revenue')

  const chartData = useMemo(() => {
    if (!data) return []

    // Group by day
    const grouped = data.reduce((acc, sale) => {
      const date = new Date(sale.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      if (!acc[date]) {
        acc[date] = { date, revenue: 0, volume: 0 }
      }
      acc[date].revenue += sale.amount
      acc[date].volume += 1
      return acc
    }, {} as Record<string, { date: string; revenue: number; volume: number }>)

    const result = Object.values(grouped)

    // Add forecast data if enabled
    if (forecastEnabled && result.length > 0) {
      const lastRevenue = result[result.length - 1].revenue
      const lastVolume = result[result.length - 1].volume
      const growthRate = 0.05 // 5% monthly growth assumption

      for (let i = 1; i <= 90; i += 7) { // Next 90 days, weekly points
        const forecastDate = new Date()
        forecastDate.setDate(forecastDate.getDate() + i)
        const dateStr = forecastDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        
        result.push({
          date: dateStr,
          revenue: lastRevenue * Math.pow(1 + growthRate, i / 30),
          volume: lastVolume * Math.pow(1 + growthRate * 0.8, i / 30)
        })
      }
    }

    return result
  }, [data, forecastEnabled])

  if (!data) return <div className="h-80 flex items-center justify-center text-gray-500">No data available</div>

  return (
    <div className="h-80">
      <div className="flex justify-end mb-4">
        <div className="inline-flex rounded-lg border border-gray-800 p-1">
          <button
            onClick={() => setView('revenue')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${view === 'revenue' ? 'bg-blue-600' : 'hover:bg-gray-800'}`}
          >
            Revenue
          </button>
          <button
            onClick={() => setView('volume')}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${view === 'volume' ? 'bg-blue-600' : 'hover:bg-gray-800'}`}
          >
            Volume
          </button>
        </div>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="date" 
            stroke="#9CA3AF"
            tick={{ fill: '#9CA3AF' }}
          />
          <YAxis 
            stroke="#9CA3AF"
            tick={{ fill: '#9CA3AF' }}
            tickFormatter={(value) => 
              view === 'revenue' ? `$${(value / 1000).toFixed(0)}k` : value.toString()
            }
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1F2937',
              border: '1px solid #374151',
              borderRadius: '6px'
            }}
            formatter={(value) => [
              view === 'revenue' ? `$${Number(value).toLocaleString()}` : value,
              view === 'revenue' ? 'Revenue' : 'Transactions'
            ]}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey={view === 'revenue' ? 'revenue' : 'volume'}
            stroke="#3B82F6"
            strokeWidth={2}
            dot={false}
            name={view === 'revenue' ? 'Revenue' : 'Transaction Volume'}
          />
          {forecastEnabled && (
            <Line
              type="monotone"
              dataKey={view === 'revenue' ? 'revenue' : 'volume'}
              stroke="#10B981"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              name="Forecast"
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}