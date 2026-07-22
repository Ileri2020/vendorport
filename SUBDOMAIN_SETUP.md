# Subdomain Routing Configuration

> **Note**: As of Next.js 15+, subdomain routing uses `proxy.ts` instead of the deprecated `middleware.ts`. The old `middleware.ts` file is kept for reference only.

## Overview
The application now supports subdomain-based business routing:
- `storename.hcvp.com` → `/storename` (home page)
- `storename.hcvp.com/about` → `/storename/about`
- `storename.hcvp.com/store` → `/storename/store`

## How It Works

### Proxy Handler
The `proxy.ts` file at the project root handles subdomain detection and routing:
1. Extracts subdomain from the request hostname
2. Filters out reserved subdomains (www, api, admin, mail, cdn, support)
3. Rewrites the request internally from `/:subdomain/:path` to `/subdomain/:path`
4. Integrates with Next.js auth for protected routes

### URL Rewriting
- **User sees**: `storename.hcvp.com/page`
- **Internal routing**: `/storename/page`
- **No redirect**: The rewrite is transparent to the browser

## Migration from middleware.ts to proxy.ts

**Previous versions** used `middleware.ts` for request handling.
**Next.js 15+** now uses `proxy.ts` as the standard approach.

**Key differences:**
- `proxy.ts` is exported from the auth/main entry point
- Can be combined with auth logic in one place
- More efficient handling of request lifecycle
- Better TypeScript support

**What changed:**
- `middleware.ts` → `proxy.ts` (functionality moved)
- `export function middleware()` → `export async function proxy()`
- Subdomain routing now integrated with auth proxy

## Development Setup

### Local Testing
For local development with subdomains, modify your hosts file or use a tool:

**Windows (C:\Windows\System32\drivers\etc\hosts):**
```
127.0.0.1 localhost
127.0.0.1 test.localhost
127.0.0.1 hcvp.local
127.0.0.1 storename.hcvp.local
```

Then run the dev server and visit:
- `http://storename.hcvp.local:3000`
- `http://test.hcvp.local:3000`

### Alternative (ngrok tunnel)
For easier testing without hosts file edits:
```bash
ngrok http 3000
# Use the provided URL with subdomains
```

## Production Deployment (Vercel)

### DNS Configuration
1. Add a wildcard DNS record to your domain registrar:
   ```
   *.hcvp.com CNAME your-vercel-deployment.vercel.app
   ```

2. Ensure your domain is added to Vercel project settings:
   - Go to Project Settings → Domains
   - Add `hcvp.com` (the root domain)
   - Add `*.hcvp.com` (wildcard for subdomains)

### SSL/TLS Certificate
- Vercel automatically provides a wildcard SSL certificate
- No additional configuration needed

### Environment Variables
If you need to control the production domain, update `.env.local`:
```env
NEXT_PUBLIC_DOMAIN=hcvp.com
NEXT_PUBLIC_BASE_URL=https://hcvp.com
```

## How Links Work

Existing links continue to work because:
1. Navbar and footer use `basePath` prop that's set based on route context
2. Store pages receive the business name and generate links accordingly
3. Platform pages (without business context) link to `/storename` paths

For platform pages linking to stores, use:
```jsx
<Link href={`/${businessSlug}`}>Visit Store</Link>
// Links to: hcvp.com/business-slug (or business-slug.hcvp.com if subdomain is set)
```

## Excluded Subdomains
The following subdomains are preserved for system use:
- `www` → Points to main platform (hcvp.com)
- `api` → API routes (if needed separately)
- `admin` → Admin panel (if needed separately)
- `mail` → Email services
- `cdn` → CDN services
- `support` → Support subdomain

To add more reserved subdomains, edit `middleware.ts`:
```typescript
const excludedSubdomains = ['www', 'api', 'admin', 'mail', 'cdn', 'support', 'new-reserved']
```

## Testing Subdomains

### Test Cases
1. **Home page**: `storename.hcvp.com/` → displays StoreName home
2. **Store page**: `storename.hcvp.com/store` → displays product list
3. **Product detail**: `storename.hcvp.com/products/[id]` → displays product
4. **About page**: `storename.hcvp.com/about` → displays store about
5. **Platform page**: `www.hcvp.com/` → displays platform home (not redirected)

### Monitoring
Check browser console and network tab to verify:
- Request URL shows subdomain format
- Internal routes are being rewritten (via middleware)
- Business context is properly loaded

## Troubleshooting

### Subdomains not working locally?
- Ensure hosts file is updated correctly
- Restart your development server after hosts file changes
- Clear browser cache
- Try a different browser/incognito mode

### Links not working?
- Verify `basePath` is being passed to Navbar/Footer
- Check that business slug is being generated correctly
- Ensure links use the right format based on context

### Production subdomains not resolving?
- Verify DNS wildcard record is propagated (use `nslookup` or `dig`)
- Check Vercel project settings for domain configuration
- Ensure SSL certificate covers the wildcard domain

## Future Enhancements

1. **Custom domains**: Allow businesses to use their own domain
2. **Subdomain validation**: Verify subdomain is a real business before rewriting
3. **Subdomain caching**: Cache subdomain-to-business mapping
4. **Analytics**: Track which subdomains are accessed
