"use client"
import React, { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  ArrowRight, Clock, Truck, Star, ShieldCheck, MapPin,
  Calendar, Users, Instagram, ChevronLeft, ChevronRight,
  Search, Menu, ShoppingCart, User, Phone
} from 'lucide-react'
import { motion, AnimatePresence } from "framer-motion"
import { Input } from '@/components/ui/input'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

type HeroVariant = 'carousel' | 'story' | 'menu' | 'experience' | 'local'

interface HeroVariantProps {
  variant: HeroVariant
}

// Hero Variant 1: Image Carousel + Online Ordering
const CarouselHero = () => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [showNotification, setShowNotification] = useState(true)
  const [isOrderNowFloating, setIsOrderNowFloating] = useState(false)

  const slides = [
    '/small chops 1.jpg',
    '/small chops 3.jpg',
    '/small chops 4.jpg',
    '/small chops 5.jpg',
    '/shawama pics 1.jpg',
  ]

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length)
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)

  // Auto-advance slides
  React.useEffect(() => {
    const timer = setInterval(nextSlide, 5000)
    return () => clearInterval(timer)
  }, [])

  // Detect scroll for floating button
  React.useEffect(() => {
    const handleScroll = () => {
      setIsOrderNowFloating(window.scrollY > 400)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Sticky Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="container mx-auto px-4 flex items-center justify-between h-16">
          <div className="font-bold text-xl text-accent">Lois Food & Spices</div>
          <div className="hidden md:flex gap-6">
            <Link href="/" className="hover:text-accent transition">Home</Link>
            <Link href="/store" className="hover:text-accent transition">Menu</Link>
            <Link href="/about" className="hover:text-accent transition">About</Link>
            <Link href="/contact" className="hover:text-accent transition">Contact</Link>
          </div>
          <div className="flex items-center gap-4">
            <MapPin className="h-5 w-5 hidden md:block" />
            <User className="h-5 w-5" />
            <ShoppingCart className="h-5 w-5" />
            <Menu className="h-5 w-5 md:hidden" />
          </div>
        </div>
      </nav>

      {/* Notification Bar */}
      {showNotification && (
        <motion.div
          initial={{ y: -50 }}
          animate={{ y: 0 }}
          className="fixed top-16 left-0 right-0 z-40 bg-accent text-white py-2 px-4 text-center text-sm"
        >
          Free delivery on orders over ₦5,000
          <button onClick={() => setShowNotification(false)} className="ml-4 underline">Dismiss</button>
        </motion.div>
      )}

      {/* Carousel */}
      <div className="relative h-full w-full mt-16">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentSlide}
            src={slides[currentSlide]}
            alt={`Slide ${currentSlide + 1}`}
            className="w-full h-full object-cover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          />
        </AnimatePresence>

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

        {/* Carousel Controls */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full p-3 z-20"
        >
          <ChevronLeft className="h-6 w-6 text-white" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full p-3 z-20"
        >
          <ChevronRight className="h-6 w-6 text-white" />
        </button>

        {/* Pagination Dots */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentSlide ? 'w-8 bg-accent' : 'w-2 bg-white/50'
              }`}
            />
          ))}
        </div>

        {/* CTA Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-10 px-4">
          <motion.h1
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-4xl md:text-6xl font-bold text-white mb-6"
          >
            Order Fresh Food & Spices Online
          </motion.h1>

          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col md:flex-row gap-4"
          >
            <Link href="/store">
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-white px-8 py-6 text-lg">
                Order Now <ArrowRight className="ml-2" />
              </Button>
            </Link>
            <Link href="/store">
              <Button size="lg" variant="outline" className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-black px-8 py-6 text-lg">
                View Menu
              </Button>
            </Link>
          </motion.div>

          {/* Location Selector (Desktop) */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-8 hidden md:flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-lg px-4 py-2"
          >
            <MapPin className="h-5 w-5 text-white" />
            <select className="bg-transparent text-white border-none outline-none">
              <option value="lagos">Lagos</option>
              <option value="abuja">Abuja</option>
              <option value="port-harcourt">Port Harcourt</option>
            </select>
          </motion.div>
        </div>
      </div>

      {/* Floating "Order Online" Button (shown after scroll) */}
      <AnimatePresence>
        {isOrderNowFloating && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Link href="/store">
              <Button className="bg-accent hover:bg-accent/90 text-white shadow-2xl rounded-full px-6 py-6">
                <ShoppingCart className="mr-2" />
                Order Online
              </Button>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info Section (visible at bottom) */}
      <div className="absolute bottom-0 left-0 right-0 bg-background/90 backdrop-blur-md border-t py-6 px-4 hidden lg:block">
        <div className="container mx-auto grid grid-cols-3 gap-8 text-center">
          <div>
            <Clock className="h-8 w-8 mx-auto mb-2 text-accent" />
            <h3 className="font-semibold">Mon-Sat: 8AM-8PM</h3>
            <p className="text-sm text-muted-foreground">Sundays Closed</p>
          </div>
          <div>
            <Truck className="h-8 w-8 mx-auto mb-2 text-accent" />
            <h3 className="font-semibold">Fast Delivery</h3>
            <p className="text-sm text-muted-foreground">30-60 minutes</p>
          </div>
          <div>
            <Star className="h-8 w-8 mx-auto mb-2 text-accent" />
            <h3 className="font-semibold">Special Offers</h3>
            <p className="text-sm text-muted-foreground">Save up to 20%</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Hero Variant 2: Story-Driven UI
const StoryHero = () => {
  const [expandedSection, setExpandedSection] = useState<string | null>(null)

  return (
    <div className="relative min-h-screen w-full">
      {/* Parallax Background */}
      <motion.div
        className="fixed inset-0 w-full h-full -z-10"
        style={{ backgroundImage: 'url(/small chops 1.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}
        initial={{ scale: 1 }}
        whileInView={{ scale: 1.1 }}
        transition={{ duration: 2 }}
      />
      <div className="fixed inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/30 -z-10" />

      <div className="container mx-auto px-4 py-20 min-h-screen grid lg:grid-cols-2 gap-12">
        {/* Left: Story Content */}
        <div className="flex flex-col justify-center space-y-6 text-white">
          <motion.h1
            initial={{ x: -50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            className="text-5xl md:text-6xl font-bold leading-tight"
          >
            Crafted with <span className="text-accent">Passion</span>,<br />
            Served with <span className="text-accent">Love</span>
          </motion.h1>

          <motion.p
            initial={{ x: -50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-gray-300 leading-relaxed"
          >
            For over 15 years, Lois Food and Spices has been bringing authentic Nigerian flavors to homes and businesses across the nation.
          </motion.p>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="story" className="border-white/20">
              <AccordionTrigger className="text-white text-xl hover:text-accent">Our Story</AccordionTrigger>
              <AccordionContent className="text-gray-300">
                Founded in 2010, Lois Food and Spices started as a small family business with a passion for quality and authenticity. Today, we serve thousands of customers nationwide, maintaining the same dedication to excellence that defined our beginnings.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="team" className="border-white/20">
              <AccordionTrigger className="text-white text-xl hover:text-accent">Meet the Team</AccordionTrigger>
              <AccordionContent className="text-gray-300">
                Our team consists of experienced chefs, sourcing specialists, and customer service experts who work tirelessly to ensure every product meets our high standards.
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Link href="/store">
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-white">
                Join us for dinner <ArrowRight className="ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Right: Sidebar */}
        <div className="hidden lg:flex flex-col justify-center space-y-6 bg-white/10 backdrop-blur-md rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-white">Why Choose Us?</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <ShieldCheck className="h-6 w-6 text-accent flex-shrink-0 mt-1" />
              <div>
                <h4 className="text-white font-semibold">100% Natural Ingredients</h4>
                <p className="text-gray-300 text-sm">No preservatives, just pure quality</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Truck className="h-6 w-6 text-accent flex-shrink-0 mt-1" />
              <div>
                <h4 className="text-white font-semibold">Fast Nationwide Delivery</h4>
                <p className="text-gray-300 text-sm">From our kitchen to yours in hours</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Star className="h-6 w-6 text-accent flex-shrink-0 mt-1" />
              <div>
                <h4 className="text-white font-semibold">Award-Winning Taste</h4>
                <p className="text-gray-300 text-sm">Trusted by thousands of customers</p>
              </div>
            </div>
          </div>

          {/* Social Proof */}
          <div className="pt-6 border-t border-white/20">
            <div className="flex items-center gap-2 mb-2">
              <Instagram className="h-5 w-5 text-accent" />
              <span className="text-white font-semibold">Follow us on Instagram</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {['/small chops 3.jpg', '/small chops 4.jpg', '/small chops 5.jpg'].map((img, i) => (
                <img key={i} src={img} alt="" className="rounded-lg aspect-square object-cover hover:scale-105 transition cursor-pointer" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Join Button (mobile) */}
      <div className="fixed bottom-6 left-0 right-0 px-4 lg:hidden z-50">
        <Link href="/store" className="block">
          <Button size="lg" className="w-full bg-accent hover:bg-accent/90 text-white shadow-2xl">
            Join us for dinner
          </Button>
        </Link>
      </div>
    </div>
  )
}

// Hero Variant 3: Menu Highlights UI
const MenuHighlightsHero = () => {
  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const menuItems = [
    { name: 'Jollof Rice', category: 'mains', price: 2500, image: '/small chops 1.jpg' },
    { name: 'Small Chops', category: 'starters', price: 1500, image: '/small chops 3.jpg' },
    { name: 'Shawarma', category: 'mains', price: 1800, image: '/shawama pics 1.jpg' },
    { name: 'Pepper Soup', category: 'starters', price: 1200, image: '/small chops 4.jpg' },
    { name: 'Fried Rice', category: 'mains', price: 2300, image: '/small chops 5.jpg' },
    { name: 'Chapman', category: 'drinks', price: 800, image: '/small chops 1.jpg' },
  ]

  const chefsPicks = menuItems.slice(0, 3)

  const filteredItems = menuItems.filter(item =>
    (activeTab === 'all' || item.category === activeTab) &&
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {/* Header */}
      <div className="bg-accent/10 py-16 px-4">
        <div className="container mx-auto text-center">
          <motion.h1
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-4xl md:text-6xl font-bold mb-4"
          >
            Our <span className="text-accent">Menu</span>
          </motion.h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
            Explore our delicious selection of authentic Nigerian cuisine
          </p>

          {/* Category Tabs + Search */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-8">
            <div className="flex gap-2 flex-wrap justify-center">
              {['all', 'starters', 'mains', 'desserts', 'drinks'].map((tab) => (
                <Button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  variant={activeTab === tab ? 'default' : 'outline'}
                  className={activeTab === tab ? 'bg-accent hover:bg-accent/90' : ''}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </Button>
              ))}
            </div>
            <div className="relative w-full md:w-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search menu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full md:w-64"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Featured Dishes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredItems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-card rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition group"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                />
              </div>
              <div className="p-5">
                <h3 className="font-bold text-lg mb-1">{item.name}</h3>
                <p className="text-muted-foreground text-sm mb-3 capitalize">{item.category}</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-accent">₦{item.price.toLocaleString()}</span>
                  <Button size="sm" className="bg-accent hover:bg-accent/90">
                    <ShoppingCart className="h-4 w-4 mr-1" />
                    Add to cart
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Chef's Picks Carousel */}
        <div className="bg-secondary/50 rounded-2xl p-8 mb-12">
          <h2 className="text-3xl font-bold mb-6 text-center">Chef's Picks</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {chefsPicks.map((item, index) => (
              <div key={index} className="bg-card rounded-lg p-4 text-center">
                <img src={item.image} alt={item.name} className="w-full h-32 object-cover rounded-lg mb-3" />
                <h4 className="font-semibold">{item.name}</h4>
                <p className="text-accent font-bold">₦{item.price.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Sticky Actions */}
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 flex gap-4 z-50 md:hidden">
          <Link href="/store" className="flex-1">
            <Button className="w-full bg-accent hover:bg-accent/90">View Full Menu</Button>
          </Link>
          <Link href="/cart" className="flex-1">
            <Button variant="outline" className="w-full">Order Now</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

// Hero Variant 4: Experience Focus UI
const ExperienceHero = () => {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxImage, setLightboxImage] = useState('')

  const galleryImages = [
    '/small chops 1.jpg',
    '/small chops 3.jpg',
    '/small chops 4.jpg',
    '/small chops 5.jpg',
    '/shawama pics 1.jpg',
  ]

  const reviews = [
    { name: 'John Doe', rating: 5, comment: 'Amazing food and great service!' },
    { name: 'Jane Smith', rating: 5, comment: 'Best Nigerian restaurant in town' },
    { name: 'Mike Johnson', rating: 4, comment: 'Quality ingredients, authentic taste' },
  ]

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left: Gallery */}
          <div>
            <h2 className="text-4xl font-bold mb-6">Experience Our <span className="text-accent">Ambiance</span></h2>
            <div className="grid grid-cols-2 gap-4 mb-8">
              {galleryImages.map((img, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  className="cursor-pointer rounded-lg overflow-hidden shadow-lg"
                  onClick={() => {
                    setLightboxImage(img)
                    setLightboxOpen(true)
                  }}
                >
                  <img src={img} alt="" className="w-full h-48 object-cover" />
                </motion.div>
              ))}
            </div>

            {/* Countdown Timer */}
            <div className="bg-accent text-white rounded-xl p-6 text-center mb-6">
              <h3 className="text-xl font-bold mb-2">Special Offer Ends In:</h3>
              <div className="flex gap-4 justify-center text-3xl font-bold">
                <div><span>12</span><p className="text-sm font-normal">Hours</p></div>
                <div><span>34</span><p className="text-sm font-normal">Minutes</p></div>
                <div><span>56</span><p className="text-sm font-normal">Seconds</p></div>
              </div>
            </div>
          </div>

          {/* Right: Info Panel */}
          <div className="space-y-6">
            <Accordion type="single" collapsible defaultValue="events">
              <AccordionItem value="events">
                <AccordionTrigger className="text-2xl font-bold">Events & Catering</AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-lg">
                  We cater for weddings, corporate events, and private parties. Our team can handle events of any size with professionalism and delicious food.
                  <div className="mt-4">
                    <Link href="/contact">
                      <Button className="bg-accent hover:bg-accent/90">Book Now</Button>
                    </Link>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="private-dining">
                <AccordionTrigger className="text-2xl font-bold">Private Dining</AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-lg">
                  Reserve our private dining space for intimate gatherings. Enjoy personalized service and a customized menu.
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Reviews */}
            <div className="bg-secondary/50 rounded-xl p-6">
              <h3 className="text-2xl font-bold mb-4">Customer Reviews</h3>
              <div className="space-y-4">
                {reviews.map((review, index) => (
                  <motion.div
                    key={index}
                    initial={{ x: -20, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-card p-4 rounded-lg"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="font-semibold">{review.name}</div>
                      <div className="flex">
                        {Array.from({ length: review.rating }).map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                        ))}
                      </div>
                    </div>
                    <p className="text-muted-foreground text-sm">{review.comment}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Book Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Link href="/contact">
          <Button size="lg" className="bg-accent hover:bg-accent/90 text-white shadow-2xl rounded-full px-8">
            <Calendar className="mr-2" />
            Book a Table
          </Button>
        </Link>
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <img src={lightboxImage} alt="" className="max-w-full max-h-full object-contain" />
        </div>
      )}
    </div>
  )
}

// Hero Variant 5: Local + Fresh UI
const LocalFreshHero = () => {
  const [email, setEmail] = useState('')

  const locations = [
    { name: 'Lagos Branch', lat: 6.5244, lng: 3.3792 },
    { name: 'Abuja Branch', lat: 9.0765, lng: 7.3986 },
  ]

  const carouselImages = [
    '/small chops 1.jpg',
    '/small chops 3.jpg',
    '/shawama pics 1.jpg',
  ]

  return (
    <div className="min-h-screen">
      <div className="grid lg:grid-cols-2 gap-0">
        {/* Left: Map */}
        <div className="h-[50vh] lg:h-screen bg-secondary/20 flex items-center justify-center relative">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3964.029476250563!2d3.3792!3d6.5244!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNsKwMzEnMjcuOCJOIDPCsDIyJzQ1LjEiRQ!5e0!3m2!1sen!2sng!4v1234567890"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
          />
          <div className="absolute bottom-4 left-4 right-4 bg-card p-4 rounded-lg shadow-lg">
            <h3 className="font-bold mb-2">Find Us</h3>
            <div className="flex gap-2 flex-wrap">
              {locations.map((loc, index) => (
                <Button key={index} size="sm" variant="outline">
                  <MapPin className="h-4 w-4 mr-1" />
                  {loc.name}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Info */}
        <div className="p-8 lg:p-12 flex flex-col justify-center space-y-8">
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Farm-to-Table <span className="text-accent">Freshness</span>
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              We partner with local farmers to bring you the freshest ingredients, supporting our community while delivering exceptional quality.
            </p>
          </motion.div>

          {/* Carousel */}
          <div className="bg-secondary/30 rounded-xl p-6">
            <h3 className="text-2xl font-bold mb-4">From Our Farm Partners</h3>
            <div className="grid grid-cols-3 gap-4">
              {carouselImages.map((img, index) => (
                <motion.img
                  key={index}
                  src={img}
                  alt=""
                  className="rounded-lg aspect-square object-cover"
                  whileHover={{ scale: 1.05 }}
                />
              ))}
            </div>
          </div>

          {/* Newsletter */}
          <div className="bg-accent/10 rounded-xl p-6">
            <h3 className="text-2xl font-bold mb-2">Stay Updated</h3>
            <p className="text-muted-foreground mb-4">Subscribe to get special offers and updates</p>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1"
              />
              <Button className="bg-accent hover:bg-accent/90">Subscribe</Button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <Link href="/store" className="flex-1">
              <Button className="w-full bg-accent hover:bg-accent/90">
                <ShoppingCart className="mr-2" />
                See Menu
              </Button>
            </Link>
            <Link href="/contact" className="flex-1">
              <Button variant="outline" className="w-full">
                <Phone className="mr-2" />
                Order
              </Button>
            </Link>
          </div>

          {/* Social Feed */}
          <div className="hidden lg:block">
            <h3 className="font-bold mb-3">Follow @loisfoodspices</h3>
            <div className="grid grid-cols-3 gap-2">
              {['/small chops 4.jpg', '/small chops 5.jpg', '/shawama pics 1.jpg'].map((img, i) => (
                <a key={i} href="#" className="block">
                  <img src={img} alt="" className="rounded-lg aspect-square object-cover hover:opacity-80 transition" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Nav (Mobile) */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t p-4 flex gap-2 lg:hidden z-50">
        <Link href="/store" className="flex-1">
          <Button variant="outline" className="w-full">Menu</Button>
        </Link>
        <Link href="/contact" className="flex-1">
          <Button variant="outline" className="w-full">Location</Button>
        </Link>
        <Link href="/cart" className="flex-1">
          <Button className="w-full bg-accent hover:bg-accent/90">Order</Button>
        </Link>
      </div>
    </div>
  )
}

// Main export component with variant selector
const HeroVariants: React.FC<HeroVariantProps> = ({ variant = 'carousel' }) => {
  const variants = {
    carousel: CarouselHero,
    story: StoryHero,
    menu: MenuHighlightsHero,
    experience: ExperienceHero,
    local: LocalFreshHero,
  }

  const HeroComponent = variants[variant]
  return <HeroComponent />
}

export default HeroVariants
export { CarouselHero, StoryHero, MenuHighlightsHero, ExperienceHero, LocalFreshHero }
