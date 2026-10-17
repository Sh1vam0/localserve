import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../api/axios';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';
import {
  Store,
  Check,
  X,
  Shield,
  Star,
  MapPin,
  ShieldCheck,
  Image as ImageIcon,
  ExternalLink,
  FileText,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Eye,
  Clock,
  Building2,
  User,
  Phone,
  Mail,
  Award,
  ChevronRight,
} from 'lucide-react';

const ManageBusinesses = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(searchParams.get('status') || searchParams.get('verificationStatus') || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal state for conducting store verification audit
  const [auditModalOpen, setAuditModalOpen] = useState(false);
  const [selectedBiz, setSelectedBiz] = useState(null);
  const [auditChecklist, setAuditChecklist] = useState({
    signboardMatches: false,
    photosGenuine: false,
    licenseValid: false,
    pinpointAccurate: false,
  });
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  const fetchBusinesses = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (activeTab === 'pending_review' || activeTab === 'verified' || activeTab === 'rejected' || activeTab === 'unverified') {
        params.append('verificationStatus', activeTab);
      } else if (activeTab === 'approved' || activeTab === 'suspended' || activeTab === 'pending') {
        params.append('status', activeTab);
      }

      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }

      const res = await api.get(`/admin/businesses?${params.toString()}`);
      setBusinesses(res.data.data || []);
    } catch (err) {
      console.error('Failed to load businesses:', err);
      toast.error('Failed to retrieve businesses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinesses();
  }, [activeTab]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchBusinesses();
  };

  const handleUpdateStatus = async (businessId, newStatus) => {
    try {
      await api.put(`/admin/businesses/${businessId}/status`, { status: newStatus });
      toast.success(`Listing operational status set to ${newStatus}`);
      fetchBusinesses();
      if (selectedBiz?._id === businessId) {
        setSelectedBiz((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      toast.error('Failed to update operational status');
    }
  };

  const openAuditModal = (biz) => {
    setSelectedBiz(biz);
    setRejectionReason(biz.verificationDocuments?.rejectionReason || '');
    setAuditChecklist({
      signboardMatches: biz.verificationStatus === 'verified',
      photosGenuine: biz.verificationStatus === 'verified',
      licenseValid: biz.verificationStatus === 'verified',
      pinpointAccurate: biz.verificationStatus === 'verified',
    });
    setPreviewImage(biz.images?.[0] || null);
    setAuditModalOpen(true);
  };

  const closeAuditModal = () => {
    setAuditModalOpen(false);
    setSelectedBiz(null);
    setPreviewImage(null);
  };

  const handleAuditDecision = async (decision) => {
    if (!selectedBiz) return;
    if (decision === 'rejected' && !rejectionReason.trim()) {
      toast.error('Please specify the reason for rejection to guide the owner');
      return;
    }

    try {
      setActionLoading(true);
      await api.put(`/admin/businesses/${selectedBiz._id}/verify`, {
        verificationStatus: decision,
        rejectionReason: decision === 'rejected' ? rejectionReason.trim() : '',
      });

      if (decision === 'verified') {
        toast.success(`"${selectedBiz.name}" has been verified! Green badge activated.`);
      } else {
        toast.success(`Verification rejected with audit notes.`);
      }

      closeAuditModal();
      fetchBusinesses();
    } catch (err) {
      console.error('Audit decision failed:', err);
      toast.error('Failed to apply verification decision');
    } finally {
      setActionLoading(false);
    }
  };

  const pendingCount = businesses.filter((b) => b.verificationStatus === 'pending_review').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Business Governance & Verification Hub</h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700">
              Admin Portal
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Vetting trade licenses, multi-photo premises, and GPS pinpoint accuracy to maintain high customer trust.
          </p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex items-center space-x-2 w-full md:w-auto">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by store name..."
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none w-full md:w-56"
          />
          <button
            type="submit"
            className="px-3 py-2 bg-gray-900 hover:bg-black text-white text-xs font-semibold rounded-xl"
          >
            Search
          </button>
        </form>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-white border border-gray-100 rounded-2xl shadow-xs text-xs font-semibold">
        {[
          { id: 'all', label: 'All Listings' },
          { id: 'pending_review', label: 'Pending Audit Queue', badge: pendingCount > 0 ? pendingCount : null, alert: true },
          { id: 'verified', label: 'Verified Partners' },
          { id: 'unverified', label: 'Unverified' },
          { id: 'rejected', label: 'Rejected / Corrections Required' },
          { id: 'approved', label: 'Active Operational' },
          { id: 'suspended', label: 'Suspended Stores' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setSearchParams({ status: tab.id });
            }}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center space-x-1.5 ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <span>{tab.label}</span>
            {tab.badge && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                activeTab === tab.id ? 'bg-white text-indigo-700' : 'bg-amber-100 text-amber-800'
              }`}>
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Businesses Feed */}
      {loading ? (
        <LoadingSpinner text="Loading business dossiers..." />
      ) : businesses.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-gray-100 space-y-3">
          <Store className="w-10 h-10 text-gray-300 mx-auto" />
          <h3 className="text-sm font-bold text-gray-700">No stores found</h3>
          <p className="text-xs text-gray-400">There are no businesses matching filter "{activeTab}".</p>
        </div>
      ) : (
        <div className="space-y-4">
          {businesses.map((biz) => {
            const isVerified = biz.verificationStatus === 'verified';
            const isPending = biz.verificationStatus === 'pending_review';
            const isRejected = biz.verificationStatus === 'rejected';

            const googleMapsUrl =
              biz.pinpointLocation?.googleMapsUrl ||
              `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                [biz.name, biz.address?.street, biz.address?.city].filter(Boolean).join(' ')
              )}`;

            return (
              <div
                key={biz._id}
                className={`bg-white rounded-3xl p-6 border transition-all shadow-xs hover:shadow-md ${
                  isPending ? 'border-amber-300 bg-amber-50/20' : 'border-gray-100'
                }`}
              >
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                  {/* Left Column: Basic Store & Verification Identity */}
                  <div className="space-y-3 max-w-3xl flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-extrabold text-gray-900">{biz.name}</h3>

                      <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-gray-100 text-gray-700">
                        {biz.category}
                      </span>

                      {/* Verification Status Pill */}
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider flex items-center space-x-1 ${
                          isVerified
                            ? 'bg-emerald-100 text-emerald-800'
                            : isPending
                            ? 'bg-amber-100 text-amber-900 ring-2 ring-amber-300'
                            : isRejected
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        <ShieldCheck size={13} />
                        <span>{biz.verificationStatus || 'unverified'}</span>
                      </span>

                      {/* Operational Status Pill */}
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          biz.status === 'approved'
                            ? 'bg-emerald-50 text-emerald-700'
                            : biz.status === 'pending'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-red-50 text-red-700'
                        }`}
                      >
                        {biz.status}
                      </span>
                    </div>

                    {/* Owner & Contact */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                      <span className="flex items-center space-x-1">
                        <User size={13} className="text-gray-400" />
                        <strong className="text-gray-700">{biz.owner?.name || 'Owner'}</strong> ({biz.owner?.email || 'N/A'})
                      </span>
                      <span className="flex items-center space-x-1">
                        <Phone size={13} className="text-gray-400" />
                        <span>{biz.phone || 'No phone'}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <MapPin size={13} className="text-gray-400" />
                        <span>{biz.address?.city || 'Mumbai'}</span>
                      </span>
                    </div>

                    {/* Audit Summary Box */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 bg-gray-50 p-3.5 rounded-2xl border border-gray-100 text-xs text-gray-600">
                      <div className="flex items-start space-x-2">
                        <FileText size={15} className="text-indigo-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-gray-900">Legal Credentials</p>
                          <p className="text-[11px] text-gray-500 truncate">
                            GSTIN: {biz.verificationDocuments?.gstin || 'None'}
                          </p>
                          <p className="text-[11px] text-gray-500 truncate">
                            Lic: {biz.verificationDocuments?.tradeLicense || 'None'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-2">
                        <ImageIcon size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-gray-900">Premise Photos</p>
                          <p className="text-[11px] text-gray-500">
                            {biz.images?.length || 0} photos uploaded
                            {(biz.images?.length || 0) >= 3 ? (
                              <span className="text-emerald-600 font-semibold ml-1">✓ (Min 3 Met)</span>
                            ) : (
                              <span className="text-amber-600 font-semibold ml-1">⚠ ({biz.images?.length || 0}/3)</span>
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-2">
                        <MapPin size={15} className="text-blue-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-gray-900">Pinpoint GPS</p>
                          <a
                            href={googleMapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-[11px] text-blue-600 hover:underline font-semibold"
                          >
                            <span>Verify Google Maps Pin</span>
                            <ExternalLink size={10} className="ml-1" />
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* Rejection notice if previously rejected */}
                    {isRejected && biz.verificationDocuments?.rejectionReason && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-start space-x-2">
                        <AlertTriangle size={15} className="text-red-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold">Active Rejection Feedback: </span>
                          <span>{biz.verificationDocuments.rejectionReason}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Audit Action Buttons */}
                  <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0 w-full sm:w-auto">
                    {/* Primary Audit Dossier Button */}
                    <button
                      onClick={() => openAuditModal(biz)}
                      className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 shadow-xs transition-all ${
                        isPending
                          ? 'bg-amber-600 hover:bg-amber-700 text-white ring-2 ring-amber-300'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      }`}
                    >
                      <Eye size={14} />
                      <span>Audit & Verify Dossier</span>
                    </button>

                    {/* Quick Suspend / Approve Operational State */}
                    {biz.status === 'suspended' ? (
                      <button
                        onClick={() => handleUpdateStatus(biz._id, 'approved')}
                        className="px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold flex items-center justify-center space-x-1"
                      >
                        <Check size={13} />
                        <span>Unsuspend Store</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUpdateStatus(biz._id, 'suspended')}
                        className="px-3 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold flex items-center justify-center space-x-1"
                      >
                        <X size={13} />
                        <span>Suspend Operations</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* FULL VERIFICATION AUDIT MODAL */}
      {auditModalOpen && selectedBiz && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-gray-100 my-8">
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-gray-100 pb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-xl font-black text-gray-900">{selectedBiz.name}</h2>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    selectedBiz.verificationStatus === 'verified'
                      ? 'bg-emerald-100 text-emerald-800'
                      : selectedBiz.verificationStatus === 'pending_review'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {selectedBiz.verificationStatus}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Owner: {selectedBiz.owner?.name} · {selectedBiz.owner?.email} · Tel: {selectedBiz.phone}
                </p>
              </div>

              <button
                onClick={closeAuditModal}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* AUDIT STEP 1: Legal Documents Inspection */}
            <div className="space-y-3 bg-gray-50 p-5 rounded-2xl border border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-900 flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  <span>Step 1: Statutory & Commercial Registration Documents</span>
                </h3>
                <span className="text-[11px] font-semibold text-gray-500">
                  Submitted: {new Date(selectedBiz.verificationDocuments?.submittedAt || Date.now()).toLocaleDateString()}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-white p-3 rounded-xl border border-gray-100">
                  <p className="text-[10px] font-bold uppercase text-gray-400">GSTIN / Tax ID</p>
                  <p className="text-xs font-mono font-bold text-gray-900 mt-0.5">
                    {selectedBiz.verificationDocuments?.gstin || 'Not Provided'}
                  </p>
                </div>

                <div className="bg-white p-3 rounded-xl border border-gray-100">
                  <p className="text-[10px] font-bold uppercase text-gray-400">Trade License No.</p>
                  <p className="text-xs font-mono font-bold text-gray-900 mt-0.5">
                    {selectedBiz.verificationDocuments?.tradeLicense || 'Not Provided'}
                  </p>
                </div>

                <div className="bg-white p-3 rounded-xl border border-gray-100">
                  <p className="text-[10px] font-bold uppercase text-gray-400">
                    {selectedBiz.verificationDocuments?.ownerIdType || 'Owner Government ID'}
                  </p>
                  <p className="text-xs font-mono font-bold text-gray-900 mt-0.5">
                    {selectedBiz.verificationDocuments?.ownerIdNumber || 'Not Provided'}
                  </p>
                </div>
              </div>

              {selectedBiz.verificationDocuments?.documentUrl && (
                <div className="mt-2 flex items-center justify-between bg-white p-3 rounded-xl border border-gray-100">
                  <div className="flex items-center space-x-2 text-xs text-gray-700">
                    <FileText size={14} className="text-indigo-600" />
                    <span>Uploaded Certificate Scan / PDF Document</span>
                  </div>
                  <a
                    href={selectedBiz.verificationDocuments.documentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 text-xs font-bold text-indigo-600 hover:text-indigo-800"
                  >
                    <span>Inspect Document</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              )}
            </div>

            {/* AUDIT STEP 2: Multi-Photo Premise Inspection */}
            <div className="space-y-3 bg-gray-50 p-5 rounded-2xl border border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-900 flex items-center space-x-2">
                  <ImageIcon className="w-4 h-4 text-emerald-600" />
                  <span>Step 2: Premise Inspection ({selectedBiz.images?.length || 0} Photos Uploaded)</span>
                </h3>
                <span className={`text-[11px] font-bold ${
                  (selectedBiz.images?.length || 0) >= 3 ? 'text-emerald-700' : 'text-red-600'
                }`}>
                  {(selectedBiz.images?.length || 0) >= 3 ? '✓ Minimum 3 Photos Met' : '⚠ Minimum 3 Photos Required'}
                </span>
              </div>

              {/* Photo Strip & Preview */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {selectedBiz.images?.map((imgUrl, idx) => (
                  <div
                    key={idx}
                    onClick={() => setPreviewImage(imgUrl)}
                    className={`relative rounded-xl overflow-hidden border-2 cursor-pointer transition-all aspect-video sm:aspect-square ${
                      previewImage === imgUrl ? 'border-indigo-600 ring-2 ring-indigo-200' : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <img src={imgUrl} alt={`Premise ${idx + 1}`} className="w-full h-full object-cover" />
                    <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[9px] px-1.5 py-0.5 rounded font-bold">
                      #{idx + 1}
                    </span>
                  </div>
                ))}
              </div>

              {/* Expanded Preview */}
              {previewImage && (
                <div className="bg-white p-3 rounded-2xl border border-gray-200 space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">High-Resolution Photo View</p>
                  <img src={previewImage} alt="Expanded preview" className="w-full max-h-64 object-cover rounded-xl" />
                </div>
              )}
            </div>

            {/* AUDIT STEP 3: Pinpoint Coordinates & Direct Google Maps */}
            <div className="space-y-3 bg-gray-50 p-5 rounded-2xl border border-gray-100">
              <h3 className="text-sm font-bold text-gray-900 flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-blue-600" />
                <span>Step 3: Geolocation & Pinpoint Precision</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="bg-white p-3 rounded-xl border border-gray-100 space-y-1">
                  <p className="text-[10px] font-bold uppercase text-gray-400">Store Address & Landmark</p>
                  <p className="font-semibold text-gray-900">
                    {selectedBiz.address?.street ? `${selectedBiz.address.street}, ` : ''}
                    {selectedBiz.address?.city} ({selectedBiz.address?.pincode || 'N/A'})
                  </p>
                  <p className="text-gray-500">
                    Landmark: <span className="font-medium text-gray-800">{selectedBiz.pinpointLocation?.landmark || 'None provided'}</span>
                  </p>
                </div>

                <div className="bg-white p-3 rounded-xl border border-gray-100 flex flex-col justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase text-gray-400">Coordinates</p>
                    <p className="font-mono text-xs text-gray-700 mt-1">
                      {selectedBiz.location?.coordinates?.[1]?.toFixed(5) || '19.0760'}° N,{' '}
                      {selectedBiz.location?.coordinates?.[0]?.toFixed(5) || '72.8777'}° E
                    </p>
                  </div>

                  <a
                    href={
                      selectedBiz.pinpointLocation?.googleMapsUrl ||
                      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        [selectedBiz.name, selectedBiz.address?.street, selectedBiz.address?.city].filter(Boolean).join(' ')
                      )}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center justify-center space-x-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold transition-colors"
                  >
                    <MapPin size={12} />
                    <span>Open Pinned Store on Google Maps</span>
                    <ExternalLink size={10} />
                  </a>
                </div>
              </div>
            </div>

            {/* AUDIT CHECKLIST FOR ADMIN INTEGRITY */}
            <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 space-y-2">
              <p className="text-xs font-bold text-indigo-950 uppercase tracking-wider">
                Admin Quality Assurance Checklist
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-indigo-900">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={auditChecklist.signboardMatches}
                    onChange={(e) => setAuditChecklist({ ...auditChecklist, signboardMatches: e.target.checked })}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Signboard matches legal trade name</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={auditChecklist.photosGenuine}
                    onChange={(e) => setAuditChecklist({ ...auditChecklist, photosGenuine: e.target.checked })}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Interior & equipment photos are genuine</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={auditChecklist.licenseValid}
                    onChange={(e) => setAuditChecklist({ ...auditChecklist, licenseValid: e.target.checked })}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Trade license / GSTIN is authentic</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={auditChecklist.pinpointAccurate}
                    onChange={(e) => setAuditChecklist({ ...auditChecklist, pinpointAccurate: e.target.checked })}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Google Maps pin matches real premises</span>
                </label>
              </div>
            </div>

            {/* REJECTION FEEDBACK BOX */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-700">
                Audit Feedback / Correction Instructions (Required only if rejecting):
              </label>
              <textarea
                rows={2}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Please provide a clearer photo of the exterior storefront showing the business name board, and ensure GSTIN matches the registered trade name."
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              <div className="flex flex-wrap gap-1 text-[10px]">
                <span className="text-gray-400 font-semibold">Quick Templates:</span>
                <button
                  type="button"
                  onClick={() => setRejectionReason('Storefront photo does not clearly show the business signboard.')}
                  className="px-2 py-0.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded"
                >
                  Signboard not clear
                </button>
                <button
                  type="button"
                  onClick={() => setRejectionReason('GSTIN or trade license number could not be validated. Please upload scanned document.')}
                  className="px-2 py-0.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded"
                >
                  License invalid
                </button>
                <button
                  type="button"
                  onClick={() => setRejectionReason('Minimum 3 photos required: 1 exterior signboard, 1 customer area, and 1 workstation.')}
                  className="px-2 py-0.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded"
                >
                  Min 3 photos required
                </button>
              </div>
            </div>

            {/* MODAL ACTION CONTROLS */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={closeAuditModal}
                className="px-4 py-2 text-xs font-semibold text-gray-500 hover:text-gray-800 w-full sm:w-auto"
              >
                Cancel & Close
              </button>

              <div className="flex items-center space-x-2 w-full sm:w-auto">
                {/* Reject Button */}
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => handleAuditDecision('rejected')}
                  className="px-4 py-2.5 rounded-xl border border-red-300 text-red-700 hover:bg-red-50 text-xs font-bold flex items-center justify-center space-x-1 w-full sm:w-auto transition-colors"
                >
                  <XCircle size={14} />
                  <span>Reject & Request Corrections</span>
                </button>

                {/* Approve Button */}
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => handleAuditDecision('verified')}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center justify-center space-x-1.5 shadow-md shadow-emerald-600/20 w-full sm:w-auto transition-all"
                >
                  <ShieldCheck size={15} />
                  <span>Approve & Grant Verified Partner Badge</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageBusinesses;
