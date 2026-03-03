"use client"
import React from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { AdminEditable } from '@/components/utility/AdminEditable'
import { Button } from '@/components/ui/button'
import { MapPin, MessageCircle, Instagram, Globe } from 'lucide-react'

interface Business {
  id: string
  name: string
  settings?: any
  sections?: any[]
  siteSettings?: any
}

const StoreFooter = ({ business }: { business: Business }) => {
   const { storeName } = useParams();
   const pages = business.settings?.pages || [];

   return (
     <footer className="w-full bg-slate-50 border-t py-12 px-6 md:px-12 mt-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
           <div className="space-y-4">
              <Link href={`/${storeName}`} className="text-xl font-black tracking-tighter text-accent flex items-center gap-2">
                 <div className="h-8 w-8 bg-accent rounded-lg flex items-center justify-center text-white font-bold shadow-md">
                    {business.name.charAt(0)}
                 </div>
                 <span>{business.name}</span>
              </Link>
              <AdminEditable as="p" value={business.siteSettings?.footerText || `Experience premium quality products and world-class service tailored just for you. Shop with ${business.name} today.`} model="siteSettings" id={business.siteSettings?.id || ''} field="footerText" className="text-sm text-muted-foreground leading-relaxed" />
              {business.siteSettings?.address && <p className="text-[10px] font-black uppercase text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" /> {business.siteSettings.address}</p>}
           </div>

           <div>
              <h4 className="font-bold text-sm uppercase tracking-widest mb-6">Navigation</h4>
              <ul className="space-y-3">
                 {pages.map((page: any) => (
                    <li key={page.id}>
                       <Link
                         href={page.slug === 'home' ? `/${storeName}` : `/${storeName}/${page.slug}`}
                         className="text-sm text-muted-foreground hover:text-accent transition-colors"
                       >
                          {page.name}
                       </Link>
                    </li>
                 ))}
              </ul>
           </div>

           <div>
              <h4 className="font-bold text-sm uppercase tracking-widest mb-6">Support</h4>
              <ul className="space-y-3">
                 <li><Link href="#" className="text-sm text-muted-foreground hover:text-accent font-medium">FAQ</Link></li>
                 <li><Link href="#" className="text-sm text-muted-foreground hover:text-accent font-medium">Shipping Policy</Link></li>
                 <li><Link href="#" className="text-sm text-muted-foreground hover:text-accent font-medium">Return Policy</Link></li>
                 <li><Link href="/contact" className="text-sm text-muted-foreground hover:text-accent font-medium">Contact Us</Link></li>
              </ul>
           </div>

           <div className="space-y-6">
              <h4 className="font-bold text-sm uppercase tracking-widest mb-2">Connect</h4>
               <div className="flex gap-4">
                  <Link href={business.siteSettings?.facebook || "#"} target="_blank">
                    <Button variant="outline" size="icon" className="h-10 w-10 rounded-full hover:bg-accent hover:text-white transition-all"><MessageCircle className="h-5 w-5" /></Button>
                  </Link>
                  <Link href={business.siteSettings?.instagram || "#"} target="_blank">
                    <Button variant="outline" size="icon" className="h-10 w-10 rounded-full hover:bg-accent hover:text-white transition-all"><Instagram className="h-5 w-5" /></Button>
                  </Link>
                  {business.siteSettings?.twitter && (
                    <Link href={business.siteSettings.twitter} target="_blank">
                      <Button variant="outline" size="icon" className="h-10 w-10 rounded-full hover:bg-accent hover:text-white transition-all"><Globe className="h-5 w-5" /></Button>
                    </Link>
                  )}
               </div>
              <p className="text-xs text-muted-foreground"> Powered by <span className="font-bold text-accent">VendorPort</span> Platforms </p>
           </div>
        </div>
        <div className="max-w-7xl mx-auto pt-12 mt-12 border-t text-center text-xs text-muted-foreground">
           &copy; {new Date().getFullYear()} {business.name}. All rights reserved.
        </div>
     </footer>
   );
}

export default StoreFooter
