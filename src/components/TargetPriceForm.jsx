import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Target, Loader2 } from 'lucide-react'

import { Input } from './ui/input'
import { Button } from './ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog"

import { useAuthStore } from '../stores/authStore'
import { useProductStore } from '../stores/productStore'

const targetSchema = z.object({
  targetPrice: z.number({ invalid_type_error: "Must be a number" }).positive("Price must be greater than 0")
})

export default function TargetPriceForm({ isOpen, onClose, item }) {
  const user = useAuthStore((state) => state.user)
  const fetchProducts = useProductStore((state) => state.fetchProducts)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(targetSchema),
    defaultValues: {
      targetPrice: item.targetPrice || item.product.currentPrice
    }
  })

  const onSubmit = async (data) => {
    setLoading(true)
    setErrorMsg('')
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'
      const response = await fetch(`${API_URL}/api/products/target-price`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: user.id,
          productId: item.product.id,
          targetPrice: data.targetPrice
        })
      })

      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Failed to update target price')

      // Refresh products to show the updated target price
      await fetchProducts(user.id)
      onClose()
    } catch (err) {
      setErrorMsg(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center text-lg">
            <Target className="mr-2 text-primary" size={20} />
            Set Target Price
          </DialogTitle>
          <DialogDescription className="text-gray-500 line-clamp-2">
            <strong>{item.product.title}</strong>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Target Price (₹)</label>
            <Input 
              type="number" 
              {...register('targetPrice', { valueAsNumber: true })}
              placeholder="e.g. 50000"
              className="text-lg"
            />
            {errors.targetPrice && <p className="text-red-500 text-xs mt-1">{errors.targetPrice.message}</p>}
          </div>
          
          <div className="bg-gray-50 p-3 rounded-lg text-xs text-gray-600">
            We will email you automatically as soon as the price drops below this target. 
            Current price is <strong>₹{item.product.currentPrice.toLocaleString()}</strong>.
          </div>

          {errorMsg && <p className="text-red-500 text-sm">{errorMsg}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="animate-spin mr-2" size={16} /> : null}
              Save Target
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
