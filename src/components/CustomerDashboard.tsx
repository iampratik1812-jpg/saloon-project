import React, { useState, useEffect } from 'react';
import { Booking, Review } from '../types/index.ts';
import { bookingsApi } from '../lib/api.ts';
import { useAuth } from '../context/AuthContext.tsx';
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Star,
  User,
  ArrowRight
} from 'lucide-react';

interface CustomerDashboardProps {
  onWriteReview: (booking: Booking) => void;
  onExploreSalons: () => void;
}

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({
  onWriteReview,
  onExploreSalons
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'history' | 'profile'>('upcoming');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingBooking, setCancellingBooking] = useState<Booking | null>(null);
  const [cancelReason, setCancelReason] = useState('Change of schedule');
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await bookingsApi.getBookings();
      setBookings(res.bookings);
    } catch (err: any) {
      console.error('Failed to load bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const upcomingBookings = bookings.filter(
    (b) => b.status === 'confirmed' || b.status === 'pending'
  );

  const historyBookings = bookings.filter(
    (b) => b.status === 'completed' || b.status === 'cancelled'
  );

  const handleCancel = async () => {
    if (!cancellingBooking) return;
    try {
      setActionError(null);
      await bookingsApi.updateStatus(cancellingBooking.id, 'cancelled', cancelReason);
      setActionSuccess(`Appointment #${cancellingBooking.bookingCode} cancelled successfully.`);
      setCancellingBooking(null);
      fetchBookings();
    } catch (err: any) {
      setActionError(err.message || 'Failed to cancel appointment.');
    }
  };

  return (
    <div className="py-8 bg-[#FAF9F6] min-h-[calc(100vh-140px)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Banner */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/90 shadow-xs mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-purple-900 mb-1">
              <span>Customer Portal</span>
              <span>·</span>
              <span className="text-emerald-700">Active Member</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
              Hello, {user?.fullName || 'Client'}
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1">
              Manage your upcoming beauty sessions, booking vouchers, and reviews.
            </p>
          </div>

          <button
            onClick={onExploreSalons}
            className="px-5 py-2.5 bg-purple-950 hover:bg-purple-900 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <span>Book New Appointment</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Notifications */}
        {actionSuccess && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center justify-between">
            <span>{actionSuccess}</span>
            <button
              onClick={() => setActionSuccess(null)}
              className="text-emerald-600 hover:text-emerald-900 font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {actionError && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-center justify-between">
            <span>{actionError}</span>
            <button
              onClick={() => setActionError(null)}
              className="text-rose-600 hover:text-rose-900 font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 mb-6 border-b border-neutral-200 pb-3">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'upcoming'
                ? 'bg-purple-950 text-white shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900 bg-white border border-neutral-200'
            }`}
          >
            Upcoming Appointments ({upcomingBookings.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'bg-purple-950 text-white shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900 bg-white border border-neutral-200'
            }`}
          >
            Past History ({historyBookings.length})
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-purple-950 text-white shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900 bg-white border border-neutral-200'
            }`}
          >
            Profile & Contact
          </button>
        </div>

        {/* Tab 1: UPCOMING APPOINTMENTS */}
        {activeTab === 'upcoming' && (
          <div className="space-y-4">
            {loading ? (
              <div className="bg-white rounded-2xl p-12 text-center text-xs text-neutral-400">
                Loading your appointments...
              </div>
            ) : upcomingBookings.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 border border-neutral-200 text-center space-y-3">
                <Calendar className="w-10 h-10 text-neutral-300 mx-auto" />
                <h3 className="text-base font-bold text-neutral-900">No Upcoming Appointments</h3>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                  You have no scheduled bookings right now. Explore top-rated salons and book your next haircut, spa, or facial.
                </p>
                <button
                  onClick={onExploreSalons}
                  className="px-4 py-2 bg-purple-950 text-white rounded-xl text-xs font-semibold"
                >
                  Find Salons Near You
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {upcomingBookings.map((b) => (
                  <div
                    key={b.id}
                    className="bg-white rounded-2xl p-5 border border-neutral-200/90 shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Code & Status */}
                      <div className="flex items-center justify-between pb-3 border-b border-neutral-100 mb-3">
                        <span className="font-mono text-xs font-bold text-purple-950">
                          #{b.bookingCode}
                        </span>
                        <span
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                            b.status === 'confirmed'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {b.status === 'confirmed' ? 'Confirmed' : 'Pending Confirmation'}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-neutral-900 mb-1">{b.salonName}</h3>

                      <div className="space-y-1.5 text-xs text-neutral-600 mb-4">
                        <div className="flex items-center gap-1.5 font-medium text-neutral-800">
                          <Calendar className="w-3.5 h-3.5 text-purple-900" />
                          <span>{b.date} at {b.startTime} ({b.totalDurationMinutes} mins)</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-neutral-500">
                          <User className="w-3.5 h-3.5 text-neutral-400" />
                          <span>Stylist: {b.staffName}</span>
                        </div>
                      </div>

                      {/* Service Breakdown */}
                      <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-100 text-xs space-y-1 mb-4">
                        <span className="text-[10px] text-neutral-400 uppercase font-semibold block">
                          Booked Services
                        </span>
                        {b.services.map((s, idx) => (
                          <div key={idx} className="flex justify-between text-neutral-700">
                            <span>{s.serviceName}</span>
                            <span className="font-semibold text-neutral-900 tabular-nums">₹{s.price}</span>
                          </div>
                        ))}
                        <div className="pt-2 border-t border-neutral-200 flex justify-between font-bold text-neutral-900">
                          <span>Pay at Salon:</span>
                          <span className="text-purple-950 tabular-nums">₹{b.totalPrice}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-2 flex items-center justify-between">
                      <span className="text-[11px] text-neutral-400">
                        Free cancellation up to 2h prior
                      </span>
                      <button
                        onClick={() => setCancellingBooking(b)}
                        className="px-3 py-1.5 text-xs font-semibold text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
                      >
                        Cancel Slot
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: PAST HISTORY */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            {historyBookings.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center text-xs text-neutral-400 border border-neutral-200">
                No past appointments yet.
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-xs">
                <div className="divide-y divide-neutral-100">
                  {historyBookings.map((b) => (
                    <div
                      key={b.id}
                      className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-neutral-50/50 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-neutral-600">
                            #{b.bookingCode}
                          </span>
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                              b.status === 'completed'
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-neutral-100 text-neutral-600'
                            }`}
                          >
                            {b.status.toUpperCase()}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-neutral-900">{b.salonName}</h4>
                        <p className="text-xs text-neutral-500">
                          {b.date} · Stylist: {b.staffName} · {b.services.map((s) => s.serviceName).join(', ')}
                        </p>
                        {b.cancelReason && (
                          <p className="text-[11px] text-rose-600">Reason: {b.cancelReason}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-4 shrink-0">
                        <div className="text-right">
                          <span className="text-[11px] text-neutral-400 block">Total Paid</span>
                          <span className="text-sm font-bold text-neutral-900 tabular-nums">
                            ₹{b.totalPrice}
                          </span>
                        </div>

                        {b.status === 'completed' && (
                          <button
                            onClick={() => onWriteReview(b)}
                            className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border border-amber-200 cursor-pointer"
                          >
                            <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" />
                            <span>Write Review</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: PROFILE MANAGEMENT */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-neutral-200 max-w-xl shadow-xs space-y-4">
            <h3 className="text-base font-bold text-neutral-900">Personal Information</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-neutral-500 block mb-1">Full Name</label>
                <input
                  type="text"
                  disabled
                  value={user?.fullName || ''}
                  className="w-full px-3 py-2 bg-neutral-100 border border-neutral-200 rounded-xl text-neutral-700"
                />
              </div>
              <div>
                <label className="text-neutral-500 block mb-1">Email Address</label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full px-3 py-2 bg-neutral-100 border border-neutral-200 rounded-xl text-neutral-700"
                />
              </div>
              <div>
                <label className="text-neutral-500 block mb-1">Mobile Phone (India)</label>
                <input
                  type="text"
                  disabled
                  value={user?.phone || '+91 98765 43210'}
                  className="w-full px-3 py-2 bg-neutral-100 border border-neutral-200 rounded-xl text-neutral-700"
                />
              </div>
              <div className="pt-2 text-[11px] text-neutral-500">
                To update your account credentials or phone number, please contact customer support.
              </div>
            </div>
          </div>
        )}

        {/* Cancel Confirmation Modal */}
        {cancellingBooking && (
          <div className="fixed inset-0 z-50 bg-neutral-950/70 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-neutral-200 space-y-4">
              <div className="flex items-center gap-2 text-rose-700">
                <AlertCircle className="w-5 h-5" />
                <h3 className="text-base font-bold text-neutral-900">Cancel Appointment?</h3>
              </div>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Are you sure you want to cancel booking #{cancellingBooking.bookingCode} at{' '}
                <strong>{cancellingBooking.salonName}</strong> on {cancellingBooking.date} at{' '}
                {cancellingBooking.startTime}?
              </p>

              <div>
                <label className="text-xs font-semibold text-neutral-700 block mb-1">
                  Reason for Cancellation
                </label>
                <select
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl"
                >
                  <option value="Change of personal plans">Change of personal plans</option>
                  <option value="Found an earlier slot">Found an earlier slot</option>
                  <option value="Emergency at work or home">Emergency at work or home</option>
                  <option value="Prefer another stylist">Prefer another stylist</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  onClick={() => setCancellingBooking(null)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900"
                >
                  Keep Appointment
                </button>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold transition-colors"
                >
                  Yes, Cancel Slot
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
