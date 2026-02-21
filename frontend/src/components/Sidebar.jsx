import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, PlusCircle } from 'lucide-react';
import clsx from 'clsx';

export default function Sidebar() {
  const links = [
    { name: 'Dashboard', to: '/worker/dashboard', icon: LayoutDashboard },
    { name: 'My Cases', to: '/worker/cases', icon: FileText },
    { name: 'Create Case', to: '/worker/create-case', icon: PlusCircle },
  ];

  return (
    <div className="w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-4rem)] hidden md:block">
      <div className="h-full px-4 py-6 overflow-y-auto">
        <div className="mb-6 px-3">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Menu
          </p>
        </div>
        <nav className="space-y-1.5">
          {links.map((item) => (
            <NavLink
              key={item.name}
              to={item.to}
              className={({ isActive }) => clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive 
                  ? "bg-blue-50 text-blue-700" 
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <item.icon className={clsx("flex-shrink-0 h-5 w-5")} />
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
