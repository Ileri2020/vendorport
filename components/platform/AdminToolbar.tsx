"use client"
import React from 'react'
import axios from 'axios'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { PlusCircle, Settings as SettingsIcon, Layout, Palette, Globe, Package, Users, FileText, BarChart3 } from 'lucide-react'
import ProductForm from '@/prisma/forms/ProductForm'
import StaffForm from '@/prisma/forms/StaffForm'
import PostForm from '@/prisma/forms/PostForm'
import { DEFAULT_PAGE_TEMPLATES } from '@/lib/storeTemplates'

const AdminToolbar = ({
  business,
  onUpdateSettings,
  onCreatePage,
  isOpen,
  onOpenChange,
  initialTab = "pages"
}: {
  business: any,
  onUpdateSettings: (data: any) => void,
  onCreatePage: (name: string, slug: string, template?: string) => void,
  isOpen: boolean,
  onOpenChange: (open: boolean) => void,
  initialTab?: string | null
}) => {
  const [currency, setCurrency] = React.useState(business.settings?.currency || "USD");
  const [rate, setRate] = React.useState(business.settings?.exchangeRate?.toString() || "1.0");
  const [facebook, setFacebook] = React.useState(business.siteSettings?.facebook || "");
  const [instagram, setInstagram] = React.useState(business.siteSettings?.instagram || "");
  const [twitter, setTwitter] = React.useState(business.siteSettings?.twitter || "");
  const [linkedin, setLinkedin] = React.useState(business.siteSettings?.linkedin || "");
  const [contactPhone, setContactPhone] = React.useState(business.siteSettings?.contactPhone || "");
  const [contactEmail, setContactEmail] = React.useState(business.siteSettings?.contactEmail || "");

  const [newPageName, setNewPageName] = React.useState("");
  const [selectedTemplate, setSelectedTemplate] = React.useState<string>("home");
  const [activeTab, setActiveTab] = React.useState(initialTab || "pages");

  React.useEffect(() => {
   if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  const handleAddPage = () => {
    if (!newPageName) return;
    const slug = newPageName.toLowerCase().replace(/\s+/g, '-');
    onCreatePage(newPageName, slug, selectedTemplate);
    setNewPageName("");
  };

  const deletePage = async (id: string) => {
    if (confirm("Delete this page and all its sections?")) {
      await axios.delete(`/api/dbhandler?model=page&id=${id}`);
      toast.success("Page deleted");
      window.location.href = `/${business.slug}`;
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
                <TabsTrigger value="inventory" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-4 data-[state=active]:border-accent rounded-none h-full px-0 font-bold text-xs uppercase tracking-widest">
                  <Package className="h-4 w-4 mr-2" /> Inventory
                </TabsTrigger>
                <TabsTrigger value="team" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-4 data-[state=active]:border-accent rounded-none h-full px-0 font-bold text-xs uppercase tracking-widest">
                  <Users className="h-4 w-4 mr-2" /> Team
                </TabsTrigger>
                <TabsTrigger value="posts" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-4 data-[state=active]:border-accent rounded-none h-full px-0 font-bold text-xs uppercase tracking-widest">
                  <FileText className="h-4 w-4 mr-2" /> Posts
                </TabsTrigger>
             </TabsList>
           </div>

           <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
             <TabsContent value="pages" className="mt-0 space-y-6">
               <div className="space-y-4">
                 <div className="p-4 bg-accent/5 rounded-2xl space-y-4 border-2 border-accent/10">
                   <h4 className="text-sm font-black uppercase tracking-widest text-accent">Create New Page</h4>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <div className="space-y-2">
                       <Label className="text-[10px] font-black uppercase tracking-widest">Page Name</Label>
                       <Input
                        placeholder="e.g. Services"
                        className="font-medium border-2 hover:border-accent/40 focus:border-accent transition-colors h-11"
                        value={newPageName}
                        onChange={(e) => setNewPageName(e.target.value)}
                       />
                     </div>
                     <div className="space-y-2">
                       <Label className="text-[10px] font-black uppercase tracking-widest">Starting Template</Label>
                       <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                         <SelectTrigger className="h-11 border-2">
                           <SelectValue placeholder="Choose template..." />
                         </SelectTrigger>
                         <SelectContent>
                           {Object.entries(DEFAULT_PAGE_TEMPLATES).map(([slug, tpl]) => (
                             <SelectItem key={slug} value={slug}>{tpl.name} Layout</SelectItem>
                           ))}
                         </SelectContent>
                       </Select>
                     </div>
                   </div>
                   <Button onClick={handleAddPage} className="w-full font-black bg-accent hover:bg-accent/90 h-12 shadow-lg shadow-accent/20">
                     <PlusCircle className="h-4 w-4 mr-2" /> Launch New Page
                   </Button>
                 </div>

                 <div className="grid grid-cols-1 gap-3">
                   {business.settings?.pages?.map((p: any) => (
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
                         <Button size="sm" variant="outline" className="h-9 font-black text-[10px] border-2 px-3 tracking-tighter" onClick={() => window.location.href=`/${business.slug}/${p.slug === 'home' ? '' : p.slug}`}>
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
                   <div className="space-y-2">
                     <Label className="text-[10px] uppercase tracking-widest font-black text-muted-foreground ml-1">Support Email</Label>
                     <Input value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} className="font-black border-2 h-11" />
                   </div>
                   <div className="space-y-2">
                     <Label className="text-[10px] uppercase tracking-widest font-black text-muted-foreground ml-1">Support Phone</Label>
                     <Input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} className="font-black border-2 h-11" />
                   </div>
                 </div>

                 <div className="space-y-4 pt-4 border-t">
                   <h4 className="text-sm font-black uppercase tracking-widest text-accent">Social Links</h4>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <div className="space-y-1">
                       <Label className="text-[9px] uppercase font-bold text-muted-foreground">Facebook URL</Label>
                       <Input value={facebook} onChange={(e) => setFacebook(e.target.value)} placeholder="https://..." className="h-10 border-2" />
                     </div>
                     <div className="space-y-1">
                       <Label className="text-[9px] uppercase font-bold text-muted-foreground">Instagram URL</Label>
                       <Input value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="https://..." className="h-10 border-2" />
                     </div>
                     <div className="space-y-1">
                       <Label className="text-[9px] uppercase font-bold text-muted-foreground">Twitter URL</Label>
                       <Input value={twitter} onChange={(e) => setTwitter(e.target.value)} placeholder="https://..." className="h-10 border-2" />
                     </div>
                     <div className="space-y-1">
                       <Label className="text-[9px] uppercase font-bold text-muted-foreground">LinkedIn URL</Label>
                       <Input value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="https://..." className="h-10 border-2" />
                     </div>
                   </div>
                 </div>

                  <Button
                   onClick={() => onUpdateSettings({
                    currency,
                    exchangeRate: parseFloat(rate),
                    siteSettings: {
                      facebook,
                      instagram,
                      twitter,
                      linkedin,
                      contactPhone,
                      contactEmail
                    }
                   })}
                   className="w-full font-black bg-accent shadow-lg shadow-accent/20 h-12 transition-all hover:scale-[1.01]"
                  >
                    Commit All Changes
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="inventory" className="mt-0">
                <ProductForm />
              </TabsContent>

              <TabsContent value="team" className="mt-0">
                <StaffForm />
              </TabsContent>

              <TabsContent value="posts" className="mt-0">
                <PostForm />
              </TabsContent>
            </div>
         </Tabs>
       </DialogContent>
     </Dialog>
   </div>
  );
}

export default AdminToolbar
