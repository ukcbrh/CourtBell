
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Gavel, LayoutDashboard, CalendarPlus, Scale, Users, Briefcase, Settings, Home, Receipt, LogOut } from "lucide-react";

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
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useCases } from "@/hooks/use-cases";
import { useCaseAlarms } from "@/hooks/use-case-alarms";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUserProfile } from "@/hooks/use-user-profile";

function MainLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { cases, isLoaded } = useCases();
  const { setOpenMobile } = useSidebar();
  useCaseAlarms(cases);
  
  const { user, loading, logout } = useAuth();
  const { profile } = useUserProfile();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);


  const menuItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/schedule/new", label: "New Case", icon: CalendarPlus },
    { href: "/clients", label: "Clients", icon: Users },
    { href: "/juniors", label: "Junior Advocates", icon: Briefcase },
    { href: "/payments", label: "Payments", icon: Receipt },
    { href: "/settings", label: "Settings", icon: Settings },
  ];
  
  const handleLogout = async () => {
    await logout();
    router.push('/login');
  }
  
  if (loading || !user) {
    return (
       <div className="flex items-center justify-center h-screen">
          <div className="flex flex-col items-center gap-4">
            <Scale className="h-12 w-12 animate-pulse text-primary" />
            <p className="text-muted-foreground">Loading CourtBell...</p>
          </div>
       </div>
    )
  }

  return (
    <>
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
        <SidebarHeader className="border-b border-sidebar-border">
            <div className="flex items-center gap-3 p-2">
                <Avatar className="h-9 w-9">
                    <AvatarImage src={profile.photoDataUrl} />
                    <AvatarFallback>{profile.name?.charAt(0) || user.email?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col group-data-[collapsible=icon]:hidden overflow-hidden">
                    <span className="font-semibold text-sm truncate">{profile.name || user.email}</span>
                     <span className="text-xs text-sidebar-foreground/70 truncate">{user.email}</span>
                </div>
                 <Button variant="ghost" size="icon" className="group-data-[collapsible=icon]:hidden ml-auto hover:bg-sidebar-accent hover:text-sidebar-accent-foreground" onClick={handleLogout}>
                    <LogOut className="h-4 w-4"/>
                 </Button>
            </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.label} onClick={() => setOpenMobile(false)}>
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
             <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Link href="/" passHref>
                            <Button variant="ghost" size="icon">
                                <Home className="h-5 w-5" />
                            </Button>
                        </Link>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Go to Dashboard</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </header>
        <main className="p-4 md:p-6">
          {!isLoaded ? <Skeleton className="h-[400px] w-full" /> : children}
        </main>
      </SidebarInset>
    </>
  );
}


export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <MainLayoutContent>{children}</MainLayoutContent>
    </SidebarProvider>
  )
}
