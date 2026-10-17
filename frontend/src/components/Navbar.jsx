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

            {/* Live GPS Location Pill */}
            <button
              type="button"
              onClick={detectLiveLocation}
              disabled={isDetectingGeo}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border shadow-xs ${
                userGeoLocation?.isLive
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-2 ring-emerald-200'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-emerald-700 hover:text-emerald-800'
              }`}
              title="Click to detect or refresh live GPS location"
            >
              <span className={`w-2 h-2 rounded-full ${userGeoLocation?.isLive ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
              <LocateFixed size={13} className={isDetectingGeo ? 'animate-spin text-emerald-600' : ''} />
              <span>{isDetectingGeo ? 'Locating...' : userGeoLocation ? userGeoLocation.city : 'Live Location'}</span>
            </button>

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

          {/* Mobile hamburger button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-[#17231d] hover:bg-gray-100"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#e4e8e1] bg-white px-4 pt-2 pb-4 space-y-2">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-bold text-[#17231d] hover:bg-[#edf2eb]"
          >
            Discover
          </Link>
          <Link
            to="/search"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-bold text-[#17231d] hover:bg-[#edf2eb]"
          >
            Explore All
          </Link>

          {isAuthenticated ? (
            <>
              {isCustomer && (
                <Link
                  to="/my-bookings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl text-sm font-bold text-[#17231d] hover:bg-[#edf2eb]"
                >
                  My Bookings (Wallet: ₹{user?.walletBalance || 0})
                </Link>
              )}
              {isOwner && (
                <Link
                  to="/owner/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl text-sm font-bold text-[#17231d] hover:bg-[#edf2eb]"
                >
                  Owner Dashboard
                </Link>
              )}
              {isAdmin && (
                <Link
                  to="/admin/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-xl text-sm font-bold text-[#17231d] hover:bg-[#edf2eb]"
                >
                  Admin Hub
                </Link>
              )}
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-bold text-[#17231d] hover:bg-[#edf2eb]"
              >
                Profile ({user?.name})
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50"
              >
                Sign Out
              </button>
            </>
          ) : (
            <div className="pt-2 border-t border-[#e4e8e1] flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="btn-dark justify-center text-xs"
              >
                Log In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="btn-lime justify-center text-xs"
              >
                List your business
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
