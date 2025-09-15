'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

import { cn } from '@/lib/utils';
import { useApp } from '@/context/app-provider';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';

const navItems = [
  { href: '/calendar', icon: Icons.Calendar, label: 'Calendar' },
  { href: '/dashboard', icon: Icons.Dashboard, label: 'Dashboard' },
  { href: '/profile', icon: Icons.Profile, label: 'Profile' },
];

function AppLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useApp();
  const { setOpenMobile } = useSidebar();

  const handleLinkClick = () => {
    setOpenMobile(false);
  };

  return (
    <>
      <header className="sticky top-0 flex h-14 items-center gap-4 border-b bg-card px-4 sm:h-16 sm:px-6 z-30 w-full">
        <SidebarTrigger className="md:hidden" />
        <div className="flex-1">{/* Optional Header Title can go here */}</div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Image
                src={user.avatarUrl}
                alt={user.name}
                width={36}
                height={36}
                className="rounded-full"
                data-ai-hint="profile picture"
              />
              <span className="sr-only">Toggle user menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>Support</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>
      <div className="flex min-h-[calc(100vh-3.5rem)] sm:min-h-[calc(100vh-4rem)]">
        <Sidebar className="border-r bg-card">
          <SidebarHeader className="p-4 mt-2">
            <Link href="/calendar" className="flex items-center gap-2">
              <Icons.Logo className="w-8 h-8 text-primary" />
              <span className="font-bold text-lg group-data-[collapsible=icon]:hidden">
                Content Compass
              </span>
            </Link>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    tooltip={item.label}
                    onClick={handleLinkClick}
                  >
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="p-4 border-t">
            <div className="flex items-center gap-3">
              <Image
                src={user.avatarUrl}
                alt={user.name}
                width={40}
                height={40}
                className="rounded-full"
                data-ai-hint="profile picture"
              />
              <div className="overflow-hidden group-data-[collapsible=icon]:hidden">
                <p className="font-semibold truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  Pro Plan
                </p>
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
       <footer className="border-t bg-background px-4 py-4 sm:px-6">
          <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-muted-foreground gap-2">
            <p>&copy; {new Date().getFullYear()} Content Compass. All rights reserved.</p>
            <nav className="flex gap-4">
              <Link href="/terms" className="hover:text-primary">Terms</Link>
              <Link href="/privacy" className="hover:text-primary">Privacy Policy</Link>
              <Link href="#" className="hover:text-primary">About Us</Link>
              <Link href="#" className="hover:text-primary">Contact Us</Link>
            </nav>
          </div>
        </footer>
    </>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full flex-col bg-background">
        <AppLayoutContent>{children}</AppLayoutContent>
      </div>
    </SidebarProvider>
  );
}
