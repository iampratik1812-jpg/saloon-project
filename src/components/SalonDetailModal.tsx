import React, { useState, useEffect } from 'react';
import { Salon, Service, Staff, Review } from '../types/index.ts';
import { salonsApi } from '../lib/api.ts';
import {
  X,
  MapPin,
  Clock,
  Star,
  ShieldCheck,
  Scissors,
  UserCheck,
  Check,
  MessageSquare,
  AlertCircle
} from 'lucide-react';

interface SalonDetailModalProps {
  salon: Salon | null;
  onClose: () => void;
  onProceedToBook: (salon: Salon, preselectedServiceId?: string) => void;
}

export const SalonDetailModal: React.FC<SalonDetailModalProps> = ({
  salon,
  onClose,
  onProceedToBook
}) => {
  const [activeTab, setActiveTab] = useState<'services' | 'team' | 'reviews'>('services');
  const [services, setServices] = useState<Service[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!salon) return;
    setLoading(true);
    salonsApi
      .getSalonById(salon.id)
      .then((res) => {
        setServices(res.services);
        setStaff(res.staff);
        setReviews(res.reviews);
      })
      .catch((err) => console.error('Failed to load salon details:', err))
      .finally(() => setLoading(false));
  }, [salon]);

  if (!salon) return null;

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-neutral-200">
        {/* Header Photo & Close Button */}
        <div className="relative h-48 sm:h-64 bg-neutral-100 shrink-0">
          <img
            src={salon.imageUrl}
            alt={salon.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-neutral-950/30 to-transparent" />

          {/* Close modal button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-neutral-900/70 hover:bg-neutral-900 text-white flex items-center justify-center transition-colors shadow-md z-10"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Salon Badge on Image */}
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <div className="flex flex-wrap items-center gap-2 mb-1 text-xs">
              <span className="bg-purple-950/90 text-amber-300 font-semibold px-2.5 py-0.5 rounded-md backdrop-blur-xs">
                {salon.category.toUpperCase().replace('_', ' ')}
              </span>
              <span className="bg-emerald-600/90 text-white font-medium px-2 py-0.5 rounded-md flex items-center gap-1 backdrop-blur-xs">
                <ShieldCheck className="w-3.5 h-3.5" />
                Verified Salon
              </span>
            </div>
            <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight drop-shadow-sm">
              {salon.name}
            </h2>
            <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-200 mt-1">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {salon.address}, {salon.locality}, {salon.city}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {salon.openingHours}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="px-6 pt-4 border-b border-neutral-200 flex items-center justify-between shrink-0 bg-neutral-50/50">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('services')}
              className={`pb-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
                activeTab === 'services'
                  ? 'border-purple-950 text-purple-950'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900'
              }`}
            >
              Services & Menu ({services.length})
            </button>
            <button
              onClick={() => setActiveTab('team')}
              className={`pb-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
                activeTab === 'team'
                  ? 'border-purple-950 text-purple-950'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900'
              }`}
            >
              Stylists & Team ({staff.length})
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`pb-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
                activeTab === 'reviews'
                  ? 'border-purple-950 text-purple-950'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900'
              }`}
            >
              Reviews ({reviews.length})
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-xs pb-3">
            <Star className="w-4 h-4 fill-amber-400 stroke-amber-400" />
            <strong className="text-neutral-900 font-bold">{salon.rating.toFixed(1)}</strong>
            <span className="text-neutral-500">({salon.reviewCount} verified reviews)</span>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {loading ? (
            <div className="py-12 text-center text-neutral-400 text-sm">
              Loading salon details and service menu...
            </div>
          ) : (
            <>
              {/* TAB 1: SERVICES MENU */}
              {activeTab === 'services' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-neutral-500">
                      Select any service to begin booking your customized appointment.
                    </p>
                    <span className="text-xs text-neutral-400">All prices in ₹ (INR)</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {services.map((srv) => (
                      <div
                        key={srv.id}
                        className="p-4 rounded-xl border border-neutral-200/90 hover:border-purple-950/40 bg-neutral-50/50 hover:bg-white transition-all flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-1.5">
                            <h4 className="text-sm font-bold text-neutral-900">{srv.name}</h4>
                            <span className="text-sm font-bold text-purple-950 tabular-nums shrink-0">
                              ₹{srv.price}
                            </span>
                          </div>
                          <p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed mb-3">
                            {srv.description}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-neutral-200/60 flex items-center justify-between text-xs">
                          <span className="text-neutral-500 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-neutral-400" />
                            {srv.durationMinutes} mins
                          </span>
                          <button
                            onClick={() => onProceedToBook(salon, srv.id)}
                            className="px-3 py-1 bg-purple-950 hover:bg-purple-900 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                          >
                            Select & Book
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Cancellation Policy Banner */}
                  <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200/70 text-xs text-amber-900 flex items-start gap-3 mt-6">
                    <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-semibold mb-0.5">Cancellation Policy</strong>
                      <p className="text-amber-800 leading-relaxed">{salon.cancellationPolicy}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: STYLISTS & TEAM */}
              {activeTab === 'team' && (
                <div className="space-y-4">
                  <p className="text-xs text-neutral-500">
                    Certified stylists, barbers, and beauticians available at {salon.name}.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {staff.map((st) => (
                      <div
                        key={st.id}
                        className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/50 flex items-center gap-3.5"
                      >
                        <div className="w-12 h-12 rounded-full bg-purple-950 text-white font-bold flex items-center justify-center text-sm shrink-0">
                          {st.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-neutral-900">{st.name}</h4>
                          <p className="text-xs text-purple-900 font-medium">{st.roleTitle}</p>
                          <span className="text-[11px] text-emerald-700 flex items-center gap-1 mt-1 font-medium">
                            <Check className="w-3 h-3" /> Available for booking
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: REVIEWS */}
              {activeTab === 'reviews' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
                    <div>
                      <p className="text-base font-bold text-neutral-900">
                        {salon.rating.toFixed(1)} out of 5 Stars
                      </p>
                      <p className="text-xs text-neutral-500">
                        Based on {salon.reviewCount} customer reviews
                      </p>
                    </div>
                  </div>

                  {reviews.length === 0 ? (
                    <div className="py-8 text-center text-xs text-neutral-500">
                      No reviews written yet. Be the first to book and share your feedback!
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {reviews.map((rev) => (
                        <div
                          key={rev.id}
                          className="p-4 rounded-xl bg-neutral-50/70 border border-neutral-200 space-y-2 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-neutral-900">{rev.customerName}</span>
                              <span className="text-emerald-700 font-medium">· Verified Client</span>
                            </div>
                            <div className="flex items-center text-amber-500">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3.5 h-3.5 ${
                                    i < rev.rating
                                      ? 'fill-amber-400 stroke-amber-400'
                                      : 'stroke-neutral-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-neutral-700 leading-relaxed">{rev.comment}</p>
                          {rev.salonResponse && (
                            <div className="mt-2.5 p-3 rounded-lg bg-purple-50/60 border border-purple-100 text-purple-950 space-y-1">
                              <span className="font-semibold block text-[11px]">
                                Response from {salon.name}:
                              </span>
                              <p className="text-[11px] leading-relaxed text-purple-900">
                                {rev.salonResponse}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-6 bg-neutral-50 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div>
            <span className="text-[11px] text-neutral-500 block uppercase font-medium">
              Appointments starting at
            </span>
            <span className="text-lg font-extrabold text-neutral-900 tabular-nums">
              ₹{salon.startingPrice}{' '}
              <span className="text-xs font-normal text-neutral-500">· Pay at the Salon</span>
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 text-xs font-semibold text-neutral-700 bg-white border border-neutral-200 rounded-xl hover:bg-neutral-100 transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => onProceedToBook(salon)}
              className="flex-1 sm:flex-none px-6 py-2.5 text-xs font-bold text-white bg-purple-950 hover:bg-purple-900 rounded-xl transition-all shadow-sm active:scale-98 cursor-pointer"
            >
              Book an Appointment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
