'use client'
import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import Link from 'next/link';
import { AiOutlineSearch } from "react-icons/ai";

export function SearchInput() {
  const [results, setResults] = useState<{ products: any[], businesses: any[] }>({ products: [], businesses: [] });
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchResults = async (search: string) => {
    if (search.length < 2) {
      setResults({ products: [], businesses: [] });
      return;
    }
    setLoading(true);
    try {
      const [prodRes, bizRes] = await Promise.all([
        axios.get(`/api/dbhandler?model=product&search=${encodeURIComponent(search)}`),
        axios.get(`/api/dbhandler?model=business&search=${encodeURIComponent(search)}`)
      ]);
      setResults({
        products: prodRes.data || [],
        businesses: (bizRes.data || []).filter((b: any) => b.name.toLowerCase().includes(search.toLowerCase()))
      });
    } catch (error) {
      console.error("Search error:", error);
      setResults({ products: [], businesses: [] });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isFocused) return;
    const timeout = setTimeout(() => fetchResults(query), 300);
    return () => clearTimeout(timeout);
  }, [query, isFocused]);

  const hasResults = results.products.length > 0 || results.businesses.length > 0;

  return (
    <div className="relative w-full md:w-[400px] mx-5 flex flex-row bg-background group">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-40 group-focus-within:text-accent transition-colors">
         <AiOutlineSearch className="text-xl" />
      </div>
      <Input
        placeholder="Search stores, items, categories..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setTimeout(() => setIsFocused(false), 200)}
        className="pl-10 h-12 flex-1 border-2 bg-accent/5 focus:bg-background z-30 rounded-2xl transition-all font-medium"
      />
      
      <DropdownMenu open={isFocused && (hasResults || loading)} onOpenChange={setIsFocused}>
        <DropdownMenuTrigger asChild><div className="hidden" /></DropdownMenuTrigger>
        <DropdownMenuContent
          ref={dropdownRef}
          className="w-[400px] max-h-[500px] overflow-auto shadow-2xl bg-background border-2 z-50 rounded-3xl p-4 space-y-4"
        >
          {loading && <div className="p-4 text-center animate-pulse font-bold text-accent">Searching VendorPort...</div>}
          
          {results.businesses.length > 0 && (
            <div className="space-y-2">
               <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-2">Websites / Stores</h4>
               <div className="grid gap-1">
                  {results.businesses.map(biz => (
                    <Link 
                      key={biz.id} 
                      href={`/${biz.name.toLowerCase().replace(/\s+/g, '-')}`}
                      className="flex items-center gap-3 p-2 rounded-xl hover:bg-accent/10 transition-colors group"
                    >
                       <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center font-bold text-accent group-hover:bg-accent group-hover:text-white transition-all text-xs">
                          {biz.name[0]}
                       </div>
                       <div className="flex flex-col">
                          <span className="text-sm font-bold">{biz.name}</span>
                          <span className="text-[10px] text-muted-foreground uppercase">{biz.template} Template</span>
                       </div>
                    </Link>
                  ))}
               </div>
            </div>
          )}

          {results.products.length > 0 && (
            <div className="space-y-2">
               <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-2">Products & Items</h4>
               <div className="grid gap-1">
                  {results.products.map(prod => (
                    <Link 
                      key={prod.id} 
                      href={`/store?search=${encodeURIComponent(prod.name)}`}
                      className="flex items-center gap-3 p-2 rounded-xl hover:bg-accent/10 transition-colors group"
                    >
                       <div className="h-8 w-8 rounded-lg bg-muted overflow-hidden">
                          {prod.images?.[0] && <img src={prod.images[0]} alt="" className="h-full w-full object-cover" />}
                       </div>
                       <div className="flex flex-col">
                          <span className="text-sm font-bold">{prod.name}</span>
                          <span className="text-[10px] text-muted-foreground uppercase">{prod.category?.name || 'Item'}</span>
                       </div>
                    </Link>
                  ))}
               </div>
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
