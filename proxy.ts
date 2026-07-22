import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/auth'

/**
 * Subdomain routing proxy
 * Handles rewriting subdomain requests to internal routes
 * E.g., storename.hcvp.com/about → /storename/about
 */
async function handleSubdomainRouting(request: NextRequest): Promise<NextResponse | null> {
  const url = request.nextUrl
  const hostname = request.headers.get('host') || ''

  const hostWithoutPort = hostname.split(':')[0].toLowerCase()
  const isLocalhost = hostWithoutPort.endsWith('localhost') || hostWithoutPort.endsWith('127.0.0.1')
  const isLocalDomain = hostWithoutPort.endsWith('hcvp.local')

  // Parse production base domains dynamically
  const baseDomains = ['hcvp.com']
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || ''
  if (siteUrl) {
    try {
      const parsedBase = new URL(siteUrl).hostname.toLowerCase()
      if (parsedBase && parsedBase !== 'localhost' && !baseDomains.includes(parsedBase)) {
        baseDomains.push(parsedBase)
      }
    } catch {}
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

  // Production handling (subdomain check for baseDomains)
  for (const base of baseDomains) {
    if (hostWithoutPort.endsWith(`.${base}`)) {
      const subdomain = hostWithoutPort.replace(`.${base}`, '')

      if (!excludedSubdomains.includes(subdomain)) {
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

  // Apply auth middleware if needed
  try {
    const authHandler = await auth()
    return authHandler || NextResponse.next()
  } catch (error) {
    console.error('Auth proxy error:', error)
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    // Match all routes except static assets and API routes
    '/((?!_next/static|_next/image|favicon.ico|public|api/).*)',
  ],
}