"use client"
import React from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useIsBusinessAdmin } from '@/hooks/useIsBusinessAdmin'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { ChevronRight, Menu, Layout, Home as HomeIcon, BarChart3, Search } from 'lucide-react'
import { GlobalCart } from '@/components/utility/GlobalCart'

interface Business {
  id: string
  name: string
  settings?: any
  siteSettings?: any
}

const StoreNavbar = ({ business }: { business: Business }) => {
  const { storeName } = useParams();
  const isAdmin = useIsBusinessAdmin();
  const pages = business.settings?.pages || [];

  return (
   <nav className="w-full border-b sticky top-0 z-[50] py-4 px-4 md:px-12 flex justify-between items-center bg-white/80 backdrop-blur-lg">
     <Link href={`/${storeName}`} className="text-xl md:text-2xl font-black tracking-tighter text-accent flex items-center gap-2">
       <div className="h-10 w-10 bg-accent rounded-xl flex items-center justify-center text-white shadow-lg shrink-0">
         {business.name.charAt(0)}
       </div>
       <span className="truncate max-w-[120px] md:max-w-none">{business.name}</span>
     </Link>
     <div className="hidden md:flex items-center gap-8">
       {pages.map(page => (
         <Link
          key={page.id}
          href={page.slug === 'home' ? `/${storeName}` : `/${storeName}/${page.slug}`}
          className="font-bold text-sm uppercase tracking-widest hover:text-accent transition-colors"
         >
          {page.name}
         </Link>
       ))}
     </div>
     <div className="flex items-center gap-2 md:gap-4">
       {isAdmin && (
         <Link href={`/${storeName}/analytics`}>
          <Badge variant="secondary" className="bg-accent/10 text-accent font-black border-accent/20 cursor-pointer hover:bg-accent/20 py-2 hidden sm:flex">
            ADMIN <Layout className="h-3 w-3 ml-1" />
          </Badge>
         </Link>
       )}
       <Button variant="ghost" size="icon"><Search className="h-5 w-5" /></Button>
       <GlobalCart />
       <Button variant="outline" className="rounded-full font-bold md:flex hidden">
         {business.siteSettings?.headerCTA || 'Join Platform'}
       </Button>

       <Sheet>
         <SheetTrigger asChild>
           <Button variant="ghost" size="icon" className="md:hidden"><Menu className="h-5 w-5" /></Button>
         </SheetTrigger>
         <SheetContent side="right" className="w-[300px] sm:w-[400px] border-l-4 border-accent">
           <SheetHeader className="text-left mb-8">
             <SheetTitle className="text-2xl font-black flex items-center gap-2">
               <div className="h-10 w-10 bg-accent rounded-xl flex items-center justify-center text-white shrink-0">
                 {business.name.charAt(0)}
               </div>
               <span>{business.name}</span>
             </SheetTitle>
           </SheetHeader>
           <div className="flex flex-col gap-6">
             {pages.map(page => (
               <Link
                key={page.id}
                href={page.slug === 'home' ? `/${storeName}` : `/${storeName}/${page.slug}`}
                className="font-bold text-lg uppercase tracking-widest hover:text-accent transition-colors flex items-center justify-between group"
               >
                {page.name}
                <ChevronRight className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity" />
               </Link>
             ))}
             <div className="h-px bg-border my-4" />
             {isAdmin && (
               <Link href={`/${storeName}/analytics`} className="flex items-center gap-3 text-accent font-black">
                 <BarChart3 className="h-5 w-5" /> OWNER ANALYTICS
               </Link>
             )}
             <Button className="w-full bg-accent hover:bg-accent/90 text-white font-bold h-12 rounded-xl">Visit Platform</Button>
           </div>
         </SheetContent>
       </Sheet>
     </div>
   </nav>
  )
}

export default StoreNavbar
