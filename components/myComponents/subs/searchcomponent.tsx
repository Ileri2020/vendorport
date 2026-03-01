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
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch products from backend
  const fetchProducts = async (search: string) => {
    if (search.length < 3) {
      setProducts([]);
      return;
    }
    setLoading(true);
    try {
      const res = await axios.get(`/api/dbhandler?model=product&search=${encodeURIComponent(search)}`);
      setProducts(res.data || []);
    } catch (error) {
      console.error("Search error:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search
  useEffect(() => {
    if (!isFocused) return;
    const timeout = setTimeout(() => fetchProducts(query), 300);
    return () => clearTimeout(timeout);
  }, [query, isFocused]);

  return (
    <div className="relative w-full /w-[230px] md:w-[300px] mx-5 flex flex-row bg-background">
      <Input
        placeholder="Search products..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setTimeout(() => setIsFocused(false), 200)}
        className="flex-1 border-0 dark:border-2 bg-accent/10 z-30"
      />
      <DropdownMenu open={isFocused} onOpenChange={setIsFocused}>
        <DropdownMenuTrigger asChild>
          <Button className="absolute right-0 h-full rounded-sm text-background text-xl">
            <AiOutlineSearch />
          </Button>
        </DropdownMenuTrigger>

        {products.length > 0 && (
          <DropdownMenuContent
            ref={dropdownRef}
            className=" w-full max-w-sm max-h-[400px] overflow-auto shadow-lg bg-secondary z-30 rounded-md"
          >
            <Table className="w-full text-sm sm:text-base">
              <TableBody>
                {products.map((product) => {
                  const productUrl = `/store?id=${product.id}&category=${product.category?.name || ''}&search=${encodeURIComponent(query)}`;
                  return (
                    <TableRow key={product.id} className="hover:bg-accent/20">
                      <TableCell className="truncate max-w-[400px] sm:max-w-none">
                        <Link
                          href={productUrl}
                          className="font-semibold capitalize hover:text-blue-800 truncate"
                        >
                          {product.name} - {product.category?.name || 'General'}
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </DropdownMenuContent>
        )}
      </DropdownMenu>
    </div>
  );
}
