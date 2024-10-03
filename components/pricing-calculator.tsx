
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function PricingCalculator() {
  const [seats, setSeats] = useState(1)
  const [usage, setUsage] = useState(0)
  const [discount, setDiscount] = useState(0)
  const [total, setTotal] = useState(0)

  const calculateTotal = () => {
    const seatPrice = 20
    const usagePrice = 0.1
    const discountMultiplier = 1 - discount / 100
    const calculatedTotal = (seats * seatPrice + usage * usagePrice) * discountMultiplier
    setTotal(calculatedTotal)
  }

  return (
    <Card className="max-w-md mx-auto mt-10">
      <CardHeader>
        <CardTitle className="text-center">SaaS Pricing Calculator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label htmlFor="seats" className="block text-sm font-medium text-gray-700">
            Number of Seats
          </label>
          <Input
            type="number"
            id="seats"
            value={seats}
            onChange={(e) => setSeats(Number(e.target.value))}
            min="1"
            className="mt-1"
          />
        </div>
        <div>
          <label htmlFor="usage" className="block text-sm font-medium text-gray-700">
            Usage (in hours)
          </label>
          <Input
            type="number"
            id="usage"
            value={usage}
            onChange={(e) => setUsage(Number(e.target.value))}
            min="0"
            className="mt-1"
          />
        </div>
        <div>
          <label htmlFor="discount" className="block text-sm font-medium text-gray-700">
            Discount (%)
          </label>
          <Input
            type="number"
            id="discount"
            value={discount}
            onChange={(e) => setDiscount(Number(e.target.value))}
            min="0"
            max="100"
            className="mt-1"
          />
        </div>
        <Button onClick={calculateTotal} className="w-full">
          Calculate Total
        </Button>
        <div className="text-center text-lg font-bold">
          Total Price: ${total.toFixed(2)}
        </div>
      </CardContent>
    </Card>
  )
}