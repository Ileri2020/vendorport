"use client"
import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  PlusCircle, LayoutPanelTop, Grid3X3, AlignLeft, Sparkles,
  MessageCircle, Bell, Mail, BookOpen, ShoppingBag,
  Star, Users, HelpCircle, Megaphone, ShoppingCart,
  Package, Layers
} from 'lucide-react'

const SECTION_TYPES = [
  {
    id: 'hero',
    label: 'Hero Banner',
    description: 'Full-width banner with headline, subtitle & CTA button',
    icon: LayoutPanelTop,
    color: 'from-violet-500 to-purple-600',
    layout: 'modern-split',
  },
  {
    id: 'products',
    label: 'Products Carousel',
    description: 'A scrollable carousel of featured products',
    icon: Sparkles,
    color: 'from-pink-500 to-rose-600',
    layout: 'carousel of products',
  },
  {
    id: 'product-list',
    label: 'Product Catalog',
    description: 'Full grid of products with search and filters',
    icon: ShoppingBag,
    color: 'from-orange-500 to-amber-600',
    layout: 'grid',
  },
  {
    id: 'categories',
    label: 'Categories Grid',
    description: 'Visual grid of product categories',
    icon: Grid3X3,
    color: 'from-sky-500 to-blue-600',
    layout: 'grid',
  },
  {
    id: 'description',
    label: 'Text / About',
    description: 'Rich text block for your brand story or info',
    icon: AlignLeft,
    color: 'from-teal-500 to-green-600',
    layout: 'UI of description',
  },
  {
    id: 'features',
    label: 'Trust Features',
    description: 'Highlight key benefits with icons and short copy',
    icon: Star,
    color: 'from-yellow-500 to-orange-600',
    layout: 'trust-bars',
  },
  {
    id: 'staff',
    label: 'Team Members',
    description: 'Showcase staff photos, names and roles',
    icon: Users,
    color: 'from-indigo-500 to-violet-600',
    layout: 'grid',
  },
  {
    id: 'blog-posts',
    label: 'Blog / Posts',
    description: 'Display your latest articles and updates',
    icon: BookOpen,
    color: 'from-emerald-500 to-teal-600',
    layout: 'masonry',
  },
  {
    id: 'newsletter',
    label: 'Newsletter',
    description: 'Email signup with a compelling call-to-action',
    icon: Mail,
    color: 'from-fuchsia-500 to-pink-600',
    layout: 'centered',
  },
  {
    id: 'contact-form',
    label: 'Contact Form',
    description: 'Let customers reach you with a form + info cards',
    icon: Mail,
    color: 'from-cyan-500 to-sky-600',
    layout: 'standard',
  },
  {
    id: 'chat-interface',
    label: 'Chat Interface',
    description: 'Embedded live chat panel for customer support',
    icon: MessageCircle,
    color: 'from-blue-500 to-indigo-600',
    layout: 'standard',
  },
  {
    id: 'chat',
    label: 'Chat Button',
    description: 'Floating chat bubble that opens a support window',
    icon: MessageCircle,
    color: 'from-green-500 to-emerald-600',
    layout: 'UI of chat',
  },
  {
    id: 'notifications',
    label: 'Announcement Bar',
    description: 'Prominent banner for promotions and announcements',
    icon: Bell,
    color: 'from-red-500 to-rose-600',
    layout: 'UI of notifications',
  },
  {
    id: 'stats',
    label: 'Stats Counter',
    description: 'Highlight business milestones with big numbers',
    icon: Sparkles,
    color: 'from-violet-600 to-fuchsia-600',
    layout: 'UI of stats',
  },
  {
    id: 'partners',
    label: 'Partners / Logos',
    description: 'Brand trust strip of logos and partner names',
    icon: Layers,
    color: 'from-slate-500 to-gray-600',
    layout: 'UI of partners',
  },
  {
    id: 'promotions',
    label: 'Promotions',
    description: 'Visually bold promo cards with discount badges',
    icon: Megaphone,
    color: 'from-amber-500 to-yellow-600',
    layout: 'wide-cards',
  },
  {
    id: 'cart',
    label: 'Cart Details',
    description: 'Shopping cart page with item list and checkout',
    icon: ShoppingCart,
    color: 'from-rose-500 to-pink-600',
    layout: 'full-details',
  },
  {
    id: 'product-details',
    label: 'Product Details',
    description: 'Individual product page with images, price and add-to-cart',
    icon: Package,
    color: 'from-teal-600 to-cyan-600',
    layout: 'premium',
  },
  {
    id: 'help',
    label: 'Help Center',
    description: 'FAQ articles and help content grid',
    icon: HelpCircle,
    color: 'from-indigo-400 to-blue-500',
    layout: 'UI of help',
  },
]

const AddSectionTrigger = ({ onAdd }: { onAdd: (type: string, layout: string) => void }) => {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState('')

  const filtered = SECTION_TYPES.filter(
    (s) =>
      s.label.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase())
  )

  const handleSelect = (section: typeof SECTION_TYPES[number]) => {
    onAdd(section.id, section.layout)
    setOpen(false)
    setSearch('')
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="border-2 border-accent text-accent font-black hover:bg-accent hover:text-white transition-all scale-90 hover:scale-100 shadow-sm px-4"
        >
          <PlusCircle className="h-4 w-4 mr-2" /> Add Section Here
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-3xl p-0 overflow-hidden rounded-3xl">
        <DialogHeader className="px-6 pt-6 pb-4 border-b bg-gradient-to-r from-accent/5 to-accent/10">
          <DialogTitle className="text-2xl font-black tracking-tight flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-accent flex items-center justify-center">
              <PlusCircle className="h-5 w-5 text-white" />
            </div>
            Add a Section
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Pick a section type to add to your page.
          </p>
          {/* Search */}
          <input
            type="text"
            placeholder="Search sections…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mt-3 w-full border-2 rounded-xl px-4 py-2 text-sm font-medium outline-none focus:border-accent transition-colors bg-background"
            autoFocus
          />
        </DialogHeader>

        <div className="overflow-y-auto max-h-[60vh] p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {filtered.map((section) => {
              const Icon = section.icon
              return (
                <button
                  key={section.id}
                  onClick={() => handleSelect(section)}
                  className="group flex flex-col items-start gap-3 p-4 rounded-2xl border-2 border-transparent bg-muted/30 hover:border-accent hover:bg-accent/5 transition-all text-left"
                >
                  <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${section.color} flex items-center justify-center shrink-0 shadow-md`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-sm group-hover:text-accent transition-colors">{section.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{section.description}</p>
                  </div>
                </button>
              )
            })}
          </div>
          {filtered.length === 0 && (
            <div className="py-12 text-center text-muted-foreground">
              <p className="font-bold">No sections match "{search}"</p>
              <p className="text-sm mt-1">Try a different keyword</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default AddSectionTrigger
