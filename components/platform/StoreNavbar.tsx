"use client"
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useIsBusinessAdmin } from '@/hooks/useIsBusinessAdmin'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ChevronRight, Menu, Layout, BarChart3, Search, Camera, Edit2 } from 'lucide-react'
import { GlobalCart } from '@/components/utility/GlobalCart'
import { AIProductSearch } from '@/components/myComponents/subs/AIProductSearch'
import TemplateSelector from './TemplateSelector'
import { toast } from 'sonner'
import { updateSiteSettings } from '@/server/action/siteSettings'

import { AdminEditable } from '@/components/utility/AdminEditable'

interface Business {
  id: string
  name: string
  settings?: any
  sections?: any[]
  siteSettings?: any
}

const StoreNavbar = ({ business, businessId }: { business: Business, businessId?: string }) => {
  const { storeName } = useParams();
  const isAdmin = useIsBusinessAdmin();
  const pages = business.settings?.pages || [];
  const [iconMode, setIconMode] = useState<string>(business.siteSettings?.iconMode || 'text');
  const [iconText, setIconText] = useState<string>(business.siteSettings?.iconText || business.name);
  const [iconFontSize, setIconFontSize] = useState<number>(business.siteSettings?.iconFontSize || 20);
  const [iconFontColor, setIconFontColor] = useState<string>(business.siteSettings?.iconFontColor || '#000000');
  const [iconImageUrl, setIconImageUrl] = useState<string>(business.siteSettings?.iconImageUrl || '');
  const [iconImageWidth, setIconImageWidth] = useState<number>(business.siteSettings?.iconImageWidth || 40);
  const [iconImageHeight, setIconImageHeight] = useState<number>(business.siteSettings?.iconImageHeight || 40);
  const [isSavingIcon, setIsSavingIcon] = useState(false);

  useEffect(() => {
    setIconMode(business.siteSettings?.iconMode || 'text');
    setIconText(business.siteSettings?.iconText || business.name);
    setIconFontSize(business.siteSettings?.iconFontSize || 20);
    setIconFontColor(business.siteSettings?.iconFontColor || '#000000');
    setIconImageUrl(business.siteSettings?.iconImageUrl || '');
    setIconImageWidth(business.siteSettings?.iconImageWidth || 40);
    setIconImageHeight(business.siteSettings?.iconImageHeight || 40);
  }, [business]);

  const saveIconSettings = async () => {
    if (!businessId) {
      toast.error('Business context is missing');
      return;
    }
    setIsSavingIcon(true);
    const response = await updateSiteSettings({
      iconMode,
      iconText,
      iconFontSize,
      iconFontColor,
      iconImageUrl,
      iconImageWidth,
      iconImageHeight,
    }, businessId);

    if (response.success) {
      toast.success('Business icon settings saved');
    } else {
      toast.error(response.error || 'Failed to save icon settings');
    }
    setIsSavingIcon(false);
  };

  const showText = iconMode !== 'image';
  const showImage = iconMode !== 'text' && Boolean(iconImageUrl);
  const renderedIconText = iconText?.trim() || business.name;

  return (
   <nav className="w-full border-b sticky top-0 z-[50] py-4 px-4 md:px-12 flex justify-between items-center bg-white/80 backdrop-blur-lg">
     <div className="flex items-center gap-3">
       <div className="relative">
         <Link href={`/${storeName}`} className="flex items-center gap-2 text-xl md:text-2xl font-black tracking-tighter text-accent">
           {/* eslint-disable-next-line */}
           <div className="flex items-center justify-center overflow-hidden rounded-2xl border border-accent/20 bg-accent/10" style={{ width: iconImageWidth + 12, minWidth: 40, height: iconImageHeight + 12 }}>
             {showImage && (
               <img
                 src={iconImageUrl}
                 alt={renderedIconText}
                 className="object-cover"
                 style={{ width: iconImageWidth, height: iconImageHeight }}
               />
             )}
             {showText && (
               <span
                 className="font-black text-center truncate"
                 style={{ fontSize: iconFontSize, color: iconFontColor, lineHeight: 1 }}
               >
                 {renderedIconText}
               </span>
             )}
           </div>
         </Link>

         {isAdmin && (
           <Dialog>
             <DialogTrigger asChild>
               <button type="button" title="Edit icon settings" className="absolute -bottom-2 -right-2 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-white bg-white text-accent shadow-lg hover:bg-accent/10">
                 <Edit2 className="h-4 w-4" />
               </button>
             </DialogTrigger>
             <DialogContent className="max-w-xl">
               <DialogHeader>
                 <DialogTitle>Business Icon Settings</DialogTitle>
                 <DialogDescription>Choose text, image, or both and configure the styling for your store icon.</DialogDescription>
               </DialogHeader>
               <div className="grid gap-4 py-4">
                 <div className="grid gap-2">
                   <Label htmlFor="icon-mode">Icon Type</Label>
                   <Select value={iconMode} onValueChange={(value) => setIconMode(value)}>
                     <SelectTrigger id="icon-mode" className="h-11">
                       <SelectValue placeholder="Select icon type" />
                     </SelectTrigger>
                     <SelectContent>
                       <SelectItem value="text">Text Only</SelectItem>
                       <SelectItem value="image">Image Only</SelectItem>
                       <SelectItem value="both">Both</SelectItem>
                     </SelectContent>
                   </Select>
                 </div>

                 {(iconMode === 'text' || iconMode === 'both') && (
                   <div className="grid gap-2">
                     <Label htmlFor="icon-text">Icon Text</Label>
                     <Input
                       id="icon-text"
                       value={iconText}
                       onChange={(e) => setIconText(e.target.value)}
                       placeholder="Business name or initials"
                       className="h-11"
                     />
                     <div className="grid grid-cols-2 gap-2">
                       <div className="grid gap-2">
                         <Label htmlFor="icon-font-size">Font Size</Label>
                         <Input
                           id="icon-font-size"
                           type="number"
                           min={10}
                           max={60}
                           value={iconFontSize}
                           onChange={(e) => setIconFontSize(Number(e.target.value))}
                           className="h-11"
                         />
                       </div>
                       <div className="grid gap-2">
                         <Label htmlFor="icon-font-color">Font Color</Label>
                         <Input
                           id="icon-font-color"
                           type="color"
                           value={iconFontColor}
                           onChange={(e) => setIconFontColor(e.target.value)}
                           className="h-11 p-0"
                         />
                       </div>
                     </div>
                   </div>
                 )}

                 {(iconMode === 'image' || iconMode === 'both') && (
                   <div className="grid gap-2">
                     <Label htmlFor="icon-image-url">Icon Image URL</Label>
                     <Input
                       id="icon-image-url"
                       value={iconImageUrl}
                       onChange={(e) => setIconImageUrl(e.target.value)}
                       placeholder="https://example.com/logo.png"
                       className="h-11"
                     />
                     <div className="grid grid-cols-2 gap-2">
                       <div className="grid gap-2">
                         <Label htmlFor="icon-image-width">Image Width</Label>
                         <Input
                           id="icon-image-width"
                           type="number"
                           min={20}
                           max={200}
                           value={iconImageWidth}
                           onChange={(e) => setIconImageWidth(Number(e.target.value))}
                           className="h-11"
                         />
                       </div>
                       <div className="grid gap-2">
                         <Label htmlFor="icon-image-height">Image Height</Label>
                         <Input
                           id="icon-image-height"
                           type="number"
                           min={20}
                           max={200}
                           value={iconImageHeight}
                           onChange={(e) => setIconImageHeight(Number(e.target.value))}
                           className="h-11"
                         />
                       </div>
                     </div>
                   </div>
                 )}

                 <div className="rounded-3xl border border-muted/30 bg-muted/10 p-4">
                   <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Preview</p>
                   <div className="mt-3 inline-flex items-center gap-2 rounded-2xl border border-accent/20 bg-white p-3">
                     {showImage && iconImageUrl ? (
                       <img
                         src={iconImageUrl}
                         alt="Icon preview"
                         className="rounded-xl object-cover"
                         style={{ width: iconImageWidth, height: iconImageHeight }}
                       />
                     ) : null}
                     {showText ? (
                       <span
                         className="font-black truncate"
                         style={{ fontSize: iconFontSize, color: iconFontColor, maxWidth: 160 }}
                       >
                         {renderedIconText}
                       </span>
                     ) : null}
                   </div>
                 </div>
               </div>
               <DialogFooter>
                 <Button variant="outline" onClick={() => setIconMode(business.siteSettings?.iconMode || 'text')}>
                   Cancel
                 </Button>
                 <Button onClick={saveIconSettings} disabled={isSavingIcon}>
                   {isSavingIcon ? 'Saving...' : 'Save Icon'}
                 </Button>
               </DialogFooter>
             </DialogContent>
           </Dialog>
         )}
       </div>
       <Link href={`/${storeName}`} className="truncate max-w-[120px] md:max-w-none text-xl md:text-2xl font-black tracking-tighter text-accent">
         {business.name}
       </Link>
     </div>
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
         <>
           <TemplateSelector business={business} />
           <Link href={`/${storeName}/analytics`}>
            <Badge variant="secondary" className="bg-accent/10 text-accent font-black border-accent/20 cursor-pointer hover:bg-accent/20 py-2 hidden sm:flex">
              ADMIN <Layout className="h-3 w-3 ml-1" />
            </Badge>
           </Link>
         </>
       )}
       {businessId && (
         <AIProductSearch businessId={businessId}>
           <Button variant="ghost" size="icon" title="AI Product Search" className="hover:bg-accent/10 hover:text-accent">
             <Camera className="h-5 w-5" />
           </Button>
         </AIProductSearch>
       )}
       <Button variant="ghost" size="icon"><Search className="h-5 w-5" /></Button>
       <GlobalCart />
       <AdminEditable 
          value={business.siteSettings?.headerCTA || 'Join Platform'} 
          model="siteSettings" 
          id={business.siteSettings?.id || ''} 
          field="headerCTA"
       >
          <Button variant="outline" className="rounded-full font-bold md:flex hidden">
            {business.siteSettings?.headerCTA || 'Join Platform'}
          </Button>
       </AdminEditable>

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
             {isAdmin && (
               <TemplateSelector business={business} mobile={true} />
             )}
             {businessId && (
               <AIProductSearch businessId={businessId}>
                 <Button className="w-full h-12 bg-gradient-to-r from-accent to-primary hover:from-accent/90 hover:to-primary/90 text-white font-bold rounded-xl gap-2">
                   <Camera className="h-5 w-5" />
                   AI Product Search
                 </Button>
               </AIProductSearch>
             )}
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
