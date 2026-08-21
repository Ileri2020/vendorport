"use client"

import { useEffect, useMemo, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Check, ChevronDown, X } from "lucide-react"
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

function laneItems(categories: Category[], lane: number) {
  return categories.filter((_, index) => index % CATEGORY_LANES === lane)
}

export default function CategoryNavigator() {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { currentBusiness } = useAppContext()
  const [categories, setCategories] = useState<Category[]>([])
  const [open, setOpen] = useState(false)
  const selected = useMemo(() => splitCategories(searchParams.get("category")), [searchParams])

  useEffect(() => {
    const isPlatformStore = pathname.split("/").filter(Boolean).length === 1
    const query = isPlatformStore
      ? "&platform=true"
      : currentBusiness?.id ? `&businessId=${encodeURIComponent(currentBusiness.id)}` : ""
    fetch(`/api/dbhandler?model=category&limit=500${query}`)
      .then((response) => response.ok ? response.json() : [])
      .then((data) => setCategories(Array.isArray(data) ? data.filter((category) => category?._count?.products !== 0) : []))
      .catch(() => setCategories([]))
  }, [currentBusiness?.id, pathname])

  function updateSelection(next: string[]) {
    const params = new URLSearchParams(searchParams.toString())
    if (next.length) params.set("category", next.join(","))
    else params.delete("category")
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  function toggleCategory(name: string) {
    updateSelection(selected.includes(name) ? selected.filter((item) => item !== name) : [...selected, name])
  }

  const selectedCategories = categories.filter((category) => selected.includes(category.name))

  return (
    <section className="mb-5 w-full overflow-hidden rounded-2xl border border-border/70 bg-card/70 p-3 shadow-sm md:p-4" aria-label="Product categories">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">Browse by category</p>
          <p className="text-sm text-muted-foreground">Choose one or more categories to filter the store.</p>
        </div>
        <div className="relative">
          <Button type="button" variant="outline" size="sm" onClick={() => setOpen((value) => !value)} className="gap-2">
            Categories {selected.length ? `(${selected.length})` : ""}
            <ChevronDown className="h-4 w-4" />
          </Button>
          {open && (
            <div className="absolute right-0 top-10 z-30 w-72 rounded-xl border bg-background p-3 shadow-xl">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-bold text-muted-foreground">Select categories</span>
                <button type="button" aria-label="Close category selection" onClick={() => setOpen(false)}><X className="h-4 w-4" /></button>
              </div>
              <select
                multiple
                value={selected}
                onChange={(event) => updateSelection(Array.from(event.target.selectedOptions, (option) => option.value))}
                className="h-52 w-full rounded-lg border bg-background p-2 text-sm"
              >
                {categories.map((category) => <option key={category.id} value={category.name}>{category.name}</option>)}
              </select>
              <Button type="button" size="sm" className="mt-3 w-full" onClick={() => setOpen(false)}>Apply</Button>
            </div>
          )}
        </div>
      </div>

      {selectedCategories.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {selectedCategories.map((category) => (
            <button key={category.id} type="button" onClick={() => toggleCategory(category.name)} className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
              {category.name}<X className="h-3 w-3" />
            </button>
          ))}
        </div>
      )}

      <div className="space-y-2 [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]">
        {[0, 1, 2].map((lane) => {
          const items = laneItems(categories, lane)
          const movingItems = [...items, ...items]
          return (
            <div key={lane} className="overflow-hidden">
              <div className={`flex w-max gap-2 ${lane === 1 ? "animate-marquee-reverse" : "animate-marquee"}`}>
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