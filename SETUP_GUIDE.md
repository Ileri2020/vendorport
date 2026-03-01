# Email Verification & Hero Variants Setup Guide

## Email Configuration for Verification Flow

### Gmail Setup (Recommended for Development)

Add these variables to your `.env` file:

```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password
```

**Steps to get Gmail App Password:**

1. Enable 2-Factor Authentication on your Google Account
2. Go to https://myaccount.google.com/apppasswords
3. Generate a new App-Specific Password
4. Use that password as `EMAIL_PASSWORD`

### Alternative Email Services

You can also use:

- **SendGrid** - Professional email service with free tier
- **Mailgun** - Reliable transactional email
- **AWS SES** - Scalable email service

To switch services, update the transporter configuration in:
`app/api/auth/send-verification-code/route.ts`

---

## Hero Variants Usage

Five hero variants are available in `components/myComponents/subs/hero-variants.tsx`:

### 1. CarouselHero (Bistro Bliss Style)

- Full-screen image carousel with crossfade
- Sticky navigation with location selector
- Notification bar
- Floating "Order Online" button after scroll
- Desktop: Full viewport hero | Mobile: Portrait aspect + sticky CTA

### 2. StoryHero (The Cozy Bistro Style)

- Parallax scrolling background
- Expandable accordion sections
- Sidebar with social proof
- Instagram feed preview
- Desktop: Split layout | Mobile: Stacked vertical

### 3. MenuHighlightsHero (Taste Buds Style)

- Category tabs with search
- Grid layout for dishes
- Chef's Picks carousel
- Add to cart functionality
- Desktop: Multi-column grid | Mobile: Stacked cards

### 4. ExperienceHero (The Wine Cellar Style)

- Image gallery with lightbox
- Event & private dining info
- Customer reviews
- Countdown timer for offers
- Desktop: Split layout | Mobile: Vertical scroll

### 5. LocalFreshHero (Farm-to-Table Eats Style)

- Google Maps integration
- Farm partners carousel
- Newsletter signup
- Social media feed
- Desktop: Split screen | Mobile: Stacked with bottom nav

---

## How to Switch Hero Variants

Edit `app/home/page.tsx`:

```tsx
// Import the variant you want
import { CarouselHero } from "@/components/myComponents/subs/hero-variants";

// Replace the existing <Hero /> with your chosen variant
const Home = () => {
  return (
    <motion.section>
      <CarouselHero /> {/* Change this to any variant */}
      {/* Rest of your components */}
    </motion.section>
  );
};
```

---

## Email Verification Flow

### How it Works:

1. **User tries to login** with email + password
2. **System detects** user has no password (OAuth user)
3. **UI switches** to verification step
4. **User clicks** "Send Verification Code"
5. **6-digit code** sent to user's email
6. **User enters** code + new password
7. **Password set** - user can now login normally

### API Endpoints:

- `POST /api/auth/send-verification-code` - Sends code to email
- `POST /api/auth/verify-code-set-password` - Verifies code and sets password
- `POST /api/auth/login` - Enhanced to detect OAuth users

### Database Model:

```prisma
model EmailVerificationCode {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  email     String
  code      String
  expires   DateTime
  verified  Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([email])
}
```

---

## Testing the Features

### Test Email Verification:

1. Sign up with Google or Facebook
2. Try to login with email + password (it will prompt verification)
3. Click "Send Verification Code"
4. Check your email for the 6-digit code
5. Enter code and set a new password
6. Login normally with email + password

### Test Hero Variants:

1. Update `app/home/page.tsx` with desired variant
2. Run `npm run dev`
3. Visit `/home` to see the variant
4. Test on mobile (responsive design)

---

## Notes:

- **Code Expiry**: Verification codes expire in 15 minutes
- **Password Requirements**: Minimum 6 characters
- **Images**: All variants use images from `/public` folder
- **Responsiveness**: All variants are mobile and desktop optimized
- **Animations**: Framer Motion used for smooth transitions
