"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { ProductCard } from "./productCard"
import { toast } from "sonner"

export function ProductCarousel() {
    const [products, setProducts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch("/api/dbhandler?model=product")
            .then(res => res.json())
            .then(data => {
                // dbhandler returns an array directly for products
                const shuffled = (Array.isArray(data) ? data : []).sort(() => Math.random() - 0.5)
                setProducts(shuffled.slice(0, 10)) // Limit to 10 on frontend for now
                setLoading(false)
            })
            .catch(() => setLoading(false))
    }, [])

    if (loading || products.length === 0) return <div className="h-40 flex items-center justify-center">Loading products...</div>

    // Duplicate products for infinite effect
    const displayProducts = [...products, ...products, ...products, ...products]

    return (
        <div className="w-full overflow-hidden py-4 px-2 relative group/carousel">
            <motion.div 
                className="flex gap-4"
                animate={{ x: [0, -100 * products.length] }}
                transition={{ 
                    duration: products.length * 5, 
                    repeat: Infinity, 
                    ease: "linear" 
                }}
                whileHover={{ animationPlayState: "paused" }}
            >
                {displayProducts.map((product, idx) => (
                    <div key={`${product.id}-${idx}`} className="flex-shrink-0 w-64">
                        <ProductCard
                            product={product}
                            variant="compact"
                            onAddToCart={(prod) => toast.success("Added to cart")}
                        />
                    </div>
                ))}
            </motion.div>
        </div>
    )
}


