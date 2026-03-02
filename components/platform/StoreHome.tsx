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
  Instagram
} from 'lucide-react'
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs"
import { ScrollScaleWrapper } from '@/components/animation/ScrollScaleWrapper'
import Hero from '@/components/myComponents/subs/hero'
import FeaturedProducts from '@/components/myComponents/subs/featuredProducts'
import FeaturedCategories from '@/components/myComponents/subs/featuredCategories'
import Features from '@/components/myComponents/subs/features'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { GlobalCart } from '@/components/utility/GlobalCart'
import { CartDetails } from '@/components/myComponents/subs/CartDetails'
import { Users } from 'lucide-react'

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
  sections: Section[]
}

interface Business {
  id: string
  name: string
  template: string
  ownerId: string
  settings?: {
    id: string
    currency: string
    exchangeRate: number
    pages: Page[]
  }
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

  const handleAddSection = async (type: string, layout: string) => {
    if (!activePage) return;
    try {
      const newSection = {
        pageId: activePage.id,
        type,
        layout,
        order: sections.length,
        data: { title: `New ${type}`, text: "Add your text here..." }
      };
      await axios.post('/api/dbhandler?model=section', newSection);
      toast.success("Section added!");
      window.location.reload();
    } catch (err) {
      toast.error("Failed to add section");
    }
  };

  const handleCreatePage = async (name: string, slug: string) => {
     try {
        const res = await axios.post('/api/dbhandler?model=page', {
           name,
           slug,
           projectSettingsId: settings?.id
        });
        toast.success("Page created!");
        window.location.href = `/${storeName}/${slug}`;
     } catch (err) {
        toast.error("Failed to create page");
     }
  };

  const handleRemoveSection = async (id: string) => {
    try {
      await axios.delete(`/api/dbhandler?model=section&id=${id}`);
      toast.success("Section removed");
      window.location.reload();
    } catch (err) {
      toast.error("Failed to remove section");
    }
  };

  const handleApplyTemplate = async (templateSlug: string) => {
    if (!activePage) return;
    const template = DEFAULT_PAGE_TEMPLATES[templateSlug as keyof typeof DEFAULT_PAGE_TEMPLATES];
    if (!template) return;
    
    try {
      for (const s of template.sections) {
         await axios.post('/api/dbhandler?model=section', {
            pageId: activePage.id,
            type: s.type,
            layout: s.layout,
            order: s.order,
            data: (s as any).data
         });
      }
      toast.success(`Applied ${template.name} template!`);
      window.location.reload();
    } catch (err) {
      toast.error("Failed to apply template");
    }
  };

  const updateGlobalSettings = async (data: any) => {
    try {
      await axios.put(`/api/dbhandler?model=projectSettings`, {
        id: settings?.id,
        ...data
      });
      toast.success("Settings updated!");
      window.location.reload();
    } catch (err) {
      toast.error("Failed to update settings");
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
               {renderSection(section)}
               
               {isAdmin && (
                  <div className="py-2 w-full flex justify-center opacity-0 group-hover/section:opacity-100 transition-opacity bg-accent/5 border-b dash-border">
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
              <p className="text-sm text-muted-foreground leading-relaxed">
                 Experience premium quality products and world-class service tailored just for you. Shop with {business.name} today.
              </p>
           </div>
           
           <div>
              <h4 className="font-bold text-sm uppercase tracking-widest mb-6">Navigation</h4>
              <ul className="space-y-3">
                 {pages.map(page => (
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
                 <Button variant="outline" size="icon" className="h-10 w-10 rounded-full hover:bg-accent hover:text-white transition-all"><MessageCircle className="h-5 w-5" /></Button>
                 <Button variant="outline" size="icon" className="h-10 w-10 rounded-full hover:bg-accent hover:text-white transition-all"><Instagram className="h-5 w-5" /></Button>
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

const SectionConfigDialog = ({ section, onUpdate }: { section: Section, onUpdate: () => void }) => {
   const [configData, setConfigData] = React.useState(section.data || {});
   const [categories, setCategories] = React.useState<any[]>([]);

   React.useEffect(() => {
     const fetchCats = async () => {
        const res = await axios.get('/api/dbhandler?model=category');
        setCategories(res.data);
     };
     if (section.type === 'products') fetchCats();
   }, [section.type]);

   const handleSave = async () => {
      try {
         await axios.put(`/api/dbhandler?model=section`, {
            id: section.id,
            data: configData
         });
         toast.success("Section updated");
         onUpdate();
      } catch (err) {
         toast.error("Update failed");
      }
   };

   return (
     <Dialog>
        <DialogTrigger asChild>
           <Button size="icon" variant="secondary" className="h-8 w-8">
              <SettingsIcon className="h-4 w-4" />
           </Button>
        </DialogTrigger>
        <DialogContent>
           <DialogHeader>
              <DialogTitle>Configure Section: {section.type}</DialogTitle>
           </DialogHeader>
           <div className="space-y-4 py-4">
              {section.type === 'products' && (
                 <div className="space-y-2">
                    <Label>Product Category</Label>
                    <Select 
                      value={configData.categoryId || "featured"} 
                      onValueChange={(v) => setConfigData({ ...configData, categoryId: v === 'featured' ? null : v })}
                    >
                       <SelectTrigger>
                          <SelectValue placeholder="Featured Products" />
                       </SelectTrigger>
                       <SelectContent>
                          <SelectItem value="featured">Featured (Global)</SelectItem>
                          {categories.map(cat => (
                             <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                          ))}
                       </SelectContent>
                    </Select>
                 </div>
              )}
              <div className="space-y-2">
                 <Label>Section Title (Overlay)</Label>
                 <Input 
                   value={configData.title || ""} 
                   onChange={(e) => setConfigData({ ...configData, title: e.target.value })}
                 />
              </div>
           </div>
           <Button onClick={handleSave} className="w-full border-2 border-accent text-accent hover:bg-accent hover:text-white font-bold">Save Changes</Button>
        </DialogContent>
     </Dialog>
   );
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
           <Button variant="outline" className="rounded-full font-bold md:flex hidden">Join Platform</Button>
           <Button variant="ghost" size="icon" className="md:hidden"><Menu className="h-5 w-5" /></Button>
        </div>
     </nav>
   );
}

const AddSectionTrigger = ({ onAdd }: { onAdd: (type: string, layout: string) => void }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="border-2 border-accent/70 gap-2 text-accent/70 font-bold hover:bg-accent/10">
           <PlusCircle className="h-4 w-4" /> Add Section Here
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Section</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
           <div className="space-y-2">
              <Label>Section Type</Label>
              <Select onValueChange={(v) => onAdd(v, `UI of ${v}`)}>
                 <SelectTrigger>
                    <SelectValue placeholder="Select type..." />
                 </SelectTrigger>
                 <SelectContent>
                    <SelectItem value="hero">Hero Section</SelectItem>
                    <SelectItem value="products">Products Display</SelectItem>
                    <SelectItem value="categories">Categories Grid</SelectItem>
                    <SelectItem value="description">Text/About Section</SelectItem>
                    <SelectItem value="features">Trust Features</SelectItem>
                    <SelectItem value="chat">Chat Button</SelectItem>
                    <SelectItem value="notifications">Announcement Bar</SelectItem>
                 </SelectContent>
              </Select>
           </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

const AdminToolbar = ({ 
  business, 
  onUpdateSettings, 
  onCreatePage,
  isOpen,
  onOpenChange,
  initialTab = "pages"
}: { 
  business: Business, 
  onUpdateSettings: (data: any) => void, 
  onCreatePage: (name: string, slug: string) => void,
  isOpen: boolean,
  onOpenChange: (open: boolean) => void,
  initialTab?: string | null
}) => {
  const [currency, setCurrency] = React.useState(business.settings?.currency || "USD");
  const [rate, setRate] = React.useState(business.settings?.exchangeRate?.toString() || "1.0");
  const [newPageName, setNewPageName] = React.useState("");
  const [activeTab, setActiveTab] = React.useState(initialTab || "pages");
  const { storeName } = useParams();

  React.useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  const handleAddPage = () => {
     if (!newPageName) return;
     const slug = newPageName.toLowerCase().replace(/\s+/g, '-');
     onCreatePage(newPageName, slug);
     setNewPageName("");
  };

  const deletePage = async (id: string) => {
     if (confirm("Delete this page and all its sections?")) {
        await axios.delete(`/api/dbhandler?model=page&id=${id}`);
        toast.success("Page deleted");
        window.location.href = `/${storeName}`;
     }
  };

  return (
    <div className="fixed bottom-6 left-6 z-[100]">
       <Dialog open={isOpen} onOpenChange={onOpenChange}>
          <DialogTrigger asChild>
             <Button className="rounded-full h-14 w-14 shadow-2xl bg-black text-white hover:bg-gray-800 transition-all hover:scale-110 border-2 border-white/20">
                <SettingsIcon className="h-6 w-6" />
             </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl w-[95vw] rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
             <div className="bg-accent p-6 text-white">
                <DialogTitle className="text-2xl font-black flex items-center gap-2">
                   <div className="bg-white/20 p-2 rounded-xl"><SettingsIcon className="h-5 w-5" /></div>
                   Store Control Center
                </DialogTitle>
                <p className="text-white/70 text-sm mt-1">Manage your pages, design, and world settings.</p>
             </div>

             <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="px-6 border-b bg-muted/30">
                   <TabsList className="bg-transparent h-14 w-full justify-start gap-4 p-0">
                      <TabsTrigger value="pages" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-4 data-[state=active]:border-accent rounded-none h-full px-0 font-bold text-xs uppercase tracking-widest">
                         <Layout className="h-4 w-4 mr-2" /> Pages
                      </TabsTrigger>
                      <TabsTrigger value="design" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-4 data-[state=active]:border-accent rounded-none h-full px-0 font-bold text-xs uppercase tracking-widest">
                         <Palette className="h-4 w-4 mr-2" /> Design
                      </TabsTrigger>
                      <TabsTrigger value="settings" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-4 data-[state=active]:border-accent rounded-none h-full px-0 font-bold text-xs uppercase tracking-widest">
                         <Globe className="h-4 w-4 mr-2" /> Settings
                      </TabsTrigger>
                   </TabsList>
                </div>

                <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                   <TabsContent value="pages" className="mt-0 space-y-6">
                      <div className="space-y-4">
                         <div className="flex flex-col sm:flex-row gap-2">
                            <Input 
                              placeholder="New Page Name (e.g. Services)" 
                              className="flex-1 font-medium border-2 hover:border-accent/40 focus:border-accent transition-colors" 
                              value={newPageName}
                              onChange={(e) => setNewPageName(e.target.value)}
                            />
                            <Button onClick={handleAddPage} className="font-black bg-accent hover:bg-accent/90">
                               <PlusCircle className="h-4 w-4 mr-2" /> Add Page
                            </Button>
                         </div>

                         <div className="grid grid-cols-1 gap-3">
                            {business.settings?.pages?.map(p => (
                               <div key={p.id} className="flex items-center justify-between p-4 bg-muted/40 rounded-2xl border-2 border-transparent hover:border-accent/10 hover:bg-white transition-all group shadow-sm">
                                  <div className="flex items-center gap-4">
                                     <div className={`h-12 w-12 flex items-center justify-center rounded-xl border-2 transition-colors ${p.slug === 'home' ? 'bg-accent/10 border-accent/20 text-accent' : 'bg-background border-muted text-muted-foreground'}`}>
                                        {p.slug === 'home' ? <HomeIcon className="h-5 w-5" /> : <Layout className="h-5 w-5" />}
                                     </div>
                                     <div>
                                        <div className="font-black text-[15px] flex items-center gap-2">
                                           {p.name}
                                           {p.slug === 'home' && <Badge className="text-[9px] h-4 bg-accent/20 text-accent hover:bg-accent/30 border-none px-1">HOME</Badge>}
                                        </div>
                                        <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold opacity-60">/{p.slug}</div>
                                     </div>
                                  </div>
                                  <div className="flex gap-2">
                                     <Button size="sm" variant="outline" className="h-9 font-black text-[10px] border-2 px-3 tracking-tighter" onClick={() => window.location.href=`/${storeName}/${p.slug === 'home' ? '' : p.slug}`}>
                                        EDIT
                                     </Button>
                                     {p.slug !== 'home' && (
                                        <Button size="icon" variant="destructive" className="h-9 w-9 text-white shrink-0 shadow-lg shadow-red-500/10" onClick={() => deletePage(p.id)}>
                                           <Trash2 className="h-4 w-4" />
                                        </Button>
                                     )}
                                  </div>
                               </div>
                            ))}
                         </div>
                      </div>
                   </TabsContent>

                   <TabsContent value="design" className="mt-0 space-y-6">
                      <div className="p-10 border-4 border-dashed rounded-[2rem] flex flex-col items-center justify-center text-center space-y-4 bg-muted/20">
                         <Palette className="h-12 w-12 text-accent/40" />
                         <div>
                            <h4 className="font-bold text-lg">Visual Customizer</h4>
                            <p className="text-sm text-muted-foreground">Coming soon! You'll be able to change colors, fonts, and themes globally.</p>
                         </div>
                         <Button disabled variant="outline" className="font-bold border-2">Launch Designer</Button>
                      </div>
                   </TabsContent>

                   <TabsContent value="settings" className="mt-0 space-y-6">
                      <div className="space-y-6">
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-2">
                               <Label className="text-[10px] uppercase tracking-widest font-black text-muted-foreground ml-1">Store Currency</Label>
                               <div className="relative">
                                  <CreditCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                  <Input value={currency} onChange={(e) => setCurrency(e.target.value)} className="font-black border-2 pl-10 h-11" />
                               </div>
                            </div>
                            <div className="space-y-2">
                               <Label className="text-[10px] uppercase tracking-widest font-black text-muted-foreground ml-1">Exchange Rate</Label>
                               <Input type="number" value={rate} onChange={(e) => setRate(e.target.value)} step="0.01" className="font-black border-2 h-11" />
                            </div>
                         </div>
                         <Button onClick={() => onUpdateSettings({ currency, exchangeRate: parseFloat(rate) })} className="w-full font-black h-12 bg-accent shadow-lg shadow-accent/20">
                            Save Global Configuration
                         </Button>
                      </div>
                   </TabsContent>
                </div>
             </Tabs>
          </DialogContent>
       </Dialog>
    </div>
  );
}


// Function to render custom UI based on ProjectSettings section definition
const renderSection = (section: any) => {
   const { id, type, layout, data } = section;
   
   switch (type) {
     case 'hero':
        return <Hero variant={layout as any || 'modern-split'} />;
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
        if (layout === 'carousel of cards') {
           return (
             <div className="w-full overflow-x-auto py-10 flex gap-4 px-10">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="min-w-[250px] h-64 bg-accent/5 border rounded-xl flex items-center justify-center font-bold text-accent"> Card {i} </div>
                ))}
             </div>
           );
        }
        return <FeaturedProducts />;
     case 'admin':
        if (layout === 'carousel of admin') {
           return (
             <div className="w-full py-10 px-4 bg-accent/5">
                <h2 className="text-2xl font-bold mb-4">Admin Insights</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                   <div className="p-4 bg-white shadow rounded-lg text-center"><p className="text-muted-foreground">Orders</p> <p className="text-2xl font-bold">120</p></div>
                   <div className="p-4 bg-white shadow rounded-lg text-center"><p className="text-muted-foreground">Sales</p> <PriceDisplay amount={4500000} className="text-2xl font-bold" /></div>
                   <div className="p-4 bg-white shadow rounded-lg text-center"><p className="text-muted-foreground">Visitors</p> <p className="text-2xl font-bold">1.2k</p></div>
                   <div className="p-4 bg-white shadow rounded-lg text-center"><p className="text-muted-foreground">Inventory</p> <p className="text-2xl font-bold">Low</p></div>
                </div>
             </div>
           );
        }
        return <div className="p-10 text-center border">Default Admin Dashboard Not Implemented</div>;
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
                  <AdminEditable as="p" value={data?.text || 'This store provides the best service for all customers around the globe.'} model="section" id={id} field="data.text" data={data} className="text-xl text-muted-foreground leading-loose italic" />
                </div>
             </div>
          </ScrollScaleWrapper>
        );
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
     case 'cart':
        return (
          <div className="w-full py-20 px-4">
             <CartDetails cartId="temp" />
          </div>
        );
     case 'staff':
        return (
          <div className="w-full py-20 px-6 max-w-7xl mx-auto">
             <div className="text-center mb-16 space-y-4">
                <AdminEditable as="h2" value={data?.title || 'Meet the Experts'} model="section" id={id} field="data.title" data={data} className="text-4xl font-black" />
                <AdminEditable as="p" value={data?.text || 'Our platform is powered by highly skilled individuals dedicated to your satisfaction.'} model="section" id={id} field="data.text" data={data} className="text-muted-foreground max-w-2xl mx-auto" />
             </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {[
                  { name: 'Dr. Sarah James', role: 'Chief Pharmacist', img: 'https://images.unsplash.com/photo-1559839734-2b71f153673c?q=80&w=200&h=200&auto=format&fit=crop' },
                  { name: 'Marcus Chen', role: 'Head of Operations', img: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=200&h=200&auto=format&fit=crop' },
                  { name: 'Elena Rodriguez', role: 'Customer Success', img: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?q=80&w=200&h=200&auto=format&fit=crop' },
                  { name: 'David Smith', role: 'Senior Developer', img: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=200&h=200&auto=format&fit=crop' }
                ].map((member, i) => (
                   <div key={i} className="flex flex-col items-center group">
                      <div className="h-40 w-40 rounded-full overflow-hidden mb-4 border-4 border-accent/10 group-hover:border-accent transition-colors">
                         <img src={member.img} alt={member.name} className="h-full w-full object-cover scale-110 group-hover:scale-100 transition-transform duration-500" />
                      </div>
                      <h4 className="font-bold text-lg">{member.name}</h4>
                      <p className="text-sm text-muted-foreground">{member.role}</p>
                   </div>
                ))}
             </div>
          </div>
        );
     default:
        return <div className="p-10 text-center border">Unknown Section: {type}</div>;
   }
}

export default StoreHome
