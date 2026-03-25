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
import { Textarea } from '@/components/ui/textarea'
import {
  PlusCircle, Settings as SettingsIcon, Layout, Palette, Globe,
  Package, Users, FileText, BarChart3, Home as HomeIcon, Trash2,
  CreditCard, Layers, ChevronRight, Eye, ArrowLeft
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import ProductForm from '@/prisma/forms/ProductForm'
import StaffForm from '@/prisma/forms/StaffForm'
import PostForm from '@/prisma/forms/PostForm'
import { DEFAULT_PAGE_TEMPLATES } from '@/lib/storeTemplates'
import { Switch } from '@/components/ui/switch'
import { SectionManagerPanel } from './SectionManagerPanel'

const AdminToolbar = ({
  business,
  onUpdateSettings,
  onCreatePage,
  isOpen,
  onOpenChange,
  initialTab = "pages",
  sections = [],
  activePage,
  onAddSection,
  onDeleteSection,
  onMoveSection,
  onDuplicateSection,
  onSectionDataChange,
}: {
  business: any,
  onUpdateSettings: (data: any) => void,
  onCreatePage: (name: string, slug: string, template?: string) => void,
  isOpen: boolean,
  onOpenChange: (open: boolean) => void,
  initialTab?: string | null,
  sections?: any[],
  activePage?: any,
  onAddSection?: (type: string, layout: string) => void,
  onDeleteSection?: (id: string) => void,
  onMoveSection?: (id: string, direction: 'up' | 'down') => void,
  onDuplicateSection?: (section: any) => void,
  onSectionDataChange?: () => void,
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
  const [showOutOfStockOverlay, setShowOutOfStockOverlay] = React.useState(business.settings?.showOutOfStockOverlay ?? true);
  const [primaryColor, setPrimaryColor] = React.useState(business.siteSettings?.primaryColor || '#0ea5e9');
  const [secondaryColor, setSecondaryColor] = React.useState(business.siteSettings?.secondaryColor || '#f43f5e');
  const [fontFamily, setFontFamily] = React.useState(business.settings?.fontFamily || 'Inter, sans-serif');
  const [sectionPadding, setSectionPadding] = React.useState(business.settings?.sectionPadding || 'medium');

  // Which page is expanded in the section manager sub-view
  const [expandedPageId, setExpandedPageId] = React.useState<string | null>(null);
  const [seoDialogOpen, setSeoDialogOpen] = React.useState(false);
  const [seoPage, setSeoPage] = React.useState<any>(null);
  const [seoTitle, setSeoTitle] = React.useState('');
  const [seoDescription, setSeoDescription] = React.useState('');
  const [seoImage, setSeoImage] = React.useState('');
  const [seoKeywords, setSeoKeywords] = React.useState('');

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

  const savePageSeo = async () => {
    if (!seoPage?.id) return;
    try {
      await axios.put(`/api/dbhandler?model=page`, {
        id: seoPage.id,
        seoTitle,
        seoDescription,
        seoImage,
        seoKeywords,
      });
      toast.success('SEO settings saved');
      setSeoDialogOpen(false);
      window.location.reload();
    } catch (err) {
      toast.error('Failed to save SEO settings');
    }
  };

  const expandedPage = business.settings?.pages?.find((p: any) => p.id === expandedPageId);
  // For the current active page, we use the passed-in sections; for any other page, use page.sections
  const expandedSections: any[] = expandedPageId
    ? (expandedPage?.slug === activePage?.slug
        ? sections
        : expandedPage?.sections || [])
    : [];

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
            <p className="text-white/70 text-sm mt-1">Manage your pages, sections, design, and settings.</p>
          </div>

          <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setExpandedPageId(null); }} className="w-full">
            <div className="px-6 border-b bg-muted/30">
              <TabsList className="bg-transparent h-14 w-full justify-start gap-4 p-0 overflow-x-auto">
                <TabsTrigger value="pages" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-4 data-[state=active]:border-accent rounded-none h-full px-0 font-bold text-xs uppercase tracking-widest shrink-0">
                  <Layout className="h-4 w-4 mr-2" /> Pages
                </TabsTrigger>
                <TabsTrigger value="sections" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-4 data-[state=active]:border-accent rounded-none h-full px-0 font-bold text-xs uppercase tracking-widest shrink-0">
                  <Layers className="h-4 w-4 mr-2" /> Sections
                </TabsTrigger>
                <TabsTrigger value="design" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-4 data-[state=active]:border-accent rounded-none h-full px-0 font-bold text-xs uppercase tracking-widest shrink-0">
                  <Palette className="h-4 w-4 mr-2" /> Design
                </TabsTrigger>
                <TabsTrigger value="settings" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-4 data-[state=active]:border-accent rounded-none h-full px-0 font-bold text-xs uppercase tracking-widest shrink-0">
                  <Globe className="h-4 w-4 mr-2" /> Settings
                </TabsTrigger>
                <TabsTrigger value="inventory" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-4 data-[state=active]:border-accent rounded-none h-full px-0 font-bold text-xs uppercase tracking-widest shrink-0">
                  <Package className="h-4 w-4 mr-2" /> Inventory
                </TabsTrigger>
                <TabsTrigger value="team" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-4 data-[state=active]:border-accent rounded-none h-full px-0 font-bold text-xs uppercase tracking-widest shrink-0">
                  <Users className="h-4 w-4 mr-2" /> Team
                </TabsTrigger>
                <TabsTrigger value="posts" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-4 data-[state=active]:border-accent rounded-none h-full px-0 font-bold text-xs uppercase tracking-widest shrink-0">
                  <FileText className="h-4 w-4 mr-2" /> Posts
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">

              {/* ═══ PAGES TAB ═══ */}
              <TabsContent value="pages" className="mt-0 space-y-6">
                <div className="space-y-4">
                  {/* Create new page form */}
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
                          onKeyDown={(e) => e.key === 'Enter' && handleAddPage()}
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
                              'name' in tpl ? (
                                <SelectItem key={slug} value={slug}>{tpl.name} Layout</SelectItem>
                              ) : null
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button onClick={handleAddPage} className="w-full font-black bg-accent hover:bg-accent/90 h-12 shadow-lg shadow-accent/20">
                      <PlusCircle className="h-4 w-4 mr-2" /> Launch New Page
                    </Button>
                  </div>

                  {/* Page list */}
                  <div className="grid grid-cols-1 gap-3">
                    {business.settings?.pages?.map((p: any) => {
                      const sectionCount = p.sections?.length ?? 0
                      const isActive = p.slug === activePage?.slug
                      return (
                        <div
                          key={p.id}
                          className="flex items-center justify-between p-4 bg-muted/40 rounded-2xl border-2 border-transparent hover:border-accent/20 hover:bg-white transition-all group shadow-sm"
                        >
                          <div className="flex items-center gap-4">
                            <div className={`h-12 w-12 flex items-center justify-center rounded-xl border-2 transition-colors ${p.slug === 'home' ? 'bg-accent/10 border-accent/20 text-accent' : 'bg-background border-muted text-muted-foreground'}`}>
                              {p.slug === 'home' ? <HomeIcon className="h-5 w-5" /> : <Layout className="h-5 w-5" />}
                            </div>
                            <div>
                              <div className="font-black text-[15px] flex items-center gap-2">
                                {p.name}
                                {p.slug === 'home' && <Badge className="text-[9px] h-4 bg-accent/20 text-accent hover:bg-accent/30 border-none px-1">HOME</Badge>}
                                {isActive && <Badge className="text-[9px] h-4 bg-green-100 text-green-700 border-none px-1">CURRENT</Badge>}
                              </div>
                              <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold opacity-60 flex items-center gap-2">
                                /{p.slug}
                                {sectionCount > 0 && (
                                  <span className="bg-muted rounded-full px-2 py-0.5">{sectionCount} section{sectionCount !== 1 ? 's' : ''}</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-9 font-black text-[10px] border-2 px-3 tracking-tighter"
                              onClick={() => window.location.href = `/${business.slug}/${p.slug === 'home' ? '' : p.slug}`}
                            >
                              <Eye className="h-3 w-3 mr-1" /> VISIT
                            </Button>
                            <Button
                              size="sm"
                              variant="secondary"
                              className="h-9 font-black text-[10px] border-2 px-3 tracking-tighter"
                              onClick={() => {
                                setSeoPage(p);
                                setSeoTitle(p.seoTitle || '');
                                setSeoDescription(p.seoDescription || '');
                                setSeoImage(p.seoImage || '');
                                setSeoKeywords(p.seoKeywords || '');
                                setSeoDialogOpen(true);
                              }}
                            >
                              SEO
                            </Button>
                            {p.slug !== 'home' && (
                              <Button
                                size="icon"
                                variant="destructive"
                                className="h-9 w-9 text-white shrink-0 shadow-lg shadow-red-500/10"
                                onClick={() => deletePage(p.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <Dialog open={seoDialogOpen} onOpenChange={setSeoDialogOpen}>
                    <DialogContent className="max-w-lg rounded-3xl p-0 overflow-hidden">
                      <div className="bg-accent p-5 text-white">
                        <DialogTitle className="text-lg font-black">Page SEO Settings</DialogTitle>
                        <p className="text-xs text-white/80">Configure metadata for the page.</p>
                      </div>
                      <div className="p-5 space-y-4">
                        <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">SEO Title</Label>
                        <Input value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} className="h-11 border-2" />
                        <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">SEO Description</Label>
                        <Textarea value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} className="border-2 h-24" />
                        <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">OG Image URL</Label>
                        <Input value={seoImage} onChange={(e) => setSeoImage(e.target.value)} className="h-11 border-2" />
                        <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Keywords (comma separated)</Label>
                        <Input value={seoKeywords} onChange={(e) => setSeoKeywords(e.target.value)} className="h-11 border-2" />
                      </div>
                      <div className="p-5 border-t flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setSeoDialogOpen(false)}>Cancel</Button>
                        <Button onClick={savePageSeo} className="bg-accent text-white">Save SEO</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </TabsContent>

              {/* ═══ SECTIONS TAB ═══ */}
              <TabsContent value="sections" className="mt-0">
                {expandedPageId ? (
                  <div className="space-y-4">
                    {/* Back header */}
                    <button
                      onClick={() => setExpandedPageId(null)}
                      className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-accent transition-colors"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      All Pages
                      <ChevronRight className="h-3 w-3 opacity-40" />
                      <span className="text-foreground">{expandedPage?.name}</span>
                    </button>

                    <SectionManagerPanel
                      sections={expandedSections}
                      business={business}
                      activePage={expandedPage}
                      onAddSection={onAddSection || (() => {})}
                      onDeleteSection={onDeleteSection || (() => {})}
                      onMoveSection={(id, direction) => onMoveSection ? onMoveSection(id, direction) : undefined}
                      onDuplicateSection={(section) => onDuplicateSection ? onDuplicateSection(section) : undefined}
                      onDataChange={onSectionDataChange}
                    />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 bg-accent/5 rounded-2xl border-2 border-accent/10">
                      <h4 className="text-sm font-black uppercase tracking-widest text-accent mb-1">
                        Page Sections
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Select a page to manage its sections, drag-and-drop to reorder, or add new sections.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      {business.settings?.pages?.map((p: any) => {
                        const sectionCount = p.sections?.length ?? 0
                        const isActive = p.slug === activePage?.slug
                        const displayCount = isActive ? sections.length : sectionCount
                        return (
                          <button
                            key={p.id}
                            onClick={() => setExpandedPageId(p.id)}
                            className="flex items-center justify-between p-4 bg-muted/40 rounded-2xl border-2 border-transparent hover:border-accent/30 hover:bg-white transition-all group shadow-sm text-left w-full"
                          >
                            <div className="flex items-center gap-4">
                              <div className={`h-12 w-12 flex items-center justify-center rounded-xl border-2 transition-colors ${p.slug === 'home' ? 'bg-accent/10 border-accent/20 text-accent' : 'bg-background border-muted text-muted-foreground'}`}>
                                {p.slug === 'home' ? <HomeIcon className="h-5 w-5" /> : <Layout className="h-5 w-5" />}
                              </div>
                              <div>
                                <div className="font-black text-[15px] flex items-center gap-2">
                                  {p.name}
                                  {isActive && <Badge className="text-[9px] h-4 bg-green-100 text-green-700 border-none px-1">CURRENT</Badge>}
                                </div>
                                <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold opacity-60">
                                  {displayCount} section{displayCount !== 1 ? 's' : ''}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground group-hover:text-accent transition-colors">
                              <span className="text-xs font-bold hidden sm:block">Manage</span>
                              <ChevronRight className="h-5 w-5" />
                            </div>
                          </button>
                        )
                      })}
                    </div>

                    {/* Quick add for the CURRENT page */}
                    {activePage && onAddSection && (
                      <div className="pt-2 border-t space-y-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                          Quick add to current page ({activePage.name})
                        </p>
                        <div onClick={() => setExpandedPageId(activePage.id)}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full border-2 border-accent text-accent font-black hover:bg-accent hover:text-white h-11"
                          >
                            <PlusCircle className="h-4 w-4 mr-2" /> Add Section to This Page
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>

              {/* ═══ DESIGN TAB ═══ */}
              <TabsContent value="design" className="mt-0 space-y-6">
                <div className="space-y-6">
                  <div className="p-4 bg-muted/10 rounded-2xl border border-muted/30">
                    <h4 className="text-sm font-black uppercase tracking-widest text-accent">Theme &amp; Typography</h4>
                    <p className="text-xs text-muted-foreground mt-1">Set global styles for the site builder and preview instantly.</p>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase tracking-widest font-black text-muted-foreground">Primary Accent Color</Label>
                      <Input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="h-11 w-20 p-0 border-2" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase tracking-widest font-black text-muted-foreground">Secondary Color</Label>
                      <Input type="color" value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} className="h-11 w-20 p-0 border-2" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase tracking-widest font-black text-muted-foreground">Font Family</Label>
                      <Select value={fontFamily} onValueChange={setFontFamily}>
                        <SelectTrigger className="h-11 border-2">
                          <SelectValue placeholder="Select font" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Inter, sans-serif">Inter</SelectItem>
                          <SelectItem value="Roboto, sans-serif">Roboto</SelectItem>
                          <SelectItem value="Poppins, sans-serif">Poppins</SelectItem>
                          <SelectItem value="Montserrat, sans-serif">Montserrat</SelectItem>
                          <SelectItem value="Georgia, serif">Georgia</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase tracking-widest font-black text-muted-foreground">Section Padding</Label>
                      <Select value={sectionPadding} onValueChange={setSectionPadding}>
                        <SelectTrigger className="h-11 border-2">
                          <SelectValue placeholder="Padding size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="small">Small</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="large">Large</SelectItem>
                          <SelectItem value="extra-large">Extra Large</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="rounded-2xl border p-4 bg-white">
                    <h5 className="uppercase tracking-widest text-xs text-muted-foreground font-black">Preview</h5>
                    <div className="mt-3 p-3 rounded-xl" style={{ background: `linear-gradient(90deg, ${primaryColor}20, ${secondaryColor}20)` }}>
                      <p className="text-sm" style={{ fontFamily }}>This text reflects selected typography and colors.</p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* ═══ SETTINGS TAB ═══ */}
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

                  <div className="space-y-4 pt-4 border-t">
                    <h4 className="text-sm font-black uppercase tracking-widest text-accent">Product Display Settings</h4>
                    <div className="flex items-center space-x-2">
                      <Switch id="out-of-stock-overlay" checked={showOutOfStockOverlay} onCheckedChange={setShowOutOfStockOverlay} />
                      <Label htmlFor="out-of-stock-overlay" className="text-sm font-medium">Show Out of Stock Overlay on Product Cards</Label>
                    </div>
                  </div>

                  <Button
                    onClick={() => onUpdateSettings({
                      currency,
                      exchangeRate: parseFloat(rate),
                      showOutOfStockOverlay,
                      sectionPadding,
                      fontFamily,
                      siteSettings: {
                        facebook,
                        instagram,
                        twitter,
                        linkedin,
                        contactPhone,
                        contactEmail,
                        primaryColor,
                        secondaryColor,
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
