import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Heart, Share2, ArrowLeft, Star, CheckCircle, Truck } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { toast } from 'sonner';
import Link from 'next/link';

interface ProductDetailViewProps {
  productId?: string;
  businessId?: string;
}

export default function ProductDetailView({ productId, businessId }: ProductDetailViewProps) {
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        let url = `/api/dbhandler?model=product`;
        if (productId) url += `&id=${productId}`;
        else if (businessId) url += `&businessId=${businessId}&limit=1`; // fetch latest if no id

        const res = await axios.get(url);
        const data = Array.isArray(res.data) ? res.data[0] : res.data;
        setProduct(data);
      } catch (err) {
        console.error("Failed to fetch product details", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId, businessId]);

  if (loading) return <div className="py-20 text-center font-bold text-muted-foreground animate-pulse">Loading product details...</div>;
  
  if (!product) return (
    <div className="py-20 text-center space-y-4">
      <p className="text-xl font-bold">Product not found</p>
      <Button variant="outline" asChild><Link href="./store">Back to Store</Link></Button>
    </div>
  );

  const images = product.images?.length > 0 ? product.images : ["/logo.png"];
  const [activeImage, setActiveImage] = useState(images[0]);

  const handleAddToCart = () => {
    addItem(product, 1);
    toast.success(`${product.name} added to cart`);
  };

  return (
    <div className="w-full bg-background py-10 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="./store" className="inline-flex items-center text-sm font-bold text-muted-foreground hover:text-accent mb-8 transition-colors group">
          <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Back to Collection
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Gallery */}
          <div className="space-y-4">
            <div className="aspect-square relative rounded-[2rem] overflow-hidden border bg-muted/20 shadow-inner group">
               <img src={activeImage} alt={product.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
               {product.scarce && (
                 <Badge className="absolute top-6 left-6 bg-destructive text-white border-none px-4 py-1.5 rounded-full font-black text-xs uppercase tracking-widest shadow-lg">
                   Limited Stock
                 </Badge>
               )}
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
              {images.map((img: string, i: number) => (
                <button 
                  key={i} 
                  onClick={() => setActiveImage(img)}
                  className={`relative h-24 w-24 rounded-2xl overflow-hidden border-2 transition-all ${activeImage === img ? 'border-accent shadow-lg scale-105' : 'border-transparent opacity-60 hover:opacity-100'}`}
                >
                  <img src={img} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-4">
               <Badge variant="secondary" className="bg-accent/10 text-accent font-black">{product.category?.name || 'General'}</Badge>
               <div className="flex gap-0.5 text-yellow-400">
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 fill-current" />
                  <Star className="h-4 w-4 text-muted-foreground" />
               </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-4 text-foreground leading-[1.1]">{product.name}</h1>
            
            <div className="flex items-baseline gap-4 mb-8">
              <span className="text-3xl font-black text-accent">₦{product.price?.toLocaleString()}</span>
              {product.costPrice && (
                 <span className="text-xl text-muted-foreground line-through opacity-50 font-medium">₦{(product.price * 1.2).toLocaleString()}</span>
              )}
            </div>

            <p className="text-lg text-muted-foreground leading-relaxed mb-10 border-l-4 border-accent/20 pl-6">
              {product.description || "No description available for this premium item."}
            </p>

            <div className="space-y-6 mb-10">
               <div className="flex items-center gap-3 text-sm font-bold">
                  <CheckCircle className="h-5 w-5 text-green-500" /> 
                  <span>Quality Assured & Verified</span>
               </div>
               <div className="flex items-center gap-3 text-sm font-bold">
                  <Truck className="h-5 w-5 text-accent" /> 
                  <span>Express Delivery in 24-48 Hours</span>
               </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mt-auto">
              <Button 
                size="lg" 
                onClick={handleAddToCart}
                className="h-14 flex-1 rounded-2xl bg-accent hover:bg-accent/90 text-white font-black text-lg gap-2 shadow-xl shadow-accent/20 transition-all active:scale-95"
              >
                <ShoppingCart className="h-6 w-6" /> Add to Cart
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="h-14 w-14 rounded-2xl border-2 hover:bg-accent hover:text-white hover:border-accent transition-all group"
              >
                <Heart className="h-6 w-6 group-hover:scale-110 transition-transform" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="h-14 w-14 rounded-2xl border-2 hover:bg-accent hover:text-white hover:border-accent transition-all group"
              >
                <Share2 className="h-6 w-6 group-hover:scale-110 transition-transform" />
              </Button>
            </div>
            
            {product.activeIngredients && product.activeIngredients.length > 0 && (
              <div className="mt-12 pt-10 border-t">
                 <h3 className="font-black uppercase tracking-widest text-xs text-muted-foreground mb-4">Key Composition</h3>
                 <div className="flex flex-wrap gap-2">
                    {product.activeIngredients.map((ing: string) => (
                      <Badge key={ing} variant="outline" className="rounded-full px-4 py-1 font-bold border-2">{ing}</Badge>
                    ))}
                 </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
