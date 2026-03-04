"use client";
import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CategoryCardProps {
  category: {
    id: string;
    name: string;
    description?: string;
    image?: string;
    productCount?: number;
    products?: any[];
  };
  className?: string;
}

export function CategoryCard({ category, className }: CategoryCardProps) {
  // Get up to 2 product images
  const sampleImages = category.products 
    ? category.products.slice(0, 2).map(p => p.images?.[0]).filter(Boolean)
    : [];

  return (
    <div className={cn(
      "group relative flex flex-col bg-white rounded-[2rem] overflow-hidden border-2 border-transparent hover:border-accent/10 transition-all duration-500 shadow-xl shadow-accent/5 hover:shadow-accent/10",
      className
    )}>
      {/* Dynamic Image Grid */}
      <div className="relative h-48 overflow-hidden flex gap-0.5 bg-muted">
        {sampleImages.length >= 2 ? (
          <>
            <div className="w-1/2 h-full overflow-hidden">
              <img 
                src={sampleImages[0]} 
                alt={`${category.name} preview 1`} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
            </div>
            <div className="w-1/2 h-full overflow-hidden">
              <img 
                src={sampleImages[1]} 
                alt={`${category.name} preview 2`} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
            </div>
          </>
        ) : (
          <img 
            src={category.image || "/placeholder-cat.jpg"} 
            alt={category.name} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
        
        {/* Count Badge */}
        <div className="absolute top-4 right-4 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-[10px] font-black uppercase tracking-widest text-accent z-10 shadow-lg">
          {category.productCount || 0} ITEMS
        </div>
      </div>

      {/* Content Area */}
      <div className="p-6 flex flex-col flex-1">
        <h3 className="font-black text-xl uppercase tracking-tighter mb-1 text-primary group-hover:text-accent transition-colors">
          {category.name}
        </h3>
        <p className="text-xs text-muted-foreground font-medium mb-6 line-clamp-2">
          {category.description || `Explore our premium selection of ${category.name} products.`}
        </p>
        
        <div className="mt-auto">
          <Link 
            href={`/store?category=${category.name.toLowerCase()}`}
            className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-accent hover:gap-3 transition-all"
          >
            Browse Collection <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
