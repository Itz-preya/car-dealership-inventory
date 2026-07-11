import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { vehicleService } from '../services/api';
import type { Vehicle } from '../services/api';
import { Search, Plus, Trash2, Edit3, ShoppingCart, ArchiveRestore, AlertCircle, RefreshCw } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  // Vehicles state
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search/Filter states
  const [searchMake, setSearchMake] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRestockModal, setShowRestockModal] = useState(false);

  // Form states (Add/Edit)
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [formMake, setFormMake] = useState('');
  const [formModel, setFormModel] = useState('');
  const [formYear, setFormYear] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formQuantity, setFormQuantity] = useState('');
  const [formStatus, setFormStatus] = useState('AVAILABLE');
  const [restockAmount, setRestockAmount] = useState('');

  const fetchVehicles = async () => {
    setLoading(true);
    setError(null);
    try {
      let data: Vehicle[];
      if (searchMake || minPrice || maxPrice) {
        data = await vehicleService.search({
          make: searchMake || undefined,
          minPrice: minPrice ? Number(minPrice) : undefined,
          maxPrice: maxPrice ? Number(maxPrice) : undefined,
        });
      } else {
        data = await vehicleService.getAll();
      }
      setVehicles(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch inventory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchVehicles();
  };

  const handleClearFilters = () => {
    setSearchMake('');
    setMinPrice('');
    setMaxPrice('');
    setTimeout(() => {
      fetchVehicles();
    }, 50);
  };

  const handlePurchase = async (id: string) => {
    try {
      await vehicleService.purchase(id);
      fetchVehicles();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Purchase failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this vehicle?')) return;
    try {
      await vehicleService.delete(id);
      fetchVehicles();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Deletion failed');
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await vehicleService.create({
        make: formMake,
        model: formModel,
        year: Number(formYear),
        price: Number(formPrice),
        status: formStatus,
        quantity: Number(formQuantity || 1),
      });
      setShowAddModal(false);
      resetForm();
      fetchVehicles();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to create vehicle');
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicle) return;
    try {
      await vehicleService.update(selectedVehicle.id, {
        make: formMake,
        model: formModel,
        year: Number(formYear),
        price: Number(formPrice),
        status: formStatus,
        quantity: Number(formQuantity),
      });
      setShowEditModal(false);
      setSelectedVehicle(null);
      resetForm();
      fetchVehicles();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update vehicle');
    }
  };

  const handleRestockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicle) return;
    try {
      await vehicleService.restock(selectedVehicle.id, Number(restockAmount));
      setShowRestockModal(false);
      setSelectedVehicle(null);
      setRestockAmount('');
      fetchVehicles();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Restocking failed');
    }
  };

  const openEditModal = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setFormMake(vehicle.make);
    setFormModel(vehicle.model);
    setFormYear(String(vehicle.year));
    setFormPrice(String(vehicle.price));
    setFormQuantity(String(vehicle.quantity));
    setFormStatus(vehicle.status);
    setShowEditModal(true);
  };

  const openRestockModal = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setRestockAmount('10');
    setShowRestockModal(true);
  };

  const resetForm = () => {
    setFormMake('');
    setFormModel('');
    setFormYear('');
    setFormPrice('');
    setFormQuantity('');
    setFormStatus('AVAILABLE');
  };

  return (
    <div className="space-y-6">
      {/* Search and Action Bar */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-slate-950/40 backdrop-blur border border-slate-800 p-5 rounded-2xl">
        <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full lg:max-w-4xl">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
              <Search size={16} />
            </span>
            <input
              type="text"
              value={searchMake}
              onChange={(e) => setSearchMake(e.target.value)}
              placeholder="Make (e.g. Toyota)"
              className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-850 rounded-xl focus:border-purple-500 focus:outline-none text-sm text-slate-100 placeholder-slate-500"
            />
          </div>
          <input
            type="number"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder="Min Price ($)"
            className="w-full px-4 py-2 bg-slate-900 border border-slate-850 rounded-xl focus:border-purple-500 focus:outline-none text-sm text-slate-100 placeholder-slate-500"
          />
          <input
            type="number"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="Max Price ($)"
            className="w-full px-4 py-2 bg-slate-900 border border-slate-850 rounded-xl focus:border-purple-500 focus:outline-none text-sm text-slate-100 placeholder-slate-500"
          />
          <div className="sm:col-span-3 flex justify-end gap-2 mt-2">
            <button
              type="button"
              onClick={handleClearFilters}
              className="px-4 py-1.5 rounded-lg border border-slate-800 hover:bg-slate-900 text-xs font-semibold text-slate-300 transition"
            >
              Clear Filters
            </button>
            <button
              type="submit"
              className="bg-purple-600 hover:bg-purple-500 text-white px-5 py-1.5 rounded-lg text-xs font-semibold shadow-lg shadow-purple-600/10 transition"
            >
              Apply Filter
            </button>
          </div>
        </form>

        {isAdmin && (
          <button
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-medium px-5 py-2.5 rounded-xl shadow-lg shadow-purple-600/20 active:scale-[0.98] transition-all text-sm w-full lg:w-auto justify-center"
          >
            <Plus size={18} />
            <span>Add Vehicle</span>
          </button>
        )}
      </div>

      {/* Main Grid View */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <RefreshCw className="animate-spin text-purple-500 mb-3" size={32} />
          <p className="text-sm">Fetching catalog details...</p>
        </div>
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-6 rounded-2xl flex items-center gap-3 text-sm">
          <AlertCircle size={20} className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      ) : vehicles.length === 0 ? (
        <div className="bg-slate-950/20 border border-slate-800/80 p-16 rounded-2xl text-center text-slate-400">
          <p className="text-sm">No vehicles found matching search specifications.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((vehicle) => {
            const isOutOfStock = vehicle.quantity <= 0;
            return (
              <div
                key={vehicle.id}
                className="bg-slate-950/40 border border-slate-800/60 p-6 rounded-2xl flex flex-col hover:border-slate-700/80 transition-all duration-200"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-200">
                      {vehicle.make} {vehicle.model}
                    </h3>
                    <p className="text-xs text-slate-400">Year Model: {vehicle.year}</p>
                  </div>
                  <span
                    className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold ${
                      isOutOfStock
                        ? 'bg-rose-900/30 text-rose-400 border border-rose-800/30'
                        : vehicle.status === 'AVAILABLE'
                        ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-800/30'
                        : 'bg-amber-900/30 text-amber-400 border border-amber-800/30'
                    }`}
                  >
                    {isOutOfStock ? 'OUT OF STOCK' : vehicle.status}
                  </span>
                </div>

                <div className="border-t border-slate-900 pt-4 flex justify-between items-center text-sm mb-6">
                  <div>
                    <p className="text-xs text-slate-500">Retail Price</p>
                    <p className="text-lg font-extrabold text-slate-100">
                      ${vehicle.price.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">Inventory Stock</p>
                    <p className="font-semibold text-slate-200">
                      {vehicle.quantity} {vehicle.quantity === 1 ? 'unit' : 'units'}
                    </p>
                  </div>
                </div>

                <div className="mt-auto space-y-2">
                  <button
                    disabled={isOutOfStock}
                    onClick={() => handlePurchase(vehicle.id)}
                    className="w-full flex items-center justify-center gap-2 bg-purple-600 disabled:bg-slate-800 disabled:text-slate-500 hover:bg-purple-500 text-white font-medium py-2.5 rounded-xl transition text-sm shadow-md"
                  >
                    <ShoppingCart size={16} />
                    <span>{isOutOfStock ? 'Sold Out' : 'Purchase Stock'}</span>
                  </button>

                  {isAdmin && (
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-900">
                      <button
                        onClick={() => openEditModal(vehicle)}
                        className="flex items-center justify-center gap-1.5 bg-slate-900 border border-slate-800 hover:bg-slate-850 text-slate-300 py-1.5 rounded-lg text-xs font-semibold transition"
                        title="Edit Details"
                      >
                        <Edit3 size={14} />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => openRestockModal(vehicle)}
                        className="flex items-center justify-center gap-1.5 bg-slate-900 border border-slate-800 hover:bg-slate-850 text-purple-400 py-1.5 rounded-lg text-xs font-semibold transition"
                        title="Restock Inventory"
                      >
                        <ArchiveRestore size={14} />
                        <span>Restock</span>
                      </button>
                      <button
                        onClick={() => handleDelete(vehicle.id)}
                        className="flex items-center justify-center gap-1.5 bg-red-950/20 border border-red-900/30 hover:bg-red-950/40 text-red-400 py-1.5 rounded-lg text-xs font-semibold transition"
                        title="Delete Record"
                      >
                        <Trash2 size={14} />
                        <span>Delete</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl p-6">
            <h3 className="text-lg font-bold text-slate-200 mb-4">Create New Vehicle Record</h3>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Make</label>
                  <input
                    type="text"
                    required
                    value={formMake}
                    onChange={(e) => setFormMake(e.target.value)}
                    placeholder="Toyota"
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm focus:border-purple-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Model</label>
                  <input
                    type="text"
                    required
                    value={formModel}
                    onChange={(e) => setFormModel(e.target.value)}
                    placeholder="Camry"
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Year</label>
                  <input
                    type="number"
                    required
                    value={formYear}
                    onChange={(e) => setFormYear(e.target.value)}
                    placeholder="2022"
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm focus:border-purple-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Price ($)</label>
                  <input
                    type="number"
                    required
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    placeholder="25000"
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Stock Quantity</label>
                  <input
                    type="number"
                    required
                    value={formQuantity}
                    onChange={(e) => setFormQuantity(e.target.value)}
                    placeholder="5"
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm focus:border-purple-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm focus:border-purple-500 focus:outline-none text-slate-300"
                  >
                    <option value="AVAILABLE">AVAILABLE</option>
                    <option value="SOLD">SOLD</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-800 hover:bg-slate-900 text-sm text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-500 text-white font-medium px-5 py-2 rounded-xl text-sm shadow-md"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl p-6">
            <h3 className="text-lg font-bold text-slate-200 mb-4">Edit Vehicle details</h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Make</label>
                  <input
                    type="text"
                    required
                    value={formMake}
                    onChange={(e) => setFormMake(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm focus:border-purple-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Model</label>
                  <input
                    type="text"
                    required
                    value={formModel}
                    onChange={(e) => setFormModel(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Year</label>
                  <input
                    type="number"
                    required
                    value={formYear}
                    onChange={(e) => setFormYear(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm focus:border-purple-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Price ($)</label>
                  <input
                    type="number"
                    required
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Stock Quantity</label>
                  <input
                    type="number"
                    required
                    value={formQuantity}
                    onChange={(e) => setFormQuantity(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm focus:border-purple-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm focus:border-purple-500 focus:outline-none text-slate-300"
                  >
                    <option value="AVAILABLE">AVAILABLE</option>
                    <option value="SOLD">SOLD</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedVehicle(null);
                  }}
                  className="px-4 py-2 rounded-xl border border-slate-800 hover:bg-slate-900 text-sm text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-500 text-white font-medium px-5 py-2 rounded-xl text-sm shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Restock Modal */}
      {showRestockModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl p-6">
            <h3 className="text-lg font-bold text-slate-200 mb-2">Restock Vehicle Stock</h3>
            <p className="text-xs text-slate-400 mb-4">
              Replenishing inventory for {selectedVehicle?.make} {selectedVehicle?.model} (Current Stock: {selectedVehicle?.quantity}).
            </p>
            <form onSubmit={handleRestockSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Quantity to Add</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={restockAmount}
                  onChange={(e) => setRestockAmount(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-sm focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowRestockModal(false);
                    setSelectedVehicle(null);
                  }}
                  className="px-4 py-2 rounded-xl border border-slate-800 hover:bg-slate-900 text-sm text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-500 text-white font-medium px-5 py-2 rounded-xl text-sm shadow-md"
                >
                  Confirm Restock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
