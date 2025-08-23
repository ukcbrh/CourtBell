"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Gavel, LayoutDashboard, CalendarPlus, Scale, Users, Briefcase, Settings } from "lucide-react";

import {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarInset,
  SidebarContent,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useCases } from "@/hooks/use-cases";
import { useCaseAlarms } from "@/hooks/use-case-alarms";
import { Skeleton } from "@/components/ui/skeleton";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { cases, isLoaded } = useCases();
  useCaseAlarms(cases);

  const menuItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/schedule/new", label: "New Case", icon: CalendarPlus },
    { href: "/clients", label: "Clients", icon: Users },
    { href: "/juniors", label: "Junior Advocates", icon: Briefcase },
    { href: "/legal-tools", label: "Legal Tools", icon: Gavel },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2 group-data-[collapsible=icon]:-ml-1">
             <div className="flex items-center justify-center h-10 w-10">
              <Scale className="h-6 w-6 text-sidebar-foreground" />
            </div>
            <h1 className="text-xl font-headline font-bold text-sidebar-foreground group-data-[collapsible=icon]:hidden">
              CourtBell
            </h1>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.label}>
                <Link href={item.href} passHref>
                  <SidebarMenuButton
                    isActive={item.href === '/' ? pathname === item.href : pathname.startsWith(item.href)}
                    tooltip={item.label}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="flex items-center justify-between border-b p-4 md:p-6 md:py-4">
            <div className="flex items-center gap-2">
                 <SidebarTrigger className="md:hidden" />
                <h2 className="text-xl font-headline font-semibold">
                    {menuItems.find(item => item.href === '/' ? pathname === item.href : pathname.startsWith(item.href))?.label || 'CourtBell'}
                </h2>
            </div>
        </header>
        <main className="p-4 md:p-6">
          {!isLoaded ? <Skeleton className="h-[400px] w-full" /> : children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
