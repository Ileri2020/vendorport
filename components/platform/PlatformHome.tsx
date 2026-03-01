"use client"
import React from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowRight, PlusCircle, Star, ExternalLink, Shield, Zap, Globe } from 'lucide-react'
import { useAppContext } from '@/hooks/useAppContext'
import Login from '@/components/myComponents/subs/login'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import Image from 'next/image'

interface Business {
  id: string
  name: string
  template: string
  ratings: number
  numReviews: number
  owner: {
    name: string | null
    image: string | null
  }
}

const PlatformHome = ({ businesses }: { businesses: Business[] }) => {
  const { user } = useAppContext();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full py-20 px-4 flex flex-col items-center text-center bg-gradient-to-b from-accent/10 to-background">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl space-y-6"
        >
          <div className="inline-flex items-center rounded-full border px-3 py-1 text-sm font-semibold bg-primary/10 text-primary border-primary/20">
            <Zap className="mr-2 h-4 w-4 fill-primary" /> Create Your Online Presence in Seconds
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
            The Ultimate <span className="text-accent underline decoration-primary/30">Website Builder</span> for Your Business
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Design, launch, and manage your e-store or pharmacy with ease. Join thousands of entrepreneurs building their dreams on our platform.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            {user?.email === "nil" ? (
              <div className="w-full sm:w-auto">
                <Login />
              </div>
            ) : (
              <Link href="/create-store">
                <Button size="lg" className="h-12 px-8 bg-accent hover:bg-accent/90 text-white font-bold w-full sm:w-auto">
                  Create My E-Store <PlusCircle className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            )}
            
            <Link href="#businesses">
              <Button size="lg" variant="outline" className="h-12 px-8 font-semibold w-full sm:w-auto">
                Explore Websites <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Featured Businesses */}
      <section id="businesses" className="w-full max-w-7xl py-20 px-4 space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold">Websites Created on Our Platform</h2>
          <p className="text-muted-foreground">See how others are growing their businesses with us.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {businesses.map((biz) => (
            <motion.div
              key={biz.id}
              whileHover={{ y: -5 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="h-full flex flex-col overflow-hidden border-2 hover:border-accent/40 transition-colors shadow-lg">
                <div className="h-48 bg-muted relative">
                   <div className="absolute inset-0 flex items-center justify-center bg-accent/5">
                      <Globe className="h-16 w-16 text-accent/20" />
                   </div>
                   <div className="absolute top-4 right-4 bg-white/90 dark:bg-black/90 px-2 py-1 rounded-md flex items-center gap-1 text-sm font-bold shadow-sm">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      {biz.ratings.toFixed(1)} ({biz.numReviews})
                   </div>
                </div>
                <CardHeader>
                  <CardTitle className="text-2xl">{biz.name}</CardTitle>
                  <CardDescription className="capitalize">{biz.template} Template</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                   <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                         {biz.owner.image ? (
                           <img src={biz.owner.image} alt={biz.owner.name || ""} className="h-full w-full rounded-full" />
                         ) : (
                           <span className="text-xs font-bold">{biz.owner.name?.[0] || 'O'}</span>
                         )}
                      </div>
                      <span className="text-sm text-muted-foreground">By {biz.owner.name || 'Anonymous User'}</span>
                   </div>
                </CardContent>
                <CardFooter>
                  <Link href={`/${biz.name.toLowerCase().replace(/\s+/g, '-')}`} className="w-full">
                    <Button className="w-full gap-2 border-2" variant="outline">
                      Visit Website <ExternalLink className="h-4 w-4" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
          
          {businesses.length === 0 && (
            <div className="col-span-full py-20 text-center opacity-50">
               <Globe className="h-12 w-12 mx-auto mb-4" />
               <p>No websites have been created yet. Be the first!</p>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full bg-secondary/30 py-20 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
           <div className="space-y-4 text-center p-6 bg-background rounded-2xl shadow-sm border">
              <Zap className="h-12 w-12 text-accent mx-auto" />
              <h3 className="text-xl font-bold">Easy Builder</h3>
              <p className="text-muted-foreground">Customizable sections, drag and drop layouts, and intuitive controls.</p>
           </div>
           <div className="space-y-4 text-center p-6 bg-background rounded-2xl shadow-sm border">
              <Globe className="h-12 w-12 text-accent mx-auto" />
              <h3 className="text-xl font-bold">Global Reach</h3>
              <p className="text-muted-foreground">Sell to anyone, anywhere with multi-currency support and localized settings.</p>
           </div>
           <div className="space-y-4 text-center p-6 bg-background rounded-2xl shadow-sm border">
              <Shield className="h-12 w-12 text-accent mx-auto" />
              <h3 className="text-xl font-bold">Secure Hosting</h3>
              <p className="text-muted-foreground">Your store is safe with us. We handle the security so you can focus on sales.</p>
           </div>
        </div>
      </section>
    </div>
  )
}

export default PlatformHome
