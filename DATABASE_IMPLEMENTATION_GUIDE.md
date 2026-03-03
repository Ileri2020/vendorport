# Database Schema & Section Linking Implementation Guide

## Overview
This document provides a complete reference for how each page section is linked to the database and how to manage editable fields.

---

## PART 1: SCHEMA ARCHITECTURE

### Core Principle: Multi-Tenant Scoping
Every piece of business content is scoped by `businessId` to support multiple independent businesses on one platform.

### Storage Categories

#### A. Static Settings (siteSettings model)
Store page-wide, site-level configuration that applies across all pages.

**siteSettings fields:**
```js
{
  // Header/Navigation
  headerCTA: "Join Now",          // Button text in navbar
  
  // Hero Section
  heroTitle: "Welcome",
  heroSubtitle: "Browse our products",
  heroCTA: "Shop Now",
  heroCTALink: "/products",
  heroImage: "url://...",
  
  // About/Description
  aboutText: "We provide...",
  
  // Contact
  contactEmail: "support@example.com",
  contactPhone: "+234...",
  contactDesc: "Contact us for...",
  address: "123 Main St",
  
  // Social Links
  facebook: "https://facebook.com/...",
  instagram: "https://instagram.com/...",
  twitter: "https://twitter.com/...",
  linkedin: "https://linkedin.com/...",
  
  // Footer
  footerText: "Your trusted partner...",
  
  // Newsletter
  newsletterTitle: "Join our Newsletter",
  newsletterText: "Be the first to know...",
  
  // Help
  helpText: "How can we assist you?",
  
  // Other
  addToHome: "Add our app to your home screen..."
}
```

#### B. Dynamic Content (Dedicated Models)
Store business content that can have many records and requires full CRUD operations.

**Models:**
- **Product** - Products with images, price, description, stock
- **Category** - Product categories  
- **Post** - Blog posts/articles
- **Review** - Customer reviews/ratings
- **Promotion** - Marketing promotions/deals
- **BusinessStat** - KPI statistics (e.g. "100+ customers", "5+ years")
- **Partner** - Partner logos/links
- **HelpArticle** - Help center articles
- **Staff** - Team members
- **Subscriber** - Newsletter subscribers
- **Message** - Contact form submissions
- **ChatThread** - Chat conversation (new)
- **ChatMessage** - Chat messages (new)

---

## PART 2: PAGE-BY-PAGE SECTION BREAKDOWN

### HOME PAGE

#### Section 1: Hero
**Storage:** `siteSettings`
**Editable Fields:**
```tsx
<AdminEditable 
  value={business.siteSettings?.heroTitle || 'Welcome'}
  model="siteSettings" 
  id={business.siteSettings?.id}
  field="heroTitle"
/>
```
**Fields:**
- `heroTitle` - Main heading
- `heroSubtitle` - Subheading
- `heroCTA` - Button text
- `heroCTALink` - Button link
- `heroImage` - Background image

#### Section 2: Featured Products
**Storage:** `FeaturedProduct` model (links Product records)
**Query:** Get Featured Products via axes or API
**Editable:** Section title in `Section.data.title`
```tsx
<AdminEditable 
  value={data?.title || 'Trending Products'}
  model="section"
  id={section.id}
  field="data.title"
  data={data}
/>
```

#### Section 3: Featured Categories
**Storage:** `Category` model
**Query:** Fetch all categories for this business
**Editable:** Category names via AdminEditable on Category model

#### Section 4: Deals/Promotions Carousel
**Storage:** `Promotion` model
**Query:** Get all active promotions
**Editable Fields:**
```tsx
<AdminEditable value={promo.title} model="promotion" id={promo.id} field="title" />
<AdminEditable value={promo.description} model="promotion" id={promo.id} field="description" />
<AdminEditable value={promo.discount} model="promotion" id={promo.id} field="discount" />
```

#### Section 5: Newsletter Signup
**Storage:** `siteSettings`
**Editable Fields:**
```tsx
<AdminEditable value={business.siteSettings?.newsletterTitle} model="siteSettings" id={business.siteSettings?.id} field="newsletterTitle" />
<AdminEditable value={business.siteSettings?.newsletterText} model="siteSettings" id={business.siteSettings?.id} field="newsletterText" />
```

---

### ABOUT PAGE

#### Section 1: About Text
**Storage:** `siteSettings.aboutText`
```tsx
<AdminEditable 
  value={business.siteSettings?.aboutText}
  model="siteSettings"
  id={business.siteSettings?.id}
  field="aboutText"
/>
```

#### Section 2: Stats
**Storage:** `BusinessStat` model
**Query:** Get all stats for this business
**Editable Fields:**
```tsx
{stats.map(stat => (
  <>
    <AdminEditable value={stat.value} model="businessStat" id={stat.id} field="value" />
    <AdminEditable value={stat.label} model="businessStat" id={stat.id} field="label" />
  </>
))}
```

#### Section 3: Team Members
**Storage:** `Staff` model
**Query:** Get all staff for this business
**Editable Fields:**
```tsx
{staff.map(member => (
  <>
    <AdminEditable value={member.name} model="staff" id={member.id} field="name" />
    <AdminEditable value={member.role} model="staff" id={member.id} field="role" />
    <AdminEditable value={member.bio} model="staff" id={member.id} field="bio" />
  </>
))}
```

#### Section 4: Partners
**Storage:** `Partner` model
**Editable Fields:**
```tsx
{partners.map(partner => (
  <>
    <AdminEditable value={partner.name} model="partner" id={partner.id} field="name" />
    <AdminEditable value={partner.logo} model="partner" id={partner.id} field="logo" />
  </>
))}
```

---

### CONTACT PAGE

#### Section 1: Contact Description
**Storage:** `siteSettings.contactDesc`
```tsx
<AdminEditable 
  value={business.siteSettings?.contactDesc}
  model="siteSettings"
  id={business.siteSettings?.id}
  field="contactDesc"
/>
```

#### Section 2: Contact Information
**Storage:** `siteSettings`
**Editable Fields:**
- `contactEmail`
- `contactPhone`
- `address`

#### Section 3: Social Links
**Storage:** `siteSettings`
**Editable Fields:**
- `facebook`
- `instagram`
- `twitter`
- `linkedin`

#### Section 4: Contact Form
**Storage:** `Message` model
**User fills out form → saved to Message table with businessId, name, email, message**
**Display:** Contact form for submission

#### Section 5: Live Chat
**Storage:** `ChatThread` & `ChatMessage` models (new)
**Behavior:**
- User initiates chat = create `ChatThread`
- Each message = `ChatMessage` record
- Admin can respond = ChatMessage with sender="admin"

---

### HELP PAGE

#### Section 1: Help Text Header
**Storage:** `siteSettings.helpText`
```tsx
<AdminEditable 
  value={business.siteSettings?.helpText}
  model="siteSettings"
  id={business.siteSettings?.id}
  field="helpText"
/>
```

#### Section 2: Help Articles
**Storage:** `HelpArticle` model
**Editable Fields:**
```tsx
{helpArticles.map(article => (
  <>
    <AdminEditable value={article.title} model="helpArticle" id={article.id} field="title" />
    <AdminEditable value={article.content} model="helpArticle" id={article.id} field="content" />
  </>
))}
```

---

### BLOG/POSTS PAGE

#### Section: Blog Posts List
**Storage:** `Post` model
**Query:** Get all posts for this business
**Editable Fields:**
```tsx
{posts.map(post => (
  <>
    <AdminEditable value={post.title} model="post" id={post.id} field="title" />
    <AdminEditable value={post.description} model="post" id={post.id} field="description" />
  </>
))}
```

---

### PRODUCTS PAGE

#### Section 1: Product Catalog
**Storage:** `Product` model
**Query:** Get all products with pagination
**Editable Fields:**
```tsx
{products.map(product => (
  <>
    <AdminEditable value={product.name} model="product" id={product.id} field="name" />
    <AdminEditable value={product.description} model="product" id={product.id} field="description" />
    <AdminEditable value={product.price} model="product" id={product.id} field="price" />
  </>
))}
```

#### Section 2: Product Categories
**Storage:** `Category` model (with Products via categoryId)
**Editable:** Category names and descriptions

#### Section 3: Product Reviews
**Storage:** `Review` model
**Query:** Get reviews for specific product
**Display:** Show user reviews with ratings

---

### ACCOUNT/USER PAGE

#### Section 1: My Orders
**Storage:** `Cart` model with status="completed"
**Display:** User's order history

#### Section 2: My Wishlist
**Storage:** `Wishlist` model
**Display:** Saved products

#### Section 3: Shipping Addresses
**Storage:** `ShippingAddress` model
**Display:** User's saved addresses

---

## PART 3: ADMIN EDITABLE IMPLEMENTATION

### The AdminEditable Component
Wraps content and enables inline editing for authorized users (business owner/admin).

**Usage Pattern:**
```tsx
<AdminEditable
  as="h2"              // HTML element tag
  value={content}      // Current value
  model="siteSettings" // DB model name
  id={recordId}        // Record ID
  field="fieldName"    // Field name to update
  className="styling"  // CSS classes
  data={obj}           // Optional: entire object for complex updates
>
  {displayContent}     // Display content/children
</AdminEditable>
```

**Supported Models:**
- `siteSettings`
- `section`
- `businessStat`
- `staff`
- `promotion`
- `partner`
- `helpArticle`
- `product`
- `post`
- `category`
- `review`
- `message`
- `chatMessage`

**Example 1: Simple Text Field**
```tsx
<AdminEditable 
  as="p"
  value={business.siteSettings?.footerText}
  model="siteSettings"
  id={business.siteSettings?.id}
  field="footerText"
  className="text-sm text-muted-foreground"
>
  {business.siteSettings?.footerText}
</AdminEditable>
```

**Example 2: Section Title**
```tsx
<AdminEditable 
  as="h2"
  value={section.data?.title || 'Default Title'}
  model="section"
  id={section.id}
  field="data.title"
  data={section.data}
  className="text-3xl font-bold"
>
  {section.data?.title || 'Default Title'}
</AdminEditable>
```

---

## PART 4: IMPLEMENTATION CHECKLIST

### Current Status: ✅ ALL COMPLETE

- [x] Prisma schema updated with all models
- [x] ChatThread and ChatMessage models added
- [x] Database migrated with `prisma db push`
- [x] Prisma client regenerated
- [x] Business interface updated with all fields
- [x] RenderSection has AdminEditable wrappers
- [x] All section types properly handled
- [x] TypeScript compilation passes (no errors)
- [x] Database scoping by businessId verified
- [x] AdminEditable component can edit all section types

---

## PART 5: QUICK REFERENCE TABLE

| Section | Model | Storage | Editable? |
|---------|-------|---------|-----------|
| Hero Title | siteSettings | Static | ✅ Yes |
| Featured Products | FeaturedProduct | Dynamic | ✅ Yes |
| Categories | Category | Dynamic | ✅ Yes |
| Promotions | Promotion | Dynamic | ✅ Yes |
| Newsletter | siteSettings | Static | ✅ Yes |
| About Text | siteSettings | Static | ✅ Yes |
| Stats | BusinessStat | Dynamic | ✅ Yes |
| Team | Staff | Dynamic | ✅ Yes |
| Partners | Partner | Dynamic | ✅ Yes |
| Contact Form | Message | Dynamic | ✅ Yes |
| Live Chat | ChatThread/Message | Dynamic | ✅ Yes |
| Help Articles | HelpArticle | Dynamic | ✅ Yes |
| Blog Posts | Post | Dynamic | ✅ Yes |
| Products | Product | Dynamic | ✅ Yes |
| Reviews | Review | Dynamic | ✅ Yes |

---

## PART 6: BUSINESS OWNER WORKFLOW

### To Edit Hero Title (Example)
1. Login to store as business owner
2. Navigate to Home page
3. Hover over hero section
4. Click on "Hero Title" text
5. AdminEditable shows inline editor
6. Type new title
7. Click save/confirm
8. Updates `siteSettings.heroTitle` in database

### To Add a New Promotion
1. Go to Admin Toolbar (bottom-right gear icon)
2. Click on Admin Console
3. Navigate to "Design" or create via API
4. Create new Promotion record with:
   - title
   - description
   - image
   - discount (%)
   - startDate
   - endDate
5. Promotion appears on home page automatically

### To Add Team Member
1. Go to Admin Toolbar
2. Navigate to "Team" tab
3. Create new Staff record with:
   - name
   - role  
   - bio
   - image
4. Staff member appears on About page

---

## Notes & Best Practices

1. **Always scope by businessId** - When querying, filter by `businessId`
2. **Use AdminEditable for user-facing content** - Headers, descriptions, text
3. **Use forms for creation/deletion** - Inventory, team, promotions
4. **Cache siteSettings** - Static settings are accessed frequently
5. **Lazy load dynamic content** - Load products, blogs on demand
6. **Validate inputs** - Both client and server side
7. **Track permissions** - Only business owner can edit their content

---

## API Endpoints for Content Management

```
POST   /api/dbhandler?model=section        // Create section
PUT    /api/dbhandler?model=section        // Update section
DELETE /api/dbhandler?model=section&id=... // Delete section

POST   /api/dbhandler?model=siteSettings   // Update settings
GET    /api/dbhandler?model=siteSettings   // Get settings

POST   /api/dbhandler?model=promotion      // Create promotion
PUT    /api/dbhandler?model=promotion      // Update promotion

POST   /api/dbhandler?model=staff          // Create staff
PUT    /api/dbhandler?model=staff          // Update staff

POST   /api/dbhandler?model=product        // Create product
PUT    /api/dbhandler?model=product        // Update product

POST   /api/dbhandler?model=post           // Create blog post
PUT    /api/dbhandler?model=post           // Update blog post

POST   /api/dbhandler?model=message        // Submit contact form
```

---

## Summary

✅ **Complete database schema** with all models properly related
✅ **Admin editable content** at the section level
✅ **Multi-tenant architecture** scoped by businessId
✅ **TypeScript validation** with full type safety
✅ **AdminEditable integration** for all content types

All sections are now linked to the database and can be edited inline by business owners when logged in.
