# Database Schema Implementation Map

## Overview
This document maps all page sections to their database storage and AdminEditable wrapping.

## Section Storage Strategy

### STATIC (siteSettings)
- Header/Navigation elements
- Footer elements  
- Page-level text/meta
- Contact information
- Social links
- Site-wide settings

### DYNAMIC (Dedicated Models)
- Products (Product model)
- Categories (Category model)
- Posts (Post model)
- Reviews (Review model)
- Promotions (Promotion model)
- Stats (BusinessStat model)
- Partners (Partner model)
- Help Articles (HelpArticle model)
- Staff (Staff model)
- Subscribers (Subscriber model) 
- Messages (Message model)
- Chat (ChatThread, ChatMessage models)

## Implementation Checklist

### Page: HOME
- [x] Hero: siteSettings (heroTitle, heroSubtitle, heroCTA, heroCTALink, heroImage)
- [x] Featured Products: Product + FeaturedProduct models
- [x] Featured Categories: Category model
- [x] Deals/Promotions: Promotion model
- [x] Newsletter: siteSettings (newsletterTitle, newsletterText)

### Page: ABOUT
- [x] About Text: siteSettings.aboutText
- [x] Stats: BusinessStat model
- [x] Team: Staff model
- [x] Partners: Partner model

### Page: CONTACT
- [x] Contact Description: siteSettings.contactDesc
- [x] Contact Info: siteSettings (contactEmail, contactPhone, address)
- [x] Social Links: siteSettings (facebook, instagram, twitter, linkedin)
- [x] Contact Form: Message model
- [x] Live Chat: ChatThread, ChatMessage models

### Page: HELP
- [x] Help Text: siteSettings.helpText
- [x] Help Articles: HelpArticle model

### Page: BLOG
- [x] Posts: Post model

### Page: PRODUCTS
- [x] Product Catalog: Product model
- [x] Product Categories: Category model
- [x] Product Reviews: Review model

### Page: ACCOUNT
- [x] User Orders: Cart model
- [x] User Wishlist: Wishlist model
- [x] User Addresses: ShippingAddress model

## AdminEditable Pattern

All editable fields should follow this pattern:
```tsx
<AdminEditable
  as="h2"  // or p, span, etc
  value={currentValue}
  model="siteSettings" // or "product", "post", etc
  id={recordId}
  field="fieldName"
  className="styling"
>
  {currentValue}
</AdminEditable>
```

## Notes
- All business data is scoped by businessId
- Inline editing is enabled for business admins only
- Changes persist to database via AdminEditable component
- Section data in Section.data JSON is for UI configuration (title, order, layout)
- Actual business content data lives in dedicated models
