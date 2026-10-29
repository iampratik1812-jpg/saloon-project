import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import {
  Scissors,
  Menu,
  X,
  User as UserIcon,
  Calendar,
  Store,
  ShieldCheck,
  LogOut,
  ChevronDown
} from 'lucide-react';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string, data?: any) => void;
  onOpenAuth: (initialMode?: 'login' | 'register', defaultRole?: 'customer' | 'salon_owner') => void;
  onOpenRegisterSalon: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  onOpenAuth,
  onOpenRegisterSalon
}) => {
  const { user, logout, demoLogin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [demoMenuOpen, setDemoMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleNav = (view: string) => {
    onNavigate(view);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Top Demo Helper Bar for Evaluation */}
      <div className="bg-neutral-900 text-neutral-300 text-xs py-1.5 px-4 sm:px-8 border-b border-neutral-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white">SalonBook Demo:</span>
            <span className="text-neutral-400 hidden sm:inline">Current Persona:</span>
            <span className="text-emerald-400 font-medium">
              {user ? `${user.fullName} (${user.role.replace('_', ' ')})` : 'Guest Visitor'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-neutral-400 hidden md:inline">Quick Test Persona:</span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => demoLogin('customer')}
                className="px-2 py-0.5 text-xs bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded transition-colors"
                title="Switch to customer: Rohit Verma"
              >
                Customer
              </button>
              <button
                onClick={() => demoLogin('salon_owner')}
                className="px-2 py-0.5 text-xs bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded transition-colors"
                title="Switch to salon owner: Arjun Sharma (Urban Edge)"
              >
                Salon Owner
              </button>
              <button
                onClick={() => demoLogin('admin')}
                className="px-2 py-0.5 text-xs bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded transition-colors"
                title="Switch to Admin: Vikramaditya Roy"
              >
                Admin
              </button>
              {user && (
                <button
                  onClick={() => logout()}
                  className="px-2 py-0.5 text-xs text-rose-400 hover:text-rose-300 ml-1 transition-colors"
                >
                  Logout
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Top Bar Contract: 3 Zones */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-8">
          {/* Zone 1: Brand Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => handleNav('home')}
              className="flex items-center gap-2.5 text-left group"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-950 flex items-center justify-center text-amber-300 shadow-xs group-hover:scale-102 transition-transform">
                <Scissors className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-neutral-900 block leading-none">
                  SalonBook
                </span>
                <span className="text-[10px] tracking-wider uppercase text-neutral-500 font-medium">
                  India
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: Single-line Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-neutral-600">
            <button
              onClick={() => handleNav('home')}
              className={`transition-colors whitespace-nowrap hover:text-purple-950 cursor-pointer ${
                currentView === 'home' ? 'text-purple-950 font-semibold' : ''
              }`}
            >
              Home
            </button>
            <button
              onClick={() => handleNav('explore')}
              className={`transition-colors whitespace-nowrap hover:text-purple-950 cursor-pointer ${
                currentView === 'explore' ? 'text-purple-950 font-semibold' : ''
              }`}
            >
              Explore Salons
            </button>
            <button
              onClick={() => handleNav('services')}
              className={`transition-colors whitespace-nowrap hover:text-purple-950 cursor-pointer ${
                currentView === 'services' ? 'text-purple-950 font-semibold' : ''
              }`}
            >
              Services
            </button>
            <button
              onClick={() => {
                if (user?.role === 'salon_owner') {
                  handleNav('owner_dashboard');
                } else {
                  onOpenRegisterSalon();
                }
              }}
              className="transition-colors whitespace-nowrap hover:text-purple-950 cursor-pointer"
            >
              Become a Partner
            </button>

            {/* Role specific links */}
            {user?.role === 'customer' && (
              <button
                onClick={() => handleNav('customer_dashboard')}
                className={`transition-colors whitespace-nowrap hover:text-purple-950 cursor-pointer flex items-center gap-1.5 ${
                  currentView === 'customer_dashboard' ? 'text-purple-950 font-semibold' : ''
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>My Appointments</span>
              </button>
            )}

            {user?.role === 'salon_owner' && (
              <button
                onClick={() => handleNav('owner_dashboard')}
                className={`transition-colors whitespace-nowrap hover:text-purple-950 cursor-pointer flex items-center gap-1.5 ${
                  currentView === 'owner_dashboard' ? 'text-purple-950 font-semibold' : ''
                }`}
              >
                <Store className="w-4 h-4" />
                <span>Salon Dashboard</span>
              </button>
            )}

            {user?.role === 'admin' && (
              <button
                onClick={() => handleNav('admin_dashboard')}
                className={`transition-colors whitespace-nowrap hover:text-purple-950 cursor-pointer flex items-center gap-1.5 ${
                  currentView === 'admin_dashboard' ? 'text-purple-950 font-semibold' : ''
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Admin Console</span>
              </button>
            )}
          </nav>

          {/* Zone 3: 1 Primary Action & User Menu */}
          <div className="flex items-center gap-3 shrink-0">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 py-1.5 px-3 rounded-lg border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 transition-colors text-sm text-neutral-800"
                >
                  <div className="w-7 h-7 rounded-full bg-purple-950 text-white flex items-center justify-center text-xs font-semibold">
                    {user.fullName.charAt(0)}
                  </div>
                  <span className="hidden sm:inline font-medium max-w-[120px] truncate">
                    {user.fullName}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-neutral-500" />
                </button>

                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-neutral-200 py-1.5 z-50 text-sm"
                    onMouseLeave={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-neutral-100">
                      <p className="font-semibold text-neutral-900 truncate">{user.fullName}</p>
                      <p className="text-xs text-neutral-500 truncate">{user.email}</p>
                      <span className="inline-block mt-1 text-[11px] font-medium text-purple-900 bg-purple-50 px-2 py-0.5 rounded">
                        {user.role === 'admin'
                          ? 'Administrator'
                          : user.role === 'salon_owner'
                          ? 'Salon Owner'
                          : 'Customer'}
                      </span>
                    </div>

                    {user.role === 'customer' && (
                      <button
                        onClick={() => {
                          handleNav('customer_dashboard');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-neutral-50 flex items-center gap-2 text-neutral-700"
                      >
                        <Calendar className="w-4 h-4 text-neutral-400" />
                        My Appointments
                      </button>
                    )}

                    {user.role === 'salon_owner' && (
                      <button
                        onClick={() => {
                          handleNav('owner_dashboard');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-neutral-50 flex items-center gap-2 text-neutral-700"
                      >
                        <Store className="w-4 h-4 text-neutral-400" />
                        Manage Salon
                      </button>
                    )}

                    {user.role === 'admin' && (
                      <button
                        onClick={() => {
                          handleNav('admin_dashboard');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-neutral-50 flex items-center gap-2 text-neutral-700"
                      >
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        Admin Dashboard
                      </button>
                    )}

                    <div className="border-t border-neutral-100 my-1" />

                    <button
                      onClick={() => {
                        logout();
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-rose-50 text-rose-600 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenAuth('login')}
                  className="px-3.5 py-2 text-sm font-medium text-neutral-700 hover:text-purple-950 transition-colors"
                >
                  Login
                </button>
                <button
                  onClick={() => onOpenAuth('register')}
                  className="hidden sm:inline-block px-3.5 py-2 text-sm font-medium text-neutral-700 hover:text-purple-950 transition-colors"
                >
                  Sign Up
                </button>
              </div>
            )}

            {/* Primary Action Button */}
            <button
              onClick={() => handleNav('explore')}
              className="px-4 py-2.5 text-sm font-semibold text-white bg-purple-950 hover:bg-purple-900 rounded-xl transition-all shadow-sm hover:shadow active:scale-98 whitespace-nowrap shrink-0"
            >
              Book an Appointment
            </button>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-neutral-600 hover:text-neutral-900 rounded-lg hover:bg-neutral-100"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-neutral-200 bg-white px-4 pt-3 pb-6 space-y-2">
            <button
              onClick={() => handleNav('home')}
              className="w-full text-left py-2.5 px-3 rounded-lg hover:bg-neutral-50 text-sm font-medium text-neutral-800"
            >
              Home
            </button>
            <button
              onClick={() => handleNav('explore')}
              className="w-full text-left py-2.5 px-3 rounded-lg hover:bg-neutral-50 text-sm font-medium text-neutral-800"
            >
              Explore Salons
            </button>
            <button
              onClick={() => handleNav('services')}
              className="w-full text-left py-2.5 px-3 rounded-lg hover:bg-neutral-50 text-sm font-medium text-neutral-800"
            >
              Popular Services
            </button>
            <button
              onClick={() => {
                if (user?.role === 'salon_owner') {
                  handleNav('owner_dashboard');
                } else {
                  onOpenRegisterSalon();
                  setMobileMenuOpen(false);
                }
              }}
              className="w-full text-left py-2.5 px-3 rounded-lg hover:bg-neutral-50 text-sm font-medium text-neutral-800"
            >
              Become a Partner
            </button>

            {user?.role === 'customer' && (
              <button
                onClick={() => handleNav('customer_dashboard')}
                className="w-full text-left py-2.5 px-3 rounded-lg hover:bg-neutral-50 text-sm font-medium text-neutral-800"
              >
                My Appointments
              </button>
            )}

            {user?.role === 'salon_owner' && (
              <button
                onClick={() => handleNav('owner_dashboard')}
                className="w-full text-left py-2.5 px-3 rounded-lg hover:bg-neutral-50 text-sm font-medium text-neutral-800"
              >
                Salon Owner Dashboard
              </button>
            )}

            {user?.role === 'admin' && (
              <button
                onClick={() => handleNav('admin_dashboard')}
                className="w-full text-left py-2.5 px-3 rounded-lg hover:bg-neutral-50 text-sm font-medium text-neutral-800"
              >
                Admin Console
              </button>
            )}

            {!user && (
              <div className="pt-2 border-t border-neutral-100 flex gap-2">
                <button
                  onClick={() => {
                    onOpenAuth('login');
                    setMobileMenuOpen(false);
                  }}
                  className="flex-1 py-2 text-center text-sm font-medium border border-neutral-300 rounded-lg"
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    onOpenAuth('register');
                    setMobileMenuOpen(false);
                  }}
                  className="flex-1 py-2 text-center text-sm font-medium bg-neutral-900 text-white rounded-lg"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        )}
      </header>
    </>
  );
};
