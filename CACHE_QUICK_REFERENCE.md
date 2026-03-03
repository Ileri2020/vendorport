# ⚡ Caching Quick Reference

## For Business Page Loads

### Store Homepage & Subpages
```tsx
import { usePageCache } from '@/hooks/usePageCache';

// Automatically handles: pages [storeName] and [storeName]/[...slug]
const { business, isLoading, error, invalidateCache } = usePageCache(
  storeName,
  pageSlug // e.g., 'home', 'about', 'products'
);
```

**Automatic Benefits:**
- ✅ Single API request on first load
- ✅ Instant load on repeat visits (10 min cache)
- ✅ Auto-invalidates when admins modify sections
- ✅ Handles all sections, settings, siteSettings

---

## For Other Data (Products, Posts, etc.)

### Basic Usage
```tsx
import { useCachedData } from '@/hooks/useDataCache';

const { data: products, isLoading, refetch } = useCachedData(
  'products_store1', // unique key
  async () => {
    const res = await axios.get(
      '/api/dbhandler?model=product&businessId=store1'
    );
    return res.data;
  }
);
```

### With Custom Cache Duration
```tsx
const { data: trending } = useCachedData(
  'trending_products',
  fetchTrendingProducts,
  { duration: 1000 * 60 * 5 } // 5 minutes
);
```

### Disable Auto-Fetch
```tsx
const { data, refetch } = useCachedData(
  'key',
  fetchFn,
  { autoFetch: false }
);

// Fetch manually when needed
refetch();
```

---

## Invalidating Cache

### When User Modifies Data
```tsx
import { DataCache } from '@/hooks/useDataCache';

// Single entry
DataCache.remove('products_store1');

// All products for a store
DataCache.clearByPattern('products_store1');

// All cache (nuclear option)
DataCache.clearAll();
```

### Automatic in useStoreActions
- Admin adds section → `onDataChange()` called
- Admin updates settings → `onDataChange()` called
- Admin creates page → `onDataChange()` called
- All automatically clear page cache and reload

---

## Cache Keys Convention

```
page_cache_{storeName}_{pageSlug}
products_{businessId}
categories_{businessId}
posts_{businessId}_blog
trending_products
user_orders_{userId}
```

**Rule:** Use `{entity}_{id}` format for consistency

---

## Performance Checklist

- [ ] Using `usePageCache` for business pages? 
- [ ] Using `useCachedData` for frequently accessed data?
- [ ] Invalidating cache after mutations?
- [ ] Setting appropriate duration per data type?
- [ ] Checked DevTools Storage to verify cache?

---

## Debugging

### Check What's Cached
```javascript
// In browser console
Object.keys(localStorage)
  .filter(k => k.startsWith('vendorport_cache_'))
  .forEach(k => console.log(k, JSON.parse(localStorage[k])))
```

### Measure Load Times
```javascript
console.time('page-load');
// ... component loads
console.timeEnd('page-load');
```

### Clear Cache Manually
```javascript
// All VendorPort cache
Object.keys(localStorage)
  .filter(k => k.startsWith('vendorport_cache_'))
  .forEach(k => localStorage.removeItem(k));
```

---

## Expected Performance

| Scenario | Before | After | Improvement |
|----------|--------|-------|-------------|
| First page load | 3+ API calls, ~2-3s | 1 API call, ~500-800ms | **50-70% faster** |
| Repeat load (cached) | 3+ API calls, ~2-3s | localStorage read, ~100-200ms | **90% faster** |
| Admin modifies section | Page reload | Auto-purge + reload | **Same fast** |

---

## Common Patterns

### Products List with Real-time Search
```tsx
const [search, setSearch] = useState('');
const { data: products, refetch } = useCachedData(
  'all_products',
  fetchAllProducts
);

const filtered = products?.filter(p => 
  p.name.includes(search)
) || [];

// Search is instant (filtered in browser, not API)
```

### Multiple Related Caches
```tsx
// Clean up related caches together
const invalidateGallery = () => {
  DataCache.clearByPattern('gallery_'); // gallery_store1, gallery_page2, etc.
};
```

### Stale Data Prevention
```tsx
// Check cache freshness
const { data, refetch } = useCachedData(
  'critical_data',
  fetchCritical,
  { duration: 1000 * 60 } // Shorter for critical data
);

// Optionally refetch on visibility change
useEffect(() => {
  const handleVisibilityChange = () => {
    if (!document.hidden) refetch();
  };
  document.addEventListener('visibilitychange', handleVisibilityChange);
  return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
}, [refetch]);
```

---

## Common Mistakes to Avoid

❌ **Don't:** Cache user-specific data (orders, account settings)
```tsx
// Wrong - user data changes
useCachedData('user_orders', fetchUserOrders);
```

✅ **Do:** Only cache global/public data
```tsx
// Correct - product catalog is stable
useCachedData('products', fetchProducts);
```

---

❌ **Don't:** Use same key for different data
```tsx
// Wrong
useCachedData('data', () => fetchProducts()); // Product list
useCachedData('data', () => fetchPosts()); // Different data!
```

✅ **Do:** Use unique keys
```tsx
// Correct
useCachedData('products_all', () => fetchProducts());
useCachedData('posts_blog', () => fetchPosts());
```

---

❌ **Don't:** Forget to invalidate after mutations
```tsx
// Wrong - cache becomes stale
const handleAddProduct = async (p) => {
  await axios.post('/api/dbhandler?model=product', p);
  // Cache not cleared!
};
```

✅ **Do:** Always invalidate
```tsx
// Correct
const handleAddProduct = async (p) => {
  await axios.post('/api/dbhandler?model=product', p);
  DataCache.remove(`products_${businessId}`);
};
```

---

## See Also
- [Full Caching Guide](./CACHE_OPTIMIZATION_GUIDE.md)
- [Hook Documentation](./hooks/)
