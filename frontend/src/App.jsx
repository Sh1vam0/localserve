import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Search from './pages/Search';
import BusinessDetail from './pages/BusinessDetail';
import MyBookings from './pages/MyBookings';
import Profile from './pages/Profile';

// Owner Pages
import OwnerDashboard from './pages/owner/OwnerDashboard';
import ManageBusiness from './pages/owner/ManageBusiness';
import ManageServices from './pages/owner/ManageServices';
import OwnerBookings from './pages/owner/OwnerBookings';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageUsers from './pages/admin/ManageUsers';
import ManageBusinesses from './pages/admin/ManageBusinesses';

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-[#fafafa] text-gray-900">
      <Navbar />
      <main className="flex-1">
        <Routes>
          {/* Public & Customer Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/search" element={<Search />} />
          <Route path="/business/:id" element={<BusinessDetail />} />

          {/* Customer Protected */}
          <Route
            path="/my-bookings"
            element={
              <ProtectedRoute allowedRoles={['customer', 'owner', 'admin']}>
                <MyBookings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Owner Protected Routes */}
          <Route
            path="/owner/dashboard"
            element={
              <ProtectedRoute allowedRoles={['owner', 'admin']}>
                <OwnerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/owner/business"
            element={
              <ProtectedRoute allowedRoles={['owner', 'admin']}>
                <ManageBusiness />
              </ProtectedRoute>
            }
          />
          <Route
            path="/owner/services"
            element={
              <ProtectedRoute allowedRoles={['owner', 'admin']}>
                <ManageServices />
              </ProtectedRoute>
            }
          />
          <Route
            path="/owner/bookings"
            element={
              <ProtectedRoute allowedRoles={['owner', 'admin']}>
                <OwnerBookings />
              </ProtectedRoute>
            }
          />

          {/* Admin Protected Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ManageUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/businesses"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ManageBusinesses />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
