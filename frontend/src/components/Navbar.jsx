import { Link } from 'react-router-dom';
import { Activity } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex-shrink-0 flex items-center gap-2">
              <div className="bg-blue-900 p-1.5 rounded-lg shadow-sm">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <span className="font-bold text-xl text-slate-800 tracking-tight">Expert <span className="text-blue-900">Connect</span></span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
