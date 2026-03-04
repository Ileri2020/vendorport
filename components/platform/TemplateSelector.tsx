"use client"
import React, { useState } from 'react'
import axios from 'axios'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sparkles, GripVertical, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TemplateSelectorProps {
  business: any
  onTemplateApply?: () => void
  trigger?: React.ReactNode
  mobile?: boolean
}

const SITE_TEMPLATES = [
  {
    id: 'default',
    name: 'General Store',
    description: 'Versatile template for all types of businesses',
    icon: '🏪',
    pages: ['home', 'store', 'about', 'contact', 'cart', 'product-description'],
  },
  {
    id: 'pharmacy',
    name: 'Pharmacy',
    description: 'Optimized for health & wellness products',
    icon: '💊',
    pages: ['home', 'store', 'about', 'contact', 'cart', 'product-description'],
  },
  {
    id: 'restaurant',
    name: 'Restaurant',
    description: 'Perfect for food & dining services',
    icon: '🍽️',
    pages: ['home', 'menu', 'about', 'contact', 'cart', 'account'],
  },
  {
    id: 'fastfood',
    name: 'Fast Food',
    description: 'Quick service restaurant menu system',
    icon: '🍔',
    pages: ['home', 'store', 'about', 'menu', 'cart', 'account'],
  },
  {
    id: 'marketplace',
    name: 'Marketplace',
    description: 'Multi-vendor shopping platform',
    icon: '🛍️',
    pages: ['home', 'store', 'about', 'contact', 'cart', 'account'],
  },
]

export default function TemplateSelector({
  business,
  onTemplateApply,
  trigger,
  mobile = false,
}: TemplateSelectorProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState(business?.template || 'default')

  const handleApplyTemplate = async (templateId: string) => {
    if (selectedTemplate === templateId && business?.template === templateId) {
      toast.info('Template already applied')
      return
    }

    setLoading(true)
    try {
      // Save template selection to business settings
      const response = await axios.put(`/api/dbhandler?model=business&id=${business.id}`, {
        template: templateId,
        settings: {
          ...business.settings,
          siteTemplate: templateId,
        },
      })

      setSelectedTemplate(templateId)
      toast.success(`${SITE_TEMPLATES.find(t => t.id === templateId)?.name} template applied!`)
      setOpen(false)

      // Reload to apply template
      if (onTemplateApply) {
        onTemplateApply()
      } else {
        window.location.reload()
      }
    } catch (err) {
      console.error('Failed to apply template:', err)
      toast.error('Failed to apply template')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            variant={mobile ? 'default' : 'secondary'}
            size={mobile ? 'lg' : 'sm'}
            className={cn(
              'font-black gap-2',
              mobile ? 'w-full h-12 rounded-xl' : 'hidden md:flex rounded-lg'
            )}
          >
            <Sparkles className="h-4 w-4" />
            TEMPLATES
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-2xl font-black flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-accent" />
            Site Templates
          </DialogTitle>
          <DialogDescription className="text-base">
            Choose a template to organize your pages and sections. You can customize everything later.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6">
          {SITE_TEMPLATES.map((template) => {
            const isSelected = selectedTemplate === template.id
            const isCurrent = business?.template === template.id

            return (
              <div
                key={template.id}
                onClick={() => setSelectedTemplate(template.id)}
                className={cn(
                  'relative p-6 rounded-3xl border-2 cursor-pointer transition-all duration-300 group',
                  isSelected
                    ? 'bg-accent/10 border-accent shadow-lg shadow-accent/20'
                    : 'bg-muted/30 border-transparent hover:bg-white hover:border-accent/10'
                )}
              >
                {/* Current Badge */}
                {isCurrent && (
                  <Badge className="absolute top-3 right-3 bg-accent/20 text-accent border-none font-black">
                    CURRENT
                  </Badge>
                )}

                {/* Selection Checkbox */}
                <div
                  className={cn(
                    'absolute top-3 right-3 h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all',
                    isSelected
                      ? 'bg-accent border-accent'
                      : 'border-muted-foreground/30 group-hover:border-accent'
                  )}
                >
                  {isSelected && <Check className="h-4 w-4 text-white" />}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="text-4xl">{template.icon}</div>
                    <div className="flex-1">
                      <h3 className="font-black text-lg uppercase tracking-tight">
                        {template.name}
                      </h3>
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                        {template.id}
                      </p>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground font-medium">
                    {template.description}
                  </p>

                  <div className="pt-3 border-t">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">
                      Pages Included
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {template.pages.map((page) => (
                        <Badge key={page} variant="outline" className="font-bold text-[10px]">
                          {page}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="flex gap-3 pt-6 border-t justify-end">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className="h-11 font-bold border-2"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={() => handleApplyTemplate(selectedTemplate)}
            className="h-11 font-black bg-accent hover:bg-accent/90 shadow-lg shadow-accent/20"
            disabled={loading || selectedTemplate === business?.template}
          >
            {loading ? 'Applying...' : selectedTemplate === business?.template ? 'Already Applied' : 'Apply Template'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
