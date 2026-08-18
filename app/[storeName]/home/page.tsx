"use client"
import { motion } from "framer-motion"
import { useCallback, useEffect, useState } from "react"
import { Filters, Gallery} from "@/components/myComponents/subs"
import ECommerceSalesPage from "@/components/myComponents/salestore"
import Hero from "@/components/myComponents/subs/hero"
import FeaturedCategories from "@/components/myComponents/subs/featuredCategories"
import FeaturedProducts from "@/components/myComponents/subs/featuredProducts"
import CommonMedications from "@/components/myComponents/subs/commonMedications"
import Features from "@/components/myComponents/subs/features"
import ConcernGrid from "@/components/myComponents/subs/concern-grid"
import PartnerBrands from "@/components/myComponents/subs/partner-brands"
import FeaturedIngredients from "@/components/myComponents/subs/featuredIngredients"
import StoreSetupPrompt, { StoreSetupSkeleton } from "@/components/myComponents/subs/StoreSetupPrompt"
import { MessageCircle } from "lucide-react"
import Link from "next/link"
import { HeavilyDiscountedCarousel } from "@/components/myComponents/subs/HeavilyDiscountedCarousel"
import RecentProductsCarousel from "@/components/myComponents/subs/recentProductsCarousel"
import { useAppContext } from "@/hooks/useAppContext"

const Home = () => {
  const { currentBusiness, user } = useAppContext();
  const [hasCategories, setHasCategories] = useState<boolean | undefined>(undefined)
  const [hasProducts, setHasProducts] = useState<boolean | undefined>(undefined)
  const [setupLoaded, setSetupLoaded] = useState(false)
  const isPharmacy = currentBusiness?.template === "pharmacy";
  const isOwner = Boolean(currentBusiness?.ownerId && currentBusiness?.ownerId === user?.id)

  const loadStoreContentState = useCallback(async () => {
    if (!currentBusiness?.id) {
      setHasCategories(undefined)
      setHasProducts(undefined)
      setSetupLoaded(false)
      return
    }

    try {
      const businessId = currentBusiness.id
      const [categoryRes, productRes] = await Promise.all([
        fetch(`/api/dbhandler?model=category&businessId=${businessId}&limit=1`),
        fetch(`/api/dbhandler?model=product&businessId=${businessId}&limit=1`),
      ])

      const categories = categoryRes.ok ? await categoryRes.json() : null
      const products = productRes.ok ? await productRes.json() : null
      setHasCategories((Array.isArray(categories) && categories.length > 0) || Number(currentBusiness._count?.categories || 0) > 0)
      setHasProducts((Array.isArray(products) && products.length > 0) || Number(currentBusiness._count?.products || 0) > 0)
    } catch (error) {
      console.error("Failed to load store content state", error)
      setHasCategories(Number(currentBusiness._count?.categories || 0) > 0)
      setHasProducts(Number(currentBusiness._count?.products || 0) > 0)
    } finally {
      setSetupLoaded(true)
    }
  }, [currentBusiness?.id])

  useEffect(() => {
    loadStoreContentState()
  }, [loadStoreContentState])

  return (
    <motion.section
      initial = {{ opacity: 0 }}
      animate = {{
        opacity : 1,
        transition : { delay: 0.5, duration: 0.6, ease: "easeIn"}
      }}
      className="w-[100vw] min-h-full overflow-clip flex flex-col"
    >
      {/* <Filters /> */}
      <Hero storeTemplate={currentBusiness?.template} />

      {!currentBusiness || !setupLoaded ? <StoreSetupSkeleton /> : currentBusiness && (!hasCategories || !hasProducts) ? (
        <StoreSetupPrompt
          businessName={currentBusiness.name}
          isOwner={isOwner}
          hasCategories={!!hasCategories}
          hasProducts={!!hasProducts}
          onRefresh={loadStoreContentState}
        />
      ) : null}

     <div className="mx-auto w-full">
       {!currentBusiness || !setupLoaded || (currentBusiness && (!hasCategories || !hasProducts)) ? null : (
         <>
           {/* Pharmacy-only sections */}
           {isPharmacy && <CommonMedications />}

           <HeavilyDiscountedCarousel />
           <PartnerBrands />

           {/* Pharmacy-only sections */}
           {isPharmacy && <ConcernGrid />}

           {(!currentBusiness || hasCategories) && <FeaturedCategories />}
           {(!currentBusiness || hasProducts) && <RecentProductsCarousel />}

           {/* Pharmacy-only sections */}
           {isPharmacy && <FeaturedIngredients />}

           {(!currentBusiness || hasProducts) && <FeaturedProducts />}
           <Features />
         </>
       )}
     </div>

      {/* Fixed Contact Button */}
      <Link href="/contact" className="fixed bottom-6 left-6 z-50">
        <div className="flex items-center justify-center w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 transition-all hover:scale-105 cursor-pointer border-2 border-white dark:border-gray-800">
          <MessageCircle className="w-6 h-6" />
        </div>
      </Link>
    </motion.section>
  )
}

export default Home
