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
  }
};

export const STORE_TEMPLATES = {
  estore: {
    pages: ['home', 'about', 'contact']
  },
  pharmacy: {
    pages: ['home', 'about', 'contact'],
    defaults: {
       hero: { layout: 'immersive' },
       description: { title: 'Health First' }
    }
  }
};
