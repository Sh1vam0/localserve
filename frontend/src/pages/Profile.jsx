import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { User, Mail, Phone, Wallet, Shield, CheckCircle, ArrowDownLeft, ArrowUpRight } from 'lucide-react';

const Profile = () => {
  const { user, refreshUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [saving, setSaving] = useState(false);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/auth/me', { name, phone });
      toast.success('Profile updated successfully!');
      if (refreshUser) refreshUser();
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Account & Wallet</h1>
        <p className="text-xs text-gray-500 mt-1">Manage your personal information and credit balances</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Profile Edit */}
        <div className="md:col-span-2 bg-white rounded-3xl p-6 border border-gray-100 shadow-xs space-y-5">
          <div className="flex items-center space-x-3 pb-4 border-b border-gray-100">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">{user?.name}</h3>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700">
                {user?.role}
              </span>
            </div>
          </div>

          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">Email (Read Only)</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full pl-10 pr-4 py-2 text-xs border border-gray-200 bg-gray-50 rounded-xl text-gray-500 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">Phone Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full pl-10 pr-4 py-2 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>

        {/* Right: Wallet Details */}
        <div className="space-y-6">
          <div className="bg-gradient-to-tr from-emerald-600 to-teal-700 text-white rounded-3xl p-6 shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-200">
                LocalServ Wallet
              </span>
              <Wallet className="w-5 h-5 text-emerald-200" />
            </div>

            <div>
              <span className="text-3xl font-black">₹{user?.walletBalance || 0}</span>
              <p className="text-[11px] text-emerald-100 mt-1">
                Available for instant cancellation refunds & booking discounts.
              </p>
            </div>
          </div>

          {/* Wallet History */}
          <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-xs space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 pb-2 border-b border-gray-100">
              Transaction History
            </h4>

            {(!user?.walletHistory || user.walletHistory.length === 0) ? (
              <p className="text-xs text-gray-400 py-3 text-center">No transactions recorded yet.</p>
            ) : (
              <div className="space-y-2.5 max-h-48 overflow-y-auto">
                {user.walletHistory.map((h, i) => (
                  <div key={i} className="flex justify-between items-center text-xs pb-2 border-b border-gray-50">
                    <div className="space-y-0.5">
                      <p className="font-semibold text-gray-800 line-clamp-1">{h.reason}</p>
                      <span className="text-[10px] text-gray-400">
                        {new Date(h.date).toLocaleDateString()}
                      </span>
                    </div>
                    <span className="font-bold text-emerald-600">
                      +₹{h.amount}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
