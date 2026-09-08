"use client"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { Stocks, GlobalSearch } from "@/components/myComponents/subs"
import CategoryNavigator from "@/components/myComponents/subs/categoryNavigator"
import { useAppContext } from "@/hooks/useAppContext"

// Store hero/marketing texts sourced from SiteSettings


const Store = () => {
  const { currentBusiness } = useAppContext();
  const pathname = usePathname();
  const isPlatformStore = !currentBusiness?.id && (pathname || "").replace(/\/+$/, "") === "/store";
  const settings = currentBusiness?.siteSettings || {}
  const isPharmacy = currentBusiness?.template === "pharmacy"
  const businessReady = isPlatformStore || Boolean(currentBusiness?.id)

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
          <div className="min-h-40" aria-label="Loading store" />
        ) : (
          <>
            <CategoryNavigator />
            {/* Hero marketing block — pharmacy only */}
            {isPharmacy && (
              <div className="w-full mb-4">
                <div className="max-w-7xl mx-auto p-6 rounded-2xl /bg-gradient-to-r /from-white /to-slate-50 border">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      {settings?.badgeText && <div className="text-xs font-black text-emerald-700">{settings.badgeText}</div>}
                      {settings?.animatedTexts?.length ? (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {settings.animatedTexts.map((text, idx) => (
                            <span key={idx} className="text-xs md:text-xs text-slate-600 bg-slate-100 border border-slate-200 rounded-full px-2 py-1">
                              {text}
                            </span>
                          ))}
                        </div>
                      ) : null}
                      <h1 className="text-xl md:text-2xl font-bold mt-2">
                        {settings?.preHeroText ? (<><span className="mr-2 text-lg font-semibold">{settings.preHeroText}</span></>) : null}
                        <span className="block text-xl md:text-2xl">{settings?.heroHighlight || 'Premium Medical Supplies'}</span>
                      </h1>
                      <p className="mt-2 text-muted-foreground max-w-2xl">
                        {settings?.promoTitle || 'Order authentic medications, pharmaceutical products, and medical equipment at the lowest prices, delivered to your doorstep.'}
                      </p>
                    </div>
                    <div className="hidden md:block">
                      {settings?.promoBannerText && <div className="p-3 rounded-lg bg-amber-50 border text-sm font-bold">{settings.promoBannerText}</div>}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="relative w-full h-full flex flex-col justify-center items-center">
              {/* <Filters /> */}
              <Stocks />
            </div>
          </>
        )}
      </div>
    </motion.section>
  )
}

export default Store
