"use client"
import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import axios from 'axios'
import { Loader2, AlertCircle, ShoppingCart, Menu, User, Settings as SettingsIcon, PlusCircle, Layout } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppContext } from '@/hooks/useAppContext'
import StoreHome from '@/components/platform/StoreHome'
import { toast } from 'sonner'

const DynamicStorePage = () => {
  const params = useParams();
  const storeName = params.storeName as string;
  const slugArray = params.slug as string[] | undefined;
  const pageSlug = slugArray?.[0] || 'home';
  
  const router = useRouter();
  const { user, setCurrentBusiness } = useAppContext();
  const [business, setBusiness] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        const res = await axios.get(`/api/dbhandler?model=business`);
        const businesses = res.data;
        
        // Find by slug-ified name
        const biz = businesses.find((b: any) => 
          b.name.toLowerCase().replace(/\s+/g, '-') === storeName
        );

        if (!biz) {
          setError("Store not found");
          setIsLoading(false);
          return;
        }

        setBusiness(biz);
        setCurrentBusiness(biz); // Sync context
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching business:", err);
        setError("Failed to load store");
        setIsLoading(false);
      }
    };

    if (storeName) {
      fetchBusiness();
    }
  }, [storeName, setCurrentBusiness]);

  if (isLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-accent" />
        <p className="text-xl font-bold animate-pulse text-muted-foreground uppercase tracking-widest text-center">
            {slugArray ? `Navigating to ${pageSlug}...` : `Entering ${storeName}...`}
        </p>
      </div>
    );
  }

  if (error || !business) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center space-y-6 text-center px-4">
        <AlertCircle className="h-20 w-20 text-destructive" />
        <div className="space-y-2">
           <h1 className="text-4xl font-extrabold tracking-tight">Oops! That store doesn't exist.</h1>
           <p className="text-xl text-muted-foreground">It seems you've followed a broken link or the store has been renamed.</p>
        </div>
        <Button size="lg" onClick={() => router.push('/')} variant="outline" className="h-12 border-2 px-8 font-bold">
           Back to Platform Home
        </Button>
      </div>
    );
  }

  // Find the current page in business settings
  const currentPage = business.settings?.pages?.find((p: any) => p.slug === pageSlug) || (pageSlug === 'home' ? business.settings?.pages?.[0] : null);

  return (
    <div className="min-h-screen bg-background relative flex flex-col">
       {/* Store Header / Sticky Nav could go here if business wants one */}
       <StoreHome business={business} activePageSlug={pageSlug} />
    </div>
  );
}

export default DynamicStorePage
