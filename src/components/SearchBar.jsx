import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Search, Loader2 } from 'lucide-react'

import { Input } from './ui/input'
import { Button } from './ui/button'
import { useProductStore } from '../stores/productStore'
import { useAuthStore } from '../stores/authStore'

const searchSchema = z.object({
  url: z.string().url({ message: "Please enter a valid URL." })
})

export default function SearchBar() {
  const user = useAuthStore((state) => state.user)
  const trackProduct = useProductStore((state) => state.trackProduct)
  const fetchProducts = useProductStore((state) => state.fetchProducts)
  const isLoading = useProductStore((state) => state.isLoading)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(searchSchema)
  })

  const onSubmit = async (data) => {
    setSuccessMsg('')
    setErrorMsg('')
    
    try {
      await trackProduct(data.url, user.id)
      setSuccessMsg('Product added! Fetching details...')
      reset()
      // Refresh the product list so the new item shows up
      await fetchProducts(user.id)
      setTimeout(() => setSuccessMsg(''), 3000)
    } catch (error) {
      setErrorMsg(error.message)
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto mb-10">
      <form onSubmit={handleSubmit(onSubmit)} className="relative flex items-center shadow-lg rounded-xl overflow-hidden bg-white/70 backdrop-blur-sm border border-gray-100">
        <div className="pl-4 text-gray-400">
          <Search size={20} />
        </div>
        
        <Input
          {...register('url')}
          type="url"
          placeholder="Paste an Amazon or Flipkart URL here..."
          className="border-0 bg-transparent h-14 focus-visible:ring-0 focus-visible:ring-offset-0 text-lg flex-1"
          disabled={isLoading}
        />
        
        <div className="pr-2">
          <Button 
            type="submit" 
            disabled={isLoading}
            className="h-10 px-6 font-semibold"
          >
            {isLoading ? <Loader2 className="animate-spin" /> : 'Track'}
          </Button>
        </div>
      </form>

      {/* Error & Success Messages */}
      <div className="mt-2 h-6 text-center text-sm font-medium">
        {errors.url && <p className="text-red-500">{errors.url.message}</p>}
        {errorMsg && <p className="text-red-500">{errorMsg}</p>}
        {successMsg && <p className="text-green-600">{successMsg}</p>}
      </div>
    </div>
  )
}
