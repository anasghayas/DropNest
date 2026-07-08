import { useState, useEffect } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts'
import { Card, CardContent } from './ui/card'

export default function PriceChart({ productId }) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchHistory() {
      try {
        const API_URL = import.meta.env.VITE_API_URL || ''
        const response = await fetch(`${API_URL}/api/prices/${productId}`)
        const history = await response.json()

        // Format dates for the chart
        const formattedData = history.map(point => ({
          ...point,
          date: new Date(point.recordedAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
          })
        }))

        setData(formattedData)
      } catch (error) {
        console.error('Failed to load price history:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [productId])

  if (loading) {
    return (
      <Card className="w-full h-64 flex items-center justify-center bg-gray-50/50">
        <div className="animate-pulse flex space-x-2">
          <div className="w-3 h-3 bg-primary rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </Card>
    )
  }

  if (data.length === 0) {
    return (
      <Card className="w-full h-64 flex items-center justify-center bg-gray-50/50 text-muted-foreground text-sm">
        Not enough data points yet. Check back later!
      </Card>
    )
  }

  // Calculate min and max for Y-axis scaling to make the graph look dynamic
  const minPrice = Math.min(...data.map(d => d.price))
  const maxPrice = Math.max(...data.map(d => d.price))
  const padding = (maxPrice - minPrice) * 0.1 || maxPrice * 0.1

  return (
    <Card className="w-full p-4 bg-white shadow-sm border-gray-100 overflow-hidden">
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#888' }}
              dy={10}
            />
            <YAxis 
              domain={[minPrice - padding, maxPrice + padding]} 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#888' }}
              tickFormatter={(val) => `₹${val.toLocaleString()}`}
              width={60}
            />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              itemStyle={{ color: 'var(--primary)', fontWeight: 'bold' }}
              formatter={(value) => [`₹${value.toLocaleString()}`, 'Price']}
            />
            <Area 
              type="monotone" 
              dataKey="price" 
              stroke="var(--primary)" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorPrice)" 
              activeDot={{ r: 6, strokeWidth: 0, fill: 'var(--primary)' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
