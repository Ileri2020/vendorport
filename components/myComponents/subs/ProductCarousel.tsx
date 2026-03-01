"use client"

import React, { useEffect, useState } from "react"
import { motion, useAnimationControls } from "framer-motion"
import { Utensils, Heart, ShoppingCart } from "lucide-react"
import { toggleWishlist, checkWishlisStatus } from "@/action/wishlist"
import { AddLunchDialog } from "./AddLunchDialog"
import Link from "next/link"
import { toast } from "sonner"

export function ProductCarousel() {
    const [products, setProducts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch("/api/product?limit=10")
            .then(res => res.json())
            .then(data => {
                const shuffled = (data.products || []).sort(() => Math.random() - 0.5)
                setProducts(shuffled)
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
                    <CarouselCard key={`${product.id}-${idx}`} product={product} />
                ))}
            </motion.div>
        </div>
    )
}

function CarouselCard({ product }: { product: any }) {
    const [isLunchDialogOpen, setIsLunchDialogOpen] = useState(false)
    const [isInWishlist, setIsInWishlist] = useState(false)
    const image = product.images?.[0] || "/placeholder.png"

    useEffect(() => {
        checkWishlisStatus(product.id).then(setIsInWishlist).catch(() => {})
    }, [product.id])

    const handleWishlist = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsInWishlist(!isInWishlist)
        await toggleWishlist(product.id)
    }

    return (
        <>
            <div className="relative w-48 h-48 md:w-64 md:h-64 flex-shrink-0 group rounded-lg overflow-hidden shadow-lg bg-muted">
                <Link href={`/store/${product.id}`} className="block w-full h-full">
                    <img src={image} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                </Link>

                {/* Top Right Semi-Quarter Circle for Lunch */}
                <div className="absolute top-0 right-0 w-12 h-12 overflow-hidden pointer-events-none">
                     <div 
                        className="absolute top-[-50%] right-[-50%] w-[200%] h-[200%] bg-background/60 backdrop-blur-md rounded-full cursor-pointer pointer-events-auto flex items-center justify-center pt-[25%] pr-[25%]"
                        onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            setIsLunchDialogOpen(true)
                        }}
                    >
                        <Utensils className="h-5 w-5 text-orange-500 translate-x-[-12px] translate-y-[12px]" />
                    </div>
                </div>

                {/* Wishlist Icon */}
                <button 
                    onClick={handleWishlist}
                    className="absolute top-2 right-12 bg-background/60 backdrop-blur-sm p-1.5 rounded-full z-10 hover:bg-background transition-colors"
                >
                    <Heart className={cn("h-4 w-4", isInWishlist ? "fill-destructive text-destructive" : "text-muted-foreground")} />
                </button>

                {/* Add to Cart Overlay */}
                <div className="absolute bottom-0 left-0 right-0 h-1/5 bg-background/60 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button 
                        className="w-full h-full flex items-center justify-center gap-2 font-bold text-sm text-primary hover:bg-primary hover:text-white transition-colors"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toast.success("Added to cart")
                        }}
                    >
                        <ShoppingCart className="h-4 w-4" /> Add to Cart
                    </button>
                </div>
            </div>

            <AddLunchDialog 
                isOpen={isLunchDialogOpen} 
                onClose={() => setIsLunchDialogOpen(false)} 
                productId={product.id} 
            />
        </>
    )
}

function cn(...classes: any[]) {
    return classes.filter(Boolean).join(" ")
}
