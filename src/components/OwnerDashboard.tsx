import React, { useState, useEffect } from 'react';
import { Salon, Service, Staff, Booking } from '../types/index.ts';
import { salonsApi, servicesApi, staffApi, bookingsApi } from '../lib/api.ts';
import { useAuth } from '../context/AuthContext.tsx';
import {
  Store,
  Calendar,
  Clock,
  DollarSign,
  Users,
  CheckCircle2,
  XCircle,
  Plus,
  Trash2,
  Edit2,
  Settings,
  AlertCircle,
  ChevronRight,
  TrendingUp,
  UserPlus
} from 'lucide-react';

export const OwnerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [salons, setSalons] = useState<Salon[]>([]);
  const [selectedSalon, setSelectedSalon] = useState<Salon | null>(null);
  const [activeTab, setActiveTab] = useState<'appointments' | 'services' | 'staff' | 'settings'>('appointments');

  // Appointments
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingFilterStatus, setBookingFilterStatus] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  // Modals
  const [walkinModalOpen, setWalkinModalOpen] = useState(false);
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [staffModalOpen, setStaffModalOpen] = useState(false);
  const [cancelModalBooking, setCancelModalBooking] = useState<Booking | null>(null);
  const [cancelReason, setCancelReason] = useState('Client requested cancellation');

  // Services & Staff lists
  const [services, setServices] = useState<Service[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);

  // Form states
  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState('499');
  const [newServiceDuration, setNewServiceDuration] = useState('45');
  const [newServiceCategory, setNewServiceCategory] = useState('Haircut');
  const [newServiceDesc, setNewServiceDesc] = useState('');

  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffRole, setNewStaffRole] = useState('Hair Stylist');

  // Walk-in form states
  const [walkinName, setWalkinName] = useState('Walk-in Client');
  const [walkinPhone, setWalkinPhone] = useState('+91 99999 88888');
  const [walkinServiceId, setWalkinServiceId] = useState('');
  const [walkinStaffId, setWalkinStaffId] = useState('');
  const [walkinTime, setWalkinTime] = useState('14:00');
  const [walkinDate, setWalkinDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Notifications
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Settings form states
  const [autoConfirm, setAutoConfirm] = useState(true);
  const [cancellationPolicyText, setCancellationPolicyText] = useState('');

  // 1. Load Owner's Salons
  const loadSalons = async () => {
    try {
      setLoading(true);
      const res = await salonsApi.getSalons({ ownerId: user?.id });
      setSalons(res.salons);
      if (res.salons.length > 0) {
        const primary = res.salons[0];
        setSelectedSalon(primary);
        setAutoConfirm(primary.autoConfirm);
        setCancellationPolicyText(primary.cancellationPolicy);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load salons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSalons();
  }, [user]);

  // 2. Load Bookings, Services, and Staff for selected salon
  const loadSalonData = async (salonId: string) => {
    try {
      const [bkRes, srvRes, stfRes] = await Promise.all([
        bookingsApi.getBookings({ salonId }),
        servicesApi.getServices(salonId),
        staffApi.getStaff(salonId)
      ]);
      setBookings(bkRes.bookings);
      setServices(srvRes.services);
      setStaffList(stfRes.staff);
      if (srvRes.services.length > 0) {
        setWalkinServiceId(srvRes.services[0].id);
      }
      if (stfRes.staff.length > 0) {
        setWalkinStaffId(stfRes.staff[0].id);
      }
    } catch (err: any) {
      console.error('Error fetching salon data:', err);
    }
  };

  useEffect(() => {
    if (selectedSalon) {
      loadSalonData(selectedSalon.id);
    }
  }, [selectedSalon]);

  // Appointment Status Handlers
  const handleUpdateStatus = async (
    bookingId: string,
    status: Booking['status'],
    reason?: string
  ) => {
    try {
      setErrorMsg(null);
      await bookingsApi.updateStatus(bookingId, status, reason);
      setSuccessMsg(`Booking status updated to ${status}.`);
      if (selectedSalon) loadSalonData(selectedSalon.id);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update booking status.');
    }
  };

  // Add Service Handler
  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSalon) return;
    try {
      setErrorMsg(null);
      await servicesApi.createService(selectedSalon.id, {
        name: newServiceName,
        price: Number(newServicePrice),
        durationMinutes: Number(newServiceDuration),
        category: newServiceCategory,
        description: newServiceDesc
      });
      setSuccessMsg(`Service "${newServiceName}" added successfully.`);
      setServiceModalOpen(false);
      setNewServiceName('');
      setNewServiceDesc('');
      loadSalonData(selectedSalon.id);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to add service');
    }
  };

  // Delete Service Handler
  const handleDeleteService = async (id: string) => {
    if (!confirm('Are you sure you want to remove this service?')) return;
    try {
      await servicesApi.deleteService(id);
      setSuccessMsg('Service removed.');
      if (selectedSalon) loadSalonData(selectedSalon.id);
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  // Add Staff Handler
  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSalon) return;
    try {
      setErrorMsg(null);
      await staffApi.createStaff(selectedSalon.id, {
        name: newStaffName,
        roleTitle: newStaffRole,
        assignedServiceIds: services.map((s) => s.id)
      });
      setSuccessMsg(`Team member "${newStaffName}" added.`);
      setStaffModalOpen(false);
      setNewStaffName('');
      loadSalonData(selectedSalon.id);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to add staff member');
    }
  };

  // Record Walk-in Handler
  const handleRecordWalkin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSalon) return;
    try {
      setErrorMsg(null);
      await bookingsApi.createBooking({
        salonId: selectedSalon.id,
        staffId: walkinStaffId,
        serviceIds: [walkinServiceId],
        date: walkinDate,
        startTime: walkinTime,
        paymentMethod: 'pay_at_salon',
        customerName: walkinName,
        customerPhone: walkinPhone,
        isWalkin: true
      });
      setSuccessMsg('Walk-in appointment recorded and slot blocked.');
      setWalkinModalOpen(false);
      loadSalonData(selectedSalon.id);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to record walk-in slot.');
    }
  };

  // Save Settings Handler
  const handleSaveSettings = async () => {
    if (!selectedSalon) return;
    try {
      setErrorMsg(null);
      await salonsApi.updateSalon(selectedSalon.id, {
        autoConfirm,
        cancellationPolicy: cancellationPolicyText
      });
      setSuccessMsg('Salon booking rules updated successfully.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update salon settings.');
    }
  };

  // Metric Computations
  const todayStr = new Date().toISOString().split('T')[0];
  const todayBookings = bookings.filter((b) => b.date === todayStr);
  const upcomingCount = bookings.filter((b) => b.status === 'confirmed' || b.status === 'pending').length;
  const completedCount = bookings.filter((b) => b.status === 'completed').length;
  const cancelledCount = bookings.filter((b) => b.status === 'cancelled').length;
  const totalGrossValue = bookings
    .filter((b) => b.status === 'completed' || b.status === 'confirmed')
    .reduce((sum, b) => sum + b.totalPrice, 0);

  const filteredBookings = bookings.filter((b) => {
    if (bookingFilterStatus === 'all') return true;
    return b.status === bookingFilterStatus;
  });

  return (
    <div className="py-8 bg-[#FAF9F6] min-h-[calc(100vh-140px)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Salon Selector & Verification Status Bar */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/90 shadow-xs mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-purple-900 mb-1">
                <Store className="w-3.5 h-3.5" />
                <span>Salon Owner Portal</span>
                {selectedSalon && (
                  <>
                    <span>·</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        selectedSalon.verificationStatus === 'approved'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {selectedSalon.verificationStatus}
                    </span>
                  </>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
                {selectedSalon ? selectedSalon.name : 'Salon Dashboard'}
              </h1>
              <p className="text-xs sm:text-sm text-neutral-500 mt-1">
                {selectedSalon
                  ? `${selectedSalon.address}, ${selectedSalon.locality}, ${selectedSalon.city}`
                  : 'Manage services, staff schedules, and appointments.'}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setWalkinModalOpen(true)}
                className="px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Record Walk-in</span>
              </button>
            </div>
          </div>
        </div>

        {/* Feedback banners */}
        {successMsg && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center justify-between">
            <span>{successMsg}</span>
            <button onClick={() => setSuccessMsg(null)} className="font-bold">✕</button>
          </div>
        )}
        {errorMsg && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-center justify-between">
            <span>{errorMsg}</span>
            <button onClick={() => setErrorMsg(null)} className="font-bold">✕</button>
          </div>
        )}

        {/* Real Metrics Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs">
            <span className="text-[11px] text-neutral-500 font-semibold block uppercase">Today's Appointments</span>
            <p className="text-2xl font-extrabold text-neutral-900 mt-1 tabular-nums">{todayBookings.length}</p>
            <span className="text-[10px] text-neutral-400">Scheduled for today</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs">
            <span className="text-[11px] text-neutral-500 font-semibold block uppercase">Upcoming Bookings</span>
            <p className="text-2xl font-extrabold text-purple-950 mt-1 tabular-nums">{upcomingCount}</p>
            <span className="text-[10px] text-neutral-400">Active queue</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs">
            <span className="text-[11px] text-neutral-500 font-semibold block uppercase">Completed / Cancelled</span>
            <p className="text-2xl font-extrabold text-neutral-900 mt-1 tabular-nums">
              {completedCount} <span className="text-xs text-neutral-400 font-normal">/ {cancelledCount}</span>
            </p>
            <span className="text-[10px] text-neutral-400">Historical count</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs">
            <span className="text-[11px] text-neutral-500 font-semibold block uppercase">Total Booking Value</span>
            <p className="text-2xl font-extrabold text-emerald-800 mt-1 tabular-nums">₹{totalGrossValue}</p>
            <span className="text-[10px] text-neutral-400">Confirmed & Completed</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mb-6 border-b border-neutral-200 pb-3">
          <button
            onClick={() => setActiveTab('appointments')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'appointments'
                ? 'bg-purple-950 text-white shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900 bg-white border border-neutral-200'
            }`}
          >
            Appointments ({bookings.length})
          </button>
          <button
            onClick={() => setActiveTab('services')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'services'
                ? 'bg-purple-950 text-white shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900 bg-white border border-neutral-200'
            }`}
          >
            Services & Prices ({services.length})
          </button>
          <button
            onClick={() => setActiveTab('staff')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'staff'
                ? 'bg-purple-950 text-white shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900 bg-white border border-neutral-200'
            }`}
          >
            Staff & Schedules ({staffList.length})
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-purple-950 text-white shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900 bg-white border border-neutral-200'
            }`}
          >
            Salon Settings & Rules
          </button>
        </div>

        {/* TAB 1: APPOINTMENTS MANAGEMENT */}
        {activeTab === 'appointments' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-neutral-200">
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-neutral-500 font-semibold">Filter:</span>
                {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setBookingFilterStatus(st)}
                    className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer capitalize ${
                      bookingFilterStatus === st
                        ? 'bg-purple-950 text-white'
                        : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
              <span className="text-xs text-neutral-500">
                Showing {filteredBookings.length} appointments
              </span>
            </div>

            {filteredBookings.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center text-xs text-neutral-400 border border-neutral-200">
                No appointments matching the selected filter.
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-xs divide-y divide-neutral-100">
                {filteredBookings.map((b) => (
                  <div
                    key={b.id}
                    className="p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 hover:bg-neutral-50/50 transition-colors"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-purple-950">
                          #{b.bookingCode}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                            b.status === 'confirmed'
                              ? 'bg-emerald-50 text-emerald-700'
                              : b.status === 'pending'
                              ? 'bg-amber-50 text-amber-700'
                              : b.status === 'completed'
                              ? 'bg-blue-50 text-blue-700'
                              : 'bg-neutral-100 text-neutral-600'
                          }`}
                        >
                          {b.status}
                        </span>
                        {b.isWalkin && (
                          <span className="text-[10px] bg-neutral-200 text-neutral-700 px-1.5 py-0.5 rounded">
                            Walk-in
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs">
                        <strong className="text-neutral-900 text-sm font-bold">{b.customerName}</strong>
                        <span className="text-neutral-400">·</span>
                        <span className="text-neutral-600">{b.customerPhone}</span>
                        <span className="text-neutral-400">·</span>
                        <span className="text-neutral-600">{b.date} at {b.startTime} ({b.totalDurationMinutes}m)</span>
                      </div>

                      <p className="text-xs text-neutral-600">
                        <span className="font-semibold text-neutral-700">Stylist:</span> {b.staffName} ·{' '}
                        <span className="font-semibold text-neutral-700">Services:</span>{' '}
                        {b.services.map((s) => `${s.serviceName} (₹${s.price})`).join(', ')}
                      </p>

                      {b.cancelReason && (
                        <p className="text-[11px] text-rose-600 font-medium">
                          Cancelled Reason: {b.cancelReason}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-right mr-2">
                        <span className="text-[10px] text-neutral-400 uppercase block font-semibold">Value</span>
                        <span className="text-sm font-bold text-neutral-900 tabular-nums">₹{b.totalPrice}</span>
                      </div>

                      {b.status === 'pending' && (
                        <button
                          onClick={() => handleUpdateStatus(b.id, 'confirmed')}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold"
                        >
                          Confirm
                        </button>
                      )}

                      {b.status === 'confirmed' && (
                        <button
                          onClick={() => handleUpdateStatus(b.id, 'completed')}
                          className="px-3 py-1.5 bg-purple-950 hover:bg-purple-900 text-white rounded-lg text-xs font-semibold"
                        >
                          Complete
                        </button>
                      )}

                      {(b.status === 'pending' || b.status === 'confirmed') && (
                        <button
                          onClick={() => {
                            setCancelModalBooking(b);
                          }}
                          className="px-3 py-1.5 bg-neutral-100 hover:bg-rose-50 text-neutral-600 hover:text-rose-700 rounded-lg text-xs font-medium border border-neutral-200"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SERVICES & MENU MANAGEMENT */}
        {activeTab === 'services' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-neutral-900">Salon Service Menu</h3>
                <p className="text-xs text-neutral-500">Configure services, prices in ₹, and estimated duration.</p>
              </div>
              <button
                onClick={() => setServiceModalOpen(true)}
                className="px-4 py-2 bg-purple-950 hover:bg-purple-900 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add Service</span>
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-neutral-200 divide-y divide-neutral-100 overflow-hidden shadow-xs">
              {services.map((srv) => (
                <div key={srv.id} className="p-4 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-neutral-900">{srv.name}</h4>
                      <span className="text-[10px] bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded font-medium">
                        {srv.category}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500">{srv.description}</p>
                    <span className="text-[11px] text-neutral-400">Duration: {srv.durationMinutes} mins</span>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <span className="text-base font-extrabold text-neutral-900 tabular-nums">
                      ₹{srv.price}
                    </span>
                    <button
                      onClick={() => handleDeleteService(srv.id)}
                      className="text-neutral-400 hover:text-rose-600 p-1.5 transition-colors"
                      title="Delete service"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: STAFF & SCHEDULES */}
        {activeTab === 'staff' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-neutral-900">Stylists & Specialists</h3>
                <p className="text-xs text-neutral-500">Manage team members, roles, and shift availability.</p>
              </div>
              <button
                onClick={() => setStaffModalOpen(true)}
                className="px-4 py-2 bg-purple-950 hover:bg-purple-900 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5"
              >
                <UserPlus className="w-4 h-4" />
                <span>Add Stylist</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {staffList.map((st) => (
                <div key={st.id} className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-950 text-white font-bold flex items-center justify-center text-sm">
                        {st.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-neutral-900">{st.name}</h4>
                        <p className="text-xs text-neutral-500">{st.roleTitle}</p>
                      </div>
                    </div>
                    <span className="text-[11px] bg-emerald-50 text-emerald-700 font-medium px-2 py-0.5 rounded">
                      Active
                    </span>
                  </div>

                  <div className="text-xs text-neutral-600 border-t border-neutral-100 pt-3 space-y-1">
                    <p className="flex justify-between">
                      <span className="text-neutral-400">Working Shift:</span>
                      <span className="font-semibold text-neutral-800">10:00 AM - 7:30 PM</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-neutral-400">Afternoon Break:</span>
                      <span className="font-semibold text-neutral-800">1:30 PM - 2:30 PM</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: SALON SETTINGS */}
        {activeTab === 'settings' && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-neutral-200 max-w-2xl shadow-xs space-y-5">
            <h3 className="text-base font-bold text-neutral-900">Salon Booking Rules & Settings</h3>

            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between p-3.5 bg-neutral-50 rounded-xl border border-neutral-200">
                <div>
                  <p className="font-bold text-neutral-900">Auto-Confirm Online Appointments</p>
                  <p className="text-neutral-500 text-[11px]">
                    If enabled, customer appointments are automatically locked in. If disabled, they require your manual review.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={autoConfirm}
                  onChange={(e) => setAutoConfirm(e.target.checked)}
                  className="w-4 h-4 text-purple-950 rounded cursor-pointer"
                />
              </div>

              <div>
                <label className="text-neutral-700 font-semibold block mb-1">
                  Cancellation & Rescheduling Policy (Shown to clients)
                </label>
                <textarea
                  rows={3}
                  value={cancellationPolicyText}
                  onChange={(e) => setCancellationPolicyText(e.target.value)}
                  className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl"
                />
              </div>

              <button
                onClick={handleSaveSettings}
                className="px-5 py-2.5 bg-purple-950 hover:bg-purple-900 text-white rounded-xl font-bold transition-colors"
              >
                Save Settings
              </button>
            </div>
          </div>
        )}

        {/* MODAL: ADD SERVICE */}
        {serviceModalOpen && (
          <div className="fixed inset-0 z-50 bg-neutral-950/70 backdrop-blur-xs flex items-center justify-center p-4">
            <form onSubmit={handleAddService} className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-neutral-200 space-y-4">
              <h3 className="text-base font-bold text-neutral-900">Add New Service</h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-neutral-600 block mb-1">Service Name</label>
                  <input
                    type="text"
                    required
                    value={newServiceName}
                    onChange={(e) => setNewServiceName(e.target.value)}
                    placeholder="e.g. Keratin Treatment / Beard Fade"
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-neutral-600 block mb-1">Price (₹)</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={newServicePrice}
                      onChange={(e) => setNewServicePrice(e.target.value)}
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="text-neutral-600 block mb-1">Duration (Mins)</label>
                    <input
                      type="number"
                      required
                      min={10}
                      step={5}
                      value={newServiceDuration}
                      onChange={(e) => setNewServiceDuration(e.target.value)}
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-neutral-600 block mb-1">Category</label>
                  <select
                    value={newServiceCategory}
                    onChange={(e) => setNewServiceCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl"
                  >
                    <option value="Haircut">Haircut</option>
                    <option value="Beard Styling">Beard Styling</option>
                    <option value="Combos">Combos</option>
                    <option value="Facial">Facial</option>
                    <option value="Hair Spa">Hair Spa</option>
                    <option value="Hair Colouring">Hair Colouring</option>
                    <option value="Manicure and Pedicure">Manicure and Pedicure</option>
                    <option value="Bridal Makeup">Bridal Makeup</option>
                  </select>
                </div>

                <div>
                  <label className="text-neutral-600 block mb-1">Short Description</label>
                  <textarea
                    rows={2}
                    value={newServiceDesc}
                    onChange={(e) => setNewServiceDesc(e.target.value)}
                    placeholder="Details about products used, wash, etc."
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setServiceModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-950 text-white rounded-xl text-xs font-bold"
                >
                  Save Service
                </button>
              </div>
            </form>
          </div>
        )}

        {/* MODAL: ADD STAFF */}
        {staffModalOpen && (
          <div className="fixed inset-0 z-50 bg-neutral-950/70 backdrop-blur-xs flex items-center justify-center p-4">
            <form onSubmit={handleAddStaff} className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-neutral-200 space-y-4">
              <h3 className="text-base font-bold text-neutral-900">Add Staff Member</h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-neutral-600 block mb-1">Stylist / Specialist Name</label>
                  <input
                    type="text"
                    required
                    value={newStaffName}
                    onChange={(e) => setNewStaffName(e.target.value)}
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="text-neutral-600 block mb-1">Title / Role</label>
                  <input
                    type="text"
                    required
                    value={newStaffRole}
                    onChange={(e) => setNewStaffRole(e.target.value)}
                    placeholder="e.g. Senior Hair Stylist / Esthetician"
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setStaffModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-950 text-white rounded-xl text-xs font-bold"
                >
                  Add Stylist
                </button>
              </div>
            </form>
          </div>
        )}

        {/* MODAL: RECORD WALK-IN */}
        {walkinModalOpen && (
          <div className="fixed inset-0 z-50 bg-neutral-950/70 backdrop-blur-xs flex items-center justify-center p-4">
            <form onSubmit={handleRecordWalkin} className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-neutral-200 space-y-4">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-purple-950" />
                <h3 className="text-base font-bold text-neutral-900">Record Walk-in Client</h3>
              </div>
              <p className="text-xs text-neutral-500">
                Instantly locks the calendar and reserves the stylist to prevent online double-booking.
              </p>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-neutral-600 block mb-1">Client Name</label>
                  <input
                    type="text"
                    required
                    value={walkinName}
                    onChange={(e) => setWalkinName(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="text-neutral-600 block mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={walkinPhone}
                    onChange={(e) => setWalkinPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-neutral-600 block mb-1">Date</label>
                    <input
                      type="date"
                      required
                      value={walkinDate}
                      onChange={(e) => setWalkinDate(e.target.value)}
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="text-neutral-600 block mb-1">Start Time</label>
                    <input
                      type="time"
                      required
                      value={walkinTime}
                      onChange={(e) => setWalkinTime(e.target.value)}
                      className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-neutral-600 block mb-1">Service</label>
                  <select
                    value={walkinServiceId}
                    onChange={(e) => setWalkinServiceId(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl"
                  >
                    {services.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} (₹{s.price}, {s.durationMinutes}m)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-neutral-600 block mb-1">Stylist</label>
                  <select
                    value={walkinStaffId}
                    onChange={(e) => setWalkinStaffId(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl"
                  >
                    {staffList.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setWalkinModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-neutral-900 text-white rounded-xl text-xs font-bold"
                >
                  Lock In Walk-in
                </button>
              </div>
            </form>
          </div>
        )}

        {/* MODAL: CANCEL WITH REASON */}
        {cancelModalBooking && (
          <div className="fixed inset-0 z-50 bg-neutral-950/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-neutral-200 space-y-4">
              <h3 className="text-base font-bold text-neutral-900">Cancel Appointment #{cancelModalBooking.bookingCode}</h3>
              <p className="text-xs text-neutral-600">
                Record the reason for cancellation for salon reporting and client records:
              </p>
              <textarea
                rows={3}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full p-3 text-xs bg-neutral-50 border border-neutral-200 rounded-xl"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setCancelModalBooking(null)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-600"
                >
                  Back
                </button>
                <button
                  onClick={() => {
                    handleUpdateStatus(cancelModalBooking.id, 'cancelled', cancelReason);
                    setCancelModalBooking(null);
                  }}
                  className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold"
                >
                  Confirm Cancellation
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
