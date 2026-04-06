/* eslint-disable tailwindcss/no-inline-styles */
"use client"
import React from 'react'
import { useIsBusinessAdmin } from '@/hooks/useIsBusinessAdmin'
import { useMounted } from '@/hooks/use-mounted'
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
  FileText,
  GripHorizontal,
  Copy,
  Monitor,
  Tablet,
  Smartphone,
  Eye,
  Settings,
  Pointer,
} from 'lucide-react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
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
import { cn } from '@/lib/utils'
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
import { AIProductSearch } from '@/components/myComponents/subs/AIProductSearch'
import { BusinessProductSearch } from '@/components/utility/BusinessProductSearch'

interface NormalizedSection {
  id: string;
  type: string;
  variant: string;
  props: any;
  order: number;
}

interface Page {
  id: string
  name: string
  slug: string
  sections: NormalizedSection[]
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
    productCardLayout?: 'vertical' | 'horizontal'
    siteTemplate?: string
  }
  sections?: any[]
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
    iconMode?: string
    iconText?: string
    iconFontSize?: number
    iconFontColor?: string
    iconImageUrl?: string
    iconImageWidth?: number
    iconImageHeight?: number
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
  initialAdminTab = null,
  onDataChange
}: {
  business: Business,
  activePageSlug?: string,
  initialAdminTab?: 'pages' | 'settings' | null,
  onDataChange?: () => void
}) => {
  const { setCurrentBusiness, currentBusiness } = useAppContext();
  const isAdmin = useIsBusinessAdmin();
  const [business, setBusiness] = React.useState(initialBusiness);
  const [isAdminToolbarOpen, setIsAdminToolbarOpen] = React.useState(!!initialAdminTab);
  const [buildMode, setBuildMode] = React.useState(isAdmin);
  const [device, setDevice] = React.useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const mounted = useMounted();
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
  const activePage = settings?.pages?.find(p => p.slug === activePageSlug) ||
    (activePageSlug === 'home' && settings?.pages?.[0]?.slug === 'home' ? settings.pages[0] : null);

  // detect global reusable components (header/footer) and page-specific section list
  const normalizeSec = (s: any): NormalizedSection => {
    if (business.sections && business.sections.length) {
      // businessSection model mapping
      return {
        id: s.id,
        type: s.key || s.type,
        variant: s.settings?.layout || s.layout || 'default',
        props: s.content || s.data || {},
        order: s.position ?? 0
      }
    } else {
      // section model mapping
      return {
        id: s.id,
        type: s.type,
        variant: s.layout || 'default',
        props: s.data || {},
        order: s.order ?? 0
      }
    }
  }

  const rawSections = (business.sections?.length
    ? business.sections.filter((s: any) => s.page === activePageSlug && s.isActive !== false)
    : activePage?.sections || []
  );

  const sections: NormalizedSection[] = rawSections
    .map(normalizeSec)
    .sort((a: NormalizedSection, b: NormalizedSection) => a.order - b.order);

  const globalHeaderSections = (business.sections || [])
    .filter((s: any) => s.page === 'header' && s.isActive !== false)
    .sort((a: any, b: any) => (a.position ?? 0) - (b.position ?? 0));
  const globalFooterSections = (business.sections || [])
    .filter((s: any) => s.page === 'footer' && s.isActive !== false)
    .sort((a: any, b: any) => (a.position ?? 0) - (b.position ?? 0));

  // Active layout sections (handles optimistic drag)
  const [activeSections, setActiveSections] = React.useState<any[]>(sections);
  React.useEffect(() => {
    setActiveSections(sections);
  }, [sections]);

  const {
    handleAddSection,
    handleCreatePage,
    handleRemoveSection,
    handleMoveSection,
    handleApplyTemplate,
    handleReorderSections, // newly added
    handleDuplicateSection,
    updateGlobalSettings,
  } = useStoreActions({ activePage, sections: activeSections, settings, storeName, business, onDataChange });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = activeSections.findIndex((s) => s.id === active.id);
      const newIndex = activeSections.findIndex((s) => s.id === over?.id);
      const newSections = arrayMove(activeSections, oldIndex, newIndex);
      setActiveSections(newSections);
      
      if(handleReorderSections) {
         handleReorderSections(newSections.map((s, idx) => ({ id: s.id, position: idx })));
      }
    }
  };

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
       <StoreNavbar business={business} businessId={business.id} />

       {/* Global header components as reusable blocks */}
       {globalHeaderSections.map((section) => (
         <RenderSection key={`header-${section.id}`} section={section} business={business} isAdmin={isAdmin} activePageSlug={activePageSlug} />
       ))}

       {isAdmin && (
          <div className="sticky top-4 z-[100] w-full flex justify-center mb-6 px-4">
             <div className="bg-background/80 backdrop-blur-2xl border-2 shadow-2xl rounded-2xl p-1.5 flex items-center gap-2 ring-1 ring-black/5 animate-in slide-in-from-top-4 duration-500">
                <div className="flex bg-muted/30 rounded-xl p-1 gap-1">
                   <Button 
                      variant={device === 'desktop' ? 'secondary' : 'ghost'} 
                      size="sm" 
                      onClick={() => setDevice('desktop')}
                      className="h-9 w-9 p-0 rounded-lg transition-all"
                   >
                      <Monitor className="h-4 w-4" />
                   </Button>
                   <Button 
                      variant={device === 'tablet' ? 'secondary' : 'ghost'} 
                      size="sm" 
                      onClick={() => setDevice('tablet')}
                      className="h-9 w-9 p-0 rounded-lg transition-all"
                   >
                      <Tablet className="h-4 w-4" />
                   </Button>
                   <Button 
                      variant={device === 'mobile' ? 'secondary' : 'ghost'} 
                      size="sm" 
                      onClick={() => setDevice('mobile')}
                      className="h-9 w-9 p-0 rounded-lg transition-all"
                   >
                      <Smartphone className="h-4 w-4" />
                   </Button>
                </div>
                
                <div className="h-6 w-px bg-border mx-1"></div>
                
                <Button 
                   variant={buildMode ? 'default' : 'ghost'} 
                   size="sm" 
                   onClick={() => setBuildMode(!buildMode)}
                   className={cn(
                      "gap-2 px-4 h-9 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all",
                      buildMode ? "bg-accent text-white shadow-lg shadow-accent/20" : "text-muted-foreground"
                   )}
                >
                   {buildMode ? <Settings className="h-3.5 w-3.5 animate-spin-slow" /> : <Eye className="h-3.5 w-3.5" />}
                   {buildMode ? 'Build Mode' : 'Preview Mode'}
                </Button>
             </div>
          </div>
        )}

       {isAdmin && (
         <AdminToolbar
           business={business}
           onUpdateSettings={updateGlobalSettings}
           onCreatePage={handleCreatePage}
           isOpen={isAdminToolbarOpen}
           onOpenChange={setIsAdminToolbarOpen}
           initialTab={initialAdminTab}
           sections={sections}
           activePage={activePage}
           onAddSection={handleAddSection}
           onDeleteSection={handleRemoveSection}
           onMoveSection={handleMoveSection}
           onDuplicateSection={handleDuplicateSection}
           onSectionDataChange={onDataChange}
         />
       )}

        <main className={cn(
           "flex-1 transition-all duration-500 ease-in-out origin-top border-x-[12px] border-transparent bg-slate-100/30",
           (mounted && device === 'mobile') ? "max-w-[430px] shadow-2xl ring-12 ring-black/90 rounded-[3.5rem] my-12 min-h-[850px] border-black overflow-hidden" : 
           (mounted && device === 'tablet') ? "max-w-[800px] shadow-2xl ring-12 ring-black/80 rounded-[2.5rem] my-12 min-h-[1024px] border-black overflow-hidden" : 
           "w-full px-0"
        )}>
           <div className="w-full bg-white shadow-sm ring-1 ring-black/5">
             {/* Global Header Builder Sections */}
             {globalHeaderSections.map((s: any) => (
               <RenderSection key={s.id} section={normalizeSec(s)} business={business} isAdmin={false} activePageSlug={activePageSlug} />
             ))}

             {activeSections.length === 0 && (
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

             <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={activeSections.map(s => s.id)} strategy={verticalListSortingStrategy}>
                   {activeSections.map((section, idx, arr) => (
                     <SortableSectionRow 
                        key={section.id} 
                        section={section} 
                        idx={idx} 
                        arr={arr} 
                        isAdmin={isAdmin && buildMode} 
                        business={business}
                        activePageSlug={activePageSlug}
                        handleMoveSection={handleMoveSection}
                        handleRemoveSection={handleRemoveSection}
                        handleAddSection={handleAddSection}
                        handleDuplicateSection={handleDuplicateSection}
                     />
                   ))}
                </SortableContext>
             </DndContext>
             
             {/* Global Footer Builder Sections */}
             {globalFooterSections.map((s: any) => (
               <RenderSection key={s.id} section={normalizeSec(s)} business={business} isAdmin={false} activePageSlug={activePageSlug} />
             ))}
           </div>
        </main>

       <StoreFooter business={business} />
    </div>
  );
}

// Draggable wrapper for sections in the layout
const SortableSectionRow = ({ section, idx, arr, isAdmin, business, activePageSlug, handleMoveSection, handleRemoveSection, handleAddSection, handleDuplicateSection }: any) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className={`w-full group/section relative ${isDragging ? 'shadow-2xl ring-2 ring-accent scale-[1.02] rounded-3xl overflow-hidden' : ''}`}>
       {isAdmin && (
          <div className="absolute right-4 top-4 z-40 opacity-0 group-hover/section:opacity-100 transition-opacity flex gap-1 flex-wrap justify-end p-1.5 bg-background/90 backdrop-blur-xl rounded-xl border-2 shadow-xl items-center">
             <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing hover:bg-accent/10 p-2 text-muted-foreground transition-all rounded-lg flex items-center justify-center">
                <GripHorizontal className="h-4 w-4" />
             </div>
             <div className="h-6 w-px bg-border mx-1"></div>
             
             <SectionConfigDialog section={section} onUpdate={() => window.location.reload()} />
             
             <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-accent/10 text-muted-foreground" title="Duplicate Section" onClick={() => handleDuplicateSection(section)}>
                <Copy className="h-4 w-4" />
             </Button>

             <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-destructive/10 text-destructive" title="Remove Section" onClick={() => handleRemoveSection(section.id)}>
                <Trash2 className="h-4 w-4" />
             </Button>
          </div>
       )}
       
       {/* Block events from interfering with drag handle logic */}
       <div className={`${isDragging ? 'pointer-events-none' : ''}`}>
         <RenderSection section={section} business={business} isAdmin={isAdmin} activePageSlug={activePageSlug} />
       </div>

       {isAdmin && (
          <div className="h-12 w-full flex justify-center items-center bg-accent/5 border-b dash-border opacity-0 group-hover/section:opacity-100 transition-opacity absolute bottom-[-24px] z-30">
             <AddSectionTrigger onAdd={handleAddSection} />
          </div>
       )}
    </div>
  );
};

const BG_CLASSES: Record<string, string> = {
  '': '',
  'muted': 'bg-muted/30',
  'accent': 'bg-accent text-white',
  'dark': 'bg-black text-white',
  'gradient': 'bg-gradient-to-br from-background via-muted/20 to-background',
}

const RADIUS_CLASSES: Record<string, string> = {
  'none': 'rounded-none',
  'sm': 'rounded-sm',
  'md': 'rounded-md',
  'lg': 'rounded-lg',
  'xl': 'rounded-[2.5rem]',
  'full': 'rounded-full',
}

const SHADOW_CLASSES: Record<string, string> = {
  'none': 'shadow-none',
  'sm': 'shadow-sm',
  'md': 'shadow-md',
  'lg': 'shadow-xl',
  'xl': 'shadow-2xl shadow-accent/10',
}

const PADDING_CLASSES: Record<string, string> = {
  'none': 'py-0',
  'small': 'py-8',
  'medium': 'py-16 md:py-20',
  'large': 'py-24 md:py-32',
  'extra-large': 'py-32 md:py-48',
}

const ALIGN_CLASSES: Record<string, string> = {
  'left': 'text-left items-start',
  'center': 'text-center items-center',
  'right': 'text-right items-end',
}

const SectionWrapper = ({ section, children, className = "" }: { section: any, children: React.ReactNode, className?: string }) => {
  const settings = section.settings || section.data?.settings || section.data || {};
  const bg = BG_CLASSES[settings.bg as string] || '';
  const radius = RADIUS_CLASSES[settings.radius as string] || '';
  const shadow = SHADOW_CLASSES[settings.shadow as string] || '';
  const padding = PADDING_CLASSES[settings.padding as string] || (section.type === 'hero' ? 'py-0' : 'py-20');
  const alignment = ALIGN_CLASSES[settings.alignment as string] || '';

  return (
    <section className={cn(
      "w-full transition-all duration-500",
      bg,
      padding,
      className
    )}>
      <div className={cn(
        "max-w-7xl mx-auto px-4 md:px-8 flex flex-col transition-all",
        radius,
        shadow,
        alignment,
        (settings.bg && settings.bg !== 'gradient') ? 'p-8 md:p-12' : ''
      )}>
        {children}
      </div>
    </section>
  );
};

// Component to render custom UI based on ProjectSettings section definition
const RenderSection = ({ section, business, isAdmin, activePageSlug }: { section: any, business: Business, isAdmin: boolean, activePageSlug: string }) => {
   // old schema: { id, type, layout, data }
   // new schema: { id, key, type, settings, content }
   const { id } = section;
   const type = section.type || section.key || '';
   const layout = section.layout || section.settings?.layout || section.key || '';
   const data = section.data || section.content || {};
   const { storeName } = useParams();
   const searchParams = useSearchParams();
   
   // Auto-inject AI search section after hero
   const isHeroSection = type === 'hero';
   
   switch (type) {
     case 'hero':
        // Only render hero section on the home page
        if (activePageSlug !== 'home') {
          return null;
        }
        return (
          <div className="w-full">
            <Hero 
              variant={layout as any || 'modern-split'} 
              title={<AdminEditable value={business.siteSettings?.heroTitle || 'Welcome'} model="siteSettings" id={business.siteSettings?.id || ''} field="heroTitle">{business.siteSettings?.heroTitle || 'Welcome'}</AdminEditable>}
              subtitle={<AdminEditable value={business.siteSettings?.heroSubtitle || ''} model="siteSettings" id={business.siteSettings?.id || ''} field="heroSubtitle">{business.siteSettings?.heroSubtitle || ''}</AdminEditable>}
              sectionId={id} 
            />
            {/* AI Product Search Section Below Hero */}
            <section className="w-full py-12 px-4 md:px-8 bg-gradient-to-br from-background via-muted/30 to-background border-b border-t shadow-sm">
              <div className="max-w-7xl mx-auto">
                <AIProductSearch businessId={business.id}>
                  <Button 
                    className="w-full md:w-auto h-14 px-8 bg-accent hover:bg-accent/90 text-white font-black text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all group"
                  >
                    <Search className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                    Find Products with AI
                  </Button>
                </AIProductSearch>
                <p className="text-sm text-muted-foreground mt-3 text-center md:text-left">Snap a photo or upload a list of products you want to find</p>
              </div>
            </section>
          </div>
        );
     case 'products':
        return (
          <SectionWrapper section={section}>
             <div className="space-y-8 w-full">
                <AdminEditable as="h2" value={data?.title || 'Trending Products'} model="section" id={id} field="data.title" data={data} className="text-3xl font-black tracking-tight" />
                <FeaturedProducts categoryId={data?.categoryId} title={data?.title} businessId={business.id} storeName={storeName as string} />
             </div>
          </SectionWrapper>
        );
     case 'categories':
        return (
          <SectionWrapper section={section}>
             <div className="w-full">
                <AdminEditable as="h2" value={data?.title || 'Categories'} model="section" id={id} field="data.title" data={data} className="text-3xl font-black tracking-tight mb-8" />
                <FeaturedCategories businessId={business.id} />
             </div>
          </SectionWrapper>
        );
     case 'features':
        return <SectionWrapper section={section}><Features /></SectionWrapper>;
     case 'description':
        return (
          <SectionWrapper section={section}>
             <div className="max-w-4xl mx-auto space-y-6">
                <Info className="h-12 w-12 text-accent mx-auto" strokeWidth={3} />
                <AdminEditable as="h2" value={data?.title || 'Our Philosophy'} model="section" id={id} field="data.title" data={data} className="text-4xl font-extrabold tracking-tight underline decoration-accent/40" />
                <div className="w-full">
                  <AdminEditable as="p" value={business.siteSettings?.aboutText || 'This store provides the best service for all customers around the globe.'} model="siteSettings" id={business.siteSettings?.id || ''} field="aboutText" className="text-xl text-muted-foreground leading-loose italic" />
                </div>
             </div>
          </SectionWrapper>
        );
     case 'contact-form':
        return (
          <SectionWrapper section={section}>
             <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div className="space-y-8">
                   <div className="space-y-4">
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
          </SectionWrapper>
        );
     case 'chat-interface':
        return (
          <SectionWrapper section={section}>
             <div className="w-full space-y-8">
                <div className="text-center space-y-2">
                   <AdminEditable as="h2" value={data?.title || 'Talk to an Expert'} model="section" id={id} field="data.title" data={data} className="text-3xl font-black tracking-tight" />
                   <AdminEditable as="p" value={data?.text || 'Get instant support and consultation from our licensed team.'} model="section" id={id} field="data.text" data={data} className="text-muted-foreground" />
                </div>
                <ChatInterface />
             </div>
          </SectionWrapper>
        );
     case 'blog-posts':
        return (
          <SectionWrapper section={section}>
             <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6 w-full">
                <div className="space-y-2">
                   <AdminEditable as="h2" value={data?.title || 'Latest Insights'} model="section" id={id} field="data.title" data={data} className="text-3xl font-black" />
                   <AdminEditable as="p" value={data?.text || 'Knowledge base and updates from our experts.'} model="section" id={id} field="data.text" data={data} className="text-muted-foreground" />
                </div>
                <Button variant="outline" className="font-bold rounded-full border-2 h-12 px-8">View All Posts</Button>
             </div>
             <Posts page="General" />
          </SectionWrapper>
        );
     case 'product-list': {
        const productCardLayout = business.settings?.productCardLayout || 'vertical';
        
        const handleLayoutChange = async (newLayout: 'vertical' | 'horizontal') => {
          try {
            await axios.put(`/api/dbhandler?model=business`, {
              id: business.id,
              settings: { ...business.settings, productCardLayout: newLayout },
            });
            toast.success(`Layout saved: ${newLayout}`);
            window.location.reload();
          } catch (err) {
            toast.error('Failed to save layout');
          }
        };
        
        return (
          <SectionWrapper section={section}>
             <div className="w-full space-y-12">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                   <AdminEditable as="h2" value={data?.title || 'Catalog'} model="section" id={id} field="data.title" data={data} className="text-4xl font-black tracking-tighter" />
                   <div className="flex gap-4 items-center flex-wrap">
                      {isAdmin && (
                        <div className="bg-white/10 backdrop-blur-md rounded-xl p-1 flex items-center border border-white/20">
                           <Button 
                             variant={productCardLayout === 'vertical' ? 'secondary' : 'ghost'} 
                             size="sm" 
                             onClick={() => handleLayoutChange('vertical')}
                             className="rounded-lg h-9 px-3 text-xs font-bold"
                           >
                             Vertical
                           </Button>
                           <Button 
                             variant={productCardLayout === 'horizontal' ? 'secondary' : 'ghost'} 
                             size="sm" 
                             onClick={() => handleLayoutChange('horizontal')}
                             className="rounded-lg h-9 px-3 text-xs font-bold"
                           >
                             Horizontal
                           </Button>
                        </div>
                      )}
                      <Button variant="secondary" className="font-bold rounded-xl h-11 px-6">Filters</Button>
                      <div className="relative">
                         <Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                         <Input className="pl-10 h-11 w-64 rounded-xl border-2 hover:border-accent transition-colors" placeholder="Search products..." />
                      </div>
                   </div>
                </div>
                <Stocks businessId={business.id} />
             </div>
          </SectionWrapper>
        );
      }
     case 'newsletter':
        return (
           <SectionWrapper section={section}>
              <div className="w-full px-6 py-12 bg-accent rounded-[3rem] text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl shadow-accent/20">
                 <div className="space-y-2 flex-1">
                    <AdminEditable as="h3" value={business.siteSettings?.newsletterTitle || 'Join our Newsletter'} model="siteSettings" id={business.siteSettings?.id || ''} field="newsletterTitle" className="text-2xl font-black uppercase tracking-widest" />
                    <AdminEditable as="p" value={business.siteSettings?.newsletterText || 'Be the first to know about new arrivals and exclusive offers.'} model="siteSettings" id={business.siteSettings?.id || ''} field="newsletterText" className="text-white/80 font-medium" />
                 </div>
                 <div className="flex w-full md:w-auto gap-3 items-center">
                    <Input placeholder="your@email.com" className="bg-white/10 border-white/20 h-12 rounded-2xl w-full md:w-64 placeholder:text-white/50 font-bold" />
                    <Button className="h-12 px-8 rounded-2xl bg-white text-accent font-black hover:bg-white/90">Join</Button>
                 </div>
              </div>
           </SectionWrapper>
        );
     case 'stats': {
        const stats = business.stats || [];
        return (
           <SectionWrapper section={section} className="bg-accent text-white">
              <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
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
           </SectionWrapper>
        );
     }
     case 'partners': {
        const partners = business.partners || [];
        return (
           <SectionWrapper section={section}>
              <div className="w-full space-y-12">
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
           </SectionWrapper>
        );
     }
     case 'promotions': {
        const promos = business.promotions || [];
        return (
           <SectionWrapper section={section}>
              <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8">
                 {promos.map(promo => (
                    <div key={promo.id} className="relative h-[300px] rounded-[3rem] overflow-hidden group shadow-xl">
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
           </SectionWrapper>
        );
     }
     case 'cart':
        return (
           <SectionWrapper section={section}>
              <div className="w-full">
                 <div className="mb-12">
                    <h2 className="text-4xl font-black tracking-tighter">Shopping Bag</h2>
                    <p className="text-muted-foreground font-medium">Review your items before checkout.</p>
                 </div>
                 <CartDetails cartId="temp" />
              </div>
           </SectionWrapper>
        );
     case 'product-details': {
        const pId = searchParams.get('id');
        return <section className="w-full py-20 px-4 md:px-8"><ProductDetailView productId={pId || undefined} businessId={business.id} /></section>;
     }
     case 'staff': {
        const staff = business.staff || [];
        return (
          <SectionWrapper section={section}>
             <div className="w-full">
                <div className="mb-16 space-y-4">
                   <AdminEditable as="h2" value={data?.title || 'Meet the Experts'} model="section" id={id} field="data.title" data={data} className="text-4xl font-black" />
                   <AdminEditable as="p" value={data?.text || 'Our platform is powered by highly skilled individuals dedicated to your satisfaction.'} model="section" id={id} field="data.text" data={data} className="text-muted-foreground max-w-2xl" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 w-full">
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
          </SectionWrapper>
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
           <SectionWrapper section={section}>
              <div className="w-full space-y-12">
                 <div className="space-y-4">
                    <AdminEditable as="h2" value={data?.title || 'Help Center'} model="section" id={id} field="data.title" data={data} className="text-4xl font-black tracking-tighter" />
                    <AdminEditable as="p" value={data?.text || 'Find answers to common questions.'} model="section" id={id} field="data.text" data={data} className="text-muted-foreground" />
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                    {articles.map(article => (
                       <div key={article.id} className="p-8 bg-muted/20 rounded-[2rem] border-2 border-transparent hover:border-accent/10 transition-all group">
                          <AdminEditable as="h4" value={article.title} model="helpArticle" id={article.id} field="title" className="text-lg font-bold mb-3 group-hover:text-accent transition-colors" />
                          <AdminEditable as="p" value={article.content} model="helpArticle" id={article.id} field="content" className="text-sm text-muted-foreground line-clamp-3" />
                          <Button variant="link" className="px-0 h-auto mt-4 text-accent font-black">Read More</Button>
                       </div>
                    ))}
                 </div>
              </div>
           </SectionWrapper>
        );
     }
     default:
        return <div className="p-10 text-center text-muted-foreground">Unknown section type: {type}</div>;
   }
}

export default StoreHome;
