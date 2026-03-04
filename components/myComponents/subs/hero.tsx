"use client"
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Button } from '@/components/ui/button'
import {
  ArrowRight, Clock, Truck, Star, ShieldCheck, CreditCard, ShoppingCart,
  Store, Banknote, Wallet, MapPin, User, Menu, ChevronLeft, ChevronRight,
  Instagram, Calendar, Phone, Search
} from 'lucide-react'
import { SearchInput } from './searchcomponent'
import { RiseAndFadeText } from './textctrl'
import { useAppContext } from '@/hooks/useAppContext'
import { getSiteSettings } from '@/server/action/siteSettings'
import { motion, AnimatePresence } from "framer-motion"
import { AdminEditable } from '@/components/utility/AdminEditable';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Input } from '@/components/ui/input'
import { ProductCarousel } from './ProductCarousel'

type HeroVariant = 'modern-split' | 'immersive' | 'carousel' | 'story' | 'menu' | 'experience' | 'local';

interface HeroProps {
  variant?: HeroVariant;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  sectionId?: string;
}

// --- Shared Components ---

const BackgroundEffects = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <div className="absolute bottom-20 left-0 w-full opacity-[0.04]">
        <IconMarquee />
      </div>
      {/* Ribbons */}
      <motion.div
        animate={{ y: [0, 20, 0], rotate: [0, 5, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[10%] left-[5%] w-[150px] h-[150px] md:w-[300px] md:h-[300px] bg-accent/10 md:bg-accent/20 rounded-full blur-[60px] md:blur-[80px]"
      />
      <motion.div
        animate={{ x: [0, -30, 0], y: [0, 40, 0], rotate: [0, -10, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute bottom-[20%] right-[10%] w-[200px] h-[200px] md:w-[400px] md:h-[400px] bg-primary/10 md:bg-primary/20 rounded-full blur-[80px] md:blur-[100px]"
      />
      {/* Wave */}
      <div className="absolute top-1/2 left-0 w-[200%] h-32 opacity-[0.04] md:opacity-[0.06] text-accent flex overflow-hidden">
        <motion.div
          className="flex w-full"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          <WaveSVG />
          <WaveSVG />
        </motion.div>
      </div>
    </div>
  )
}

const WaveSVG = () => (
  <svg className="w-1/2 h-full flex-shrink-0" viewBox="0 0 1440 320" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
    <path fill="currentColor" fillOpacity="1" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,160C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" />
  </svg>
)

const IconMarquee = () => {
  const icons = [
    { Icon: ShoppingCart, key: 'cart' }, { Icon: CreditCard, key: 'card' },
    { Icon: Store, key: 'store' }, { Icon: Banknote, key: 'banknote' }, { Icon: Wallet, key: 'wallet' },
  ];
  const marqueeIcons = [...icons, ...icons, ...icons, ...icons, ...icons, ...icons];
  return (
    <motion.div
      className="flex items-center space-x-24 whitespace-nowrap"
      animate={{ x: [0, -1000] }}
      transition={{ x: { repeat: Infinity, repeatType: "loop", duration: 40, ease: "linear" } }}
    >
      {marqueeIcons.map((item, index) => (
        <div key={index} className="flex items-center text-foreground">
          <item.Icon className="h-12 w-12 opacity-80" />
        </div>
      ))}
    </motion.div>
  );
};

// --- Main Component ---

const Hero = ({ variant = 'modern-split', title, subtitle, sectionId }: HeroProps) => {
  const { user, currentBusiness } = useAppContext();
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    if (currentBusiness?.id) {
       getSiteSettings(currentBusiness.id).then(setSettings);
    }
  }, [currentBusiness]);

  // Carousel/Slide Logic
  const slides = ['/small chops 1.jpg', '/small chops 3.jpg', '/small chops 4.jpg'];
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFloating, setIsFloating] = useState(false);

  useEffect(() => {
    if (variant === 'carousel') {
      const t = setInterval(() => setCurrentSlide(c => (c + 1) % slides.length), 5000);
      return () => clearInterval(t);
    }
  }, [variant, slides.length]);

  useEffect(() => {
    const handleScroll = () => setIsFloating(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Shared Logic
  const DynamicText = () => (
    <RiseAndFadeText
      texts={
        settings?.heroDynamicTexts || [
          "From " + (currentBusiness?.name || "Our Store"), "Card & Bank Transfer Payments", "Login With Google or Facebook",
          "Naturally Processed Spices", "Quality You Can Trust", "Trusted by Homes and Businesses",
          "Fast & Reliable Delivery", "Carefully Packed for Freshness", "Customer Satisfaction Guaranteed",
        ]
      }
      className="text-xl md:text-2xl mt-2 font-semibold text-muted-foreground overflow-hidden"
    />
  );

  const buttonBounce = {
    y: [0, -4, 0],
    transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
  };

  const storeBase = currentBusiness?.name ? `/${currentBusiness.name.toLowerCase().replace(/\s+/g, '-')}` : '/store';

  const CTAButtons = ({ className = "" }: { className?: string }) => (
    <div className={`flex flex-col gap-3 sm:flex-row z-10 ${className}`}>
      <Link href={`${storeBase}/store`} className='w-full max-w-52'>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} animate={buttonBounce}>
          <Button className={`h-12 gap-1.5 px-8 transition-all duration-200 bg-accent hover:bg-accent/90 w-full text-white font-bold text-lg shadow-xl shadow-accent/20`} size="lg">
            Shop Now <ArrowRight className="h-5 w-5 animate-pulse" />
          </Button>
        </motion.div>
      </Link>
      {user?.id === "nil" && (
        <Link href="/account" className="w-full max-w-52">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} animate={buttonBounce} transition={{ delay: 0.2 }}>
            <Button className="h-12 px-8 w-full border-2 border-accent text-accent hover:bg-accent/10 transition-colors duration-200 font-semibold" size="lg" variant="outline">
              Login
            </Button>
          </motion.div>
        </Link>
      )}
    </div>
  );

  const TrustBadges = ({ className = "text-muted-foreground" }: { className?: string }) => (
    <div className={`flex flex-wrap gap-5 text-sm ${className} mt-4`}>
      <div className="flex items-center gap-1.5">
        <Truck className="h-5 w-5 text-primary" />
        <span>Free shipping available</span>
      </div>
      <div className="flex items-center gap-1.5">
        <Clock className="h-5 w-5 text-primary" />
        <span>24/7 Customer Support</span>
      </div>
    </div>
  );

  const editableTitle = (defaultVal: string) => {
    const val = title || (sectionId ? defaultVal : (settings?.heroTitle || defaultVal));
    const model = sectionId ? "section" : "siteSettings";
    const field = sectionId ? "data.title" : "heroTitle";
    const id = sectionId || settings?.id || "";

    return (
      <AdminEditable 
        value={val} 
        field={field} 
        model={model} 
        id={id} 
        as="span" 
        className="relative z-10" 
        data={sectionId ? { title: val, text: subtitle } : undefined}
      />
    );
  };

  const editableSubtitle = (defaultVal: string) => {
    const val = subtitle || (sectionId ? defaultVal : (settings?.heroSubtitle || defaultVal));
    const model = sectionId ? "section" : "siteSettings";
    const field = sectionId ? "data.text" : "heroSubtitle";
    const id = sectionId || settings?.id || "";

    return (
      <AdminEditable 
        value={val} 
        field={field} 
        model={model} 
        id={id} 
        as="p" 
        className="max-w-[600px] text-lg text-muted-foreground md:text-xl leading-relaxed" 
        data={sectionId ? { title, text: val } : undefined}
      />
    );
  };

  // --- VARIANTS ---

  if (variant === 'modern-split') {
    return (
      <div className="relative overflow-hidden py-8 md:py-20 bg-background">
        <BackgroundEffects />
        <div className="relative z-10 container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-12">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="flex flex-col justify-center space-y-8">
              <div className="flex z-50 md:hidden w-full justify-center items-center"><SearchInput /></div>
              <div className="space-y-4">
                <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-accent/10 text-accent hover:bg-accent/20">
                  <Star className="mr-1 h-3 w-3 fill-accent" /> Top Rated
                </div>
                <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                   <div className="block text-foreground">{editableTitle("World of flavors!")}</div>
                   <span className="block text-accent uppercase tracking-tighter">{currentBusiness?.name || "Our Store"}</span>
                 </h1>
                  <DynamicText />
                  {editableSubtitle("Discover premium products at competitive prices, with fast shipping and exceptional customer service.")}
              </div>
              <ProductCarousel />
              <CTAButtons />
              <TrustBadges />
            </motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.2 }} className="relative hidden lg:block h-[500px] w-full">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-[400px] h-[400px] bg-accent/10 rounded-full animate-blob mix-blend-multiply filter blur-xl opacity-70"></div>
                <div className="relative w-[400px] h-[400px] bg-primary/10 rounded-full animate-blob animation-delay-2000 mix-blend-multiply filter blur-xl opacity-70 -ml-20"></div>
                <img src="/mission-burrito-fast-food-shawarma-kati-roll-breakfast-6dd86711999109a88eae948201cd24bf.png" alt="Featured" className="relative z-10 w-[450px] h-auto object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500" />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'immersive') { 
    return (
      <div className="relative w-full h-[80vh] min-h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 w-full h-full">
          <img src="/small chops 1.jpg" alt="Background" className="w-full h-full object-cover scale-105" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
        </div>
        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center">
          <div className="max-w-2xl">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="backdrop-blur-md bg-black/30 p-8 md:p-10 rounded-2xl border border-white/10 shadow-2xl">
              <div className="flex z-50 md:hidden w-full justify-center items-center mb-6"><SearchInput /></div>
              <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight mb-4 drop-shadow-md">
                {editableTitle("Exclusive Experience")} <br />
                <span className="text-accent">{currentBusiness?.name || "Premium Store"}</span>
              </h1>
              <div className="text-gray-200 mb-8">{editableSubtitle("Quality products tailored just for you.")}</div>
              <CTAButtons />
              <TrustBadges className="text-gray-300" />
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'carousel') {
    return (
      <div className="relative h-screen w-full overflow-hidden">
        <div className="absolute top-0 left-0 right-0 z-40 bg-accent text-white py-1 text-center text-sm font-bold">Welcome to {currentBusiness?.name || "Our Store"}</div>
        <div className="absolute inset-0 bg-black/60 z-10" />
        <AnimatePresence mode='wait'>
            <motion.img key={currentSlide} src={slides[currentSlide]} initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:1}} className="absolute inset-0 w-full h-full object-cover" />
        </AnimatePresence>
        <div className="relative z-20 container mx-auto h-full flex flex-col justify-center items-center text-center px-4 pt-20">
           <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              {editableTitle("Fresh Quality")} <span className="text-accent">Online</span>
           </h1>
           <div className="text-gray-200 mb-8 text-xl">{editableSubtitle("Order from the comfort of your home.")}</div>
           <CTAButtons />
           <div className="absolute bottom-0 w-full bg-background/90 backdrop-blur-md py-6 border-t hidden md:block">
              <div className="container mx-auto grid grid-cols-3 gap-4">
                  <div className='flex flex-col items-center'><Clock className="text-accent h-6 w-6"/><span className="font-bold">24/7 Support</span></div>
                  <div className='flex flex-col items-center'><Truck className="text-accent h-6 w-6"/><span className="font-bold">Fast Delivery</span></div>
                  <div className='flex flex-col items-center'><Star className="text-accent h-6 w-6"/><span className="font-bold">Standard Quality</span></div>
              </div>
           </div>
        </div>
      </div>
    )
  }

  if (variant === 'story') {
    return (
        <div className="relative min-h-screen w-full overflow-hidden">
            <div className="fixed inset-0 -z-10 bg-[url('/small%20chops%201.jpg')] bg-cover bg-center bg-fixed opacity-20" />
            <div className="container mx-auto px-4 py-20 min-h-screen grid lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-8">
                    <h1 className="text-6xl font-bold">{editableTitle("Our Passion")}</h1>
                    <div className="text-muted-foreground text-xl">{editableSubtitle("The journey of our store and vision.")}</div>
                    <Accordion type="single" collapsible className="w-full bg-background/80 backdrop-blur-sm rounded-lg p-4">
                        <AccordionItem value="story">
                            <AccordionTrigger className='text-lg font-bold'>The Mission</AccordionTrigger>
                            <AccordionContent>Providing high-quality products to empower our customers.</AccordionContent>
                        </AccordionItem>
                    </Accordion>
                    <CTAButtons />
                </div>
            </div>
        </div>
    )
  }

  return (
    <div className="py-20 bg-background text-center space-y-6">
       <h1 className="text-5xl font-black">{editableTitle("Our Boutique")}</h1>
       <div className="max-w-2xl mx-auto">{editableSubtitle("Excellence in every detail.")}</div>
       <div className="flex justify-center"><CTAButtons /></div>
    </div>
  );
}

export default Hero
