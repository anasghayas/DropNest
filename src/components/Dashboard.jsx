import { useEffect } from 'react'
import SearchBar from './SearchBar'
import ItemCard from './ItemCard'
import { useAuthStore } from '../stores/authStore'
import { useProductStore } from '../stores/productStore'

export default function Dashboard() {
  const user = useAuthStore((state) => state.user)
  const products = useProductStore((state) => state.products)
  const fetchProducts = useProductStore((state) => state.fetchProducts)
  const isLoading = useProductStore((state) => state.isLoading)

  useEffect(() => {
    if (user?.id) {
      fetchProducts(user.id)
    }
  }, [user?.id, fetchProducts])

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      {/* Header section */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-white tracking-tight sm:text-5xl mb-4">
          Track Prices, <span className="text-primary">Save Money.</span>
        </h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto">
          Paste a product link from Amazon or Flipkart or any another E-commerce Platform. We'll track its price 
          history and alert you when it drops.
        </p>
      </div>

      <SearchBar />

      {/* Products Grid */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Your Tracked Items</h2>
          <span className="bg-gray-800 border border-gray-700 text-gray-300 py-1 px-3 rounded-full text-sm font-medium">
            {products.length} Items
          </span>
        </div>

        {isLoading && products.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-48 rounded-xl bg-gray-100 animate-pulse"></div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {products.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        ) : ( 
          <div className="text-center py-20 bg-gray-900/40 backdrop-blur-sm rounded-2xl border border-dashed border-gray-700">
            <h3 className="text-xl font-semibold text-gray-300 mb-2">No items tracked yet</h3>
            <p className="text-gray-400">Paste a URL above to start tracking your first product!</p>
          </div>
        )}
      </div>
    </div>
  )
}
