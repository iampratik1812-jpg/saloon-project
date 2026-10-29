import React, { useState } from 'react';
import { salonsApi, authApi } from '../lib/api.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { X, Store, CheckCircle2, AlertCircle, Building, Clock, MapPin } from 'lucide-react';

interface OwnerRegisterModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const OwnerRegisterModal: React.FC<OwnerRegisterModalProps> = ({
  onClose,
  onSuccess
}) => {
  const { user, login } = useAuth();

  const [businessName, setBusinessName] = useState('');
  const [ownerName, setOwnerName] = useState(user?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [password, setPassword] = useState('salon123');
  const [category, setCategory] = useState<'unisex' | 'barber' | 'beauty_parlour' | 'hair_studio'>('unisex');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Bengaluru');
  const [locality, setLocality] = useState('');
  const [description, setDescription] = useState('');
  const [openTime, setOpenTime] = useState('09:30');
  const [closeTime, setCloseTime] = useState('20:30');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      // 1. If not logged in, register or sign in as salon owner first
      let currentOwner = user;
      if (!currentOwner) {
        try {
          const authRes = await authApi.register({
            fullName: ownerName,
            email,
            phone,
            password,
            role: 'salon_owner'
          });
          currentOwner = authRes.user;
        } catch (authErr: any) {
          // If already exists, attempt login
          const loginRes = await authApi.login({ email, password });
          currentOwner = loginRes.user;
        }
      }

      // 2. Create the salon listing with 'pending' status
      await salonsApi.createSalon({
        name: businessName.trim(),
        description: description.trim() || 'Premier salon offering professional hair and aesthetic services.',
        category,
        address: address.trim(),
        city: city.trim(),
        locality: locality.trim(),
        openTime,
        closeTime,
        imageUrl: '/src/assets/images/hero_salon_interior_1793290119938.jpg',
        cancellationPolicy: 'Free cancellation up to 2 hours before appointment.',
        autoConfirm: true
      });

      setIsSuccess(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit salon application');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-neutral-200 relative max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-500 hover:text-neutral-900 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {isSuccess ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <span className="text-xs font-bold text-amber-700 uppercase tracking-wider block mb-1">
                Application Submitted · Pending Verification
              </span>
              <h2 className="text-2xl font-extrabold text-neutral-900">
                Welcome to SalonBook Partner Network!
              </h2>
              <p className="text-xs text-neutral-600 mt-2 max-w-md mx-auto leading-relaxed">
                Your salon <strong>"{businessName}"</strong> has been registered. To ensure trust and customer safety, all new salon listings undergo administrator verification. You can approve this salon right away from the Admin Console!
              </p>
            </div>

            <div className="pt-4">
              <button
                onClick={() => {
                  onSuccess();
                  onClose();
                }}
                className="px-6 py-2.5 bg-purple-950 text-white rounded-xl text-xs font-bold hover:bg-purple-900 transition-colors"
              >
                Go to Salon Portal
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-900 mb-1">
                <Store className="w-4 h-4" />
                <span>Partner Onboarding</span>
              </div>
              <h2 className="text-2xl font-extrabold text-neutral-900 tracking-tight">
                List Your Salon on SalonBook
              </h2>
              <p className="text-xs text-neutral-500 mt-1">
                Fill in your salon details. New listings are verified before going live to customers.
              </p>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="text-neutral-700 font-semibold block mb-1">
                  Salon / Business Name
                </label>
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Royal Looks Unisex Salon & Spa"
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-700 font-semibold block mb-1">Owner Name</label>
                  <input
                    type="text"
                    required
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder="Your Full Name"
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl font-medium"
                  />
                </div>
                <div>
                  <label className="text-neutral-700 font-semibold block mb-1">Salon Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl font-medium"
                  >
                    <option value="unisex">Unisex Salon</option>
                    <option value="barber">Barbershop / Men's Grooming</option>
                    <option value="beauty_parlour">Beauty Parlour / Bridal</option>
                    <option value="hair_studio">Hair Studio & Spa</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-700 font-semibold block mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contact@salon.com"
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl font-medium"
                  />
                </div>
                <div>
                  <label className="text-neutral-700 font-semibold block mb-1">Phone Number (India)</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl font-medium"
                  />
                </div>
              </div>

              {!user && (
                <div>
                  <label className="text-neutral-700 font-semibold block mb-1">Owner Account Password</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl font-medium"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-700 font-semibold block mb-1">City</label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl font-medium"
                  >
                    <option value="Bengaluru">Bengaluru</option>
                    <option value="Mumbai">Mumbai</option>
                    <option value="New Delhi">New Delhi</option>
                    <option value="Hyderabad">Hyderabad</option>
                  </select>
                </div>
                <div>
                  <label className="text-neutral-700 font-semibold block mb-1">Locality / Neighborhood</label>
                  <input
                    type="text"
                    required
                    value={locality}
                    onChange={(e) => setLocality(e.target.value)}
                    placeholder="e.g. Koramangala / Bandra / South Ex"
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-neutral-700 font-semibold block mb-1">Full Street Address</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Shop No, Building Name, Main Road"
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-700 font-semibold block mb-1">Opening Time</label>
                  <input
                    type="time"
                    value={openTime}
                    onChange={(e) => setOpenTime(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl font-medium"
                  />
                </div>
                <div>
                  <label className="text-neutral-700 font-semibold block mb-1">Closing Time</label>
                  <input
                    type="time"
                    value={closeTime}
                    onChange={(e) => setCloseTime(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-neutral-700 font-semibold block mb-1">Business Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell clients about your specialties, awards, or sanitization protocols..."
                  className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl font-medium"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-purple-950 hover:bg-purple-900 text-white rounded-xl font-bold transition-all shadow-md active:scale-98 cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Submitting Application...' : 'Submit Salon for Review'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
