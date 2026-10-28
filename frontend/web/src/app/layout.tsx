import type { Metadata } from 'next';
import { Barlow_Condensed, Allura, Manrope } from 'next/font/google';
import './globals.css';
import { CartProvider } from '../context/CartContext';
import { WishlistProvider } from '../context/WishlistContext';
import { CustomerAuthProvider } from '../context/CustomerAuthContext';
import { CartDrawer } from '../components/cart/CartDrawer';
import { WishlistDrawer } from '../components/wishlist/WishlistDrawer';
import { CustomerAuthModal } from '../components/auth/CustomerAuthModal';
import { CheckoutModal } from '../components/checkout/CheckoutModal';
import { Navbar } from '../components/layout/Navbar';
import { OfferMarquee } from '../components/layout/OfferMarquee';
import { Footer } from '../components/layout/Footer';

const barlowCondensed = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-barlow-condensed',
  display: 'swap',
});

const allura = Allura({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-allura',
  display: 'swap',
});

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-manrope',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'GymNation – The Fitness Hub | Premium Gym & Supplements in Bhatar, Surat',
  description:
    "Surat's premier fitness hub located at Bhatar. High performance training floor, international strength equipment, certified trainers, and authentic nutritional supplements.",
  keywords: ['Gym in Surat', 'Bhatar Gym', 'Supplements Surat', 'Whey Protein', 'Fitness Hub'],
  openGraph: {
    title: 'GymNation – The Fitness Hub | Bhatar, Surat, Gujarat',
    description: 'High performance training floor and 100% authentic nutrition store in Surat.',
    locale: 'en_IN',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${barlowCondensed.variable} ${allura.variable} ${manrope.variable} dark`}
    >
      <head>
        <script src="https://checkout.razorpay.com/v1/checkout.js" async />
      </head>
      <body className="bg-gn-black text-gn-ivory font-sans antialiased selection:bg-gn-maroon selection:text-white min-h-screen flex flex-col justify-between">
        <CustomerAuthProvider>
          <CartProvider>
            <WishlistProvider>
              {/* Global Header Navigation */}
              <Navbar />
              {/* Running Promo Marquee */}
              <OfferMarquee />

              {/* Main Page Content */}
              <div className="flex-1 w-full">
                {children}
              </div>

              {/* Global Footer */}
              <Footer />

              {/* E-Commerce & Customer Modals / Drawers */}
              <CartDrawer />
              <WishlistDrawer />
              <CustomerAuthModal />
              <CheckoutModal />
            </WishlistProvider>
          </CartProvider>
        </CustomerAuthProvider>
      </body>
    </html>
  );
}
