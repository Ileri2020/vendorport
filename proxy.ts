import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Subdomain routing proxy
 * Handles rewriting subdomain requests to internal routes
 * E.g., storename.hcvp.com/about → /storename/about
 * E.g., storename.vendorport.vercel.app → /storename
 */
async function handleSubdomainRouting(request: NextRequest): Promise<NextResponse | null> {
  const url = request.nextUrl
  const hostname = request.headers.get('host') || ''

  const hostWithoutPort = hostname.split(':')[0].toLowerCase()
  const isLocalhost = hostWithoutPort.endsWith('localhost') || hostWithoutPort.endsWith('127.0.0.1')
  const isLocalDomain = hostWithoutPort.endsWith('hcvp.local')

  // Parse production base domains dynamically
  const baseDomains = ['hcvp.com']
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_ORIGIN_URL || ''
  if (siteUrl) {
    try {
      const parsedBase = new URL(siteUrl.startsWith('http') ? siteUrl : `https://${siteUrl}`).hostname.toLowerCase()
      if (parsedBase && parsedBase !== 'localhost' && !baseDomains.includes(parsedBase)) {
        baseDomains.push(parsedBase)
      }
    } catch {}
  }

  const vercelUrl = process.env.VERCEL_URL || process.env.NEXT_PUBLIC_VERCEL_URL || 'https://vendorport.vercel.app/'
  if (vercelUrl) {
    const cleanVercel = vercelUrl.replace(/^https?:\/\//, '').split(':')[0].toLowerCase()
    if (cleanVercel && !baseDomains.includes(cleanVercel)) {
      baseDomains.push(cleanVercel)
    }
  }

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
    // Match all routes except static assets and API routes
    '/((?!_next/static|_next/image|favicon.ico|public|api/).*)',
  ],
}
