# Core Prisma Models Summary

## Business Model
```prisma
model Business {
  id: String @id
  name: String @unique
  ownerId: String (User reference)
  template: String
  
  // new: master section system
  sections: BusinessSection[]  // unified sections
  
  // existing: page-based system
  settings: ProjectSettings? (has pages -> sections)
  siteSettings: SiteSettings?
  
  // content models
  products: Product[]
  categories: Category[]
  posts: Post[]
  reviews: Review[]
  staff: Staff[]
  // ... more models
}
```

## ProjectSettings & Page & Section (Legacy)
```prisma
model ProjectSettings {
  id: String
  businessId: String
  pages: Page[]  // multiple pages
}

model Page {
  id: String
  slug: String
  sections: Section[]  // page has sections
}

model Section {
  id: String
  pageId: String
  type: String  // hero, products, description
  layout: String  // variant: carousel, grid, etc
  data: Json  // { title, categoryId, etc }
  order: Int
}
```

## BusinessSection & SectionItem (Master System)
```prisma
model BusinessSection {
  id: String
  businessId: String (Business reference)
  page: String  // home, about, shop, footer, etc
  key: String  // hero, stats, testimonials, contact-form
  type: String  // static | dynamic | collection
  position: Int
  isActive: Boolean
  heading: String?
  subHeading: String?
  content: Json?  // rich content
  settings: Json?  // { layout, variants, ... }
  
  items: SectionItem[]  // when type = collection
}

model SectionItem {
  id: String
  sectionId: String
  refType: String  // product, post, review, category
  refId: String
  position: Int
}
```

## SiteSettings
```prisma
model SiteSettings {
  id: String
  businessId: String
  
  // Hero
  heroTitle: String
  heroSubtitle: String
  heroImage: String
  heroCTA: String
  heroCTALink: String
  
  // About
  aboutText: String?
  
  // Contact
  contactEmail: String?
  contactPhone: String?
  contactDesc: String?
  address: String?
  
  // Social
  facebook: String?
  instagram: String?
  twitter: String?
  linkedin: String?
  
  // Newsletter
  newsletterTitle: String?
  newsletterText: String?
  
  // Help
  helpText: String?
  
  // Footer
  footerText: String?
  
  // Navigation
  headerCTA: String?
  addToHome: String?
}
```

## Rendering Logic in Frontend

### If business.sections exists and has items:
- Filter `business.sections` by `page === currentPageSlug`
- Sort by `position`
- Render using BusinessSection renderer
- Supports types: `static` (text), `dynamic` (fetch data), `collection` (items list)

### Else (fallback to legacy):
- Use `activePage?.sections` from `business.settings?.pages`
- Render using existing Section renderer
- Types: hero, products, categories, description, chat-interface, etc

## Admin Actions

### Add Section
```
if business.sections: POST /api/dbhandler?model=businessSection
else: POST /api/dbhandler?model=section
```

### Update Section
```
if businessSection: PUT /api/dbhandler?model=businessSection with content/settings
else: PUT /api/dbhandler?model=section with data
```

### Delete Section
```
if businessSection: DELETE /api/dbhandler?model=businessSection&id=X
else: DELETE /api/dbhandler?model=section&id=X
```

## Query Patterns

### Fetch business with all sections
```tsx
const res = await axios.get('/api/dbhandler?model=business&businessId=XXX');
// Returns business with sections array if present
```

### Fetch all BusinessSections for a business
```tsx
const res = await axios.get('/api/dbhandler?model=businessSection&businessId=XXX');
// Returns all BusinessSection records
```

### Filter sections by page in frontend
```tsx
const sectionsForPage = business.sections?.filter(s => s.page === 'home') || [];
```
