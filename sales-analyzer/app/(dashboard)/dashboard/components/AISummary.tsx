'use client'

import { useState, useEffect } from 'react'
import { Sparkles, AlertCircle, TrendingUp, TrendingDown } from 'lucide-react'
import { SalesRecord } from '@/lib/supabase-client'
import { Button } from '@/components/ui/button'

interface AISummaryProps {
  salesData: SalesRecord[] | null
}

export default function AISummary({ salesData }: AISummaryProps) {
  const [insight, setInsight] = useState('')
  const [loading, setLoading] = useState(false)

  const generateInsight = async () => {
    if (!salesData) return
    
    setLoading(true)
    
    // Simulate AI processing with actual calculations
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Calculate real insights
    const regions = salesData.reduce((acc, sale) => {
      acc[sale.region] = (acc[sale.region] || 0) + sale.amount
      return acc
    }, {} as Record<string, number>)

    const topRegion = Object.entries(regions).sort((a, b) => b[1] - a[1])[0]
    const worstRegion = Object.entries(regions).sort((a, b) => a[1] - b[1])[0]
    
    const currentPeriod = salesData.slice(-15)
    const previousPeriod = salesData.slice(-30, -15)
    const currentRevenue = currentPeriod.reduce((sum, s) => sum + s.amount, 0)
    const previousRevenue = previousPeriod.reduce((sum, s) => sum + s.amount, 0)
    const growth = ((currentRevenue - previousRevenue) / previousRevenue) * 100

    const avgMargin = salesData.reduce((sum, s) => sum + (s.margin || 0), 0) / salesData.length

    const insightText = `Your sales in the ${topRegion[0]} region are leading with $${topRegion[1].toLocaleString()} revenue ` +
      `${growth >= 0 ? `(up ${growth.toFixed(1)}% from last period)` : `(down ${Math.abs(growth).toFixed(1)}%)`}. ` +
      `${worstRegion[0]} is underperforming at $${worstRegion[1].toLocaleString()}. ` +
      `Average margins are at ${avgMargin.toFixed(1)}%${avgMargin < 20 ? ' - consider optimizing pricing or reducing COGS.' : ', which is healthy.'}`
    
    setInsight(insightText)
    setLoading(false)
  }

  useEffect(() => {
    if (salesData && salesData.length > 0) {
      generateInsight()
    }
  }, [salesData])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-yellow-400" />
          <h3 className="font-semibold">Intelligent Analysis</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={generateInsight}
          disabled={loading}
          className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
        >
          Regenerate
        </Button>
      </div>

      {loading ? (
        <div className="space-y-2">
          <div className="h-4 bg-gray-800 rounded animate-pulse"></div>
          <div className="h-4 bg-gray-800 rounded animate-pulse w-5/6"></div>
          <div className="h-4 bg-gray-800 rounded animate-pulse w-4/6"></div>
        </div>
      ) : insight ? (
        <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-800">
          <p className="text-gray-200">{insight}</p>
          
          {/* Action Items */}
          <div className="mt-4 pt-4 border-t border-gray-800">
            <h4 className="text-sm font-semibold text-gray-400 mb-2">Recommended Actions:</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-400" />
                <span>Increase marketing spend in top-performing regions</span>
              </li>
              <li className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-400" />
                <span>Review pricing strategy for low-margin products</span>
              </li>
              <li className="flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-red-400" />
                <span>Investigate underperforming regions for root causes</span>
              </li>
            </ul>
          </div>
        </div>
      ) : (
        <p className="text-gray-500">Upload sales data to generate AI insights</p>
      )}
    </div>
  )
}