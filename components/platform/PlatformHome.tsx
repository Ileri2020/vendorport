"use client"
import React from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowRight, PlusCircle, Star, ExternalLink, Shield, Zap, Globe, User, Sparkles } from 'lucide-react'
import { AiOutlineRobot } from 'react-icons/ai'
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

  // Order by ratings double-check (already done in page.tsx but safety)
  const sortedBusinesses = [...businesses].sort((a, b) => b.ratings - a.ratings);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full py-24 px-4 flex flex-col items-center text-center bg-gradient-to-b from-accent/15 via-background to-background relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
           <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent rounded-full blur-[120px]" />
           <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary rounded-full blur-[120px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-5xl space-y-8 z-10"
        >
          <div className="inline-flex items-center rounded-full border-2 px-4 py-1.5 text-sm font-black bg-primary/10 text-primary border-primary/20 animate-pulse">
            <Zap className="mr-2 h-4 w-4 fill-primary" /> VendorPort v2.0 is Live
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none">
            Scale Your Business <br />
            <span className="text-accent underline decoration-primary/30 italic">Without Boundaries</span>
          </h1>
          <p className="text-2xl text-muted-foreground max-w-3xl mx-auto font-medium leading-relaxed">
            The world's most dynamic website builder for entrepreneurs. Launch your e-store, pharmacy, or service site in under 60 seconds with full multi-currency and AI-powered shopping.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center pt-10">
            {user?.email === "nil" ? (
              <div className="flex flex-col gap-3">
                 <Login />
                 <p className="text-sm text-muted-foreground font-bold uppercase tracking-widest">Register to build your site</p>
              </div>
            ) : (
              <Link href="/create-store">
                <Button size="lg" className="h-16 px-10 bg-accent hover:bg-accent/90 text-white font-black text-xl w-full sm:w-auto rounded-2xl shadow-2xl shadow-accent/30 transition-all hover:scale-105">
                  Launch My Website <PlusCircle className="ml-3 h-6 w-6" />
                </Button>
              </Link>
            )}
            
            <Link href="#businesses">
              <Button size="lg" variant="outline" className="h-16 px-10 font-black text-xl w-full sm:w-auto rounded-2xl border-2 hover:bg-muted/50 transition-all">
                Explore Best Stores <ArrowRight className="ml-3 h-6 w-6" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="w-full border-y bg-muted/20 py-10">
         <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 px-6">
            <div className="text-center group">
               <h3 className="text-4xl font-black group-hover:text-accent transition-colors">500+</h3>
               <p className="text-sm font-bold text-muted-foreground uppercase opacity-60">Active Stores</p>
            </div>
            <div className="text-center group">
               <h3 className="text-4xl font-black group-hover:text-accent transition-colors">$2M+</h3>
               <p className="text-sm font-bold text-muted-foreground uppercase opacity-60">Sales Generated</p>
            </div>
            <div className="text-center group">
               <h3 className="text-4xl font-black group-hover:text-accent transition-colors">150+</h3>
               <p className="text-sm font-bold text-muted-foreground uppercase opacity-60">Templates</p>
            </div>
            <div className="text-center group">
               <h3 className="text-4xl font-black group-hover:text-accent transition-colors">24/7</h3>
               <p className="text-sm font-bold text-muted-foreground uppercase opacity-60">Expert Support</p>
            </div>
         </div>
      </section>

      {/* AI Assistant Section */}
      <section className="w-full py-32 px-6 relative overflow-hidden bg-accent">
         <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white rounded-full blur-[160px]" />
         </div>
         
         <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center relative z-10">
            <motion.div 
               initial={{ opacity: 0, x: -50 }}
               whileInView={{ opacity: 1, x: 0 }}
               viewport={{ once: true }}
               className="space-y-8"
            >
               <div className="inline-flex items-center rounded-full bg-white/20 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-white border border-white/20">
                  <Sparkles className="mr-2 h-4 w-4" /> Next-Gen Shopping
               </div>
               <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-none">
                  Your Personal <br />
                  <span className="text-black/30 underline decoration-white/20 italic">AI Shopper</span>
               </h2>
               <p className="text-xl text-white/80 font-medium max-w-xl leading-relaxed">
                  Can't find what you're looking for? Just upload your shopping list or describe what you need. Our AI scans every store on VendorPort to find you the best deals, quality, and nearest availability in seconds.
               </p>
               <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    "Cross-Store Price Comparison",
                    "Snap & Search (Upload Images)",
                    "Smart Inventory Tracking",
                    "AI Optimized Checkout"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-white font-black text-sm p-3 rounded-2xl bg-white/10 border border-white/10">
                       <Zap className="h-4 w-4 fill-white" /> {item}
                    </li>
                  ))}
               </ul>
               <Link href="/store">
                  <Button size="lg" className="h-16 px-10 bg-white text-accent hover:bg-white/90 text-xl font-black rounded-2xl shadow-2xl transition-all hover:scale-105">
                     Try Smart Shopping <ArrowRight className="ml-3 h-6 w-6" />
                  </Button>
               </Link>
            </motion.div>
            
            <motion.div 
               initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
               whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
               viewport={{ once: true }}
               className="relative"
            >
               <div className="bg-white/10 backdrop-blur-3xl rounded-[40px] border-4 border-white/20 p-8 shadow-2xl relative z-20 overflow-hidden group">
                  <div className="space-y-6">
                     <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-2xl bg-white flex items-center justify-center text-accent shadow-xl">
                           <AiOutlineRobot className="h-10 w-10" />
                        </div>
                        <div>
                           <h4 className="text-white font-black text-xl uppercase tracking-tighter">Vendor-AI assistant</h4>
                           <div className="flex gap-1">
                              <div className="h-1 w-8 bg-white/40 rounded-full" />
                              <div className="h-1 w-2 bg-white/40 rounded-full" />
                           </div>
                        </div>
                     </div>
                     <div className="bg-white/90 rounded-3xl p-6 text-accent font-black text-lg shadow-inner">
                        "I've found 12 stores selling your requested Nike Air Max. Store 'GemJewels' has the best price at ₦42,000. Should I add it to your bag?"
                     </div>
                     <div className="flex justify-between items-center bg-black/20 p-4 rounded-2xl border border-white/10">
                        <span className="text-white/60 text-xs font-black uppercase tracking-widest">Searching 500+ stores...</span>
                        <div className="flex -space-x-3">
                           {[1, 2, 3, 4].map(i => (
                             <div key={i} className="h-8 w-8 rounded-full border-2 border-accent bg-white/20" />
                           ))}
                        </div>
                     </div>
                  </div>
                  <div className="absolute -bottom-10 -right-10 opacity-30 pointer-events-none group-hover:rotate-12 transition-transform duration-1000">
                     <Sparkles className="h-64 w-64 text-white" />
                  </div>
               </div>
               
               {/* Decorative dots/lines */}
               <div className="absolute -top-10 -right-10 h-32 w-32 border-8 border-white/20 rounded-full blur-xl" />
               <div className="absolute -bottom-10 -left-10 h-24 w-24 bg-black/20 rounded-full blur-xl" />
            </motion.div>
         </div>
      </section>

      {/* Featured Businesses */}
      <section id="businesses" className="w-full max-w-7xl py-24 px-6 space-y-16">
        <div className="space-y-4 max-w-3xl">
          <h2 className="text-4xl md:text-5xl font-black tracking-tight">Top Rated Websites <br /><span className="text-accent underline decoration-primary/20">on VendorPort</span></h2>
          <p className="text-xl text-muted-foreground font-medium">Join the elite businesses using our platform to dominate their local markets.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {sortedBusinesses.map((biz) => (
            <motion.div
              key={biz.id}
              whileHover={{ y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="h-full flex flex-col overflow-hidden border-2 hover:border-accent transition-all shadow-xl rounded-3xl group">
                <div className="h-56 bg-muted relative overflow-hidden">
                   <div className="absolute inset-0 flex items-center justify-center bg-accent/5 group-hover:bg-accent/10 transition-colors">
                      <Globe className="h-20 w-20 text-accent/10 group-hover:scale-120 transition-transform duration-700" />
                   </div>
                   <div className="absolute top-4 right-4 bg-white/95 dark:bg-black/95 px-3 py-1.5 rounded-full flex items-center gap-1.5 text-sm font-black shadow-lg border-2 border-accent/20">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      {biz.ratings.toFixed(1)} <span className="opacity-40 font-bold">({biz.numReviews})</span>
                   </div>
                   <div className="absolute bottom-4 left-4">
                      <div className="bg-black/80 backdrop-blur-md text-white px-3 py-1 rounded-lg text-xs font-black uppercase tracking-widest border border-white/20">
                         {biz.template}
                      </div>
                   </div>
                </div>
                <CardHeader>
                  <CardTitle className="text-3xl font-black tracking-tight">{biz.name}</CardTitle>
                  <div className="flex items-center gap-3 pt-2">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center border-2 border-primary/5">
                         {biz.owner.image ? (
                           <img src={biz.owner.image} alt={biz.owner.name || ""} className="h-full w-full rounded-xl object-cover" />
                         ) : (
                           <User className="h-5 w-5 text-primary" />
                         )}
                      </div>
                      <div className="flex flex-col">
                         <span className="text-sm font-black">{biz.owner.name || 'Anonymous User'}</span>
                         <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Business Owner</span>
                      </div>
                   </div>
                </CardHeader>
                <CardContent className="flex-1">
                   <p className="text-muted-foreground line-clamp-2 font-medium">The official digital presence for {biz.name}, powered by VendorPort infrastructure.</p>
                </CardContent>
                <CardFooter className="pt-0 pb-8 px-6">
                  <Link href={`/${biz.name.toLowerCase().replace(/\s+/g, '-')}`} className="w-full">
                    <Button className="w-full h-14 gap-3 border-2 rounded-2xl group-hover:bg-accent group-hover:text-white transition-all font-black text-lg" variant="outline">
                      Visit Experience <ArrowRight className="h-5 w-5" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
          
          {businesses.length === 0 && (
            <div className="col-span-full py-32 text-center rounded-3xl border-4 border-dashed border-muted flex flex-col items-center justify-center space-y-6">
               <div className="h-24 w-24 bg-muted rounded-full flex items-center justify-center">
                  <Globe className="h-12 w-12 opacity-20" />
               </div>
               <div className="space-y-2">
                  <h3 className="text-3xl font-black">No Business Websites Yet</h3>
                  <p className="text-muted-foreground max-w-sm mx-auto">The digital frontier is open. Be the first entrepreneur to launch a top-rated site on VendorPort!</p>
               </div>
               <Link href="/create-store">
                  <Button className="h-14 px-10 bg-accent text-white font-bold rounded-xl shadow-xl">Start Building Today</Button>
               </Link>
            </div>
          )}
        </div>
      </section>

      {/* CTA Registration Section */}
      <section className="w-full bg-black text-white py-32 px-6">
         <div className="max-w-5xl mx-auto flex flex-col items-center text-center space-y-10">
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-tight">Ready to Take Over <br />The Digital World?</h2>
            <p className="text-xl text-gray-400 max-w-3xl font-medium">Join 500+ entrepreneurs who turned their local business into a global brand in seconds. No coding required. No design skills needed.</p>
            <div className="flex flex-col md:flex-row gap-6 w-full max-w-md">
               <div className="flex-1">
                  {user?.email === "nil" ? <Login /> : (
                    <Link href="/create-store" className="w-full">
                       <Button className="w-full h-16 bg-accent text-white font-black text-xl rounded-2xl shadow-2xl hover:scale-105 transition-all">Get Started Now</Button>
                    </Link>
                  )}
               </div>
            </div>
            <div className="pt-10 flex flex-wrap justify-center gap-10 opacity-50 grayscale hover:grayscale-0 transition-all">
               <div className="flex items-center gap-2 font-black text-xl"><Shield className="h-6 w-6" /> Enterprise Secure</div>
               <div className="flex items-center gap-2 font-black text-xl"><Zap className="h-6 w-6" /> Ultra Fast</div>
               <div className="flex items-center gap-2 font-black text-xl"><Globe className="h-6 w-6" /> Global CDN</div>
            </div>
         </div>
      </section>
    </div>
  )
}

export default PlatformHome
