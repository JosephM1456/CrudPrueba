'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/productos', label: 'Productos' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-surface-100 text-surface-900 border-r border-surface-200 flex flex-col shrink-0">
      {/* Logo */}
      <div className="p-5 border-b border-surface-200">
        <div>
          <h1 className="font-display text-base font-bold tracking-tight text-surface-900">Productos</h1>
          <p className="text-[11px] text-surface-600 font-medium">Panel de gestion</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group ${
                isActive
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-surface-700 hover:bg-surface-200 hover:text-surface-900'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-surface-200">
        <p className="text-[11px] text-surface-600 text-center">Prototipo Demo v1.0</p>
      </div>
    </aside>
  );
}
