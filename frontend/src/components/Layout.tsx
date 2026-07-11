import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Car, LogOut, User, Menu, X } from 'lucide-react';

const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Vehicles Inventory', href: '/', icon: Car },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col md:flex-row">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-950 border-r border-slate-800 p-6 flex-shrink-0">
        <div className="flex items-center gap-3 mb-8 px-2">
          <div className="bg-purple-600 p-2 rounded-lg text-white">
            <Car size={24} />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-wider bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
              AutoInventory
            </h1>
            <p className="text-xs text-slate-400">Inventory Portal</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-purple-600/10 text-purple-400 font-medium border border-purple-500/20'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                }`}
              >
                <Icon size={20} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {user && (
          <div className="mt-auto pt-6 border-t border-slate-800">
            <div className="flex items-center gap-3 px-2 mb-4">
              <div className="bg-slate-800 p-2 rounded-full text-slate-300">
                <User size={18} />
              </div>
              <div className="truncate">
                <p className="text-xs text-slate-400">Logged in as</p>
                <p className="text-sm font-semibold text-slate-200 truncate">{user.email || 'User'}</p>
                <span className="inline-flex items-center mt-0.5 px-2 py-0.5 rounded text-xs font-medium bg-purple-900/30 text-purple-400 border border-purple-800/30">
                  {user.role}
                </span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/5 transition-all duration-200 border border-transparent hover:border-red-500/10"
            >
              <LogOut size={20} />
              <span>Sign Out</span>
            </button>
          </div>
        )}
      </aside>

      {/* Header and Mobile Nav */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-slate-950 border-b border-slate-800 p-4 md:px-8 md:py-5 flex items-center justify-between">
          <div className="flex items-center gap-3 md:hidden">
            <div className="bg-purple-600 p-1.5 rounded text-white">
              <Car size={20} />
            </div>
            <span className="font-bold text-md text-slate-200">AutoInventory</span>
          </div>

          <div className="hidden md:block">
            <h2 className="text-xl font-bold text-slate-200">
              {navigation.find((n) => n.href === location.pathname)?.name || 'Dashboard'}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-full border border-slate-800 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-slate-400">Services Active</span>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </header>

        {/* Mobile menu panel */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-slate-950 border-b border-slate-800 px-6 py-4 space-y-4">
            <nav className="space-y-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl ${
                      isActive
                        ? 'bg-purple-600/10 text-purple-400 font-medium'
                        : 'text-slate-400'
                    }`}
                  >
                    <Icon size={20} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {user && (
              <div className="pt-4 border-t border-slate-800">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Role:</span>
                    <span className="px-2 py-0.5 rounded text-xs font-semibold bg-purple-900/30 text-purple-400 border border-purple-800/30">
                      {user.role}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 text-xs text-red-400"
                  >
                    <LogOut size={16} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
