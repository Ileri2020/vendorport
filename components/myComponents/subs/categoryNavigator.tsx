"use client"

import { useEffect, useMemo, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAppContext } from "@/hooks/useAppContext"

type Category = {
  id: string
  name: string
  description?: string | null
  _count?: { products?: number }
}

const CATEGORY_LANES = 3

function splitCategories(value: string | null) {
  return value ? value.split(",").map((item) => item.trim()).filter(Boolean) : []
}

function splitLocations(value: string | null) {
  return value ? value.split("|").map((item) => item.trim()).filter(Boolean) : []
}

function laneItems(categories: Category[], lane: number, useThreeLanes: boolean) {
  if (!useThreeLanes) return categories
  const baseSize = Math.floor(categories.length / CATEGORY_LANES)
  const remainder = categories.length % CATEGORY_LANES
  const start = lane * baseSize + Math.min(lane, remainder)
  const size = baseSize + (lane < remainder ? 1 : 0)
  return categories.slice(start, start + size)
}

export default function CategoryNavigator() {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { currentBusiness } = useAppContext()
  const [categories, setCategories] = useState<Category[]>([])
  const [locations, setLocations] = useState<string[]>([])
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false)
  const selected = useMemo(() => splitCategories(searchParams.get("category")), [searchParams])
  const selectedLocations = useMemo(() => splitLocations(searchParams.get("location")), [searchParams])
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "")
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "")

  useEffect(() => {
    const isPlatformStore = pathname.replace(/\/$/, "") === "/store"
    const query = isPlatformStore
      ? "&platform=true"
      : currentBusiness?.id ? `&businessId=${encodeURIComponent(currentBusiness.id)}` : ""
    fetch(`/api/dbhandler?model=category&limit=500${query}`)
      .then((response) => response.ok ? response.json() : [])
      .then((data) => setCategories(Array.isArray(data) ? data.filter((category) => category?._count?.products !== 0) : []))
      .catch(() => setCategories([]))

    const locationsQuery = !isPlatformStore && currentBusiness?.id
      ? `?businessId=${encodeURIComponent(currentBusiness.id)}`
      : ""
    fetch(`/api/store-locations${locationsQuery}`)
      .then((response) => response.ok ? response.json() : [])
      .then((data) => setLocations(Array.isArray(data) ? data : []))
      .catch(() => setLocations([]))
  }, [currentBusiness?.id, pathname])

  useEffect(() => {
    setMinPrice(searchParams.get("minPrice") || "")
    setMaxPrice(searchParams.get("maxPrice") || "")
  }, [searchParams])

  function updateSelection(next: string[]) {
    const params = new URLSearchParams(searchParams.toString())
    if (next.length) params.set("category", next.join(","))
    else params.delete("category")
    const query = params.toString()
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }

  function toggleCategory(name: string) {
    updateSelection(selected.includes(name) ? selected.filter((item) => item !== name) : [...selected, name])
  }

  function applyFilters() {
    const params = new URLSearchParams(searchParams.toString())
    if (minPrice.trim() && Number.isFinite(Number(minPrice))) params.set("minPrice", String(Math.max(0, Number(minPrice))))
    else params.delete("minPrice")
    if (maxPrice.trim() && Number.isFinite(Number(maxPrice))) params.set("maxPrice", String(Math.max(0, Number(maxPrice))))
    else params.delete("maxPrice")
    if (selectedLocations.length) params.set("location", selectedLocations.join("|"))
    else params.delete("location")
    const query = params.toString()
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }

  function clearFilters() {
    setMinPrice("")
    setMaxPrice("")
    const params = new URLSearchParams(searchParams.toString())
    params.delete("minPrice")
    params.delete("maxPrice")
    params.delete("location")
    const query = params.toString()
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }

  const selectedCategories = categories.filter((category) => selected.includes(category.name))
  const useThreeLanes = categories.length >= CATEGORY_LANES * 5
  const lanes = useThreeLanes ? [0, 1, 2] : [0]

  return (
    <section className="mb-5 w-full overflow-hidden rounded-2xl border border-border/70 bg-card/70 p-3 shadow-sm md:p-4" aria-label="Product categories">
      {selectedCategories.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {selectedCategories.map((category) => (
            <button key={category.id} type="button" onClick={() => toggleCategory(category.name)} className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
              {category.name}<X className="h-3 w-3" />
            </button>
          ))}
        </div>
      )}

      <div className="mb-2 grid gap-3 rounded-xl border border-border/70 bg-background/70 p-3 grid-cols-2 lg:grid-cols-4 mx-auto max-w-sm">
        <div className="relative w-full">
          <Button type="button" className="w-full" variant="outline" size="sm" onClick={() => setCategoryMenuOpen((open) => !open)}>
            Categories {selected.length ? `(${selected.length})` : ""}
          </Button>
          {categoryMenuOpen && (
            <div className="fixed left-1/2 top-1/2 z-40 w-[min(90vw,24rem)] -translate-x-1/2 -translate-y-1/2 rounded-xl border bg-background p-3 shadow-2xl sm:absolute sm:left-auto sm:right-0 sm:top-10 sm:w-72 sm:translate-x-0 sm:translate-y-0">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-bold text-muted-foreground">Select categories</span>
                <button type="button" aria-label="Close category selection" onClick={() => setCategoryMenuOpen(false)}><X className="h-4 w-4" /></button>
              </div>
              <div className="max-h-64 space-y-1 overflow-y-auto">
                {categories.map((category) => {
                  const isSelected = selected.includes(category.name)
                  return <button key={category.id} type="button" onClick={() => toggleCategory(category.name)} className={`flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm ${isSelected ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>
                    {isSelected && <Check className="h-3 w-3" />}{category.name}
                  </button>
                })}
              </div>
              <Button type="button" size="sm" className="mt-3 w-full" onClick={() => setCategoryMenuOpen(false)}>Apply</Button>
            </div>
          )}
        </div>
        <div>
          {/* <label htmlFor="store-location" className="mb-1 hidden text-xs font-bold text-muted-foreground md:block">Available location</label> */}
          <select id="store-location" multiple value={selectedLocations} onChange={(event) => {
            const next = Array.from(event.target.selectedOptions, (option) => option.value)
            const params = new URLSearchParams(searchParams.toString())
            if (next.length) params.set("location", next.join("|"))
            else params.delete("location")
            const query = params.toString()
            router.push(query ? `${pathname}?${query}` : pathname, { scroll: false })
          }} className="w-full h-8 rounded-md border bg-background px-2 text-sm outline-none focus:ring-2 focus:ring-ring" aria-label="Select one or more available locations">
            {locations.length ? <><option disabled value="">Available location</option>{locations.map((location) => <option key={location} value={location}>{location}</option>)}</> : <option disabled>No locations configured</option>}
          </select>
        </div>
        <div>
          {/* <label htmlFor="store-min-price" className="mb-1 hidden text-xs font-bold text-muted-foreground md:block">Minimum price</label> */}
          <input id="store-min-price" type="number" min="0" value={minPrice} onChange={(event) => setMinPrice(event.target.value)} placeholder="Minimum price" className="h-9 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div>
          {/* <label htmlFor="store-max-price" className="mb-1 hidden text-xs font-bold text-muted-foreground md:block">Maximum price</label> */}
          <input id="store-max-price" type="number" min="0" value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)} placeholder="Maximum price" className="h-9 w-full rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <div className="flex items-end gap-2">
          <Button type="button" size="sm" onClick={applyFilters}>Apply filters</Button>
          {(minPrice || maxPrice || selectedLocations.length) && <Button type="button" size="sm" variant="ghost" onClick={clearFilters}>Clear</Button>}
        </div>
      </div>

      <div className="space-y-2 [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]">
        {lanes.map((lane) => {
          const items = laneItems(categories, lane, useThreeLanes)
          const shouldMove = items.length > 3
          const movingItems = shouldMove ? [...items, ...items] : items
          return (
            <div key={lane} className={`overflow-hidden ${!shouldMove ? "flex justify-center" : ""}`}>
              <div
                className={`flex w-max ${shouldMove ? "flex-nowrap" : "flex-wrap justify-center"} gap-2 ${shouldMove ? lane === 1 ? "animate-marquee-reverse" : "animate-marquee" : ""}`}
                style={{ "--marquee-duration": `${28 + lane * 4}s` } as React.CSSProperties}
              >
                {movingItems.map((category, index) => {
                  const isSelected = selected.includes(category.name)
                  return <button key={`${category.id}-${index}`} type="button" onClick={() => toggleCategory(category.name)} className={`inline-flex min-h-9 items-center gap-1 whitespace-nowrap rounded-full border px-3 text-xs font-semibold transition-colors ${isSelected ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background hover:border-primary hover:text-primary"}`}>
                    {isSelected && <Check className="h-3 w-3" />}{category.name}
                  </button>
                })}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}