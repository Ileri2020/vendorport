# Page Data Caching & Performance Optimization Guide

## Overview
This document explains the new caching system that ensures business pages load with minimal API requests by storing all page data in localStorage and serving it locally.

## Architecture

### Two-Level Caching System

#### 1. Business Page Data Cache (`usePageCache`)
- **Target**: Business/store pages (`/[storeName]` and `/[storeName]/[...slug]`)
- **Data Cached**: Complete business object including:
  - Business settings (currency, exchange rate, page structure)
  - SiteSettings (contact info, social links, hero section, etc.)
  - All page definitions with sections
  - Master section data (BusinessSection records)
- **Cache Duration**: 10 minutes
- **Cache Key**: `page_cache_{storeName}_{pageSlug}`

**Usage in Components:**
```tsx
import { usePageCache } from '@/hooks/usePageCache';

const MyComponent = () => {
  const { business, isLoading, error, invalidateCache, refetch } = usePageCache(
    'my-store',
    'home'
  );

  return <div>{business?.name}</div>;
};
```

#### 2. Generic Data Cache (`useDataCache`)
- **Target**: Any API data (products, posts, categories, etc.)
- **Features**: 
  - Automatic expiration
  - Version-based invalidation
  - Pattern-based cache clearing
- **Cache Duration**: Configurable (default 10 minutes)
- **Cache Prefix**: `vendorport_cache_`

**Usage in Components:**
```tsx
import { useCachedData, DataCache } from '@/hooks/useDataCache';

const ProductList = ({ businessId }: { businessId: string }) => {
  const { data: products, isLoading, refetch } = useCachedData(
    `products_${businessId}`,
    async () => {
      const res = await axios.get(
        `/api/dbhandler?model=product&businessId=${businessId}`
      );
      return res.data;
    },
    { duration: 1000 * 60 * 5 } // 5 minutes
  );

  return <div>{products?.map(p => <div key={p.id}>{p.name}</div>)}</div>;
};
```

### Cache Invalidation Strategies

#### 1. Manual Invalidation
```tsx
import { DataCache } from '@/hooks/useDataCache';

// Invalidate specific cache entry
DataCache.remove('products_businessId123');

// Invalidate all products cache for a business
DataCache.clearByPattern('products_businessId123');

// Clear all cache
DataCache.clearAll();
```

#### 2. Automatic Invalidation on Data Changes
When admin modifies page sections, products, or settings:

```tsx
const { onDataChange } = usePageCache(storeName, pageSlug);

// Call this after any mutation
onDataChange?.(); 
// This will:
// 1. Clear the page cache
// 2. Trigger a page reload to fetch fresh data
```

Action handlers in `useStoreActions` automatically call `onDataChange()`:
- After section add/remove/update
- After page creation
- After template application
- After settings update

#### 3. Time-Based Expiration
- Business page cache expires after **10 minutes**
- Generic data cache expires after **10 minutes** (configurable)
- Automatic cleanup on cache read

### Data Flow Diagram

```
User navigates to /my-store/products
       ↓
usePageCache hook activated
       ↓
Checks localStorage for 'page_cache_my-store_products'
       ↓
Found & valid?       → Return cached data (instant load)
       ↓ No/Expired
Make single API request to /api/dbhandler?model=business
       ↓
Receive full business object with:
- settings.pages[].sections
- siteSettings
- businessSections (if using master system)
       ↓
Store in localStorage with timestamp & version
       ↓
Render StoreHome component with cached data
       ↓
Page loads instantly on next visit (within 10 min)
```

## Performance Improvements

### Before Caching
- Multiple independent API requests:
  1. `GET /api/dbhandler?model=business` (all businesses)
  2. `GET /api/dbhandler?model=section?businessId=X`
  3. `GET /api/dbhandler?model=siteSettings?businessId=X`
  - **Total**: 3+ requests, ~1-3 seconds load time

### After Caching
- Single API request (first load):
  1. `GET /api/dbhandler?model=business` (full data in response)
  - **Total**: 1 request, ~500ms-1s load time
  
- Subsequent loads (within 10 min):
  - **Total**: 0 requests (instant), ~100-200ms

### Expected Performance Gains
- **First visit**: ~50% faster (single request instead of 3)
- **Repeat visits**: ~90% faster (localStorage read only)
- **Total page load**: From ~3s → ~500ms (instant if cached)

## Implementation Details

### Browser Storage Capacity
- localStorage: ~5-10MB per domain
- VendorPort cache prefix prevents conflicts
- Automatic cleanup on cache version change

### Cache Key Naming Convention
```
page_cache_{storeName}_{pageSlug}
  ↓
Namespace isolation per store and page
```

### Version Control
- Current version: `1.0`
- Increment when schema changes to auto-invalidate old cache
- User upgrade: automatic, no action needed

## Best Practices

### 1. When to Use `usePageCache`
✓ Store/business pages
✓ Pages that need complete business context
✓ Pages that load frequently

❌ Admin dashboard (fresh data critical)
❌ Real-time data (chat, live notifications)

### 2. When to Use `useDataCache`
✓ Product listings
✓ Blog posts
✓ Categories
✓ Any frequently accessed, slowly-changing data

❌ User-specific data (orders, account)
❌ Real-time inventory
❌ Data that changes frequently

### 3. Cache Duration Guidelines
```tsx
// Real-time critical (chat, inventory)
duration: 1000 * 60 // 1 minute

// Frequently updated (products, posts)
duration: 1000 * 60 * 5 // 5 minutes

// Rarely changes (categories, settings)
duration: 1000 * 60 * 30 // 30 minutes
```

### 4. Clearing Cache After Mutations
```tsx
// Option 1: Use invalidateCache callback
const { invalidateCache } = usePageCache(storeName, pageSlug);
// Called automatically in useStoreActions

// Option 2: Manual invalidation
import { DataCache } from '@/hooks/useDataCache';
DataCache.remove('specific_key');

// Option 3: Pattern-based clearing
DataCache.clearByPattern('products_');
```

## Migration Path for Existing Components

### Step 1: Identify Components That Fetch Data
- Search for `axios.get('/api/dbhandler?model=...`
- Check if data is used multiple times

### Step 2: Implement Caching
```tsx
// Before
const [products, setProducts] = useState([]);
useEffect(() => {
  axios.get(`/api/dbhandler?model=product&businessId=${bid}`)
    .then(r => setProducts(r.data));
}, [bid]);

// After
const { data: products } = useCachedData(
  `products_${bid}`,
  () => axios.get(`/api/dbhandler?model=product&businessId=${bid}`)
    .then(r => r.data)
);
```

### Step 3: Handle Mutations
```tsx
// Add cache invalidation after any POST/PUT/DELETE
const handleAddProduct = async (formData) => {
  await axios.post('/api/dbhandler?model=product', formData);
  DataCache.remove(`products_${businessId}`);
  DataCache.clearByPattern('product_'); // Clear related caches
};
```

## Monitoring Cache Effectiveness

### Check Cache in DevTools
```javascript
// Console command to inspect cache
Object.keys(localStorage).filter(k => k.startsWith('vendorport_cache_'))
```

### Measure Performance
```tsx
// Use performance API
const start = performance.now();
const { data } = useCachedData(...);
console.log(`Load time: ${performance.now() - start}ms`);
```

## Troubleshooting

### Cache Not Being Used?
1. Check browser's localStorage is enabled
2. Verify cache key matches component's key parameter
3. Check if cache has expired (console: `typeof(JSON.parse(localStorage.getItem('...')))`)

### Stale Data Being Served?
1. Reduce cache duration: `duration: 1000 * 60 * 2` (2 min)
2. Manually invalidate after mutations
3. Use network tab to verify API calls

### localStorage Full?
1. Use DevTools Storage tab to clear old cache
2. Reduce cache scope targeting specific business/page
3. Increase cache version to auto-clear all old entries

## Future Enhancements

- [ ] IndexedDB for larger cache capacity
- [ ] Service Worker caching for offline support
- [ ] Cache compression for large objects
- [ ] Analytics on cache hit/miss ratio
- [ ] User preference for cache duration
- [ ] Partial cache updates (only changed sections)
