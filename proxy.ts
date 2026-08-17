import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/auth'

const CACHE_TTL = 5000
const cacheStore = new Map<string, { timestamp: number; status: number; headers: Record<string, string>; body: string }>()
const pendingRequests = new Map<string, Promise<NextResponse>>()

function getCachedResponse(key: string) {
  const cached = cacheStore.get(key)
  if (!cached) return null
  if (Date.now() - cached.timestamp > CACHE_TTL) {
    cacheStore.delete(key)
    return null
  }
  return cached
}

function getRequestCacheKey(url: URL, req: Request) {
  const search = url.searchParams.toString()
  return `${req.method}:${url.origin}${url.pathname}${search ? `?${search}` : ''}`
}

async function fetchWithBypass(req: Request) { 
  const clonedHeaders = new Headers(req.headers)
  clonedHeaders.set('x-proxy-cache-bypass', '1')

  return fetch(req.url, {
    method: req.method,
    headers: clonedHeaders,
    body: req.method === 'GET' ? undefined : await req.clone().arrayBuffer(),
    redirect: 'manual',
  })
}

function shouldCacheRequest(url: URL, req: Request) {
  if (req.method !== 'GET') return false
  if (!url.pathname.startsWith('/api/')) return false
  if (url.pathname.startsWith('/api/auth')) return false
  if (req.headers.get('x-proxy-cache-bypass') === '1') return false
  return true
}

/**
 * Subdomain routing proxy
 * Handles rewriting subdomain requests to internal routes
 * E.g., storename.vport.store/about → /storename/about
 * E.g., storename.www.vport.store → /storename
 */
async function handleSubdomainRouting(request: NextRequest): Promise<NextResponse | null> {
  const url = request.nextUrl
  const hostname = request.headers.get('host') || ''

  const hostWithoutPort = hostname.split(':')[0].toLowerCase()
  const isLocalhost = hostWithoutPort.endsWith('localhost') || hostWithoutPort.endsWith('127.0.0.1')
  const isLocalDomain = hostWithoutPort.endsWith('hcvp.local')

  // Use explicit deployment hosts directly in the proxy so subdomain routing
  // works reliably without depending on environment variables at runtime.
  const baseDomains = [
    'vport.vercel.app',
    'www.vport.vercel.app',
    'vport.store',
    'www.vport.store',
  ]

  // Exclude common non-business subdomains
  const excludedSubdomains = ['www', 'api', 'admin', 'mail', 'cdn', 'support']

  // Development handling (localhost and .local domains)
  if (isLocalhost || isLocalDomain) {
    let subdomain = null

    if (isLocalhost) {
      // Extract subdomain from localhost formats
      // e.g., itech3.localhost:3000 -> itech3
      // e.g., localhost:3000 -> no subdomain
      const parts = hostWithoutPort.split('.')
      if (parts.length > 1 && parts[parts.length - 1] === 'localhost') {
        subdomain = parts[0]
      }
    } else if (isLocalDomain) {
      // Extract subdomain from .hcvp.local
      // e.g., storename.hcvp.local -> storename
      const parts = hostWithoutPort.split('.')
      if (parts.length > 2) {
        subdomain = parts[0]
      }
    }

    // Rewrite if subdomain found and not excluded
    if (subdomain && !excludedSubdomains.includes(subdomain)) {
      const pathname = url.pathname === '/' ? '' : url.pathname
      const search = url.search
      
      // If path already starts with /{subdomain}, strip it and redirect for clean URLs
      if (pathname.startsWith(`/${subdomain}/`)) {
        const cleanPath = pathname.slice(`/${subdomain}`.length)
        const cleanUrl = new URL(`${cleanPath}${search}`, request.url)
        return NextResponse.redirect(cleanUrl, { status: 308 })
      }
      
      // Otherwise rewrite to add subdomain for internal routing
      if (pathname !== `/${subdomain}`) {
        const rewriteUrl = new URL(`/${subdomain}${pathname}${search}`, request.url)
        return NextResponse.rewrite(rewriteUrl)
      }
    }

    return null
  }

  // If host is exactly one of the base domains, it is the main platform landing page
  if (baseDomains.includes(hostWithoutPort)) {
    return null
  }

  // Production handling (subdomain check for baseDomains & wildcard .vercel.app)
  let subdomain: string | null = null

  for (const base of baseDomains) {
    if (hostWithoutPort.endsWith(`.${base}`)) {
      subdomain = hostWithoutPort.slice(0, hostWithoutPort.length - base.length - 1)
      break
    }
  }

  // If host is like <subdomain>.<project>.vercel.app (e.g. itech3.vendorport.vercel.app)
  if (!subdomain && hostWithoutPort.endsWith('.vercel.app')) {
    const parts = hostWithoutPort.split('.')
    if (parts.length >= 4) {
      subdomain = parts[0]
    }
  }

  // Fallback for custom domains: <subdomain>.<domain>.<tld>
  if (!subdomain) {
    const parts = hostWithoutPort.split('.')
    if (parts.length > 2 && parts[0] !== 'www') {
      // Vercel URLs with 3 parts (e.g. project.vercel.app) are apex domains
      if (hostWithoutPort.endsWith('.vercel.app')) {
        return null
      }
      subdomain = parts[0]
    }
  }

  if (subdomain && !excludedSubdomains.includes(subdomain)) {
    const pathname = url.pathname === '/' ? '' : url.pathname
    const search = url.search

    // If path already starts with /{subdomain}, strip it and redirect for clean URLs
    if (pathname.startsWith(`/${subdomain}/`)) {
      const cleanPath = pathname.slice(`/${subdomain}`.length)
      const cleanUrl = new URL(`${cleanPath}${search}`, request.url)
      return NextResponse.redirect(cleanUrl, { status: 308 })
    }

    // Otherwise rewrite to add subdomain for internal routing
    if (pathname !== `/${subdomain}`) {
      const rewriteUrl = new URL(`/${subdomain}${pathname}${search}`, request.url)
      return NextResponse.rewrite(rewriteUrl)
    }
  }

  return null
}

/**
 * Main proxy handler combining auth and subdomain routing
 */
export async function proxy(request: NextRequest) {
  const url = new URL(request.url)

  if (shouldCacheRequest(url, request)) {
    const cacheKey = getRequestCacheKey(url, request)
    const cached = getCachedResponse(cacheKey)

    if (cached) {
      return new NextResponse(cached.body, {
        status: cached.status,
        headers: cached.headers,
      })
    }

    const pending = pendingRequests.get(cacheKey)
    if (pending) {
      return pending
    }

    const fetchPromise = (async () => {
      const response = await fetchWithBypass(request)
      const body = await response.text()
      const responseHeaders: Record<string, string> = {}

      response.headers.forEach((value, key) => {
        responseHeaders[key] = value
      })

      const nextResponse = new NextResponse(body, {
        status: response.status,
        headers: responseHeaders,
      })

      if (response.ok) {
        cacheStore.set(cacheKey, {
          timestamp: Date.now(),
          status: response.status,
          headers: responseHeaders,
          body,
        })
      }

      return nextResponse
    })()

    pendingRequests.set(cacheKey, fetchPromise)

    try {
      return await fetchPromise
    } finally {
      pendingRequests.delete(cacheKey)
    }
  }

  // First handle subdomain routing
  const subdomainResponse = await handleSubdomainRouting(request)
  if (subdomainResponse) {
    return subdomainResponse
  }

  // Continue with next handler
  return NextResponse.next()
}

export const middleware = proxy

export const config = {
  matcher: [
    // Match all app routes, including API routes, while skipping static assets.
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}
