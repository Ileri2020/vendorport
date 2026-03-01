"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useIsAdmin } from "@/hooks/useIsAdmin";
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
async function getCategories() {
  const res = await fetch(`/api/dbhandler?model=category`);

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

  const fetchCategories = async () => {
    const cats = await getCategories();
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

  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col items-center text-center">
          <h2 className="font-display text-3xl leading-tight font-bold tracking-tight md:text-4xl">
            Shop by Category
          </h2>
          <div className="mt-2 h-1 w-12 rounded-full bg-primary" />
          <p className="mt-4 max-w-2xl text-center text-muted-foreground">
            Find the perfect product for your needs from our curated collections
          </p>

          {isAdmin && (
            <div className="mt-6">
              <Dialog onOpenChange={(open) => !open && fetchCategories()}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Category
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add New Category</DialogTitle>
                  </DialogHeader>
                  <CategoryForm />
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {categories.map((category: any) => (
            <div key={category.id} className="group relative flex flex-col space-y-4 overflow-hidden rounded-2xl border bg-card shadow transition-all duration-300 hover:shadow-lg">
              {isAdmin && (
                <div className="absolute top-2 right-2 flex gap-2 z-30">
                  <Dialog onOpenChange={(open) => !open && fetchCategories()}>
                    <DialogTrigger asChild>
                      <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm shadow-sm">
                        <Edit3 className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Edit Category: {category.name}</DialogTitle>
                      </DialogHeader>
                      {/* Passing category as initialData or similar might be needed if CategoryForm supports it, 
                          but CategoryForm usually fetches or we can just let it be. 
                          Actually CategoryForm uses internal state. We might need to modify CategoryForm to accept initialCategory. */}
                      <CategoryForm initialCategory={category} hideList={true} /> 
                    </DialogContent>
                  </Dialog>
                  <Button 
                    size="icon" 
                    variant="destructive" 
                    className="h-8 w-8 rounded-full bg-destructive/80 backdrop-blur-sm shadow-sm"
                    onClick={() => handleDelete(category.id, category.name)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
              <Link
                href={`/store?category=${category.name.toLowerCase()}`}
                aria-label={`Browse ${category.name} products`}
                className="flex flex-col h-full"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <div className="absolute inset-0 z-10 bg-gradient-to-t from-background/80 to-transparent" />
                  <img
                    src={category.image}
                    alt={category.name}
                    className="object-cover transition duration-300 scale-110 group-hover:scale-100 w-full h-full"
                  />
                </div>

                <div className="relative z-20 -mt-6 p-4">
                  <div className="mb-1 text-lg font-semibold">
                    {category.name}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {category.productCount} products
                  </p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCategories;
