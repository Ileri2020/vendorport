export const DEFAULT_PAGE_TEMPLATES = {
  home: {
    name: 'Home',
    slug: 'home',
    sections: [
      { type: 'hero', layout: 'modern-split', order: 0, data: { title: 'Welcome to our store', text: 'Discover amazing products.' } },
      { type: 'products', layout: 'carousel of products', order: 1, data: { title: 'Trending Now' } },
      { type: 'categories', layout: 'grid', order: 2 },
      { type: 'features', layout: 'trust-bars', order: 3 },
    ]
  },
  about: {
    name: 'About Us',
    slug: 'about',
    sections: [
      { type: 'description', layout: 'UI of description', order: 0, data: { title: 'Our Story', text: 'We started with a vision to provide the best...' } },
      { type: 'features', layout: 'UI of features', order: 1 }
    ]
  },
  contact: {
    name: 'Contact',
    slug: 'contact',
    sections: [
      { type: 'description', layout: 'UI of description', order: 0, data: { title: 'Get in Touch', text: 'Reach out to us for any queries.' } },
      { type: 'chat', layout: 'floating-button', order: 1 }
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
        { type: 'description', layout: 'UI of description', order: 0, data: { title: 'Meet Our Experts', text: 'Highly qualified professionals at your service.' } },
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
