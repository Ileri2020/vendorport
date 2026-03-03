"use client"
import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import axios from 'axios'
import { Loader2, AlertCircle, ShoppingCart, Menu, User, Settings, BarChart3, PlusCircle } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppContext } from '@/hooks/useAppContext'
import { usePageCache } from '@/hooks/usePageCache'
import StoreHome from '@/components/platform/StoreHome'
import { toast } from 'sonner'

const DynamicStorePage = () => {
  const params = useParams();
  const storeName = params.storeName as string;
  const slugArray = params.slug as string[] | undefined;
  const pageSlug = slugArray?.[0] || 'home';
  
  const router = useRouter();
  const { user, setCurrentBusiness } = useAppContext();
  const { pageData, business, isLoading, error, invalidateCache } = usePageCache(storeName, pageSlug);
  const [adminTab, setAdminTab] = useState<'pages' | 'settings' | null>(null);

  useEffect(() => {
    if (business) {
      setCurrentBusiness(business);
    }
  }, [business, setCurrentBusiness]);

  const handleOpenAdmin = (tab: 'pages' | 'settings') => {
    setAdminTab(null);
    setTimeout(() => setAdminTab(tab), 10);
  };

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

  return (
    <div className="min-h-screen bg-background relative flex flex-col">
       {/* Admin Toolbar (only if owner/staff) */}
       {(user.id === business.ownerId || user.role === 'admin' || user.role === 'staff') && (
         <div className="sticky top-0 z-50 bg-accent text-white py-2 px-4 shadow-xl flex justify-between items-center bg-opacity-95 backdrop-blur-md">
            <div className="flex items-center gap-2">
               <div className="h-8 w-8 bg-white/20 rounded flex items-center justify-center font-bold">A</div>
               <span className="font-bold hidden md:inline uppercase tracking-tighter text-sm">Owner Mode: {business.name}</span>
            </div>
            <div className="flex gap-2">
               <Link href={`/${storeName}/analytics`}>
                 <Button size="sm" variant="outline" className="text-white border-white/40 hover:bg-white/20 flex items-center gap-1 font-bold text-xs h-9">
                    <BarChart3 className="h-4 w-4" /> <span className="hidden sm:inline">Insights</span>
                 </Button>
               </Link>
               <Button onClick={() => handleOpenAdmin('pages')} size="sm" variant="outline" className="text-white border-white/40 hover:bg-white/20 flex items-center gap-1 font-bold text-xs h-9">
                  <PlusCircle className="h-4 w-4" /> <span className="hidden sm:inline">Add Page</span>
               </Button>
               <Button onClick={() => handleOpenAdmin('settings')} size="sm" variant="outline" className="text-white border-white/40 hover:bg-white/20 flex items-center gap-1 font-bold text-xs h-9">
                  <Settings className="h-4 w-4" /> <span className="hidden sm:inline">Edit Layout</span>
               </Button>
            </div>
         </div>
       )}

       <StoreHome business={business} activePageSlug={pageSlug} initialAdminTab={adminTab} onDataChange={invalidateCache} />
    </div>
  );
}

export default DynamicStorePage
