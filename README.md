# PerfectBite - Food Ordering Platform

A modern, production-ready food ordering platform built for small food businesses. Replace clunky Google Forms with a beautiful, functional ordering system with payment integration and admin dashboard.

## Features

### Customer Features
- 📱 Mobile-first responsive design
- 🍕 Browse menu items and events
- 🛒 Cart management with localStorage persistence
- 📝 Order form with pickup time selection
- 💳 Secure payment integration (provider-agnostic)
- ✅ Order confirmation with tracking

### Admin Features
- 📊 Dashboard with real-time order updates
- 📋 Order management and status updates
- 🍽️ Menu management (CRUD for items/categories)
- 📅 Event management (weekly specials, pizza days)
- 📈 Revenue analytics and statistics
- ⚙️ Business settings

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **State Management**: Zustand
- **Styling**: SCSS with CSS Variables
- **Routing**: React Router v7
- **Forms**: React Hook Form + Zod validation
- **Backend**: Supabase (PostgreSQL + Auth + Realtime)
- **Testing**: Vitest + React Testing Library
- **Payment**: Provider-agnostic (Stripe/Tranzila/PayPlus ready)

## Getting Started

### Prerequisites

- Node.js 20+
- npm or pnpm
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/perfectbite.git
cd perfectbite
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your Supabase credentials:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_BUSINESS_ID=your-business-uuid
VITE_PAYMENT_PROVIDER=mock
```

4. Set up the database:
   - Go to your Supabase project
   - Navigate to SQL Editor
   - Run the schema from `supabase/schema.sql`

5. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Creating an Admin User

1. Go to Supabase Dashboard → Authentication → Users
2. Click "Add user" → "Create new user"
3. Enter email and password
4. The user can now log in at `/login`

## Project Structure

```
src/
├── assets/styles/         # SCSS styles
│   ├── setup/             # Variables, mixins, reset
│   ├── cmps/              # Component styles
│   └── main.scss
├── components/
│   ├── ui/                # Reusable UI components
│   ├── layout/            # Layout components
│   ├── customer/          # Customer-facing components
│   ├── admin/             # Admin components
│   └── auth/              # Auth components
├── hooks/                 # Custom React hooks
├── lib/
│   ├── supabase.ts        # Supabase client
│   └── payment/           # Payment provider abstraction
├── pages/                 # Page components
├── routes/                # Router configuration
├── services/              # API services
├── stores/                # Zustand stores
├── types/                 # TypeScript types
└── utils/                 # Utility functions
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm test` - Run tests
- `npm run test:ui` - Run tests with UI
- `npm run lint` - Run ESLint

## Production Deployment

### Supabase Backend

Your Supabase project is already configured and production-ready:

- **Project URL**: `https://uzwbucaysfoefigdcfsk.supabase.co`
- **Region**: ap-south-1
- **Database**: PostgreSQL 17.6
- **Status**: ACTIVE_HEALTHY

**Database Tables:**
- `businesses` - Business configuration
- `menu_categories` - Menu categories
- `menu_items` - Menu items with pricing
- `events` - Special events/sales
- `event_items` - Items available in events
- `event_pickup_slots` - Event-specific pickup times
- `pickup_slots` - General pickup time slots
- `orders` - Customer orders
- `order_items` - Items in orders
- `payments` - Payment records

**Security:**
- Row Level Security (RLS) enabled on all tables
- Public read access for menu items, events, and pickup slots
- Anonymous order creation allowed
- Authenticated access required for admin operations

**Storage:**
- `business-assets` bucket configured for logos and images
- Public read access, authenticated write access

### Frontend Hosting Options

#### Option 1: Vercel (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import your repository
3. Configure environment variables:
   ```
   VITE_SUPABASE_URL=https://uzwbucaysfoefigdcfsk.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   VITE_BUSINESS_ID=your-business-uuid
   ```
4. Deploy - Vercel auto-detects Vite and configures the build

#### Option 2: Netlify

1. Push your code to GitHub
2. Go to [netlify.com](https://netlify.com) and import your repository
3. Build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
4. Configure environment variables in Site settings
5. Add `_redirects` file in `public/` for SPA routing:
   ```
   /*    /index.html   200
   ```

#### Option 3: Manual Deployment

1. Build the project:
   ```bash
   npm run build
   ```

2. Deploy the `dist/` folder to any static hosting:
   - AWS S3 + CloudFront
   - Google Cloud Storage
   - Azure Static Web Apps
   - DigitalOcean App Platform

### Environment Variables

For production, set these environment variables:

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `VITE_BUSINESS_ID` | Your business UUID from the businesses table |
| `VITE_PAYMENT_PROVIDER` | Payment provider (`mock`, `stripe`, etc.) |

### Post-Deployment Checklist

- [ ] Environment variables configured on hosting platform
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active (auto-enabled on Vercel/Netlify)
- [ ] Create admin user in Supabase Auth
- [ ] Test order flow end-to-end
- [ ] Configure payment provider for production (replace mock)

## Payment Integration

The app uses a provider-agnostic payment architecture. To add a new payment provider:

1. Create a new provider file in `src/lib/payment/`
2. Implement the `PaymentProvider` interface
3. Register it in `src/lib/payment/index.ts`

Currently supported:
- **Mock** - For development/testing
- **Stripe** - Ready for implementation
- **Tranzila** - Ready for implementation
- **PayPlus** - Ready for implementation

## RTL Support

The app is designed with Hebrew (RTL) as the primary language. All layouts use logical CSS properties for proper RTL support.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

MIT License - feel free to use for your own food business!

---

Built with ❤️ for small food businesses
