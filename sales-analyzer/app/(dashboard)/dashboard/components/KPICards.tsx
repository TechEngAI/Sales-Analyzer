'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, DollarSign, Users, ShoppingCart, TrendingDown } from 'lucide-react'

interface KPICardsProps {
  kpis: {
    revenue: number
    growth: number
    avgOrderValue: number
    uniqueCustomers: number
    totalTransactions: number
  } | null
}

export default function KPICards({ kpis }: KPICardsProps) {
  const cards = [
    {
      title: 'Total Revenue',
      value: `$${kpis?.revenue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) || '0'}`,
      icon: DollarSign,
      change: `${kpis?.growth.toFixed(1)}%`,
      isPositive: (kpis?.growth || 0) >= 0,
      description: 'From previous period'
    },
    {
      title: 'Growth Rate',
      value: `${kpis?.growth.toFixed(1)}%`,
      icon: kpis?.growth >= 0 ? TrendingUp : TrendingDown,
      change: `${Math.abs(kpis?.growth || 0).toFixed(1)}%`,
      isPositive: (kpis?.growth || 0) >= 0,
      description: 'MoM comparison'
    },
    {
      title: 'Avg Order Value',
      value: `$${kpis?.avgOrderValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0'}`,
      icon: ShoppingCart,
      change: '+5.2%',
      isPositive: true,
      description: 'Per transaction'
    },
    {
      title: 'Active Customers',
      value: kpis?.uniqueCustomers.toString() || '0',
      icon: Users,
      change: '+12.5%',
      isPositive: true,
      description: 'Unique buyers'
    }
  ]

  return (
    <>
      {cards.map((card) => (
        <Card key={card.title} className="bg-gray-900/50 border-gray-800 hover:border-blue-500/30 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              {card.title}
            </CardTitle>
            <card.icon className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <div className="flex items-center text-xs mt-1">
              <span className={card.isPositive ? "text-green-400" : "text-red-400"}>
                {card.isPositive ? '↑' : '↓'} {card.change}
              </span>
              <span className="text-gray-500 ml-2">{card.description}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  )
}