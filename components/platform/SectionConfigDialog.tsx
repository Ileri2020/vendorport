"use client"
import React from 'react'
import axios from 'axios'
import { toast } from 'sonner'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Settings as SettingsIcon, Save, Image, Type, Layout, Sliders, Palette, Settings } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const HERO_VARIANTS = [
  { value: 'modern-split', label: 'Modern Split' },
  { value: 'immersive', label: 'Immersive Full-screen' },
  { value: 'carousel', label: 'Carousel' },
  { value: 'story', label: 'Story Style' },
  { value: 'menu', label: 'Menu Style' },
  { value: 'experience', label: 'Experience' },
  { value: 'local', label: 'Local Business' },
  { value: 'simple-centered', label: 'Simple Centered' },
  { value: 'bold-hero', label: 'Bold Hero' },
]

const LAYOUT_OPTIONS: Record<string, { value: string; label: string }[]> = {
  products: [
    { value: 'carousel of products', label: 'Carousel' },
    { value: 'grid', label: 'Grid' },
    { value: 'flex', label: 'Flex Row' },
  ],
  'product-list': [
    { value: 'grid', label: 'Grid (default)' },
    { value: 'grid-with-filters', label: 'Grid + Filters' },
    { value: 'menu-grid', label: 'Menu Style Grid' },
  ],
  categories: [
    { value: 'grid', label: 'Grid' },
    { value: 'carousel', label: 'Carousel' },
    { value: 'auto-carousel', label: 'Auto Carousel' },
    { value: 'stack', label: 'Stack' },
  ],
  staff: [
    { value: 'grid', label: 'Grid' },
    { value: 'flex', label: 'Flex Row' },
  ],
  'blog-posts': [
    { value: 'masonry', label: 'Masonry' },
    { value: 'grid', label: 'Grid' },
    { value: 'list', label: 'List' },
  ],
  partners: [
    { value: 'flex', label: 'Flex Row' },
    { value: 'grid', label: 'Grid' },
    { value: 'auto-carousel', label: 'Auto Carousel' },
  ],
  promotions: [
    { value: 'wide-cards', label: 'Wide Cards' },
    { value: 'grid', label: 'Grid' },
  ],
}

const PADDING_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium (default)' },
  { value: 'large', label: 'Large' },
  { value: 'extra-large', label: 'Extra Large' },
]

const BG_OPTIONS = [
  { value: '', label: 'Default (page bg)' },
  { value: 'muted', label: 'Muted / Light Gray' },
  { value: 'accent', label: 'Accent Color' },
  { value: 'dark', label: 'Dark / Black' },
  { value: 'gradient', label: 'Soft Gradient' },
]

const RADIUS_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'sm', label: 'Small' },
  { value: 'md', label: 'Medium' },
  { value: 'lg', label: 'Large' },
  { value: 'xl', label: 'Rounded 2xl' },
  { value: 'full', label: 'Full' },
]

const SHADOW_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'sm', label: 'Subtle' },
  { value: 'md', label: 'Medium' },
  { value: 'lg', label: 'Large' },
  { value: 'xl', label: 'Deep' },
]

const ALIGN_OPTIONS = [
  { value: 'left', label: 'Left' },
  { value: 'center', label: 'Center' },
  { value: 'right', label: 'Right' },
]

const SECTION_LABEL: Record<string, string> = {
  hero: 'Hero Banner',
  products: 'Products Carousel',
  'product-list': 'Product Catalog',
  categories: 'Categories Grid',
  description: 'Text / About',
  features: 'Trust Features',
  staff: 'Team Members',
  'blog-posts': 'Blog Posts',
  newsletter: 'Newsletter',
  'contact-form': 'Contact Form',
  'chat-interface': 'Chat Interface',
  chat: 'Chat Button',
  notifications: 'Announcement Bar',
  stats: 'Stats Counter',
  partners: 'Partners / Logos',
  promotions: 'Promotions',
  cart: 'Cart Details',
  'product-details': 'Product Details',
  help: 'Help Center',
}

const SectionConfigDialog = ({ section, onUpdate }: { section: any; onUpdate: () => void }) => {
  const [open, setOpen] = React.useState(false)
  const [saving, setSaving] = React.useState(false)
  const [configData, setConfigData] = React.useState(section.data || section.content || {})
  const [categories, setCategories] = React.useState<any[]>([])

  const type = section.type || section.key || ''
  const useMaster = Object.prototype.hasOwnProperty.call(section, 'businessId')

  const currentLayout =
    (configData.settings && configData.settings.layout) ||
    configData.layout ||
    section.layout ||
    section.settings?.layout ||
    (type === 'hero' ? 'modern-split' : 'grid')

  const currentPadding = configData.padding || section.settings?.padding || 'medium'
  const currentBg = configData.bg || section.settings?.bg || ''

  React.useEffect(() => {
    if (type === 'products' && open) {
      axios.get('/api/dbhandler?model=category').then((r) => setCategories(r.data)).catch(() => {})
    }
  }, [type, open])

  const patchConfig = (patch: Record<string, any>) =>
    setConfigData((prev: any) => ({ ...prev, ...patch }))

  const setLayout = (v: string) => {
    setConfigData((prev: any) => ({
      ...prev,
      layout: v,
      settings: { ...(prev.settings || {}), layout: v },
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const layoutValue =
        (configData.settings && configData.settings.layout) ||
        configData.layout ||
        currentLayout

      if (useMaster) {
        await axios.put('/api/dbhandler?model=businessSection', {
          id: section.id,
          content: configData,
          settings: {
            ...section.settings,
            layout: layoutValue,
            padding: currentPadding,
            bg: currentBg,
          },
        })
      } else {
        await axios.put('/api/dbhandler?model=section', {
          id: section.id,
          data: configData,
          layout: layoutValue,
        })
      }
      toast.success('Section updated!')
      onUpdate()
      setOpen(false)
    } catch {
      toast.error('Failed to save section')
    } finally {
      setSaving(false)
    }
  }

  const hasLayoutOptions = [
    'hero', 'products', 'product-list', 'categories', 'staff',
    'blog-posts', 'partners', 'promotions',
  ].includes(type)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button size="icon" variant="secondary" className="h-8 w-8 shadow-md backdrop-blur" title="Edit section">
          <SettingsIcon className="h-4 w-4" />
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="w-full sm:max-w-[420px] p-0 flex flex-col overflow-hidden">
        {/* Header */}
        <SheetHeader className="px-5 py-4 border-b bg-accent text-white shrink-0">
          <SheetTitle className="text-white font-black text-lg flex items-center gap-2">
            <SettingsIcon className="h-5 w-5 opacity-80" />
            {SECTION_LABEL[type] || type}
          </SheetTitle>
          <Badge variant="outline" className="w-fit border-white/30 text-white/80 text-[10px] font-bold uppercase tracking-widest">
            {type}
          </Badge>
        </SheetHeader>

        {/* Tabs */}
        <Tabs defaultValue="content" className="flex flex-col flex-1 overflow-hidden">
          <TabsList className="w-full rounded-none border-b justify-start h-11 bg-muted/40 px-4 gap-1 shrink-0">
            <TabsTrigger value="content" className="text-xs font-bold uppercase tracking-wider data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg">
              <Type className="h-3.5 w-3.5 mr-1.5" /> Content
            </TabsTrigger>
            {hasLayoutOptions && (
              <TabsTrigger value="layout" className="text-xs font-bold uppercase tracking-wider data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg">
                <Layout className="h-3.5 w-3.5 mr-1.5" /> Layout
              </TabsTrigger>
            )}
            <TabsTrigger value="advanced" className="text-xs font-bold uppercase tracking-wider data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg">
              <Palette className="h-3.5 w-3.5 mr-1.5" /> Styles
            </TabsTrigger>
          </TabsList>

          {/* ─── CONTENT TAB ─── */}
          <TabsContent value="content" className="flex-1 overflow-y-auto p-5 space-y-5 mt-0">
            {/* Title */}
            {['hero', 'products', 'product-list', 'categories', 'description', 'staff',
              'blog-posts', 'contact-form', 'chat-interface', 'stats', 'partners',
              'promotions', 'help', 'notifications',
            ].includes(type) && (
              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">
                  Section Title
                </Label>
                <Input
                  value={configData.title || ''}
                  onChange={(e) => patchConfig({ title: e.target.value })}
                  placeholder="Enter title…"
                  className="border-2 h-11 font-medium focus:border-accent"
                />
              </div>
            )}

            {/* Subtitle / Body text */}
            {['hero', 'description', 'contact-form', 'chat-interface', 'blog-posts', 'help', 'staff'].includes(type) && (
              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">
                  Subtitle / Body Text
                </Label>
                <Textarea
                  value={configData.text || ''}
                  onChange={(e) => patchConfig({ text: e.target.value })}
                  placeholder="Supporting description…"
                  rows={3}
                  className="border-2 font-medium focus:border-accent resize-none"
                />
              </div>
            )}

            {/* Announcement text */}
            {type === 'notifications' && (
              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">
                  Announcement Message
                </Label>
                <Input
                  value={configData.text || ''}
                  onChange={(e) => patchConfig({ text: e.target.value })}
                  placeholder="e.g. Summer Sale – 30% OFF this weekend!"
                  className="border-2 h-11 font-medium focus:border-accent"
                />
              </div>
            )}

            {/* Products – category selector */}
            {type === 'products' && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">
                    Product Category
                  </Label>
                  <Select
                    value={configData.categoryId || 'featured'}
                    onValueChange={(v) => patchConfig({ categoryId: v === 'featured' ? null : v })}
                  >
                    <SelectTrigger className="h-11 border-2">
                      <SelectValue placeholder="Featured (All)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="featured">Featured (Global)</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">
                    Item Limit
                  </Label>
                  <Input 
                    type="number" 
                    value={configData.limit || 8} 
                    onChange={(e) => patchConfig({ limit: parseInt(e.target.value) })}
                    className="h-11 border-2 font-bold"
                  />
                </div>
              </div>
            )}

            {/* Hero – background image */}
            {type === 'hero' && (
              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground flex items-center gap-1.5">
                  <Image className="h-3 w-3" /> Background Image URL
                </Label>
                <Input
                  value={configData.image || configData.backgroundImage || ''}
                  onChange={(e) => patchConfig({ image: e.target.value, backgroundImage: e.target.value })}
                  placeholder="https://…"
                  className="border-2 h-11 font-medium focus:border-accent"
                />
              </div>
            )}

            {/* Hero – CTA */}
            {type === 'hero' && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">
                    Button Label
                  </Label>
                  <Input
                    value={configData.cta || configData.buttonText || ''}
                    onChange={(e) => patchConfig({ cta: e.target.value, buttonText: e.target.value })}
                    placeholder="Shop Now"
                    className="border-2 h-10"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">
                    Button Link
                  </Label>
                  <Input
                    value={configData.ctaLink || configData.buttonLink || ''}
                    onChange={(e) => patchConfig({ ctaLink: e.target.value, buttonLink: e.target.value })}
                    placeholder="/store"
                    className="border-2 h-10"
                  />
                </div>
              </div>
            )}

            {/* Newsletter */}
            {type === 'newsletter' && (
              <>
                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Newsletter Headline</Label>
                  <Input
                    value={configData.title || ''}
                    onChange={(e) => patchConfig({ title: e.target.value })}
                    placeholder="Join our Newsletter"
                    className="border-2 h-11"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Tagline</Label>
                  <Input
                    value={configData.text || ''}
                    onChange={(e) => patchConfig({ text: e.target.value })}
                    placeholder="Be the first to know about new arrivals…"
                    className="border-2 h-11"
                  />
                </div>
              </>
            )}

            {/* Generic fallback */}
            {!['hero', 'products', 'product-list', 'categories', 'description',
                'staff', 'blog-posts', 'contact-form', 'chat-interface', 'stats',
                'partners', 'promotions', 'help', 'notifications', 'newsletter',
              ].includes(type) && (
              <div className="py-10 text-center text-muted-foreground space-y-1">
                <SettingsIcon className="h-8 w-8 mx-auto opacity-30" />
                <p className="text-sm font-medium">Use inline editing</p>
                <p className="text-xs">Click on text in the page to edit content directly.</p>
              </div>
            )}
          </TabsContent>

          {/* ─── LAYOUT TAB ─── */}
          {hasLayoutOptions && (
            <TabsContent value="layout" className="flex-1 overflow-y-auto p-5 space-y-5 mt-0">
              <div className="space-y-1.5">
                <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">
                  Layout Style
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  {(type === 'hero' ? HERO_VARIANTS : (LAYOUT_OPTIONS[type] || [
                    { value: 'grid', label: 'Grid' },
                    { value: 'flex', label: 'Flex Row' },
                    { value: 'auto-carousel', label: 'Auto Carousel' },
                  ])).map((v) => (
                    <button
                      key={v.value}
                      onClick={() => setLayout(v.value)}
                      className={`p-4 rounded-2xl border-2 text-left transition-all flex flex-col gap-3 group/opt ${
                        currentLayout === v.value
                          ? 'border-accent bg-accent/5 text-accent'
                          : 'border-border hover:border-accent/40 bg-muted/5'
                      }`}
                    >
                      <div className={cn(
                        "h-12 w-full rounded-lg border-2 border-dashed flex items-center justify-center opacity-40 group-hover/opt:opacity-70 transition-opacity",
                        currentLayout === v.value ? "border-accent/40 bg-accent/10" : "border-muted-foreground/30 bg-muted/10"
                      )}>
                        {v.value.includes('grid') ? <Layout className="h-5 w-5" /> : 
                         v.value.includes('carousel') ? <Settings className="h-5 w-5 animate-pulse" /> : 
                         <Type className="h-5 w-5" />}
                      </div>
                      <span className="text-[11px] font-black uppercase tracking-tight">{v.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </TabsContent>
          )}

          {/* ─── STYLES TAB ─── */}
          <TabsContent value="advanced" className="flex-1 overflow-y-auto p-5 space-y-6 mt-0">
            <div className="space-y-3">
              <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">
                Background Style
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {BG_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => patchConfig({ bg: opt.value })}
                    className={`p-3 rounded-xl border-2 text-left text-[11px] font-black uppercase tracking-tight transition-all ${
                      (configData.bg || section.settings?.bg) === opt.value
                        ? 'border-accent bg-accent/10 text-accent'
                        : 'border-border hover:border-accent/40'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">
                Corner Radius
              </Label>
              <div className="grid grid-cols-3 gap-2">
                {RADIUS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => patchConfig({ radius: opt.value })}
                    className={`p-2 rounded-xl border-2 text-center text-[10px] font-black uppercase tracking-tight transition-all ${
                      (configData.radius || section.settings?.radius) === opt.value
                        ? 'border-accent bg-accent/10 text-accent'
                        : 'border-border hover:border-accent/40'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">
                Shadow Level
              </Label>
              <div className="grid grid-cols-3 gap-2">
                {SHADOW_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => patchConfig({ shadow: opt.value })}
                    className={`p-2 rounded-xl border-2 text-center text-[10px] font-black uppercase tracking-tight transition-all ${
                      (configData.shadow || section.settings?.shadow) === opt.value
                        ? 'border-accent bg-accent/10 text-accent'
                        : 'border-border hover:border-accent/40'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">
                Content Alignment
              </Label>
              <div className="grid grid-cols-3 gap-2">
                {ALIGN_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => patchConfig({ alignment: opt.value })}
                    className={`p-2 rounded-xl border-2 text-center text-[10px] font-black uppercase tracking-tight transition-all ${
                      (configData.alignment || section.settings?.alignment) === opt.value
                        ? 'border-accent bg-accent/10 text-accent'
                        : 'border-border hover:border-accent/40'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 pt-2">
               <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Anchor Name</Label>
               <Input 
                 value={configData.anchorId || ''} 
                 onChange={(e) => patchConfig({ anchorId: e.target.value })}
                 className="h-11 border-2 font-mono text-xs uppercase"
                 placeholder="e.g. SHOP-NOW"
               />
            </div>
          </TabsContent>
        </Tabs>

        {/* Save Footer */}
        <div className="px-5 py-4 border-t bg-muted/20 shrink-0">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full h-12 font-black bg-accent hover:bg-accent/90 shadow-lg shadow-accent/20 text-white"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving…' : 'Save Changes'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default SectionConfigDialog
