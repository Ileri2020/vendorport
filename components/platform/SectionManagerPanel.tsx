"use client"
import React from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { toast } from 'sonner'
import axios from 'axios'
import {
  GripVertical, Eye, EyeOff, Trash2, Plus, LayoutPanelTop,
  Sparkles, Grid3X3, AlignLeft, Star, Users, BookOpen, Mail,
  MessageCircle, Bell, ShoppingBag, ShoppingCart, Package,
  HelpCircle, Megaphone, Layers, BarChart2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import AddSectionTrigger from './AddSectionTrigger'

const SECTION_ICON: Record<string, React.ElementType> = {
  hero: LayoutPanelTop,
  products: Sparkles,
  'product-list': ShoppingBag,
  categories: Grid3X3,
  description: AlignLeft,
  features: Star,
  staff: Users,
  'blog-posts': BookOpen,
  newsletter: Mail,
  'contact-form': Mail,
  'chat-interface': MessageCircle,
  chat: MessageCircle,
  notifications: Bell,
  stats: BarChart2,
  partners: Layers,
  promotions: Megaphone,
  cart: ShoppingCart,
  'product-details': Package,
  help: HelpCircle,
}

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

interface SortableSectionRowProps {
  section: any
  index: number
  onDelete: (id: string) => void
  activeId: string | null
}

function SortableSectionRow({ section, index, onDelete, activeId }: SortableSectionRowProps) {
  const type = section.type || section.key || ''
  const Icon = SECTION_ICON[type] || LayoutPanelTop

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center gap-3 p-3 rounded-xl border-2 bg-background transition-all cursor-default
        ${isDragging ? 'opacity-40 border-accent shadow-lg z-50' : 'border-border hover:border-accent/40 hover:bg-accent/5'}
      `}
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1 text-muted-foreground hover:text-accent transition-colors touch-none"
        title="Drag to reorder"
      >
        <GripVertical className="h-4 w-4" />
      </div>

      {/* Icon */}
      <div className="h-9 w-9 rounded-lg bg-accent/10 text-accent flex items-center justify-center shrink-0">
        <Icon className="h-4 w-4" />
      </div>

      {/* Label */}
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm truncate">{SECTION_LABEL[type] || type}</p>
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold opacity-60">
          Position {index + 1}
        </p>
      </div>

      {/* Delete */}
      <Button
        size="icon"
        variant="ghost"
        className="h-8 w-8 opacity-0 group-hover:opacity-100 text-destructive hover:bg-destructive/10 transition-all"
        onClick={(e) => {
          e.stopPropagation()
          onDelete(section.id)
        }}
        title="Remove section"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  )
}

interface SectionManagerPanelProps {
  sections: any[]
  business: any
  activePage: any
  onAddSection: (type: string, layout: string) => void
  onDeleteSection: (id: string) => void
  onDataChange?: () => void
}

export function SectionManagerPanel({
  sections,
  business,
  activePage,
  onAddSection,
  onDeleteSection,
  onDataChange,
}: SectionManagerPanelProps) {
  const [items, setItems] = React.useState(() =>
    [...sections].sort(
      (a, b) => (a.position ?? a.order ?? 0) - (b.position ?? b.order ?? 0)
    )
  )
  const [activeId, setActiveId] = React.useState<string | null>(null)
  const [saving, setSaving] = React.useState(false)
  const [hasChanges, setHasChanges] = React.useState(false)

  // Sync if external sections change
  React.useEffect(() => {
    setItems(
      [...sections].sort(
        (a, b) => (a.position ?? a.order ?? 0) - (b.position ?? b.order ?? 0)
      )
    )
    setHasChanges(false)
  }, [sections])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)
    if (!over || active.id === over.id) return
    const oldIdx = items.findIndex((s) => s.id === active.id)
    const newIdx = items.findIndex((s) => s.id === over.id)
    const reordered = arrayMove(items, oldIdx, newIdx)
    setItems(reordered)
    setHasChanges(true)
  }

  const handleSaveOrder = async () => {
    setSaving(true)
    const useMaster = Boolean(business && business.sections)
    try {
      await Promise.all(
        items.map((sec, idx) =>
          useMaster
            ? axios.put('/api/dbhandler?model=businessSection', { id: sec.id, position: idx })
            : axios.put('/api/dbhandler?model=section', { id: sec.id, order: idx })
        )
      )
      toast.success('Section order saved!')
      setHasChanges(false)
      onDataChange?.()
      window.location.reload()
    } catch {
      toast.error('Failed to save order')
    } finally {
      setSaving(false)
    }
  }

  const activeSection = items.find((s) => s.id === activeId)

  return (
    <div className="space-y-4">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-black uppercase tracking-widest text-accent">
            Sections on this Page
          </h4>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            Drag rows to reorder · delete to remove
          </p>
        </div>
        {hasChanges && (
          <Button
            size="sm"
            onClick={handleSaveOrder}
            disabled={saving}
            className="h-8 font-black text-xs bg-accent text-white shadow-lg shadow-accent/30 animate-pulse"
          >
            {saving ? 'Saving…' : 'Save Order ✦'}
          </Button>
        )}
      </div>

      {/* Drag-and-drop list */}
      {items.length > 0 ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={items.map((s) => s.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {items.map((section, idx) => (
                <SortableSectionRow
                  key={section.id}
                  section={section}
                  index={idx}
                  onDelete={onDeleteSection}
                  activeId={activeId}
                />
              ))}
            </div>
          </SortableContext>

          {/* Drag overlay */}
          <DragOverlay>
            {activeSection ? (
              <div className="flex items-center gap-3 p-3 rounded-xl border-2 border-accent bg-accent/5 shadow-2xl">
                <GripVertical className="h-4 w-4 text-accent" />
                <div className="h-9 w-9 rounded-lg bg-accent/10 text-accent flex items-center justify-center shrink-0">
                  {React.createElement(
                    SECTION_ICON[activeSection.type || activeSection.key] || LayoutPanelTop,
                    { className: 'h-4 w-4' }
                  )}
                </div>
                <p className="font-bold text-sm">
                  {SECTION_LABEL[activeSection.type || activeSection.key] || activeSection.type}
                </p>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      ) : (
        <div className="py-10 text-center border-2 border-dashed rounded-2xl bg-muted/20 space-y-2">
          <LayoutPanelTop className="h-8 w-8 text-muted-foreground/40 mx-auto" />
          <p className="text-sm text-muted-foreground font-medium">No sections yet</p>
          <p className="text-xs text-muted-foreground">Add your first section below</p>
        </div>
      )}

      {/* Add section button */}
      <div className="pt-2">
        <AddSectionTrigger onAdd={onAddSection} />
      </div>
    </div>
  )
}
