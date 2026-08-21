"use client"
import { getStoreUrl } from '@/lib/store-url';
import React, { useState, useRef, useEffect, useMemo } from 'react'
import { motion, useInView } from 'framer-motion'
import { useRouter } from 'next/navigation'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowRight, PlusCircle, Star, ExternalLink, Shield, Zap, Globe, User, Sparkles, Trash2, Archive, AlertTriangle, Loader2, Search, ShoppingBag } from 'lucide-react'
import { AiOutlineRobot } from 'react-icons/ai'
import { useAppContext } from '@/hooks/useAppContext'
import StatsSection from '@/components/myComponents/subs/StatsSection'
import FeaturedCategories from '@/components/myComponents/subs/featuredCategories'
import Login from '@/components/myComponents/subs/login'
import { SnapPrescription } from '@/components/myComponents/subs/SnapPrescription'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import axios from 'axios'
import { toast } from 'sonner'
import { Signup } from '@/components/myComponents/subs'
import PortfolioForm from '@/prisma/forms/PortfolioForm'

interface Business {
  id: string
  name: string
  template: string
  ratings: number
  numReviews: number
  isArchived?: boolean
  siteSettings?: {
    storefrontImageUrl?: string | null
  } | null
  owner: {
    name: string | null
    image: string | null
  }
}

type HeroRocket = {
  key: string
  startX: string
  waypointX: string
  endX: string
  endY: string
  midY: string
  delay: number
  duration: number
  rotationPath: number[]
  opacity: number
  fontSize: string
}

const heroRocketEndpoints: Array<Pick<HeroRocket, 'endX' | 'endY'>> = [
  { endX: '10vw', endY: '-45vh' },
  { endX: '25vw', endY: '-50vh' },
  { endX: '40vw', endY: '-48vh' },
  { endX: '55vw', endY: '-42vh' },
  { endX: '70vw', endY: '-55vh' },
  { endX: '85vw', endY: '-50vh' },
  { endX: '20vw', endY: '-35vh' },
  { endX: '80vw', endY: '-38vh' },
]

const possibleRocketStarts = ['8vw', '25vw', '42vw', '60vw', '77vw', '92vw']

const randomBetween = (min: number, max: number) => Math.random() * (max - min) + min

const pickUnique = <T,>(items: T[], count: number): T[] => {
  const copy = [...items]
  const picked: T[] = []
  while (picked.length < count && copy.length > 0) {
    const index = Math.floor(Math.random() * copy.length)
    picked.push(copy.splice(index, 1)[0])
  }
  return picked
}

const createHeroRockets = (count = 3): HeroRocket[] => {
  const endpoints = pickUnique(heroRocketEndpoints, count)
  const starts = pickUnique(possibleRocketStarts, count)

  return Array.from({ length: count }, (_, index) => {
    const endpoint = endpoints[index]
    const startX = starts[index]
    const waypointX = `${Math.max(5, Math.min(95, parseFloat(startX) + randomBetween(-12, 12)))}vw`
    const midY = `${randomBetween(12, 28)}vh`
    const firstRotation = randomBetween(-20, 20)
    const secondRotation = firstRotation + randomBetween(-8, 8)
    const finalRotation = firstRotation + randomBetween(-15, 15)

    return {
      key: `hero-rocket-${index}`,
      startX,
      waypointX,
      endX: endpoint.endX,
      endY: endpoint.endY,
      midY,
      delay: randomBetween(0.2, 1.5),
      duration: randomBetween(7, 11),
      rotationPath: [firstRotation, secondRotation, finalRotation],
      opacity: randomBetween(0.18, 0.45),
      fontSize: `${randomBetween(5.5, 7.2)}rem`,
    }
  })
}

const Home = ({ businesses = [], isAdmin = false }: { businesses?: Business[], isAdmin?: boolean }) => {
  const { user } = useAppContext();
  const router = useRouter();
  const [businessList, setBusinessList] = useState<Business[]>(businesses ?? []);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [assistantQuery, setAssistantQuery] = useState('');
  const [assistantResults, setAssistantResults] = useState<any[]>([]);
  const [assistantLoading, setAssistantLoading] = useState(false);
  const [assistantMessage, setAssistantMessage] = useState('Type a product or store name and I’ll search the marketplace for fast matches.');
  const [isPortfolioDialogOpen, setIsPortfolioDialogOpen] = useState(false);
  const heroRef = useRef<HTMLElement>(null);
  const isHeroInView = useInView(heroRef, { once: true, margin: '-100px' });
  const isSignedIn = Boolean(user?.email && user.email !== 'nil');
  const heroRockets = useMemo(() => createHeroRockets(3), []);

  useEffect(() => {
    const loadFeaturedBusinesses = async () => {
      if (businessList.length > 0 || businesses?.length) {
        if (businesses?.length) {
          setBusinessList(businesses);
        }
        return;
      }

      try {
        const response = await axios.get('/api/dbhandler?model=business&limit=6&includeArchived=false');
        const data = Array.isArray(response.data) ? response.data : [];

        const formattedBusinesses = data.map((biz: any) => ({
          ...biz,
          owner: {
            name: biz.owner?.name ?? 'Anonymous User',
            image: biz.owner?.image ?? null,
          },
        }));

        setBusinessList(formattedBusinesses);
      } catch (error) {
        console.error('Failed to load featured businesses:', error);
        setBusinessList([]);
      }
    };

    loadFeaturedBusinesses();
  }, [businessList.length, businesses]);

  const handleAssistantSearch = async (value = assistantQuery) => {
    const normalizedQuery = value.trim();
    if (!normalizedQuery) {
      setAssistantResults([]);
      setAssistantMessage('Type a product or store name and I’ll search the marketplace for fast matches.');
      return;
    }

    setAssistantLoading(true);
    setAssistantMessage(`Searching the marketplace for "${normalizedQuery}"...`);

    try {
      const response = await axios.get(`/api/dbhandler?model=product&query=${encodeURIComponent(normalizedQuery)}&limit=6&include=category,brand,stock,activeIngredients`);
      const results = Array.isArray(response.data) ? response.data : [];
      const topResults = results.slice(0, 4);

      setAssistantResults(topResults);

      if (topResults.length > 0) {
        const bestMatch = topResults[0];
        const bestStore = bestMatch.business?.name || bestMatch.vendor || 'a trusted store';
        const bestPrice = Number(bestMatch.price || 0);
        setAssistantMessage(`I've found ${topResults.length} strong matches for "${normalizedQuery}". ${bestStore} has the best match at ₦${bestPrice.toLocaleString()}. Should I add it to your bag?`);
      } else {
        setAssistantMessage(`I couldn’t find a direct match for "${normalizedQuery}" yet. Try a broader term like “paracetamol” or “vitamin”.`);
      }
    } catch (error) {
      console.error('Assistant search failed:', error);
      setAssistantResults([]);
      setAssistantMessage('The search service is temporarily unavailable. Please try again in a moment.');
    } finally {
      setAssistantLoading(false);
    }
  };

  // Order by ratings double-check (already done in page.tsx but safety)
  const sortedBusinesses = [...businessList].sort((a, b) => b.ratings - a.ratings);

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start' }, [Autoplay({ delay: 2200, stopOnInteraction: false, stopOnMouseEnter: true })]);

  const handleArchiveBusiness = async (businessId: string, businessName: string) => {
    if (!window.confirm(`Are you sure you want to archive "${businessName}"? This business will be suspended but data will be preserved.`)) {
      return;
    }

    try {
      setLoadingId(businessId);
      const response = await axios.post("/api/business/archive", { businessId });
      
      if (response.data.success) {
        toast.success(`"${businessName}" archived successfully`);
        setBusinessList(businessList.map(b => 
          b.id === businessId ? { ...b, isArchived: true } : b
        ));
      }
    } catch (error: any) {
      console.error("Archive error:", error);
      toast.error(error.response?.data?.error || "Failed to archive business");
    } finally {
      setLoadingId(null);
    }
  };

  const handleDeleteBusiness = async (businessId: string, businessName: string) => {
    if (!window.confirm(`Are you sure you want to PERMANENTLY DELETE "${businessName}"? This action cannot be undone and all data will be removed.`)) {
      return;
    }

    try {
      setLoadingId(businessId);
      const response = await axios.delete("/api/business/delete", {
        data: { businessId }
      });
      
      if (response.data.success) {
        toast.success(`"${businessName}" deleted successfully`);
        setBusinessList(businessList.filter(b => b.id !== businessId));
      }
    } catch (error: any) {
      console.error("Delete error:", error);
      toast.error(error.response?.data?.error || "Failed to delete business");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="min-h-screen w-full bg-background flex flex-col items-center">
      {/* Hero Section */}
      <section
        ref={heroRef}
        className="w-full py-24 px-4 flex flex-col items-center text-center bg-gradient-to-b from-accent/15 via-background to-background relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary rounded-full blur-[120px]" />
        </div>

        {heroRockets.map((rocket) => (
          <motion.div
            key={rocket.key}
            initial={{ x: rocket.startX, y: '110vh', opacity: 0, rotate: rocket.rotationPath[0], scale: 0.85 }}
            animate={isHeroInView ? {
              x: [rocket.startX, rocket.waypointX, rocket.endX],
              y: ['110vh', rocket.midY, rocket.endY],
              opacity: [0, rocket.opacity, rocket.opacity, 0],
              scale: [0.85, 1, 1.05, 0.85],
              rotate: rocket.rotationPath,
            } : {}}
            transition={{
              duration: rocket.duration,
              delay: rocket.delay,
              ease: [0.22, 1, 0.36, 1],
              repeat: Infinity,
              repeatType: 'loop',
              repeatDelay: 2.5,
            }}
            className="absolute z-0 pointer-events-none"
            style={{ left: '0', top: '0', fontSize: rocket.fontSize }}
          >
            🚀
          </motion.div>
        ))}

        <motion.div
          initial={{ opacity: 0 }}
          animate={isHeroInView ? { opacity: [0, 0.4, 0] } : {}}
          transition={{ duration: 2.5, delay: 0.5 }}
          className="absolute w-32 h-[400px] bg-gradient-to-t from-accent/40 to-transparent blur-xl rotate-[-45deg] z-0 pointer-events-none"
        />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-5xl space-y-8 z-10"
        >
          <div className="inline-flex items-center rounded-full border-2 px-4 py-1.5 text-sm font-black bg-primary/10 text-primary border-primary/20 animate-pulse">
            <Zap className="mr-2 h-4 w-4 fill-primary" /> VendorPort v2.0 is Live
          </div>
          <h1 className="text-3xl md:text-6xl font-black tracking-tighter leading-none">
            Scale Your Business <br />
            <span className="text-accent underline decoration-primary/30 italic text-4xl">Without Boundaries</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto font-medium leading-relaxed">
            World's most dynamic website builder for entrepreneurs. Launch your e-store, pharmacy, or service site in under 60 seconds with full multi-currency and AI-powered shopping.
          </p>

          <div className="flex flex-col gap-6 justify-center items-center pt-10">
            <div className="flex flex-col gap-3 md:flex-row items-center justify-center">
              {isSignedIn ? (
                <Link href="/create-store">
                  <Button size="lg" className="py-4 px-10 bg-accent/70 hover:bg-accent/50 text-white font-black animate-pulse text-lg w-full max-w-[300] rounded-2xl shadow-2xl border-2 shadow-accent/70 transition-all hover:scale-105">
                    Create Website <PlusCircle className="ml-3 h-6 w-6" />
                  </Button>
                </Link>
              ) : (
                <Dialog open={isAuthDialogOpen} onOpenChange={setIsAuthDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="lg" className="py-4 px-10 bg-accent/70 hover:bg-accent/50 text-white font-black animate-pulse text-lg w-full max-w-[200] rounded-2xl shadow-2xl border-2 shadow-accent/70 transition-all hover:scale-105">
                      Create Website <PlusCircle className="ml-3 h-6 w-6" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md rounded-3xl" aria-describedby="create-website-description">
                    <DialogHeader>
                      <DialogTitle className="text-2xl font-black">Start your storefront</DialogTitle>
                      <DialogDescription>
                        dialog to create my website. You need an account to launch your website. Choose one of the options below.
                      </DialogDescription>
                    </DialogHeader>
                    <div id="create-website-description" className="space-y-4 py-2">
                      <p className="text-sm text-muted-foreground">You need an account before you can launch your website. Choose one of the options below.</p>
                      <div className="grid gap-3">
                        <Login />
                        <Signup />
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}

              {isSignedIn ? (
                <Dialog open={isPortfolioDialogOpen} onOpenChange={setIsPortfolioDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="lg" variant="outline" className="py-4 px-10 font-black text-lg w-full max-w-[260] rounded-2xl border-2 border-accent bg-accent/10 hover:bg-accent/20 transition-all md:w-auto">
                      Create Portfolio <PlusCircle className="ml-3 h-6 w-6" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-2xl rounded-3xl">
                    <DialogHeader>
                      <DialogTitle className="text-2xl font-black">Create your portfolio</DialogTitle>
                      <DialogDescription>
                        Add your job title, summary, portfolio imagery, CVs, and certifications. Each account can keep one portfolio.
                      </DialogDescription>
                    </DialogHeader>
                    <PortfolioForm onSubmitted={() => setIsPortfolioDialogOpen(false)} />
                  </DialogContent>
                </Dialog>
              ) : (
                <Dialog open={isAuthDialogOpen} onOpenChange={setIsAuthDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="lg" variant="outline" className="py-4 px-10 font-black text-lg w-full max-w-[260] rounded-2xl border-2 border-accent bg-accent/10 hover:bg-accent/20 transition-all md:w-auto">
                      Create Portfolio <PlusCircle className="ml-3 h-6 w-6" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md rounded-3xl" aria-describedby="create-portfolio-description">
                    <DialogHeader>
                      <DialogTitle className="text-2xl font-black">Sign in to create your portfolio</DialogTitle>
                      <DialogDescription>
                        Create an account or sign in to save a single portfolio for this user.
                      </DialogDescription>
                    </DialogHeader>
                    <div id="create-portfolio-description" className="space-y-4 py-2">
                      <div className="grid gap-3">
                        <Login />
                        <Signup />
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            <Link href="#businesses">
              <Button size="lg" variant="outline" className="py-4 px-10 font-black text-xl w-full max-w-[450] sm:w-auto rounded-2xl border-2 border-accent hover:bg-muted/50 transition-all bg-accent/15">
                Explore Best Stores <ArrowRight className="ml-3 h-6 w-6" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>


      {/* Stats Section */}
      <StatsSection />

      {/* Global Categories Carousel */}
      <div className='w-full max-w-xl lg:max-w-4xl mx-auto py-5'>
        <FeaturedCategories fetchAll />
      </div>

      {/* AI Assistant Section */}
      <section className="w-full py-32 px-2 md:px-6 relative overflow-hidden bg-accent/20 rounded-xl m-2 max-w-6xl shadow-lg shadow-accent/60">
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
               <div className="inline-flex animate-pulse items-center rounded-full bg-white/20 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-white border border-white/20">
                  <Sparkles className="mr-2 h-4 w-4" /> Next-Gen Shopping
               </div>
               <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter leading-none">
                    <span className="text-5xl md:text-7xl">Your Personal</span> <br />
                  <span className="text-black/90 underline /decoration-white/20 italic text-5xl md:text-7xl pl-24">AI Shopper</span>
                </h2>
               <p className="text-xl text-white/80 font-medium max-w-xl leading-relaxed">
                  Can't find what you're looking for? Just upload your shopping list or describe what you need. Our AI scans every store on VendorPort to find you the best deals, quality, and nearest availability in seconds.
               </p>
               <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 p-2">
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
                  <Button className="px-10 py-3 mt-4 animate-pulse bg-background border-accent border-2 text-accent hover:bg-accent/40 text-2xl font-black rounded-2xl shadow-2xl shadow-accent transition-all hover:scale-105">
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
               <div className="bg-white/10 bg-glass rounded-[40px] border-4 border-white/20 p-2 py-8 md:p-8 shadow-2xl relative z-20 overflow-hidden group">
                  <div className="space-y-6">
                     <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-2xl bg-white flex items-center justify-center text-black shadow-xl">
                           <AiOutlineRobot className="h-10 w-10" />
                        </div>
                        <div>
                           <h4 className="text-white font-black text-xl uppercase tracking-tighter">Vendor-AI assistant</h4>
                           <div className="flex gap-1">
                              <div className="h-1 w-8 bg-white rounded-full" />
                              <div className="h-1 w-2 bg-white rounded-full" />
                           </div>
                        </div>
                     </div>

                     <div className="rounded-3xl border border-white/20 bg-white/95 px-2 py-5 md:px-5 shadow-inner">
                        <div className="space-y-4">
                        <Textarea
                           value={assistantQuery}
                           onChange={(e) => setAssistantQuery(e.target.value)}
                           placeholder="Type a list of products (e.g., apples, bananas) or a shopping request..."
                           className="min-h-[120px] rounded-3xl border-2 border-white/20 bg-muted/70 text-sm text-foreground focus:border-accent focus:ring-0"
                        />
                        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                           <Button
                              onClick={() => handleAssistantSearch(assistantQuery)}
                              disabled={assistantLoading}
                              className="h-14 rounded-2xl px-6 font-semibold animate-pulse bg-accent/70 hover:bg-accent/50 border-2 border-black/60"
                           >
                              {assistantLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search Products'}
                           </Button>
                           <SnapPrescription>
                              <Button
                                 variant="outline"
                                 className="h-14 rounded-2xl px-6 gap-2 font-semibold"
                              >
                                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4">
                                   <path d="M12 16v-6m0 0l-3 3m3-3l3 3M4 12a8 8 0 1016 0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                 </svg>
                                 Upload Image
                              </Button>
                           </SnapPrescription>
                        </div>
                     </div>

                        <div className="mt-4 rounded-2xl bg-accent/5 px-4 py-3 text-sm font-semibold text-black/70">
                           {assistantLoading ? 'Searching 500+ stores...' : assistantMessage}
                        </div>

                        <div className="mt-4 space-y-2">
                           {assistantResults.map((item, index) => (
                              <Link
                                 key={item.id || `${item.name}-${index}`}
                                 href={`/products/${item.id}`}
                                 className="flex items-center justify-between rounded-2xl border border-border/50 bg-background/90 px-3 py-3 transition-all hover:border-accent/40 hover:bg-accent/5"
                              >
                                 <div className="min-w-0">
                                    <p className="truncate font-black text-sm">{item.name}</p>
                                    <p className="text-xs text-muted-foreground">{item.category?.name || 'Product match'}</p>
                                 </div>
                                 <div className="flex items-center gap-2 text-sm font-black text-accent">
                                    <ShoppingBag className="h-4 w-4" />
                                    ₦{Number(item.price || 0).toLocaleString()}
                                 </div>
                              </Link>
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
      <section id="businesses" className="w-full max-w-7xl py-24 px-6">
        <div className="space-y-4 max-w-3xl mx-auto mb-2">
          <h2 className="text-4xl md:text-5xl font-black tracking-tight">Top Rated Websites <br /><span className="text-accent underline decoration-primary/20">on VendorPort</span></h2>
          <p className="text-xl text-muted-foreground font-medium">Join the elite businesses using our platform to dominate their local markets.</p>
        </div>

        {businessList.length === 0 ? (
          <div className="col-span-full py-32 text-center rounded-3xl border-4 border-dashed border-muted flex flex-col items-center justify-center space-y-6">
             <div className="h-24 w-24 bg-muted rounded-full flex items-center justify-center">
                <Globe className="h-12 w-12 opacity-20" />
             </div>
             <div className="space-y-2">
                <h3 className="text-3xl font-black">No Business Websites Yet</h3>
                <p className="text-muted-foreground max-w-sm mx-auto">The digital frontier is open. Be the first entrepreneur to launch a top-rated site on VendorPort!</p>
             </div>
             <Link href="/create-store">
                <Button className="h-14 px-10 bg-accent text-slate-400 text-xl animate-pulse dark:text-background font-bold rounded-xl shadow-xl">Start Building Today</Button>
             </Link>
          </div>
        ) : (
          <div className="mt-8">
            <div className="overflow-hidden py-4" data-embla="">
              <div ref={emblaRef} className="w-full">
                <div className="flex gap-6">
                  {sortedBusinesses.map((biz) => (
                    <div key={biz.id} className="max-w-[300px] flex-none">
                      <motion.div whileHover={{ y: -6 }} transition={{ duration: 0.25 }}>
                        <Card className="h-full shadow-md shadow-accent flex flex-col overflow-hidden border-2 hover:border-accent transition-all rounded-3xl group">
                          <div className="h-24 bg-muted relative overflow-hidden">
                              {biz.siteSettings?.storefrontImageUrl ? (
                               <img src={biz.siteSettings.storefrontImageUrl} alt={`${biz.name} storefront`} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                              ) : (
                               <div className="absolute inset-0 flex items-center justify-center bg-accent/5 group-hover:bg-accent/10 transition-colors">
                                 <Globe className="h-14 w-14 text-accent/10 group-hover:scale-120 transition-transform duration-700" />
                               </div>
                              )}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
                             <div className="absolute top-3 right-3 bg-white/95 dark:bg-black/95 px-3 py-1 rounded-full flex items-center gap-1 text-sm font-black shadow-lg border-2 border-accent/20">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                {biz.ratings.toFixed(1)}
                             </div>
                          </div>
                          <CardHeader>
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <CardTitle className="text-xl md:text-2xl font-black tracking-tight">{biz.name}</CardTitle>
                                {biz.isArchived && (
                                  <div className="inline-flex items-center gap-1 mt-2 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-lg text-xs font-bold">
                                    <AlertTriangle className="h-3 w-3" />
                                    ARCHIVED
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-3 pt-2">
                              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center border-2 border-primary/5 overflow-hidden">
                                 {biz.owner.image ? (
                                   // eslint-disable-next-line @next/next/no-img-element
                                   <img src={biz.owner.image} alt={biz.owner.name || ""} title={biz.owner.name || ""} className="h-full w-full rounded-xl object-cover" />
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
                          <CardFooter className="pt-0 pb-4 px-4 flex flex-col gap-3">
                            {!biz.isArchived ? (
                              <Link href={getStoreUrl(biz.name)} suppressHydrationWarning className="w-full">
                                <Button className="w-full h-12 gap-3 border-2 rounded-2xl group-hover:bg-accent group-hover:text-white transition-all font-black text-sm" variant="outline">
                                  Visit Experience <ArrowRight className="h-4 w-4" />
                                </Button>
                              </Link>
                            ) : (
                              <Button disabled className="w-full h-12 gap-3 border-2 rounded-2xl bg-muted text-muted-foreground font-black text-sm" variant="outline">
                                Archived - Cannot Access
                              </Button>
                            )}
                          </CardFooter>
                        </Card>
                      </motion.div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* CTA Registration Section */}
      <section className="w-full bg-black text-white py-32 px-6">
         <div className="max-w-5xl mx-auto flex flex-col items-center text-center space-y-10">
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter leading-tight">Ready to Take Over <br />The Digital World?</h2>
            <p className="text-lg md:text-xl text-gray-400 max-w-3xl font-medium">Join 500+ entrepreneurs who turned their local business into a global brand in seconds. No coding required. No design skills needed.</p>
            <div className="flex flex-col md:flex-row gap-6 w-full max-w-md">
               <div className="flex-1">
                  {user?.email === "nil" ? <Login /> : (
                    <Link href="/create-store" className="w-full">
                       <Button className="w-full h-16 bg-accent font-black text-slate-400 shadow-accent/60 shadow-xl animate-pulse dark:text-background text-xl rounded-2xl hover:scale-105 transition-all">Get Started Now</Button>
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

export default Home
