"use client"
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSearchParams } from 'next/navigation'
import axios from 'axios'
import {
   AiOutlineSearch, 
   AiOutlineFilter, 
   AiOutlineClear,
   AiOutlineShoppingCart,
   AiOutlineStar,
   AiOutlineArrowRight,
   AiOutlineRobot
} from 'react-icons/ai'
import { AIProductSearch } from '@/components/myComponents/subs/AIProductSearch'
import { 
  Search, 
  Filter, 
  ChevronRight, 
  Star, 
  ShoppingBag, 
  Sparkles, 
  SlidersHorizontal,
  LayoutGrid,
  List,
  Target,
  ArrowRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { PriceDisplay } from '../utility/PriceDisplay'
import { ProductCard } from '../myComponents/subs/productCard'
import { useCart } from '@/hooks/use-cart'
import { useAppContext } from '@/hooks/useAppContext'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'

export const PlatformStore = () => {
  const searchParams = useSearchParams()
  const { addItem } = useCart()
  const { openDialog } = useAppContext()
  
  // States
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [productCardLayout, setProductCardLayout] = useState<'vertical' | 'horizontal'>('vertical')
  
  // Filters
  const [query, setQuery] = useState(searchParams.get('search') || "")
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || "all")
  const [priceRange, setPriceRange] = useState([0, 50000])
  const [sortBy, setSortBy] = useState("newest")
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Data fetching
  const fetchData = async () => {
    setLoading(true)
    try {
      const catRes = await axios.get('/api/dbhandler?model=category')
      setCategories(catRes.data || [])
      
      const params = new URLSearchParams()
      params.append('model', 'product')
      if (query) params.append('search', query)
      if (selectedCategory !== 'all') params.append('category', selectedCategory)
      params.append('minPrice', priceRange[0].toString())
      params.append('maxPrice', priceRange[1].toString())
      
      const prodRes = await axios.get(`/api/dbhandler?${params.toString()}`)
      setProducts(prodRes.data || [])
    } catch (err) {
      toast.error("Failed to load store data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timeout = setTimeout(fetchData, 300)
    return () => clearTimeout(timeout)
  }, [query, selectedCategory, priceRange, sortBy])

  const clearFilters = () => {
    setQuery("")
    setSelectedCategory("all")
    setPriceRange([0, 50000])
    setSortBy("newest")
  }

  return (
    <div className="min-h-screen bg-background flex flex-col pt-10">
      {/* Header / Search Hero */}
      <section className="w-full bg-accent text-white py-16 px-6 relative overflow-hidden shrink-0">
         <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-[100px] -mr-48 -mt-48" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-black rounded-full blur-[80px] -ml-32 -mb-32" />
         </div>
         
         <div className="max-w-7xl mx-auto space-y-10 relative z-10">
             <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                   <h1 className="text-4xl md:text-6xl font-black tracking-tighter">Global Store</h1>
                   <p className="text-white/70 font-medium text-lg max-w-xl">Search items from all VendorPort stores. Compare prices, check ratings, and shop smart with AI.</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-1 flex items-center border border-white/20">
                    <Button 
                      variant={viewMode === 'grid' ? 'secondary' : 'ghost'} 
                      size="sm" 
                      onClick={() => setViewMode('grid')}
                      className="rounded-xl h-10 w-10 p-0"
                    >
                       <LayoutGrid className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant={viewMode === 'list' ? 'secondary' : 'ghost'} 
                      size="sm" 
                      onClick={() => setViewMode('list')}
                      className="rounded-xl h-10 w-10 p-0"
                    >
                       <List className="h-4 w-4" />
                    </Button>
                </div>
             </div>

             <div className="relative group max-w-3xl">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/40 h-6 w-6 group-focus-within:text-white transition-colors" />
                <Input 
                  placeholder="What are you looking for today? (e.g. Blue Nike Shoes)" 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="h-16 pl-16 rounded-3xl bg-white/20 border-white/30 text-white placeholder:text-white/40 text-xl font-medium focus:bg-white/30 focus:border-white/50 transition-all outline-none"
                />
             </div>
         </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto w-full flex flex-col md:flex-row gap-8 py-12 px-6">
         {/* Sidebar Navigation & Filters - now scrolls with content */}
         <aside className="w-full md:w-80 flex flex-col gap-8 order-last md:order-none h-fit">
            
            {/* AI Assistant CTA */}
            <div className="bg-gradient-to-br from-accent to-primary rounded-3xl p-6 text-white shadow-xl shadow-accent/20 group cursor-pointer relative overflow-hidden" onClick={() => setIsFilterOpen(true)}>
               <div className="absolute top-0 right-0 p-4 opacity-20 transition-transform group-hover:scale-125 duration-500">
                  <AiOutlineRobot className="h-20 w-20" />
               </div>
               <div className="relative z-10 space-y-4">
                  <div className="inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-[10px] font-black uppercase tracking-widest">Powered by AI</div>
                  <h3 className="text-xl font-black">Smart Shopping Assistant</h3>
                  <p className="text-xs text-white/80 font-medium">Upload a list or just tell the AI what you want, and it will find the best items across all stores for you.</p>
                  <AIProductSearch>
                    <Button className="w-full bg-white text-accent hover:bg-white/90 font-black rounded-xl h-12 gap-2">
                       Start AI Shop <Sparkles className="h-4 w-4" />
                    </Button>
                  </AIProductSearch>
               </div>
            </div>

            {/* Filter Section */}
            <Card className="rounded-3xl border-2 overflow-hidden shadow-sm">
               <CardHeader className="bg-muted/30 pb-4">
                  <div className="flex justify-between items-center">
                     <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                        <SlidersHorizontal className="h-4 w-4 text-accent" /> Filter Items
                     </CardTitle>
                     <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 text-[10px] uppercase font-bold text-muted-foreground hover:text-destructive">Reset</Button>
                  </div>
               </CardHeader>
               <CardContent className="space-y-8 pt-6">
                  {/* Category Filter */}
                  <div className="space-y-4">
                     <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Category</label>
                     <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="h-12 border-2 rounded-xl font-bold bg-muted/5">
                           <SelectValue placeholder="All Categories" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                           <SelectItem value="all">Global Items (All)</SelectItem>
                           {categories.map(cat => (
                             <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                           ))}
                        </SelectContent>
                     </Select>
                  </div>

                  {/* Price Filter */}
                  <div className="space-y-4">
                     <div className="flex justify-between items-center">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Price Range</label>
                        <span className="text-xs font-black text-accent"><PriceDisplay amount={priceRange[1]} /></span>
                     </div>
                     <Slider 
                        defaultValue={[0, 50000]} 
                        max={50000} 
                        step={500} 
                        value={priceRange}
                        onValueChange={setPriceRange}
                        className="py-4"
                     />
                     <div className="flex justify-between text-[10px] font-bold opacity-40 uppercase tracking-widest">
                        <span>Min: <PriceDisplay amount={priceRange[0]} /></span>
                        <span>Max: <PriceDisplay amount={priceRange[1]} /></span>
                     </div>
                  </div>

                  {/* Sort Filter */}
                  <div className="space-y-4">
                     <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Sort By</label>
                     <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="h-12 border-2 rounded-xl font-bold bg-muted/5">
                           <SelectValue placeholder="Newest Arrivals" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                           <SelectItem value="newest">Newest Arrivals</SelectItem>
                           <SelectItem value="price-low">Price: Low to High</SelectItem>
                           <SelectItem value="price-high">Price: High to Low</SelectItem>
                           <SelectItem value="popular">Most Popular</SelectItem>
                        </SelectContent>
                     </Select>
                  </div>
               </CardContent>
            </Card>

            {/* Platform Help */}
            <div className="p-6 border-2 border-dashed rounded-3xl space-y-3 opacity-60">
               <h4 className="text-xs font-black uppercase tracking-widest">Need Bulk Orders?</h4>
               <p className="text-[10px] font-medium leading-relaxed">Contact VendorPort enterprise support for multi-store wholesale inquiries and cross-border logistics.</p>
               <Button variant="link" className="p-0 h-6 text-xs text-accent font-bold">Contact Support <ArrowRight className="h-3 w-3 ml-1" /></Button>
            </div>
         </aside>

         {/* Products Grid */}
         <div className="flex-1 space-y-10">
             {/* Info Bar */}
             <div className="flex justify-between items-center bg-muted/20 p-4 px-6 rounded-2xl border flex-wrap gap-4">
                <div className="flex items-center gap-3">
                   <Target className="h-5 w-5 text-accent" />
                   <p className="font-bold text-sm">
                      {loading ? 'Finding items...' : `Showing ${products.length} matching products`}
                   </p>
                </div>
                <div className="flex items-center gap-3">
                   {query && (
                     <Badge variant="secondary" className="bg-accent/10 text-accent font-black border-accent/20 px-3 py-1 rounded-full">
                        Query: {query}
                     </Badge>
                   )}
                   {/* Product Card Layout Toggle */}
                   <div className="bg-white/10 backdrop-blur-md rounded-xl p-1 flex items-center border border-white/20 ml-auto">
                      <Button 
                        variant={productCardLayout === 'vertical' ? 'secondary' : 'ghost'} 
                        size="sm" 
                        onClick={() => setProductCardLayout('vertical')}
                        className="rounded-lg h-9 px-3 text-xs font-bold"
                      >
                        Vertical
                      </Button>
                      <Button 
                        variant={productCardLayout === 'horizontal' ? 'secondary' : 'ghost'} 
                        size="sm" 
                        onClick={() => setProductCardLayout('horizontal')}
                        className="rounded-lg h-9 px-3 text-xs font-bold"
                      >
                        Horizontal
                      </Button>
                   </div>
                </div>
             </div>

             {/* Results */}
             <div className={`grid gap-8 ${
               productCardLayout === 'vertical' 
                 ? (viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1')
                 : 'grid-cols-1'
             }`}>
                {loading ? (
                   Array.from({ length: 6 }).map((_, i) => (
                     <div key={i} className="space-y-4">
                        <Skeleton className="h-64 w-full rounded-3xl" />
                        <div className="space-y-2">
                           <Skeleton className="h-4 w-3/4 rounded-full" />
                           <Skeleton className="h-6 w-1/2 rounded-full" />
                        </div>
                     </div>
                   ))
                ) : (
                  <>
                    {products.map(prod => (
                      <ProductCard 
                        key={prod.id} 
                        product={{
                          ...prod,
                          inStock: true,
                          rating: prod.ratings || 5
                        }}
                        onAddToCart={(p) => {
                           addItem({
                              ...p,
                              businessId: prod.businessId
                           }, 1)
                           toast.success(`Added ${p.name} from ${prod.business?.name || 'store'} to global bag`)
                        }}
                        onAddToWishlist={(id) => openDialog(`Added ${id} to global favorites`, "Wishlist")}
                        className={`hover:border-accent transition-all duration-500 rounded-3xl overflow-hidden border-2 shadow-sm hover:shadow-2xl hover:shadow-accent/5 ${
                          productCardLayout === 'horizontal' 
                            ? 'flex flex-row items-center gap-4'
                            : (viewMode === 'list' ? 'flex-row' : 'flex-col')
                        }`}
                      />
                    ))}

                    {products.length === 0 && (
                      <div className="col-span-full py-32 text-center rounded-3xl border-4 border-dashed border-muted flex flex-col items-center justify-center space-y-6">
                         <div className="h-24 w-24 bg-muted rounded-full flex items-center justify-center">
                            <ShoppingBag className="h-12 w-12 opacity-20" />
                         </div>
                         <div className="space-y-2">
                            <h3 className="text-3xl font-black">No Results Found</h3>
                            <p className="text-muted-foreground max-w-sm mx-auto">Try adjusting your filters, searching for a different item, or using our Smart Assistant.</p>
                         </div>
                         <Button onClick={clearFilters} className="h-14 px-10 bg-accent text-white font-bold rounded-xl shadow-xl">Clear All Filters</Button>
                      </div>
                    )}
                  </>
                )}
             </div>
         </div>
      </main>
    </div>
  )
}
