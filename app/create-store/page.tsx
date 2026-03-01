"use client"
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { ShoppingBag, Pill, CheckCircle2, Loader2, Globe, Building2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { toast } from 'sonner'
import { useAppContext } from '@/hooks/useAppContext'

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
  const [formData, setFormData] = useState({
    name: '',
    template: 'estore',
  });

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

    setIsSubmitting(true);
    try {
      const slug = formData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      const response = await axios.post('/api/dbhandler?model=business', {
        name: formData.name,
        template: formData.template,
        ownerId: user.id,
      });

      if (response.data.id) {
         // Create default project settings and first page
         await axios.post('/api/dbhandler?model=projectSettings', {
            businessId: response.data.id,
            currency: 'USD',
         });
         
         const settingsRes = await axios.get(`/api/dbhandler?model=projectSettings&businessId=${response.data.id}`);
         const settingsId = settingsRes.data[0]?.id || response.data.settings?.id; // If returned in create response

         toast.success('Store created successfully!');
         router.push(`/${slug}`);
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
    </div>
  )
}
