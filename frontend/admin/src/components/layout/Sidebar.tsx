'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth, AdminRole } from '../../context/AuthContext';
import {
  DashboardIcon,
  SliderIcon,
  TagIcon,
  CategoryIcon,
  ProductIcon,
  OrderIcon,
  MembershipIcon,
  FaqIcon,
  SettingsIcon,
  MailIcon,
  TrainerIcon,
  ShieldIcon,
} from '../common/Icons';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  allowedRoles?: AdminRole[];
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'CORE DESK',
    items: [
      { label: 'Dashboard & Analytics', href: '/', icon: DashboardIcon },
    ],
  },
  {
    title: 'STORE & COMMERCE',
    items: [
      { label: 'Categories', href: '/categories', icon: CategoryIcon, allowedRoles: ['SUPER_ADMIN', 'MANAGER'] },
      { label: 'Inventory Matrix', href: '/inventory', icon: ProductIcon, allowedRoles: ['SUPER_ADMIN', 'MANAGER'] },
      { label: 'Promo Coupons & Offers', href: '/coupons', icon: TagIcon, allowedRoles: ['SUPER_ADMIN', 'MANAGER'] },
      { label: 'Product Catalog', href: '/products', icon: ProductIcon, allowedRoles: ['SUPER_ADMIN', 'MANAGER'] },
      { label: 'Orders & Dispatch', href: '/orders', icon: OrderIcon },
    ],
  },
  {
    title: 'MEMBERS & CRM',
    items: [
      { label: 'Membership Desk', href: '/memberships', icon: MembershipIcon },
      { label: 'Membership Plans', href: '/plans', icon: MembershipIcon, allowedRoles: ['SUPER_ADMIN', 'MANAGER'] },
      { label: 'Trainers Management', href: '/trainers', icon: TrainerIcon, allowedRoles: ['SUPER_ADMIN', 'MANAGER'] },
      { label: 'Leads & Enquiries', href: '/leads', icon: MailIcon },
    ],
  },
  {
    title: 'WEBSITE CMS',
    items: [
      { label: 'Hero Slider (Video & Visual)', href: '/hero-slides', icon: SliderIcon, allowedRoles: ['SUPER_ADMIN', 'MANAGER'] },
      { label: 'Offer Marquee', href: '/marquee', icon: TagIcon, allowedRoles: ['SUPER_ADMIN', 'MANAGER'] },
      { label: 'FAQ & Moderation', href: '/faq', icon: FaqIcon, allowedRoles: ['SUPER_ADMIN', 'MANAGER'] },
    ],
  },
  {
    title: 'SYSTEM & SETTINGS',
    items: [
      { label: 'Site & Store Settings', href: '/settings', icon: SettingsIcon, allowedRoles: ['SUPER_ADMIN'] },
    ],
  },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { user, logout, hasRole } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-gn-surface border-b border-gn-border sticky top-0 z-40 w-full shrink-0">
        <div className="flex items-center gap-2">
          <span className="font-heading text-lg font-bold tracking-wider text-gn-ivory">GYMNATION</span>
          <span className="text-[10px] px-2 py-0.5 bg-gn-gold/10 border border-gn-gold/30 text-gn-gold uppercase font-mono tracking-widest font-bold">ADMIN</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="px-3 py-1.5 bg-gn-black border border-gn-border text-xs uppercase tracking-wider text-gn-ivory hover:border-gn-gold flex items-center gap-1.5 font-mono"
        >
          {mobileOpen ? '✕ CLOSE' : '☰ MENU'}
        </button>
      </div>

      {/* Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Main Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 h-full w-72 max-w-[85vw] bg-gn-surface border-r border-gn-border flex flex-col z-50 transition-transform duration-200 ease-in-out lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:shrink-0 ${
          mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-gn-border">
          <div className="font-heading text-2xl font-extrabold tracking-widest text-gn-ivory flex items-center gap-2">
            <span>GYMNATION</span>
          </div>
          <div className="text-[10px] text-gn-gold tracking-widest uppercase mt-0.5 font-mono">
            THE FITNESS HUB / CONTROL CONSOLE
          </div>
          {user && (
            <div className="mt-3 pt-3 border-t border-gn-border/50 flex flex-col">
              <span className="text-xs font-semibold text-gn-ivory truncate">{user.name}</span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] px-1.5 py-0.5 bg-gn-maroon/40 border border-gn-maroon text-gn-ivory font-mono uppercase tracking-wider">
                  {user.role.replace('_', ' ')}
                </span>
                <span className="text-[11px] text-gn-muted truncate">{user.email}</span>
              </div>
            </div>
          )}
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {NAV_SECTIONS.map((section) => {
            const filteredItems = section.items.filter((item) =>
              item.allowedRoles ? hasRole(...item.allowedRoles) : true
            );

            if (filteredItems.length === 0) return null;

            return (
              <div key={section.title} className="space-y-1">
                <div className="px-3 py-1 text-[10px] font-mono tracking-widest text-gn-muted uppercase flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-gn-maroon inline-block" />
                  <span>{section.title}</span>
                </div>
                <div className="space-y-0.5">
                  {filteredItems.map((item) => {
                    const isActive = pathname === item.href;
                    const IconComponent = item.icon;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2 text-xs font-mono uppercase tracking-wider transition-colors ${
                          isActive
                            ? 'bg-gn-maroon text-white font-bold border-l-2 border-gn-gold'
                            : 'text-gn-muted hover:text-gn-ivory hover:bg-gn-black'
                        }`}
                      >
                        <IconComponent className={`w-4 h-4 shrink-0 ${isActive ? 'text-gn-gold' : 'text-zinc-500'}`} />
                        <span className="truncate">{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info & Logout */}
        <div className="p-4 border-t border-gn-border bg-gn-black/40">
          <button
            onClick={() => logout()}
            className="w-full py-2 bg-gn-surface hover:bg-gn-maroon border border-gn-border text-xs uppercase font-mono tracking-wider text-gn-ivory transition-colors flex items-center justify-center gap-2"
          >
            <span>LOGOUT CONSOLE</span>
          </button>
          <div className="text-[10px] text-zinc-500 font-mono text-center mt-2 uppercase">
            GYMNATION SURAT V1.0 &bull; LIVE
          </div>
        </div>
      </aside>
    </>
  );
};
