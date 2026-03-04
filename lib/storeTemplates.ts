export const DEFAULT_PAGE_TEMPLATES = {
  home: {
    name: 'Home',
    slug: 'home',
    sections: [
      { type: 'hero', layout: 'modern-split', order: 0, data: { title: 'Welcome to our world', text: 'Where quality meets craftsmanship.' } },
      { type: 'products', layout: 'carousel of products', order: 1, data: { title: 'Trending Collection' } },
      { type: 'categories', layout: 'grid', order: 2 },
      { type: 'features', layout: 'trust-bars', order: 3 },
      { type: 'description', layout: 'UI of description', order: 4, data: { title: 'Our Mission', text: 'To bring the best experience right to your doorstep.' } },
    ]
  },
  // Default store landing used by many templates
  store: {
    name: 'Store',
    slug: 'store',
    sections: [
      { type: 'hero', layout: 'immersive', order: 0, data: { title: 'Shop Our Products', text: 'Find everything you need in our curated collection.' } },
      { type: 'product-list', layout: 'grid-with-filters', order: 1, data: { title: 'Explore Everything' } },
      { type: 'categories', layout: 'carousel', order: 2 },
      { type: 'promotions', layout: 'wide-cards', order: 3 }
    ]
  },
  about: {
    name: 'About Us',
    slug: 'about',
    sections: [
      { type: 'hero', layout: 'simple-centered', order: 0, data: { title: 'The Story Behind We', text: 'Learn about our journey and the passion that drives us.' } },
      { type: 'description', layout: 'UI of description', order: 1, data: { title: 'Our Story', text: 'We started with a vision to provide the best...' } },
      { type: 'features', layout: 'UI of features', order: 2 },
      { type: 'staff', layout: 'grid', order: 3 },
    ]
  },
  contact: {
    name: 'Contact',
    slug: 'contact',
    sections: [
      { type: 'hero', layout: 'simple-centered', order: 0, data: { title: 'Get in Touch', text: 'Reach out to us for any queries or support.' } },
      { type: 'contact-form', layout: 'standard', order: 1, data: { title: 'Send us a message' } },
      { type: 'chat-interface', layout: 'standard', order: 2, data: { title: 'Chat with our Team', text: 'Get instant answers to your questions.' } },
      { type: 'features', layout: 'trust-bars', order: 3 }
    ]
  },
  store: {
    name: 'Our Store',
    slug: 'store',
    sections: [
      { type: 'hero', layout: 'immersive', order: 0, data: { title: 'Shop Our Products', text: 'Find everything you need in our curated collection.' } },
      { type: 'product-list', layout: 'grid-with-filters', order: 1, data: { title: 'Explore Everything' } },
      { type: 'categories', layout: 'carousel', order: 2 }
    ]
  },
  'product-description': {
    name: 'Product Details',
    slug: 'product',
    sections: [
      { type: 'product-details', layout: 'premium', order: 0 },
      { type: 'products', layout: 'carousel of products', order: 1, data: { title: 'You May Also Like' } }
    ]
  },
  blog: {
    name: 'Insights & News',
    slug: 'blog',
    sections: [
      { type: 'hero', layout: 'modern-split', order: 0, data: { title: 'Knowledge Base', text: 'Latest updates and clinical insights.' } },
      { type: 'blog-posts', layout: 'masonry', order: 1 },
      { type: 'newsletter', layout: 'centered', order: 2 }
    ]
  },
  cart: {
    name: 'My Cart',
    slug: 'cart',
    sections: [
      { type: 'cart', layout: 'full-details', order: 0 }
    ]
  },
  staff: {
     name: 'Our Team',
     slug: 'staff',
     sections: [
        { type: 'hero', layout: 'simple-centered', order: 0, data: { title: 'Meet the Experts', text: 'Highly qualified professionals at your service.' } },
        { type: 'staff', layout: 'grid', order: 1 }
     ]
   },
   menu: {
     name: 'Menu',
     slug: 'menu',
     sections: [
        { type: 'hero', layout: 'bold-hero', order: 0, data: { title: 'Our Menu', text: 'Delicious choices for every craving.' } },
        { type: 'product-list', layout: 'menu-grid', order: 1, data: { title: 'Browse Our Dishes' } },
        { type: 'promotions', layout: 'wide-cards', order: 2 }
     ]
   },
   account: {
     name: 'My Account',
     slug: 'account',
     sections: [
        { type: 'hero', layout: 'simple-centered', order: 0, data: { title: 'Welcome Back', text: 'Manage your profile and orders.' } },
        { type: 'description', layout: 'UI of description', order: 1, data: { title: 'Account Settings', text: 'Update your information below.' } }
     ]
   },
  pharmacy: {
    // Health-clique style pharmaceutical template
    pages: ['home', 'store', 'about', 'contact', 'cart', 'product-description'],
    defaults: {
       hero: { layout: 'immersive' },
       description: { title: 'Health First' }
    }
  },
  fastfood: {
    // Succo / fast-food style template with dedicated lunch/menu pages
    pages: ['home', 'store', 'about', 'menu', 'cart', 'account'],
    defaults: {
      hero: { layout: 'bold-hero' },
      productList: { layout: 'menu-grid' }
    }
  },
  restaurant: {
    pages: ['home', 'menu', 'about', 'contact', 'cart', 'account'],
    defaults: {
      hero: { layout: 'restaurant-hero' },
      productList: { layout: 'menu-grid' }
    }
  },
  marketplace: {
    pages: ['home', 'store', 'about', 'contact', 'cart', 'account'],
    defaults: {
      hero: { layout: 'modern-split' },
      productList: { layout: 'grid-with-filters' }
    }
  }
};
