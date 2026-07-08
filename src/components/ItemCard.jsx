import { useState } from 'react'
import { Card, CardContent } from './ui/card'
import { Button } from './ui/button'
import { LineChart, ExternalLink, TrendingDown, TrendingUp, Bell, Trash2, Loader2 } from 'lucide-react'
import PriceChart from './PriceChart'
import TargetPriceForm from './TargetPriceForm'
import { useAuthStore } from '../stores/authStore'
import { useProductStore } from '../stores/productStore'

export default function ItemCard({ item }) {
  const [showChart, setShowChart] = useState(false)
  const [showTargetModal, setShowTargetModal] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)
  const product = item.product
  const user = useAuthStore((state) => state.user)
  const removeProduct = useProductStore((state) => state.removeProduct)

  const handleRemove = async () => {
    if (!window.confirm("Are you sure you want to stop tracking this product?")) return
    setIsRemoving(true)
    await removeProduct(product.id, user.id)
    // setIsRemoving(false) is not needed because the component will unmount when removed
  }

  // Format the date
  const lastScraped = new Date(product.lastScrapedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  })

  const isLowest = product.currentPrice <= product.lowestPrice
  const isHighest = product.currentPrice >= product.highestPrice

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.5)] hover:-translate-y-1 bg-gray-900/90 sm:bg-gray-900/60 backdrop-blur-none sm:backdrop-blur-md border-gray-700/50 text-gray-100">
      <div className="p-4 flex flex-col md:flex-row gap-4">
        {/* Product Image */}
        <div className="w-full md:w-32 h-32 shrink-0 bg-white/10 rounded-xl flex items-center justify-center p-2 shadow-sm border border-gray-700/50">
          {product.imageUrl ? (
            <img 
              src={product.imageUrl} 
              alt={product.title} 
              className="max-h-full max-w-full object-contain"
            />
          ) : (
            <div className="text-gray-400 text-xs text-center">No Image</div>
          )}
        </div>

        {/* Product Details */}
        <div className="grow flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start gap-4">
              <h3 className="font-semibold text-gray-100 line-clamp-2 leading-tight">
                {product.title}
              </h3>
              <div className="flex items-center gap-3 shrink-0 mt-1">
                <a 
                  href={product.url} 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-gray-400 hover:text-primary transition-colors"
                  title="View on Store"
                >
                  <ExternalLink size={18} />
                </a>
                <button 
                  onClick={handleRemove}
                  disabled={isRemoving}
                  className="text-gray-400 hover:text-red-400 transition-colors disabled:opacity-50"
                  title="Remove from Dashboard"
                >
                  {isRemoving ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                </button>
              </div>
            </div>
            <div className="mt-2 flex items-center gap-2 text-xs font-medium">
              <span className="px-2 py-1 bg-gray-800 text-gray-300 rounded-md capitalize border border-gray-700">
                {product.platform}
              </span>
              <span className="text-gray-400">
                Last checked: {lastScraped}
              </span>
            </div>
          </div>

          {/* Pricing Info */}
          <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs text-gray-400 mb-1">Current Price</p>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-white">
                  ₹{product.currentPrice.toLocaleString()}
                </span>
                {isLowest && (
                  <span className="flex items-center text-xs text-green-400 bg-green-900/30 px-2 py-0.5 rounded-full font-medium border border-green-800">
                    <TrendingDown size={12} className="mr-1" />
                    Lowest!
                  </span>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                className="text-xs border-gray-700 bg-gray-800/50 hover:bg-gray-700 text-gray-200"
                onClick={() => setShowChart(!showChart)}
              >
                <LineChart size={14} className="mr-2 text-[#A6C8FF]" />
                {showChart ? 'Hide History' : 'Price History'}
              </Button>
              <Button 
                variant={item.targetPrice ? "default" : "secondary"}
                size="sm"
                className={`text-xs border-0 ${item.targetPrice ? 'bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 text-white shadow-md shadow-red-500/20' : 'bg-gray-800 hover:bg-gray-700 text-gray-200'}`}
                onClick={() => setShowTargetModal(true)}
              >
                <Bell size={14} className="mr-2" />
                {item.targetPrice ? `Target: ₹${item.targetPrice.toLocaleString()}` : 'Set Target'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Expandable Chart Section */}
      <div 
        className={`bg-gray-950/50 transition-all duration-500 ease-in-out overflow-hidden border-t border-gray-800 ${
          showChart ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="p-4">
          <PriceChart productId={product.id} />
        </div>
      </div>

      <TargetPriceForm 
        isOpen={showTargetModal} 
        onClose={() => setShowTargetModal(false)} 
        item={item} 
      />
    </Card>
  )
}
