"use client"
import { useCallback, useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { Stocks, GlobalSearch } from "@/components/myComponents/subs"
import CategoryNavigator from "@/components/myComponents/subs/categoryNavigator"
import StoreSetupPrompt, { StoreSetupSkeleton } from "@/components/myComponents/subs/StoreSetupPrompt"
import { useAppContext } from "@/hooks/useAppContext"

// Store hero/marketing texts sourced from SiteSettings


const Store = () => {
  const { currentBusiness, user } = useAppContext();
  const pathname = usePathname();
  const isPlatformStore = !currentBusiness?.id && (pathname || "").replace(/\/+$/, "") === "/store";
  const businessReady = isPlatformStore || Boolean(currentBusiness?.id)
  const [hasCategories, setHasCategories] = useState<boolean | undefined>(undefined)
  const [hasProducts, setHasProducts] = useState<boolean | undefined>(undefined)
  const [setupLoaded, setSetupLoaded] = useState(false)
  const settings = currentBusiness?.siteSettings || {}
  const isPharmacy = currentBusiness?.template === "pharmacy"
  const isOwner = Boolean(currentBusiness?.ownerId && currentBusiness?.ownerId === user?.id)

  const loadStoreContentState = useCallback(async () => {
    if (!businessReady) {
      setHasCategories(undefined)
      setHasProducts(undefined)
      setSetupLoaded(false)
      return
    }

    const cachedCategoryCount = Number(currentBusiness?._count?.categories || 0)
    const cachedProductCount = Number(currentBusiness?._count?.products || 0)

    // Positive counts are enough to render the store. A zero count is probed
    // in the background because cached business counts can be stale.
    if (cachedProductCount > 0) {
      setHasCategories(cachedCategoryCount > 0)
      setHasProducts(true)
      setSetupLoaded(true)
      return
    }

    try {
      const businessQuery = isPlatformStore ? "" : `&businessId=${encodeURIComponent(currentBusiness?.id || "")}`
      const [categoryRes, productRes] = await Promise.all([
        fetch(`/api/dbhandler?model=category&limit=1${businessQuery}`),
        fetch(`/api/dbhandler?model=product&compact=true&pagination=true&limit=1&offset=0&requirePrice=true${businessQuery}`),
      ])
      const categories = categoryRes.ok ? await categoryRes.json() : null
      const products = productRes.ok ? await productRes.json() : null
      setHasCategories((Array.isArray(categories) && categories.length > 0) || cachedCategoryCount > 0)
      setHasProducts((Array.isArray(products?.data) && products.data.length > 0) || (Array.isArray(products) && products.length > 0) || cachedProductCount > 0)
    } catch (error) {
      console.error("Failed to load store content state", error)
      setHasCategories(cachedCategoryCount > 0)
      setHasProducts(cachedProductCount > 0)
    } finally {
      setSetupLoaded(true)
    }
  }, [businessReady, currentBusiness?._count, currentBusiness?.id, isPlatformStore])

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
      className="w-[100vw] overflow-clip p-2 md:p-4"
    >
      <div className="w-full md:container md:mx-auto max-w-7xl">
        <div className="mb-2 w-full p-1 max-w-2xl mx-auto">
          <GlobalSearch placeholder={settings?.heroSubtitle || "Search more products in our store..."} />
        </div>

        {!businessReady ? (
          <StoreSetupSkeleton />
        ) : (
          <>
            <CategoryNavigator />
            {setupLoaded && hasProducts === false ? (
              <StoreSetupPrompt
                businessName={currentBusiness?.name || "Platform"}
                isOwner={isOwner}
                hasCategories={Boolean(hasCategories)}
                hasProducts={false}
                onRefresh={loadStoreContentState}
              />
            ) : (
              <>
                {/* Hero marketing block — pharmacy only */}
                {isPharmacy && (
                  <div className="w-full mb-4">
                    <div className="max-w-7xl mx-auto p-6 rounded-2xl /bg-gradient-to-r /from-white /to-slate-50 border">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                          {settings?.badgeText && <div className="text-xs font-black text-emerald-700">{settings.badgeText}</div>}
                          {settings?.animatedTexts?.length ? <div className="mt-2 flex flex-wrap gap-2">{settings.animatedTexts.map((text, idx) => <span key={idx} className="text-xs md:text-xs text-slate-600 bg-slate-100 border border-slate-200 rounded-full px-2 py-1">{text}</span>)}</div> : null}
                          <h1 className="text-xl md:text-2xl font-bold mt-2">
                            {settings?.preHeroText ? <span className="mr-2 text-lg font-semibold">{settings.preHeroText}</span> : null}
                            <span className="block text-xl md:text-2xl">{settings?.heroHighlight || "Premium Medical Supplies"}</span>
                          </h1>
                          <p className="mt-2 text-muted-foreground max-w-2xl">{settings?.promoTitle || "Order authentic medications, pharmaceutical products, and medical equipment at the lowest prices, delivered to your doorstep."}</p>
                        </div>
                        <div className="hidden md:block">{settings?.promoBannerText && <div className="p-3 rounded-lg bg-amber-50 border text-sm font-bold">{settings.promoBannerText}</div>}</div>
                      </div>
                    </div>
                  </div>
                )}
                <div className="relative w-full h-full flex flex-col justify-center items-center">
                  <Stocks />
                </div>
              </>
            )}
          </>
        )}
      </div>
    </motion.section>
  )
}

export default Store
