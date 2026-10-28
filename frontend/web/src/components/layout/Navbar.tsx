'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import {
  PhoneIcon,
  MailIcon,
  MapPinIcon,
  CartIcon,
  HeartIcon,
  UserIcon,
  MenuIcon,
  CloseIcon,
  WhatsAppIcon,
} from '../common/Icons';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { totalCount, setIsDrawerOpen } = useCart();
  const { totalWishlistCount, setIsWishlistOpen } = useWishlist();
  const { customer, isAuthenticated, openAuthModal, logout } = useCustomerAuth();
  const pathname = usePathname();

  const navLinks = [
    { label: 'HOME', href: '/' },
    { label: 'ABOUT US', href: '/about' },
    { label: 'WHY US', href: '/why-us' },
    { label: 'GALLERY', href: '/gallery' },
    { label: 'MEMBERSHIP', href: '/membership' },
    { label: 'PRODUCTS', href: '/products' },
    { label: 'TESTIMONIALS', href: '/testimonials' },
    { label: 'FAQ', href: '/faq' },
    { label: 'CONTACT', href: '/contact' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-gn-black/95 backdrop-blur-md border-b border-gn-border">
      {/* Top Utility Contact Bar */}
      <div className="hidden md:flex items-center justify-between px-3 sm:px-4 xl:px-6 2xl:px-8 py-1.5 bg-gn-surface text-[11px] font-mono uppercase tracking-widest text-gn-muted border-b border-gn-border/60">
        <div className="flex items-center gap-6">
          <a
            href="tel:+918511031349"
            className="flex items-center gap-2 hover:text-gn-gold transition-colors font-bold"
          >
            <PhoneIcon className="w-3.5 h-3.5 text-gn-maroon" />
            <span className="font-extrabold text-[#F2B91D]">+91 85110 31349</span>
          </a>
          <a
            href="mailto:info@gymnation.in"
            className="flex items-center gap-2 hover:text-gn-gold transition-colors font-bold"
          >
            <MailIcon className="w-3.5 h-3.5 text-gn-maroon" />
            <span className="text-zinc-200">INFO@GYMNATION.IN</span>
          </a>
          <span className="flex items-center gap-2 text-zinc-200 font-bold">
            <MapPinIcon className="w-3.5 h-3.5 text-[#F2B91D]" />
            <span>BHATAR, SURAT, GUJARAT 395017</span>
          </span>
        </div>

        <div className="flex items-center gap-4">
          <a
            href="https://wa.me/918511031349"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-[#25D366] hover:brightness-110 font-medium transition-all"
          >
            <WhatsAppIcon className="w-4 h-4 text-[#25D366]" />
            <span>+91 85110 31349</span>
          </a>
          <span className="text-gn-border">|</span>
          <span className="text-gn-gold font-medium">OPEN DAILY: 6:00 AM – 10:00 PM</span>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <nav className="flex items-center justify-between gap-2 xl:gap-3 px-3 sm:px-4 xl:px-6 2xl:px-8 py-2.5 sm:py-3 w-full">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 sm:gap-2.5 shrink-0 group select-none">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/gymnationlogo.png"
            alt="GymNation Logo"
            className="w-8 h-8 sm:w-9 sm:h-9 object-contain shrink-0"
          />
          <div className="shrink-0 flex flex-col justify-center">
            <div className="font-heading text-lg sm:text-xl xl:text-2xl font-bold tracking-wider text-gn-ivory uppercase group-hover:text-gn-gold transition-colors leading-none whitespace-nowrap">
              GYMNATION
            </div>
            <div className="text-[8.5px] sm:text-[9.5px] font-mono font-medium tracking-widest text-gn-gold uppercase mt-0.5 leading-none whitespace-nowrap">
              THE FITNESS HUB
            </div>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden lg:flex items-center gap-1 xl:gap-2 2xl:gap-3.5 shrink-0">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.label}
                href={link.href}
                className={`text-[10px] xl:text-[11px] 2xl:text-xs font-sans font-medium uppercase tracking-wider transition-colors relative py-1 px-1 whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'text-gn-gold border-b-2 border-gn-gold font-semibold'
                    : 'text-zinc-300 hover:text-gn-gold'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Cart Drawer Trigger */}
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="relative p-1.5 sm:p-2 bg-gn-surface border border-gn-border hover:border-gn-gold text-gn-ivory transition-colors shrink-0"
            aria-label="View Shopping Cart"
            title="Cart"
          >
            <CartIcon className="w-4 h-4 text-gn-gold" />
            {totalCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-gn-maroon text-white font-mono text-[9px] font-bold px-1.5 py-0.2 border border-gn-gold rounded-full">
                {totalCount}
              </span>
            )}
          </button>

          {/* Wishlist Drawer Trigger - Placed strictly on the right side of Cart icon as requested */}
          <button
            onClick={() => setIsWishlistOpen(true)}
            className="relative p-1.5 sm:p-2 bg-gn-surface border border-gn-border hover:border-red-500 text-gn-ivory transition-colors shrink-0"
            aria-label="View Saved Wishlist"
            title="Wishlist"
          >
            <HeartIcon className="w-4 h-4 text-red-500" filled={totalWishlistCount > 0} />
            {totalWishlistCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white font-mono text-[9px] font-bold px-1.5 py-0.2 border border-white/20 rounded-full">
                {totalWishlistCount}
              </span>
            )}
          </button>

          {/* Customer Authentication Status / Button */}
          {isAuthenticated && customer ? (
            <div className="hidden sm:flex items-center shrink-0">
              <Link
                href="/profile"
                className="px-2.5 py-1.5 bg-white/5 border border-white/10 hover:border-[#F2B91D] flex items-center gap-1.5 transition-colors group shrink-0"
                title="View Digital Pass & Profile"
              >
                <UserIcon className="w-3.5 h-3.5 text-[#F2B91D] shrink-0" />
                <span className="font-sans font-medium text-xs text-white max-w-[90px] xl:max-w-[120px] truncate group-hover:text-[#F2B91D]">
                  {customer.name}
                </span>
                <span className="text-[8.5px] font-mono font-semibold text-[#F2B91D] bg-[#F2B91D]/15 px-1.5 py-0.5 border border-[#F2B91D]/30 shrink-0">
                  PASS
                </span>
              </Link>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-1 xl:gap-1.5 shrink-0">
              <button
                onClick={() => openAuthModal('login')}
                className="px-2.5 py-1.5 bg-transparent border border-white/20 hover:border-[#F2B91D] text-white font-sans font-semibold text-[11px] uppercase tracking-wider transition-colors shrink-0 whitespace-nowrap"
              >
                LOGIN
              </button>
              <button
                onClick={() => openAuthModal('register')}
                className="px-2.5 py-1.5 bg-[#7A1F25] hover:bg-[#92262D] text-white font-sans font-semibold text-[11px] uppercase tracking-wider transition-colors shrink-0 whitespace-nowrap"
              >
                SIGN UP
              </button>
            </div>
          )}

          {/* Join Membership Primary CTA */}
          <Link
            href="/membership"
            className="hidden sm:inline-flex items-center justify-center px-3 xl:px-3.5 py-2 bg-gn-gold hover:bg-yellow-400 text-gn-black font-sans font-bold text-[11px] xl:text-xs uppercase tracking-wider transition-colors shadow-md shrink-0 whitespace-nowrap"
          >
            JOIN NOW
          </Link>

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 sm:p-2 bg-gn-surface border border-gn-border text-gn-ivory hover:text-gn-gold shrink-0"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <CloseIcon className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-gn-surface border-b border-gn-border px-6 py-6 space-y-4">
          {/* Mobile Contact Quick Bar */}
          <div className="pb-4 border-b border-gn-border space-y-2 text-xs font-mono">
            <div className="flex items-center gap-2 text-gn-gold font-bold">
              <PhoneIcon className="w-3.5 h-3.5" />
              <a href="tel:+918511031349">+91 85110 31349</a>
            </div>
            <div className="flex items-center gap-2 text-zinc-400">
              <MapPinIcon className="w-3.5 h-3.5" />
              <span>Bhatar, Surat, Gujarat</span>
            </div>
            <div className="flex items-center gap-2 text-zinc-400">
              <span className="text-gn-gold font-bold">TIMINGS:</span>
              <span>6:00 AM – 10:00 PM</span>
            </div>
            <a
              href="https://wa.me/918511031349"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-[#25D366] font-bold pt-1"
            >
              <WhatsAppIcon className="w-4 h-4 text-[#25D366]" />
              <span>Chat on WhatsApp</span>
            </a>
          </div>

          <div className="space-y-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block py-2.5 text-sm font-sans uppercase tracking-wider ${
                    isActive ? 'text-gn-gold font-bold' : 'text-zinc-300 hover:text-gn-gold font-medium'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Mobile Auth Actions */}
          <div className="pt-2 pb-2 border-t border-gn-border flex gap-2">
            {isAuthenticated && customer ? (
              <div className="w-full space-y-2">
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-between p-2.5 bg-white/5 border border-[#F2B91D]/40 text-white hover:bg-white/10 transition-colors"
                >
                  <span className="font-sans font-medium text-xs truncate text-white">
                    👤 {customer.name}
                  </span>
                  <span className="text-[10px] font-mono font-semibold text-black bg-[#F2B91D] px-2 py-0.5">
                    VIEW DIGITAL PASS →
                  </span>
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-1 text-center text-xs font-mono font-medium text-red-400 hover:text-white"
                >
                  LOGOUT
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuthModal('login');
                  }}
                  className="flex-1 py-2.5 border border-white/20 text-white font-sans font-semibold text-xs uppercase tracking-wider text-center"
                >
                  LOGIN
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuthModal('register');
                  }}
                  className="flex-1 py-2.5 bg-[#7A1F25] text-white font-sans font-semibold text-xs uppercase tracking-wider text-center"
                >
                  SIGN UP
                </button>
              </>
            )}
          </div>

          <Link
            href="/membership"
            onClick={() => setMobileMenuOpen(false)}
            className="block w-full py-3 bg-gn-gold text-gn-black text-center font-sans font-bold text-sm uppercase tracking-wider"
          >
            JOIN MEMBERSHIP NOW
          </Link>
        </div>
      )}
    </header>
  );
};
