"use client"

import { useEffect, useState } from "react"
import useEmblaCarousel from "embla-carousel-react"
import Autoplay from "embla-carousel-autoplay"
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ProductCard } from "./productCard"
import axios from "axios"
import { useAppContext } from "@/hooks/useAppContext"

const RecentProductsCarousel = () => {
  const { currentBusiness } = useAppContext()
  const businessId = currentBusiness?.id
  const [recentProducts, setRecentProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "start", slidesToScroll: 1 },
    [Autoplay({ delay: 3000, stopOnInteraction: false, stopOnMouseEnter: true })]
  )

  useEffect(() => {
    const fetchRecentProducts = async () => {
      try {
        setLoading(true)
        if (!businessId) return

        const response = await axios.get(
          `/api/dbhandler?model=product&businessId=${businessId}&limit=12&orderBy=createdAt&orderDirection=desc&include=category,brand,stock,business`
        )

        const products = Array.isArray(response.data) ? response.data : response.data.data || []
        setRecentProducts(products.slice(0, 12))
      } catch (error) {
        console.error("Failed to fetch recent products:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchRecentProducts()
  }, [businessId])

  const handlePrev = () => {
    if (emblaApi) emblaApi.scrollPrev()
  }

  const handleNext = () => {
    if (emblaApi) emblaApi.scrollNext()
  }

  if (loading) {
    return (
      <div className="w-full py-12 px-4 md:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
        </div>
      </div>
    )
  }

  if (recentProducts.length === 0) {
    return null
  }

  return (
    <section className="w-full md:max-w-xl lg:max-w-6xl py-12 px-4 md:px-6 mx-auto">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">Recent Products</h2>
            <p className="text-muted-foreground mt-1">New arrivals and latest updates</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="overflow-hidden rounded-lg" ref={emblaRef}>
            <div className="flex gap-2">
              {recentProducts.map((product) => (
                <div key={product.id} className="min-w-[280px] flex-none">
                  <ProductCard
                    product={{
                      ...product,
                      inStock: true,
                      originalPrice: Number(product.price) * 1.2,
                      rating: 5,
                      categoryName: product.category?.name || "Product",
                    }}
                    orientation="vertical"
                    className="w-full max-w-[200px]"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-center gap-4 pt-4">
            <Button
              size="icon"
              variant="outline"
              onClick={handlePrev}
              className="rounded-full h-10 w-10"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              size="icon"
              variant="outline"
              onClick={handleNext}
              className="rounded-full h-10 w-10"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default RecentProductsCarousel
