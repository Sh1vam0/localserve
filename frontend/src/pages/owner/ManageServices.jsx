import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, Clock, Tag, X } from 'lucide-react';

const ManageServices = () => {
  const [business, setBusiness] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal / Form state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('30');
  const [category, setCategory] = useState('General');
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const bizRes = await api.get('/businesses/owner/me');
      setBusiness(bizRes.data.data);
      if (bizRes.data.data?._id) {
        const sRes = await api.get(`/services/business/${bizRes.data.data._id}`);
        setServices(sRes.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load services:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setEditingServiceId(null);
    setName('');
    setDescription('');
    setPrice('');
    setDuration('30');
    setCategory('General');
    setModalOpen(true);
  };

  const openEditModal = (service) => {
    setEditingServiceId(service._id);
    setName(service.name);
    setDescription(service.description || '');
    setPrice(service.price);
    setDuration(service.duration || '30');
    setCategory(service.category || 'General');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!business?._id) {
      toast.error('Please create your business profile first');
      return;
    }

    setSubmitting(true);
    const payload = {
      businessId: business._id,
      name,
      description,
      price: Number(price),
      duration: Number(duration),
      category,
    };

    try {
      if (editingServiceId) {
        await api.put(`/services/${editingServiceId}`, payload);
        toast.success('Service updated successfully');
      } else {
        await api.post('/services', payload);
        toast.success('New service added successfully');
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save service';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this service?')) return;
    try {
      await api.delete(`/services/${id}`);
      toast.success('Service removed');
      fetchData();
    } catch (err) {
      toast.error('Failed to remove service');
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading services..." />;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Services & Pricing</h1>
          <p className="text-xs text-gray-500 mt-1">
            Add offerings, set customized prices, and declare service duration for appointment booking
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Service</span>
        </button>
      </div>

      {services.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 space-y-3">
          <Tag className="w-10 h-10 text-gray-300 mx-auto" />
          <h4 className="text-sm font-bold text-gray-800">No services added yet</h4>
          <p className="text-xs text-gray-400">Click "Add New Service" to list your first haircut, treatment, or pass.</p>
          <button
            onClick={openAddModal}
            className="mt-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-semibold"
          >
            Create Service
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {services.map((s) => (
            <div
              key={s._id}
              className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs flex flex-col justify-between space-y-4"
            >
              <div className="space-y-1.5">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                    {s.category || 'General'}
                  </span>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => openEditModal(s)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(s._id)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h4 className="text-base font-bold text-gray-900">{s.name}</h4>
                <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                  {s.description || 'No description provided.'}
                </p>
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-between items-center text-xs">
                <span className="flex items-center text-gray-500">
                  <Clock className="w-3.5 h-3.5 mr-1 text-gray-400" />
                  {s.duration || 30} mins
                </span>
                <span className="text-base font-extrabold text-gray-900">₹{s.price}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-900">
                {editingServiceId ? 'Edit Service' : 'Add New Service'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Service Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Classic Haircut & Blowdry"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">Price (₹)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    placeholder="350"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full text-xs p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">Duration (minutes)</label>
                  <input
                    type="number"
                    required
                    min={10}
                    step={5}
                    placeholder="30"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full text-xs p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Category</label>
                <input
                  type="text"
                  placeholder="e.g. Hair, Massage, Facial, Workout"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full text-xs p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Details of what's included..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-xs p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border rounded-xl text-xs text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageServices;
