"use client"
import React from 'react'
import { useIsBusinessAdmin } from '@/hooks/useIsBusinessAdmin'
import { AdminEditable } from '@/components/utility/AdminEditable'
import { PriceDisplay } from '@/components/utility/PriceDisplay'
import axios from 'axios'
import { toast } from 'sonner'
import { useAppContext } from '@/hooks/useAppContext'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from '@/components/ui/button'
import { DEFAULT_PAGE_TEMPLATES } from '@/lib/storeTemplates'
import {
  PlusCircle,
  Trash2,
  MoveUp,
  MoveDown,
  Globe,
  Settings as SettingsIcon,
  Layout,
  ChevronRight,
  Home as HomeIcon,
  Info,
  Bell,
  MessageSquare,
  Search,
  ShoppingCart,
  User as UserIcon,
  Menu,
  MessageCircle,
  X,
  Palette,
  CreditCard,
  Instagram,
  BarChart3,
  Send,
  Mail,
  Phone,
  MapPin,
  Package,
  Users,
  FileText
} from 'lucide-react'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { ScrollScaleWrapper } from '@/components/animation/ScrollScaleWrapper'
import Hero from '@/components/myComponents/subs/hero'
import FeaturedProducts from '@/components/myComponents/subs/featuredProducts'
import FeaturedCategories from '@/components/myComponents/subs/featuredCategories'
import Features from '@/components/myComponents/subs/features'
import Link from 'next/link'
import { useParams, useSearchParams } from 'next/navigation'
import { GlobalCart } from '@/components/utility/GlobalCart'
import { CartDetails } from '@/components/myComponents/subs/CartDetails'
import ContactForm from '@/components/utility/contactForm'
import { ChatInterface } from '@/components/myComponents/subs/ChatInterface'
import Posts from '@/components/myComponents/subs/posts'
import Stocks from '@/components/myComponents/subs/stocks'
import ProductDetailView from "@/components/myComponents/subs/ProductDetailView";
import ProductForm from "@/prisma/forms/ProductForm";
import StaffForm from "@/prisma/forms/StaffForm";
import PostForm from "@/prisma/forms/PostForm";
import StoreFooter from './StoreFooter'
import SectionConfigDialog from './SectionConfigDialog'
import StoreNavbar from './StoreNavbar'
import AddSectionTrigger from './AddSectionTrigger'
import AdminToolbar from './AdminToolbar'
import { useStoreActions } from '@/hooks/useStoreActions'

interface Section {
  id: string
  type: string
  layout: string
  data?: any
  order: number
}

interface Page {
  id: string
  name: string
  slug: string
  sections: any[]
}

interface Staff {
  id: string
  name: string
  role: string
  bio?: string
  image?: string
}

interface Promotion {
  id: string
  title: string
  description?: string
  image?: string
  discount?: number
}

interface BusinessStat {
  id: string
  label: string
  value: string
  icon?: string
}

interface Partner {
  id: string
  name: string
  logo?: string
  website?: string
}

interface HelpArticle {
  id: string
  title: string
  content: string
  category?: string
}

interface Business {
  id: string
  name: string
  slug: string
  logo?: string
  ownerId: string
  template: string
  settings?: {
    id: string
    currency: string
    exchangeRate: number
    pages: any[]
  }
  siteSettings?: {
    id: string
    aboutText: string
    contactEmail: string
    contactPhone: string
    contactDesc?: string
    helpText: string
    facebook?: string
    instagram?: string
    twitter?: string
    linkedin?: string
    headerCTA?: string
    footerText?: string
    address?: string
    newsletterTitle?: string
    newsletterText?: string
    heroTitle?: string
    heroSubtitle?: string
    heroCTA?: string
    heroCTALink?: string
    heroImage?: string
    addToHome?: string
  }
  staff?: Staff[]
  promotions?: Promotion[]
  stats?: BusinessStat[]
  partners?: Partner[]
  helpArticles?: HelpArticle[]
  reviews?: any[]
  posts?: any[]
}

const StoreHome = ({
  business: initialBusiness,
  activePageSlug = 'home',
  initialAdminTab = null
}: {
  business: Business,
  activePageSlug?: string,
  initialAdminTab?: 'pages' | 'settings' | null
}) => {
  const { setCurrentBusiness, currentBusiness } = useAppContext();
  const isAdmin = useIsBusinessAdmin();
  const [business, setBusiness] = React.useState(initialBusiness);
  const [isAdminToolbarOpen, setIsAdminToolbarOpen] = React.useState(!!initialAdminTab);
  const { storeName } = useParams();

  React.useEffect(() => {
    setCurrentBusiness(initialBusiness);
    setBusiness(initialBusiness);
  }, [initialBusiness, setCurrentBusiness]);

  React.useEffect(() => {
    if (initialAdminTab) {
      setIsAdminToolbarOpen(true);
    }
  }, [initialAdminTab]);

  const settings = business.settings;
  const activePage = settings?.pages?.find(p => p.slug === activePageSlug) || (activePageSlug === 'home' && settings?.pages?.[0]?.slug === 'home' ? settings.pages[0] : null);
  const sections = activePage?.sections || [];

  const {
    handleAddSection,
    handleCreatePage,
    handleRemoveSection,
    handleApplyTemplate,
    updateGlobalSettings,
  } = useStoreActions({ activePage, sections, settings, storeName, business });

  // If page doesn't exist, show helper
  if (!activePage) {
     return (
       <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
          <div className="h-20 w-20 bg-muted/20 rounded-full flex items-center justify-center">
             <Layout className="h-10 w-10 text-muted-foreground" />
          </div>
          <div className="text-center space-y-2">
             <h2 className="text-3xl font-bold uppercase tracking-tight">404 - Page Not Found</h2>
             <p className="text-muted-foreground">The page you're searching for hasn't been designed yet.</p>
          </div>
          {isAdmin && (
             <Button onClick={() => handleCreatePage(activePageSlug.charAt(0).toUpperCase() + activePageSlug.slice(1), activePageSlug)} className="gap-2 h-12 px-8 font-bold text-lg">
                <PlusCircle className="h-5 w-5" /> Initialize "{activePageSlug}" Page
             </Button>
          )}
          <Button variant="outline" onClick={() => window.location.href=`/${storeName}`}>Back to Home</Button>
       </div>
     );
  }

  return (
    <div className="flex flex-col items-center w-full relative">
       <StoreNavbar business={business} />

       {isAdmin && (
         <AdminToolbar
           business={business}
           onUpdateSettings={updateGlobalSettings}
           onCreatePage={handleCreatePage}
           isOpen={isAdminToolbarOpen}
           onOpenChange={setIsAdminToolbarOpen}
           initialTab={initialAdminTab}
         />
       )}

       <main className="w-full flex-1">
          {sections.length === 0 && (
             <div className="w-full min-h-[400px] flex flex-col items-center justify-center border-4 border-dashed border-accent/20 my-10 rounded-[3rem] bg-accent/5 p-10 text-center mx-auto max-w-7xl px-4">
                <Layout className="h-16 w-16 text-accent/40 mb-6" />
                <h3 className="text-2xl font-bold text-accent mb-2">This page has no content yet.</h3>
                <p className="max-w-md text-muted-foreground mb-8">Start from scratch or jump-start your design with one of our professional templates.</p>

                {isAdmin && (
                   <div className="flex flex-wrap justify-center gap-4">
                      <AddSectionTrigger onAdd={handleAddSection} />
                      <div className="h-10 w-px bg-accent/20 mx-2 hidden md:block" />
                      <div className="flex flex-wrap gap-2 justify-center">
                         {Object.keys(DEFAULT_PAGE_TEMPLATES).map((key) => (
                            <Button key={key} variant="outline" size="sm" onClick={() => handleApplyTemplate(key)} className="capitalize font-bold">
                               Apply {key} Layout
                            </Button>
                         ))}
                      </div>
                   </div>
                )}
             </div>
          )}

          {sections.sort((a,b) => a.order - b.order).map((section, idx) => (
            <div key={section.id} className="w-full group/section relative">
               {isAdmin && (
                  <div className="absolute right-4 top-4 z-40 opacity-0 group-hover/section:opacity-100 transition-opacity flex gap-2">
                     <SectionConfigDialog section={section} onUpdate={() => window.location.reload()} />
                     <Button size="icon" variant="destructive" className="h-8 w-8" onClick={() => handleRemoveSection(section.id)}>
                        <Trash2 className="h-4 w-4" />
                     </Button>
                  </div>
               )}
               <RenderSection section={section} business={business} />

               {isAdmin && (
                  <div className="h-12 w-full flex justify-center items-center bg-accent/5 border-b dash-border">
                     <AddSectionTrigger onAdd={handleAddSection} />
                  </div>
               )}
            </div>
          ))}
       </main>

       <StoreFooter business={business} />
    </div>
  );
}


// Component to render custom UI based on ProjectSettings section definition
const RenderSection = ({ section, business }: { section: any, business: Business }) => {
   const { id, type, layout, data } = section;
   const { storeName } = useParams();
   const searchParams = useSearchParams();
   
   switch (type) {
     case 'hero':
        return (
          <Hero 
            variant={layout as any || 'modern-split'} 
            title={<AdminEditable value={business.siteSettings?.heroTitle || 'Welcome'} model="siteSettings" id={business.siteSettings?.id || ''} field="heroTitle">{business.siteSettings?.heroTitle || 'Welcome'}</AdminEditable>}
            subtitle={<AdminEditable value={business.siteSettings?.heroSubtitle || ''} model="siteSettings" id={business.siteSettings?.id || ''} field="heroSubtitle">{business.siteSettings?.heroSubtitle || ''}</AdminEditable>}
            sectionId={id} 
          />
        );
     case 'products':
        if (layout === 'carousel of products') {
          return (
            <ScrollScaleWrapper className="w-full flex justify-center py-10">
               <div className="space-y-4 w-full">
                  <AdminEditable as="h2" value={data?.title || 'Trending Products'} model="section" id={id} field="data.title" data={data} className="text-3xl font-bold px-10" />
                  <FeaturedProducts categoryId={data?.categoryId} title={data?.title} />
               </div>
            </ScrollScaleWrapper>
          );
        }
        return <FeaturedProducts />;
     case 'categories':
        return <FeaturedCategories />;
     case 'features':
        return <Features />;
     case 'description':
        return (
          <ScrollScaleWrapper className="w-full py-20 px-4 md:px-20 bg-muted/10 translate-y-[-2px] border-b">
             <div className="max-w-4xl mx-auto space-y-6 text-center">
                <Info className="h-12 w-12 text-accent mx-auto" strokeWidth={3} />
                <AdminEditable as="h2" value={data?.title || 'Our Philosophy'} model="section" id={id} field="data.title" data={data} className="text-4xl font-extrabold tracking-tight underline decoration-accent/40" />
                <div className="w-full">
                  <AdminEditable as="p" value={business.siteSettings?.aboutText || 'This store provides the best service for all customers around the globe.'} model="siteSettings" id={business.siteSettings?.id || ''} field="aboutText" className="text-xl text-muted-foreground leading-loose italic" />
                </div>
             </div>
          </ScrollScaleWrapper>
        );
     case 'contact-form':
        return (
          <div className="w-full py-20 px-4 md:px-20 bg-background">
             <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div className="space-y-8">
                   <div className="space-y-4 text-center md:text-left">
                      <AdminEditable as="h2" value={data?.title || 'Connect with Us'} model="section" id={id} field="data.title" data={data} className="text-4xl font-black tracking-tighter text-accent" />
                      <AdminEditable as="p" value={data?.text || "We'd love to hear from you. Fill out the form or use our contact details."} model="section" id={id} field="data.text" data={data} className="text-muted-foreground text-lg" />
                   </div>
                   <div className="space-y-6">
                      <div className="flex gap-4 items-center">
                         <div className="h-12 w-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent"><Mail /></div>
                         <div><p className="text-xs font-black uppercase text-muted-foreground">Email</p><AdminEditable value={business.siteSettings?.contactEmail || `support@${storeName}.com`} model="siteSettings" id={business.siteSettings?.id || ''} field="contactEmail" className="font-bold" /></div>
                      </div>
                      <div className="flex gap-4 items-center">
                         <div className="h-12 w-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent"><Phone /></div>
                         <div><p className="text-xs font-black uppercase text-muted-foreground">Phone</p><AdminEditable value={business.siteSettings?.contactPhone || '+234 (0) 000 000 0000'} model="siteSettings" id={business.siteSettings?.id || ''} field="contactPhone" className="font-bold" /></div>
                      </div>
                      <div className="flex gap-4 items-center">
                         <div className="h-12 w-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent"><MapPin /></div>
                         <div><p className="text-xs font-black uppercase text-muted-foreground">Office</p><AdminEditable value={business.siteSettings?.address || 'Global Presence'} model="siteSettings" id={business.siteSettings?.id || ''} field="address" className="font-bold" /></div>
                      </div>
                   </div>
                </div>
                <div className="bg-card shadow-2xl rounded-[2.5rem] overflow-hidden border">
                   <ContactForm />
                </div>
             </div>
          </div>
        );
     case 'chat-interface':
        return (
          <div className="w-full py-20 px-4 bg-accent/5">
             <div className="max-w-5xl mx-auto space-y-8">
                <div className="text-center space-y-2">
                   <AdminEditable as="h2" value={data?.title || 'Talk to an Expert'} model="section" id={id} field="data.title" data={data} className="text-3xl font-black tracking-tight" />
                   <AdminEditable as="p" value={data?.text || 'Get instant support and consultation from our licensed team.'} model="section" id={id} field="data.text" data={data} className="text-muted-foreground" />
                </div>
                <ChatInterface />
             </div>
          </div>
        );
     case 'blog-posts':
        return (
          <div className="w-full py-20 px-4 max-w-7xl mx-auto">
             <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                <div className="space-y-2 text-center md:text-left">
                   <AdminEditable as="h2" value={data?.title || 'Latest Insights'} model="section" id={id} field="data.title" data={data} className="text-3xl font-black" />
                   <AdminEditable as="p" value={data?.text || 'Knowledge base and updates from our experts.'} model="section" id={id} field="data.text" data={data} className="text-muted-foreground" />
                </div>
                <Button variant="outline" className="font-bold rounded-full border-2 h-12 px-8">View All Posts</Button>
             </div>
             <Posts page="General" />
          </div>
        );
     case 'product-list':
        return (
          <div className="w-full py-20 bg-background">
             <div className="max-w-7xl mx-auto px-4 space-y-12">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                   <AdminEditable as="h2" value={data?.title || 'Catalog'} model="section" id={id} field="data.title" data={data} className="text-4xl font-black tracking-tighter" />
                   <div className="flex gap-4">
                      <Button variant="secondary" className="font-bold rounded-xl h-11 px-6">Filters</Button>
                      <div className="relative">
                         <Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                         <Input className="pl-10 h-11 w-64 rounded-xl border-2 hover:border-accent transition-colors" placeholder="Search products..." />
                      </div>
                   </div>
                </div>
                <Stocks />
             </div>
          </div>
        );
     case 'newsletter':
        return (
           <div className="w-full py-20 px-4 md:px-0">
              <div className="max-w-4xl mx-auto px-6 py-12 bg-accent rounded-[3rem] text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl shadow-accent/20">
                 <div className="space-y-2 flex-1 text-center md:text-left">
                    <AdminEditable as="h3" value={business.siteSettings?.newsletterTitle || 'Join our Newsletter'} model="siteSettings" id={business.siteSettings?.id || ''} field="newsletterTitle" className="text-2xl font-black uppercase tracking-widest" />
                    <AdminEditable as="p" value={business.siteSettings?.newsletterText || 'Be the first to know about new arrivals and exclusive offers.'} model="siteSettings" id={business.siteSettings?.id || ''} field="newsletterText" className="text-white/80 font-medium" />
                 </div>
                 <div className="flex w-full md:w-auto gap-3 items-center">
                    <Input placeholder="your@email.com" className="bg-white/10 border-white/20 h-12 rounded-2xl w-full md:w-64 placeholder:text-white/50 font-bold" />
                    <Button className="h-12 px-8 rounded-2xl bg-white text-accent font-black hover:bg-white/90">Join</Button>
                 </div>
              </div>
           </div>
        );
     case 'stats': {
        const stats = business.stats || [];
        return (
           <div className="w-full py-20 bg-accent text-white">
              <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
                 {stats.map(stat => (
                    <div key={stat.id} className="space-y-2">
                       <AdminEditable 
                          as="h4" 
                          value={stat.value} 
                          model="businessStat" 
                          id={stat.id} 
                          field="value" 
                          className="text-5xl font-black" 
                       />
                       <AdminEditable 
                          as="p" 
                          value={stat.label} 
                          model="businessStat" 
                          id={stat.id} 
                          field="label" 
                          className="text-sm font-bold uppercase tracking-widest opacity-70" 
                       />
                    </div>
                 ))}
              </div>
           </div>
        );
     }
     case 'partners': {
        const partners = business.partners || [];
        return (
           <div className="w-full py-20 bg-muted/30">
              <div className="max-w-7xl mx-auto px-6 text-center space-y-12">
                 <AdminEditable as="h2" value={data?.title || 'Our Trusted Partners'} model="section" id={id} field="data.title" data={data} className="text-sm font-black uppercase tracking-widest text-muted-foreground" />
                 <div className="flex flex-wrap justify-center items-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                    {partners.map(partner => (
                       <div key={partner.id} className="flex flex-col items-center gap-2">
                          <img src={partner.logo || ''} alt={partner.name} className="h-12 object-contain" />
                          <AdminEditable 
                             as="p" 
                             value={partner.name} 
                             model="partner" 
                             id={partner.id} 
                             field="name" 
                             className="text-[10px] font-bold uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity" 
                          />
                       </div>
                    ))}
                 </div>
              </div>
           </div>
        );
     }
     case 'promotions': {
        const promos = business.promotions || [];
        return (
           <div className="w-full py-20 overflow-hidden">
              <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                 {promos.map(promo => (
                    <div key={promo.id} className="relative h-[300px] rounded-[3rem] overflow-hidden group">
                       <img
                         src={promo.image || ''}
                         alt={promo.title || 'Promotion image'}
                         className="absolute inset-0 h-full w-full object-cover group-hover:scale-110 transition-transform duration-700"
                       />
                       <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent p-10 flex flex-col justify-end">
                          <AdminEditable 
                             as="h4" 
                             value={promo.title} 
                             model="promotion" 
                             id={promo.id} 
                             field="title" 
                             className="text-3xl font-black text-white" 
                          />
                          <AdminEditable 
                             as="p" 
                             value={promo.description || ''} 
                             model="promotion" 
                             id={promo.id} 
                             field="description" 
                             className="text-white/70 font-medium mb-4" 
                          />
                          {promo.discount && <Badge className="w-fit bg-red-600 font-black">{promo.discount}% OFF</Badge>}
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        );
     }
     case 'cart':
        return (
          <div className="w-full py-20 px-4 max-w-7xl mx-auto">
             <div className="mb-12 text-center md:text-left">
                <h2 className="text-4xl font-black tracking-tighter">Shopping Bag</h2>
                <p className="text-muted-foreground font-medium">Review your items before checkout.</p>
             </div>
             <CartDetails cartId="temp" />
          </div>
        );
     case 'product-details': {
        const pId = searchParams.get('id');
        return <ProductDetailView productId={pId || undefined} businessId={business.id} />;
     }
     case 'staff': {
        const staff = business.staff || [];
        return (
          <div className="w-full py-20 px-6 max-w-7xl mx-auto border-t border-dashed">
             <div className="text-center mb-16 space-y-4">
                <AdminEditable as="h2" value={data?.title || 'Meet the Experts'} model="section" id={id} field="data.title" data={data} className="text-4xl font-black" />
                <AdminEditable as="p" value={data?.text || 'Our platform is powered by highly skilled individuals dedicated to your satisfaction.'} model="section" id={id} field="data.text" data={data} className="text-muted-foreground max-w-2xl mx-auto" />
             </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {staff.length > 0 ? staff.map((member, i) => (
                   <div key={member.id} className="flex flex-col items-center group">
                      <div className="h-40 w-40 rounded-full overflow-hidden mb-4 border-4 border-accent/10 group-hover:border-accent transition-all duration-300 shadow-xl group-hover:shadow-accent/20">
                         <img src={member.image || 'https://res.cloudinary.com/dc5khnuiu/image/upload/v1752627019/uxokaq0djttd7gsslwj9.png'} alt={member.name} className="h-full w-full object-cover scale-110 group-hover:scale-100 transition-transform duration-500" />
                      </div>
                      <AdminEditable 
                         as="h4" 
                         value={member.name} 
                         model="staff" 
                         id={member.id} 
                         field="name" 
                         className="font-bold text-lg group-hover:text-accent transition-colors" 
                      />
                      <AdminEditable 
                         as="p" 
                         value={member.role} 
                         model="staff" 
                         id={member.id} 
                         field="role" 
                         className="text-sm text-muted-foreground uppercase tracking-widest font-bold text-[10px]" 
                      />
                   </div>
                )) : (
                   <div className="col-span-full py-20 text-center text-muted-foreground border-2 border-dashed rounded-3xl">
                      <p>No team members listed yet. Add staff to your business dashboard.</p>
                   </div>
                )}
             </div>
          </div>
        );
     }
     case 'chat':
        return (
          <div className="fixed bottom-6 right-6 z-[60] group">
             <Button className="rounded-full h-16 w-16 bg-blue-600 hover:bg-blue-700 shadow-2xl text-white transform hover:scale-110 transition-transform">
                <MessageSquare className="h-8 w-8" />
             </Button>
             <div className="absolute right-0 bottom-full mb-4 w-60 bg-white p-4 rounded-2xl shadow-2xl border hidden group-hover:block animate-in slide-in-from-bottom-2">
                <p className="font-bold">Need help?</p>
                <p className="text-sm text-muted-foreground">Chat with us right now!</p>
             </div>
          </div>
        );
     case 'notifications':
        return (
          <div className="relative w-full h-0 z-40 overflow-visible text-center">
             <div className="inline-flex bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 rounded-full shadow-2xl items-center gap-3 animate-bounce translate-y-[-50px]">
                <Bell className="h-6 w-6" />
                <span className="font-bold uppercase tracking-widest text-sm">{data?.text || "Special Weekend Sale - 20% OFF!"}</span>
             </div>
          </div>
        );
     case 'help': {
        const articles = business.helpArticles || [];
        return (
           <div className="w-full py-20 px-6 max-w-5xl mx-auto space-y-12">
              <div className="text-center space-y-4">
                 <AdminEditable as="h2" value={data?.title || 'Help Center'} model="section" id={id} field="data.title" data={data} className="text-4xl font-black tracking-tighter" />
                 <AdminEditable as="p" value={data?.text || 'Find answers to common questions.'} model="section" id={id} field="data.text" data={data} className="text-muted-foreground" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {articles.map(article => (
                    <div key={article.id} className="p-8 bg-muted/20 rounded-[2rem] border-2 border-transparent hover:border-accent/10 transition-all group">
                       <AdminEditable as="h4" value={article.title} model="helpArticle" id={article.id} field="title" className="text-lg font-bold mb-3 group-hover:text-accent transition-colors" />
                       <AdminEditable as="p" value={article.content} model="helpArticle" id={article.id} field="content" className="text-sm text-muted-foreground line-clamp-3" />
                       <Button variant="link" className="px-0 h-auto mt-4 text-accent font-black">Read More</Button>
                    </div>
                 ))}
              </div>
           </div>
        );
     }
     default:
        return <div className="p-10 text-center text-muted-foreground">Unknown section type: {type}</div>;
   }
}

export default StoreHome;
