import React, { useState, useEffect } from 'react';
import { Salon, User, Booking } from '../types/index.ts';
import { adminApi, bookingsApi } from '../lib/api.ts';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Users,
  Store,
  Calendar,
  Building,
  TrendingUp,
  Clock
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'verification' | 'salons' | 'users' | 'bookings'>('verification');
  const [stats, setStats] = useState<any>(null);
  const [salons, setSalons] = useState<Salon[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsRes, salonsRes, usersRes, bookingsRes] = await Promise.all([
        adminApi.getStats(),
        adminApi.getSalons(),
        adminApi.getUsers(),
        bookingsApi.getBookings()
      ]);
      setStats(statsRes.stats);
      setSalons(salonsRes.salons);
      setUsers(usersRes.users);
      setBookings(bookingsRes.bookings);
    } catch (err: any) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateVerification = async (salonId: string, status: string) => {
    try {
      const res = await adminApi.updateVerification(salonId, status);
      setActionMsg(res.message);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Verification update failed');
    }
  };

  const handleResetSeed = async () => {
    if (!confirm('Reset database to clean initial seed data?')) return;
    try {
      await adminApi.resetSeedData();
      setActionMsg('Database successfully reset to seed data.');
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const pendingSalons = salons.filter((s) => s.verificationStatus === 'pending');

  return (
    <div className="py-8 bg-[#FAF9F6] min-h-[calc(100vh-140px)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Admin Header */}
        <div className="bg-neutral-900 text-white rounded-3xl p-6 sm:p-8 shadow-xs mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Platform Administrator Console</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              SalonBook System Administration
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1">
              Manage salon verification workflows, audit bookings, and view platform metrics.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetSeed}
              className="px-3.5 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border border-neutral-700 cursor-pointer"
              title="Reset all appointments and salons to initial demo state"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Demo DB</span>
            </button>
          </div>
        </div>

        {actionMsg && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center justify-between">
            <span>{actionMsg}</span>
            <button onClick={() => setActionMsg(null)} className="font-bold">✕</button>
          </div>
        )}

        {/* Platform Statistics Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs">
            <span className="text-[11px] text-neutral-500 font-semibold uppercase block">Pending Verifications</span>
            <p className="text-2xl font-extrabold text-amber-600 mt-1 tabular-nums">
              {stats?.pendingSalons ?? pendingSalons.length}
            </p>
            <span className="text-[10px] text-neutral-400">Salons awaiting approval</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs">
            <span className="text-[11px] text-neutral-500 font-semibold uppercase block">Registered Salons</span>
            <p className="text-2xl font-extrabold text-neutral-900 mt-1 tabular-nums">{salons.length}</p>
            <span className="text-[10px] text-neutral-400">Total active & pending listings</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs">
            <span className="text-[11px] text-neutral-500 font-semibold uppercase block">Platform Bookings</span>
            <p className="text-2xl font-extrabold text-purple-950 mt-1 tabular-nums">{bookings.length}</p>
            <span className="text-[10px] text-neutral-400">Total appointments booked</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs">
            <span className="text-[11px] text-neutral-500 font-semibold uppercase block">Gross Volume</span>
            <p className="text-2xl font-extrabold text-emerald-800 mt-1 tabular-nums">
              ₹{stats?.totalGrossRevenue ?? 0}
            </p>
            <span className="text-[10px] text-neutral-400">Platform transactional value</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mb-6 border-b border-neutral-200 pb-3">
          <button
            onClick={() => setActiveTab('verification')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'verification'
                ? 'bg-purple-950 text-white shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900 bg-white border border-neutral-200'
            }`}
          >
            Verification Queue ({pendingSalons.length})
          </button>
          <button
            onClick={() => setActiveTab('salons')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'salons'
                ? 'bg-purple-950 text-white shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900 bg-white border border-neutral-200'
            }`}
          >
            All Salons ({salons.length})
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'users'
                ? 'bg-purple-950 text-white shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900 bg-white border border-neutral-200'
            }`}
          >
            Registered Users ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'bookings'
                ? 'bg-purple-950 text-white shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900 bg-white border border-neutral-200'
            }`}
          >
            All Platform Bookings ({bookings.length})
          </button>
        </div>

        {/* TAB 1: VERIFICATION QUEUE */}
        {activeTab === 'verification' && (
          <div className="space-y-4">
            {pendingSalons.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center text-xs text-neutral-400 border border-neutral-200">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <p className="text-sm font-bold text-neutral-800">Verification Queue Clear</p>
                <p className="text-neutral-500">All submitted salon listings have been reviewed and approved.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingSalons.map((s) => (
                  <div
                    key={s.id}
                    className="bg-white p-6 rounded-2xl border border-amber-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                          Pending Approval
                        </span>
                        <span className="text-xs text-neutral-400">Category: {s.category}</span>
                      </div>
                      <h3 className="text-lg font-bold text-neutral-900">{s.name}</h3>
                      <p className="text-xs text-neutral-600">
                        {s.address}, {s.locality}, {s.city}
                      </p>
                      <p className="text-xs text-neutral-500 italic max-w-xl">"{s.description}"</p>
                      <p className="text-[11px] text-neutral-400">
                        Hours: {s.openingHours} · Starting Price: ₹{s.startingPrice}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleUpdateVerification(s.id, 'approved')}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
                      >
                        Approve Listing
                      </button>
                      <button
                        onClick={() => handleUpdateVerification(s.id, 'rejected')}
                        className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-semibold border border-rose-200 transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ALL SALONS */}
        {activeTab === 'salons' && (
          <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-xs">
            <div className="divide-y divide-neutral-100">
              {salons.map((s) => (
                <div key={s.id} className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-neutral-900">{s.name}</h4>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          s.verificationStatus === 'approved'
                            ? 'bg-emerald-50 text-emerald-700'
                            : s.verificationStatus === 'pending'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {s.verificationStatus}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500">
                      {s.locality}, {s.city} · {s.rating.toFixed(1)}★ ({s.reviewCount} reviews) · Starts ₹{s.startingPrice}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 text-xs">
                    {s.verificationStatus !== 'approved' && (
                      <button
                        onClick={() => handleUpdateVerification(s.id, 'approved')}
                        className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg font-semibold"
                      >
                        Approve
                      </button>
                    )}
                    {s.verificationStatus !== 'suspended' && (
                      <button
                        onClick={() => handleUpdateVerification(s.id, 'suspended')}
                        className="px-3 py-1.5 bg-neutral-100 text-neutral-700 hover:bg-rose-50 hover:text-rose-700 rounded-lg font-medium"
                      >
                        Suspend
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: REGISTERED USERS */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-xs">
            <div className="divide-y divide-neutral-100">
              {users.map((u) => (
                <div key={u.id} className="p-4 sm:p-5 flex items-center justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-bold text-neutral-900">{u.fullName}</h4>
                    <p className="text-xs text-neutral-500">{u.email} · {u.phone || 'No phone'}</p>
                  </div>
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-md uppercase ${
                      u.role === 'admin'
                        ? 'bg-neutral-900 text-amber-300'
                        : u.role === 'salon_owner'
                        ? 'bg-purple-100 text-purple-900'
                        : 'bg-neutral-100 text-neutral-700'
                    }`}
                  >
                    {u.role.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: PLATFORM BOOKINGS AUDIT */}
        {activeTab === 'bookings' && (
          <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-xs divide-y divide-neutral-100">
            {bookings.map((b) => (
              <div key={b.id} className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono font-bold text-purple-950">#{b.bookingCode}</span>
                    <span className="font-bold text-neutral-800">{b.salonName}</span>
                    <span className="text-neutral-400">·</span>
                    <span className="text-neutral-600">{b.customerName} ({b.customerPhone})</span>
                  </div>
                  <p className="text-neutral-500">
                    {b.date} at {b.startTime} · Stylist: {b.staffName} · {b.services.map((s) => s.serviceName).join(', ')}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-bold text-neutral-900 block tabular-nums">₹{b.totalPrice}</span>
                  <span className="text-[10px] text-neutral-400 uppercase font-semibold">{b.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
