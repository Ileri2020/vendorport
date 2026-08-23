export type StoreFilterUrlInput = {
  categories?: string[] | string | null
  locations?: string[] | string | null
  minPrice?: number | string | null
  maxPrice?: number | string | null
  pathname: string
  currentQuery?: Record<string, string | undefined | null>
}

function normalizeValues(value: string[] | string | null | undefined) {
  const values = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? value.split(",")
      : []

  return [...new Set(values.map((item) => item.trim()).filter(Boolean))]
}

function parseNumericValue(value: number | string | null | undefined) {
  if (typeof value === "number") return Number.isFinite(value) ? value : Number.NaN
  if (typeof value === "string") {
    const trimmed = value.trim()
    if (!trimmed || trimmed === "undefined" || trimmed === "null") return Number.NaN
    return Number(trimmed)
  }
  return Number.NaN
}

export function buildStoreFilterUrl({
  categories,
  locations,
  minPrice,
  maxPrice,
  pathname,
  currentQuery = {},
}: StoreFilterUrlInput) {
  const params = new URLSearchParams()

  Object.entries(currentQuery).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "undefined" || value === "null" || value === "") {
      return
    }
    params.set(key, value)
  })

  const normalizedCategories = normalizeValues(categories)
  if (normalizedCategories.length) {
    params.set("category", normalizedCategories.join(","))
  } else {
    params.delete("category")
  }

  const normalizedLocations = normalizeValues(locations)
  if (normalizedLocations.length) {
    params.set("location", normalizedLocations.join("|"))
  } else {
    params.delete("location")
  }

  const minValue = parseNumericValue(minPrice)
  if (Number.isFinite(minValue) && minValue >= 0) {
    params.set("minPrice", String(Math.max(0, minValue)))
  } else {
    params.delete("minPrice")
  }

  const maxValue = parseNumericValue(maxPrice)
  if (Number.isFinite(maxValue) && maxValue >= 0) {
    params.set("maxPrice", String(Math.max(0, maxValue)))
  } else {
    params.delete("maxPrice")
  }

  const queryString = params.toString()
  return queryString ? `${pathname}?${queryString}` : pathname
}
