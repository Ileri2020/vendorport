"use client"
import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ShoppingBag, Pill, CheckCircle2, Loader2, Globe, Building2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { toast } from 'sonner'
import { useAppContext } from '@/hooks/useAppContext'
import { getStoreUrl } from '@/lib/store-url'
import MonnifyPaymentButton from '@/components/payment/monnify'
import { ManualTransfer } from '@/components/payment/manual'

const plans = [
  { id: 'basic', name: 'Basic', amount: 3000, description: '₦500/month, minimum 6-month payment. Starting businesses, up to 15 products.' },
  { id: 'premium', name: 'Premium', amount: 9000, description: '₦3,000/month, minimum 3-month payment. Growing stores, up to 200 products.' },
  { id: 'custom', name: 'Custom', amount: 120000, description: 'Custom build quoted from ₦120,000 to ₦2,000,000.' },
]

const templates = [
  {
    id: 'estore',
    name: 'Standard E-Store',
    description: 'Perfect for general retail, fashion, and electronics.',
    icon: ShoppingBag,
    color: 'bg-blue-500',
  },
  {
    id: 'pharmacy',
    name: 'Pharmacy Store',
    description: 'Optimized for health products, medicine, and wellness.',
    icon: Pill,
    color: 'bg-green-500',
  },
]

export default function CreateStorePage() {
  const { user } = useAppContext();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [couponOpen, setCouponOpen] = useState(false);
  const [createdStore, setCreatedStore] = useState<any>(null);
  const [customOpen, setCustomOpen] = useState(false);
  const [customConfig, setCustomConfig] = useState({ storeType: 'ecommerce', web: true, mobile: false, desktop: false, whatsapp: user?.contact || '', email: user?.email || '' });
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    template: 'estore',
    plan: 'basic',
    couponCode: '20thsept2026',
  });
  const customAmount = Math.min(2000000, Math.max(120000, 120000 + (customConfig.storeType === 'ecommerce' ? 180000 : customConfig.storeType === 'pharmacy' ? 220000 : 0) + (customConfig.mobile ? 300000 : 0) + (customConfig.desktop ? 250000 : 0)));
  const selectedAmount = formData.plan === 'custom' ? customAmount : plans.find((plan) => plan.id === formData.plan)?.amount || 0;

  useEffect(() => {
    setCustomConfig((current) => ({
      ...current,
      whatsapp: current.whatsapp || user?.contact || '',
      email: current.email || user?.email || '',
    }));
  }, [user?.contact, user?.email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || user.email === 'nil') {
      toast.error('You must be logged in to create a store');
      return;
    }

    if (!formData.name) {
      toast.error('Please enter a store name');
      return;
    }

    if (!formData.plan) {
      toast.error('Please select a Basic, Premium, or Custom plan');
      return;
    }

    if (formData.plan === 'custom' && (!customConfig.whatsapp.trim() || !customConfig.email.trim())) {
      toast.error('Add a WhatsApp number and email for the custom plan quote');
      setCustomOpen(true);
      return;
    }

    setIsSubmitting(true);
    try {
      const slug = formData.name
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');

      const response = await axios.post('/api/dbhandler?model=business', {
        name: formData.name.trim(),
        description: formData.description.trim() || `Welcome to ${formData.name.trim()}`,
        template: formData.template,
        ownerId: user.id,
        plan: formData.plan,
        planAmount: selectedAmount,
        customConfig: formData.plan === 'custom' ? customConfig : undefined,
        couponCode: formData.couponCode.trim() === '20thsept2026' ? formData.couponCode.trim() : undefined,
      });

      if (response.data?.id) {
        const businessName = response.data.name || formData.name.trim();
        const businessSlug = businessName
          .trim()
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '');

        setCreatedStore({ ...response.data, slug: businessSlug || slug, planId: formData.plan, planAmount: selectedAmount });
        if (formData.couponCode.trim() === '20thsept2026') {
          setCouponOpen(true);
          window.setTimeout(() => {
            window.location.assign(getStoreUrl(businessSlug || slug));
          }, 1500);
        } else {
          setPaymentOpen(true);
        }
        toast.success('Store created. Complete plan payment to keep it active beyond 7 days.');
      }
    } catch (error: any) {
      console.error('Error creating store:', error);
      toast.error(error.response?.data?.error || 'Failed to create store. Name might be taken.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 py-12 px-4 flex justify-center items-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-3xl"
      >
        <Card className="shadow-2xl border-2">
          <CardHeader className="text-center space-y-2 border-b">
            <div className="mx-auto bg-accent/10 h-16 w-16 rounded-full flex items-center justify-center mb-2">
               <Building2 className="h-8 w-8 text-accent" />
            </div>
            <CardTitle className="text-3xl font-bold">Build Your Dream Store</CardTitle>
            <CardDescription className="text-lg">Set up your identity and choose a theme to get started.</CardDescription>
          </CardHeader>
          <CardContent className="pt-8 space-y-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Store Name */}
              <div className="space-y-3">
                <Label htmlFor="storeName" className="text-lg font-semibold">Store Name</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="storeName"
                    placeholder="e.g. My Awesome Shop"
                    className="pl-10 h-12 text-lg"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                   Your store will be available at: <strong>/{formData.name.toLowerCase().replace(/\s+/g, '-') || 'your-store-name'}</strong>
                </p>
              </div>

              {/* Store Description */}
              <div className="space-y-3">
                <Label htmlFor="storeDescription" className="text-lg font-semibold">Store Description</Label>
                <textarea
                  id="storeDescription"
                  placeholder="Tell customers what makes your store special..."
                  className="min-h-28 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
                <p className="text-sm text-muted-foreground">
                  Add a short description that will appear on your storefront.
                </p>
              </div>

              {/* Template Selection */}
              <div className="space-y-4">
                <Label className="text-lg font-semibold">Choose a Template</Label>
                <RadioGroup 
                  defaultValue="estore"
                  value={formData.template}
                  onValueChange={(v) => setFormData({ ...formData, template: v })}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  {templates.map((tpl) => (
                    <div key={tpl.id}>
                      <RadioGroupItem
                        value={tpl.id}
                        id={tpl.id}
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor={tpl.id}
                        className="flex flex-col items-center justify-between rounded-xl border-2 border-muted bg-popover p-6 hover:bg-accent/5 hover:border-accent/50 peer-data-[state=checked]:border-accent peer-data-[state=checked]:bg-accent/5 cursor-pointer transition-all h-full"
                      >
                        <div className={`p-4 rounded-full ${tpl.color} text-white mb-4`}>
                           <tpl.icon className="h-8 w-8" />
                        </div>
                        <div className="text-center">
                          <h3 className="text-xl font-bold mb-1">{tpl.name}</h3>
                          <p className="text-sm text-muted-foreground">{tpl.description}</p>
                        </div>
                        <CheckCircle2 className={`mt-4 h-6 w-6 text-accent transition-opacity ${formData.template === tpl.id ? 'opacity-100' : 'opacity-0'}`} />
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="space-y-4">
                <Label className="text-lg font-semibold">Choose a Plan</Label>
                <RadioGroup value={formData.plan} onValueChange={(plan) => { setFormData({ ...formData, plan }); if (plan === 'custom') setCustomOpen(true); }} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {plans.map((plan) => (
                    <div key={plan.id}>
                      <RadioGroupItem value={plan.id} id={`plan-${plan.id}`} className="peer sr-only" />
                      <Label htmlFor={`plan-${plan.id}`} className="block h-full cursor-pointer rounded-xl border-2 border-muted bg-popover p-4 peer-data-[state=checked]:border-accent peer-data-[state=checked]:bg-accent/5">
                        <div className="flex items-center justify-between"><span className="font-bold">{plan.name}</span><span>{plan.id === 'custom' ? 'Quote' : `₦${plan.amount.toLocaleString()} minimum`}</span></div>
                        <p className="mt-2 text-xs text-muted-foreground">{plan.description}</p>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="couponCode" className="text-lg font-semibold">Coupon Code (optional)</Label>
                <Input id="couponCode" placeholder="Enter coupon code" value={formData.couponCode} onChange={(e) => setFormData({ ...formData, couponCode: e.target.value })} />
                <p className="text-xs text-muted-foreground">Valid code: 20thsept2026</p>
              </div>

              <div className="pt-4">
                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full h-14 text-lg font-bold bg-accent hover:bg-accent/90 shadow-lg shadow-accent/20"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Creating Your World...
                    </>
                  ) : (
                    'Launch My Business →'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
          <CardFooter className="bg-muted/30 p-4 justify-center border-t">
             <p className="text-sm text-muted-foreground">You can change your template and settings later in the admin dashboard.</p>
          </CardFooter>
        </Card>
      </motion.div>

      <Dialog open={couponOpen} onOpenChange={setCouponOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Coupon applied</DialogTitle>
            <DialogDescription>3 month basic plan access for free.</DialogDescription>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Add categories and products within the next 7 days so your store is not flagged as inactive.</p>
          <Button onClick={() => router.push(getStoreUrl(createdStore?.slug || 'store'))}>Continue to store</Button>
        </DialogContent>
      </Dialog>

      <Dialog open={customOpen} onOpenChange={setCustomOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Configure your Custom store</DialogTitle>
            <DialogDescription>Estimated quote: ₦{customAmount.toLocaleString()} (₦120,000 to ₦2,000,000).</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-3">
            {['static', 'ecommerce', 'pharmacy'].map((type) => <Button key={type} type="button" variant={customConfig.storeType === type ? 'default' : 'outline'} onClick={() => setCustomConfig({ ...customConfig, storeType: type })}>{type[0].toUpperCase() + type.slice(1)}</Button>)}
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {(['web', 'mobile', 'desktop'] as const).map((platform) => <Button key={platform} type="button" variant={customConfig[platform] ? 'default' : 'outline'} onClick={() => setCustomConfig({ ...customConfig, [platform]: !customConfig[platform] })}>{platform[0].toUpperCase() + platform.slice(1)} {customConfig[platform] ? '✓' : ''}</Button>)}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div><Label htmlFor="custom-whatsapp">WhatsApp number</Label><Input id="custom-whatsapp" value={customConfig.whatsapp} onChange={(e) => setCustomConfig({ ...customConfig, whatsapp: e.target.value })} placeholder="WhatsApp number" /></div>
            <div><Label htmlFor="custom-email">Email</Label><Input id="custom-email" type="email" value={customConfig.email} onChange={(e) => setCustomConfig({ ...customConfig, email: e.target.value })} placeholder="Email address" /></div>
          </div>
          <div className="rounded-xl border bg-muted/30 p-4 text-sm text-muted-foreground">
            <p className="font-bold text-foreground">Custom plan advantages</p>
            <ul className="mt-2 list-disc space-y-1 pl-5"><li>Separate hosting and database</li><li>Up to 20x faster dedicated performance</li><li>Unlimited products</li><li>Three months of free upgrades and bug fixes after deployment</li><li>Build tailored to your selected store type and platforms</li></ul>
          </div>
          <Button type="button" onClick={() => setCustomOpen(false)}>Save Custom Plan</Button>
        </DialogContent>
      </Dialog>

      <Dialog open={paymentOpen} onOpenChange={setPaymentOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete your {plans.find((plan) => plan.id === createdStore?.planId)?.name} plan</DialogTitle>
            <DialogDescription>Your store is available for 7 days while payment is confirmed.</DialogDescription>
          </DialogHeader>
          {createdStore && (
            <div className="grid gap-3 sm:grid-cols-2">
              <MonnifyPaymentButton amount={createdStore.planAmount} email={user.email} name={user.name || 'Store owner'} reference={`store-plan-${createdStore.id}-${Date.now()}`} onSuccess={async () => { await axios.post('/api/business-plan', { businessId: createdStore.id, plan: createdStore.planId, amount: createdStore.planAmount, reference: `monnify-${createdStore.id}-${Date.now()}`, method: 'monnify', durationCount: createdStore.planId === 'basic' ? 6 : createdStore.planId === 'premium' ? 3 : 1, durationUnit: 'month' }); router.push(getStoreUrl(createdStore.slug)); }} />
              <ManualTransfer paymentAction="business_plan" cartId={createdStore.id} amount={createdStore.planAmount} userId={user.id} tx_ref={`manual-${createdStore.id}-${Date.now()}`} guestDetails={{ name: user.name, email: user.email, planId: createdStore.planId, durationCount: createdStore.planId === 'basic' ? 6 : createdStore.planId === 'premium' ? 3 : 1, durationUnit: 'month' }} onSuccess={() => router.push(getStoreUrl(createdStore.slug))} />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
