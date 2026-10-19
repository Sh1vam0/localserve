import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Compass, 
  CalendarDays, 
  User, 
  LogOut, 
  Menu, 
  X, 
  Store, 
  ShieldCheck, 
  Wallet,
  ArrowRight,
  Plus,
  LocateFixed
} from 'lucide-react';
import { useLocationContext } from '../context/LocationContext';
import LocationPicker from './LocationPicker';

const Navbar = () => {
  const { user, isAuthenticated, isCustomer, isOwner, isAdmin, logout } = useAuth();
  const { location: userGeoLocation, detecting: isDetectingGeo, detectLiveLocation } = useLocationContext();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMobileMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 border-b border-[#e4e8e1]/90 bg-[#f7f8f5]/90 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* NearNest Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#2f6b4f] text-[#d9f36a] shadow-sm group-hover:scale-105 transition-transform">
              <Compass size={22} />
            </span>
            <span className="text-left">
              <span className="block text-xl font-extrabold tracking-tight text-[#17231d]">
                NearNest<span className="text-[#2f6b4f]">.</span>
              </span>
              <span className="-mt-1 block text-[10px] font-semibold uppercase tracking-[.2em] text-[#6b756e]">
                Good things, nearby
              </span>
            </span>
          </Link>

          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className={`nav-link ${isActive('/') ? 'nav-active' : ''}`}
            >
              Discover
            </Link>

            <Link
              to="/search"
              className={`nav-link ${isActive('/search') ? 'nav-active' : ''}`}
            >
              Explore All
            </Link>

            {/* Location Pill & Dropdown ("Near me") */}
            <LocationPicker />

            {isAuthenticated && isCustomer && (
              <>
                <Link
                  to="/my-bookings"
                  className={`nav-link ${isActive('/my-bookings') ? 'nav-active' : ''}`}
                >
                  My bookings
                </Link>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-[#e7eee6] text-[#2f6b4f] rounded-full text-xs font-bold">
                  <Wallet size={13} />
                  <span>Wallet: ₹{user?.walletBalance || 0}</span>
                </div>
              </>
            )}

            {isAuthenticated && isOwner && (
              <>
                <Link
                  to="/owner/dashboard"
                  className={`nav-link ${isActive('/owner/dashboard') ? 'nav-active' : ''}`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/owner/bookings"
                  className={`nav-link ${isActive('/owner/bookings') ? 'nav-active' : ''}`}
                >
                  Bookings
                </Link>
                <Link
                  to="/owner/services"
                  className={`nav-link ${isActive('/owner/services') ? 'nav-active' : ''}`}
                >
                  Services
                </Link>
              </>
            )}

            {isAuthenticated && isAdmin && (
              <>
                <Link
                  to="/admin/dashboard"
                  className={`nav-link ${isActive('/admin/dashboard') ? 'nav-active' : ''}`}
                >
                  Admin Hub
                </Link>
                <Link
                  to="/admin/businesses"
                  className={`nav-link ${isActive('/admin/businesses') ? 'nav-active' : ''}`}
                >
                  Listings
                </Link>
              </>
            )}

            {!isAuthenticated && (
              <Link
                to="/register"
                className="nav-link"
              >
                List your business
              </Link>
            )}
          </nav>

          {/* User Auth Actions */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3 pl-3 border-l border-[#e4e8e1]">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 text-xs font-bold text-[#17231d] hover:text-[#2f6b4f]"
                >
                  <div className="w-8 h-8 rounded-full bg-[#2f6b4f] text-[#d9f36a] flex items-center justify-center font-bold text-xs uppercase">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <span className="max-w-[110px] truncate">{user?.name}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 text-[#6b756e] hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                  title="Sign Out"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="btn-dark py-2 px-4 text-xs"
                >
                  <span>Log In</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Right Controls: 1-Tap Location Pill + Hamburger Menu */}
          <div className="md:hidden flex items-center gap-2">
            <LocationPicker />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-[#17231d] hover:bg-gray-100"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* SLIDE-OVER NAVIGATION DRAWER */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden animate-in fade-in duration-200">
          {/* Backdrop blur */}
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="absolute inset-0 bg-[#0F221A]/50 backdrop-blur-xs transition-opacity"
          />

          {/* Drawer content panel */}
          <div className="absolute right-0 top-0 bottom-0 w-72 sm:w-80 bg-[#F6F5F0] p-6 shadow-2xl flex flex-col justify-between border-l border-[#e4e8e1]">
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-[#e4e8e1]">
                <div className="flex items-center gap-2">
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#0F221A] text-[#DDF279]">
                    <Compass size={18} />
                  </span>
                  <span className="font-bold text-base text-[#0F221A]">
                    NearNest<span className="text-emerald-700">.</span>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-[#0F221A]/60 hover:text-[#0F221A] hover:bg-black/5"
                  aria-label="Close menu"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="mt-5 space-y-1">
                <Link
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2.5 rounded-xl text-sm font-bold text-[#0F221A] hover:bg-white transition"
                >
                  Discover
                </Link>
                <Link
                  to="/search"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2.5 rounded-xl text-sm font-bold text-[#0F221A] hover:bg-white transition"
                >
                  Explore All Studios
                </Link>

                {isAuthenticated ? (
                  <>
                    {isCustomer && (
                      <Link
                        to="/my-bookings"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block px-3 py-2.5 rounded-xl text-sm font-bold text-[#0F221A] hover:bg-white transition"
                      >
                        My Bookings & OTPs
                        <span className="ml-2 text-xs font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                          ₹{user?.walletBalance || 0}
                        </span>
                      </Link>
                    )}
                    {isOwner && (
                      <Link
                        to="/owner/dashboard"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block px-3 py-2.5 rounded-xl text-sm font-bold text-[#0F221A] hover:bg-white transition"
                      >
                        Owner Dashboard
                      </Link>
                    )}
                    {isAdmin && (
                      <Link
                        to="/admin/dashboard"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block px-3 py-2.5 rounded-xl text-sm font-bold text-[#0F221A] hover:bg-white transition"
                      >
                        Admin Hub
                      </Link>
                    )}
                    <Link
                      to="/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-3 py-2.5 rounded-xl text-sm font-bold text-[#0F221A] hover:bg-white transition"
                    >
                      Profile ({user?.name})
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 transition"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <div className="pt-4 mt-2 border-t border-[#e4e8e1] space-y-2">
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="btn-dark w-full justify-center text-xs"
                    >
                      Log In
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="btn-lime w-full justify-center text-xs"
                    >
                      List Your Studio
                    </Link>
                  </div>
                )}
              </nav>
            </div>

            {/* Bottom Verification Guarantee Card */}
            <div className="p-3.5 rounded-2xl bg-[#0F221A] text-white text-xs space-y-1">
              <p className="text-[#DDF279] font-bold text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck size={14} />
                Partner Verification
              </p>
              <p className="text-white/70 text-[11px] leading-relaxed">
                Every listed store is physically inspected with multi-photo & two-way OTP booking.
              </p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
