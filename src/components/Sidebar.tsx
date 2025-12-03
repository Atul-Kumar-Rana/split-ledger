import { Home, Plus, Receipt, Users, User, X } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Create Event', href: '/events/create', icon: Plus },
  { name: 'Transactions', href: '/transactions', icon: Receipt },
  { name: 'Contacts', href: '/users', icon: Users },
  { name: 'Profile', href: '/profile', icon: User },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-full w-64 transform border-r border-border bg-sidebar transition-transform duration-300 ease-in-out lg:sticky lg:top-16 lg:z-0 lg:h-[calc(100vh-4rem)] lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-6 lg:hidden">
          <span className="text-lg font-semibold">Menu</span>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="space-y-2 p-4">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-glow"
              activeClassName="bg-sidebar-accent text-primary font-medium shadow-glow"
            >
              <item.icon className="h-5 w-5" />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
