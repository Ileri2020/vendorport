"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useAppContext } from "@/hooks/useAppContext";
import { Button } from "@/components/ui/button";
import { Plus, Edit3, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import CategoryForm from "@/prisma/forms/CategoryForm";
import axios from "axios";
import { toast } from "sonner";

// Fetch categories from backend
async function getCategories(businessId?: string) {
  let url = `/api/dbhandler?model=category`;
  if (businessId) {
    url += `&businessId=${businessId}`;
  }

  const res = await fetch(url);

  if (!res.ok) return [];

  const categories = await res.json();

  return categories.map((cat: any) => ({
    id: cat.id,
    image: cat.image || "/logo.png",
    name: cat.name,
    description: cat.description || "",
    productCount: cat.products?.length || 0,
  }));
}

const FeaturedCategories = () => {
  const [categories, setCategories] = useState([]);
  const isAdmin = useIsAdmin();
  const { currentBusiness } = useAppContext();

  const fetchCategories = async () => {
    const cats = await getCategories(currentBusiness?.id);
    setCategories(cats);
  };

  useEffect(() => {
    fetchCategories(); 
  }, []); 

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete category "${name}"?`)) {
      try {
        await axios.delete(`/api/dbhandler?model=category&id=${id}`);
        toast.success("Category deleted");
        fetchCategories();
      } catch (err) {
        toast.error("Failed to delete category");
      }
    }
  };

import { CategoryCard } from "@/components/utility/CategoryCard";
import { Badge } from "@/components/ui/badge";

  return (
    <section className="py-20 md:py-32 bg-muted/20">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="mb-16 flex flex-col items-center text-center">
          <Badge className="mb-4 bg-accent/10 text-accent hover:bg-accent/20 border-none font-black text-[10px] tracking-widest uppercase py-1.5 px-4 rounded-full">Explore Our World</Badge>
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-primary uppercase">
            Product <span className="text-accent">Galleries</span>
          </h2>
          <p className="mt-4 max-w-xl text-muted-foreground font-medium text-lg italic">
            "Discover premium selections curated specifically for your lifestyle."
          </p>

          {isAdmin && (
            <div className="mt-8">
              <Dialog onOpenChange={(open) => !open && fetchCategories()}>
                <DialogTrigger asChild>
                  <Button className="h-12 px-8 rounded-2xl bg-accent hover:bg-accent/90 shadow-lg shadow-accent/20 gap-2 font-black text-xs uppercase tracking-widest">
                    <Plus className="h-4 w-4" />
                    Expand Catalog
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl bg-transparent border-none p-0 shadow-none">
                  <CategoryForm />
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {categories.length === 0 ? (
            [1,2,3,4].map((i) => (
              <div key={`empty-${i}`} className="aspect-[4/5] rounded-[2.5rem] bg-muted/40 animate-pulse border-2 border-dashed border-muted flex items-center justify-center">
                 <div className="h-10 w-10 text-muted-foreground/20 italic">Loading...</div>
              </div>
            ))
          ) : (
            categories.map((category: any) => (
              <div key={category.id} className="relative">
                {isAdmin && (
                  <div className="absolute top-4 left-4 flex gap-2 z-30">
                    <Dialog onOpenChange={(open) => !open && fetchCategories()}>
                      <DialogTrigger asChild>
                        <Button size="icon" variant="secondary" className="h-10 w-10 rounded-2xl bg-white/90 backdrop-blur-md shadow-xl text-primary hover:bg-accent hover:text-white transition-all">
                          <Edit3 className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl bg-transparent border-none p-0 shadow-none">
                        <CategoryForm initialCategory={category} hideList={true} /> 
                      </DialogContent>
                    </Dialog>
                    <Button 
                      size="icon" 
                      variant="destructive" 
                      className="h-10 w-10 rounded-2xl shadow-xl hover:scale-110 transition-transform"
                      onClick={() => handleDelete(category.id, category.name)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                <CategoryCard category={category} />
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCategories;
