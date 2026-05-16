'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { authClient } from '@/app/lib/auth-client';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  LayoutDashboard, 
  PlusCircle, 
  ListTodo, 
  Settings, 
  LogOut, 
  Grape, 
  Menu,
  ChevronDown
} from 'lucide-react';
import { cn } from '@/app/lib/utils';

export function Navigation() {
  const { data: session } = authClient.useSession();
  const pathname = usePathname();

  const handleLogout = async () => {
    await authClient.signOut();
    window.location.href = '/';
  };

  if (!session) return null;

  const isAdmin = session.user.role === 'administrateur';

  const navItems = [
    { label: 'Accueil', href: '/', icon: LayoutDashboard },
    { label: 'Incidents', href: '/incidents', icon: ListTodo },
    { label: 'Signaler', href: '/incidents/new', icon: PlusCircle },
  ];

  if (isAdmin) {
    navItems.push({ label: 'Supervision', href: '/admin/dashboard', icon: Settings });
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md dark:bg-zinc-950/80 dark:border-zinc-800">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight text-primary">
            <Grape className="h-6 w-6" />
            <span className="hidden sm:inline">CaveIssue</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Button
                key={item.href}
                variant="ghost"
                asChild
                className={cn(
                  "h-9 px-4 text-sm font-medium transition-colors",
                  pathname === item.href 
                    ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50" 
                    : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                )}
              >
                <Link href={item.href}>
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.label}
                </Link>
              </Button>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 flex items-center gap-2 pl-2 pr-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800">
                <Avatar className="h-8 w-8 border">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold uppercase">
                    {session.user.name?.substring(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:flex flex-col items-start text-left">
                  <span className="text-sm font-semibold leading-none">{session.user.name}</span>
                  <span className="text-[10px] text-zinc-500 capitalize leading-none mt-1">{session.user.role}</span>
                </div>
                <ChevronDown className="h-3 w-3 text-zinc-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 mt-2">
              <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {navItems.map((item) => (
                <DropdownMenuItem key={item.href} asChild className="md:hidden">
                  <Link href={item.href} className="flex items-center">
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.label}
                  </Link>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator className="md:hidden" />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600 cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                Se déconnecter
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
