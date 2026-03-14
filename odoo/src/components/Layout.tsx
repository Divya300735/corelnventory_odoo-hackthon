import { useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Package, LayoutDashboard, Settings, ShoppingCart, Truck, History, Map, PieChart, Sun, Moon, Users, Building2, ArrowRightLeft, LogOut } from 'lucide-react';
import { cn } from '../lib/utils';
import { useThemeStore } from '../store/themeStore';
import { useAuthStore } from '../store/authStore';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Products', href: '/products', icon: Package },
  { name: 'Receipts', href: '/receipts', icon: ShoppingCart },
  { name: 'Operations', href: '/operations', icon: ArrowRightLeft },
  { name: 'Deliveries', href: '/deliveries', icon: Truck },
  { name: 'Warehouse', href: '/warehouse', icon: Map },
  { name: 'Customers', href: '/customers', icon: Users, role: 'manager' },
  { name: 'Suppliers', href: '/suppliers', icon: Building2, role: 'manager' },
  { name: 'History', href: '/history', icon: History, role: 'manager' },
  { name: 'Reports', href: '/reports', icon: PieChart, role: 'manager' },
  { name: 'Settings', href: '/settings', icon: Settings, role: 'manager' },
];

export default function Layout() {
  const location = useLocation();
  const { isDark, toggleTheme } = useThemeStore();
  const { user, logout } = useAuthStore();

  const filteredNavigation = navigation.filter(item => 
    !item.role || item.role === user?.role
  );

  // Apply saved theme on mount
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'JD';

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Sidebar */}
      <div className="hidden md:flex flex-col w-64 glass border-r">
        <div className="flex h-16 items-center px-6 border-b glass">
          <Package className="h-6 w-6 text-primary mr-2" />
          <span className="text-xl font-bold font-heading bg-gradient-to-r from-primary to-accent bg-clip-text">CoreInventory</span>
        </div>
        <nav className="flex-1 space-y-1 px-4 py-4 overflow-y-auto">
          {filteredNavigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-base',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                )}
              >
                <item.icon
                  className={cn(
                    'mr-3 flex-shrink-0 h-5 w-5 transition-base group-hover:scale-110',
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  )}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t glass">
          <button
            onClick={logout}
            className="flex items-center w-full px-3 py-2 text-sm font-medium text-rose-500 rounded-md hover:bg-rose-500/10 transition-all group"
          >
            <LogOut className="mr-3 h-5 w-5 transition-transform group-hover:-translate-x-1" />
            Logout
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="flex h-16 items-center justify-between px-6 border-b glass">
          <div className="flex items-center">
            {/* Mobile menu trigger could go here */}
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl hover:bg-secondary border border-transparent hover:border-border transition-all duration-200"
              title="Toggle theme"
            >
              {isDark
                ? <Sun className="w-5 h-5 text-amber-400" />
                : <Moon className="w-5 h-5 text-indigo-500" />
              }
            </button>
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center font-bold text-white text-xs mr-2">
              {initials}
            </div>
            <button
              onClick={logout}
              className="p-2 rounded-xl hover:bg-rose-500/10 text-rose-500 border border-transparent hover:border-rose-500/20 transition-all duration-200"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6 bg-secondary/30">
          <div className="mx-auto max-w-7xl animate-in fade-in duration-500">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
