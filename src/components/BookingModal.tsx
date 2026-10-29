import React, { useState, useEffect } from 'react';
import { Salon, Service, Staff, Booking, TimeSlot } from '../types/index.ts';
import { salonsApi, slotsApi, bookingsApi } from '../lib/api.ts';
import { useAuth } from '../context/AuthContext.tsx';
import {
  X,
  Calendar as CalendarIcon,
  Clock,
  User as UserIcon,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Building,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Check
} from 'lucide-react';

interface BookingModalProps {
  salon: Salon | null;
  preselectedServiceId?: string;
  onClose: () => void;
  onSuccess: (booking: Booking) => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  salon,
  preselectedServiceId,
  onClose,
  onSuccess,
  onOpenAuth
}) => {
  const { user } = useAuth();

  // Wizard Step: 1 = Services, 2 = Stylist & Date/Slot, 3 = Summary & Confirm, 4 = Success
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Data
  const [services, setServices] = useState<Service[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loadingInitial, setLoadingInitial] = useState(true);

  // Selections
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [selectedStaffId, setSelectedStaffId] = useState<string>('any');
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'pay_at_salon' | 'online'>('pay_at_salon');

  // Customer contact info (if not logged in or editing)
  const [customerName, setCustomerName] = useState(user?.fullName || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');

  // Submitting state & errors
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  // Sync user info if auth updates
  useEffect(() => {
    if (user) {
      if (!customerName) setCustomerName(user.fullName);
      if (!customerPhone) setCustomerPhone(user.phone);
      if (!customerEmail) setCustomerEmail(user.email);
    }
  }, [user]);

  // Load salon details, services & staff
  useEffect(() => {
    if (!salon) return;
    setLoadingInitial(true);
    salonsApi
      .getSalonById(salon.id)
      .then((res) => {
        setServices(res.services);
        setStaff(res.staff);
        if (preselectedServiceId && res.services.some((s) => s.id === preselectedServiceId)) {
          setSelectedServiceIds([preselectedServiceId]);
        } else if (res.services.length > 0) {
          setSelectedServiceIds([res.services[0].id]);
        }
      })
      .catch((err) => {
        setErrorMsg('Failed to fetch salon services.');
        console.error(err);
      })
      .finally(() => setLoadingInitial(false));
  }, [salon, preselectedServiceId]);

  // Fetch available slots whenever salon, selectedServiceIds, selectedStaffId, or date changes
  useEffect(() => {
    if (!salon || selectedServiceIds.length === 0 || !selectedDate) return;
    setLoadingSlots(true);
    setErrorMsg(null);
    slotsApi
      .getSlots({
        salonId: salon.id,
        date: selectedDate,
        staffId: selectedStaffId !== 'any' ? selectedStaffId : undefined,
        serviceIds: selectedServiceIds
      })
      .then((res) => {
        setAvailableSlots(res.slots);
        // If current selected slot is no longer available, clear it
        if (selectedSlot) {
          const slotStillValid = res.slots.some((s) => s.time === selectedSlot && s.available);
          if (!slotStillValid) {
            setSelectedSlot('');
          }
        }
      })
      .catch((err) => {
        console.error('Error fetching slots:', err);
      })
      .finally(() => setLoadingSlots(false));
  }, [salon, selectedServiceIds, selectedStaffId, selectedDate]);

  if (!salon) return null;

  // Selected services calculations
  const selectedServices = services.filter((s) => selectedServiceIds.includes(s.id));
  const totalPrice = selectedServices.reduce((sum, s) => sum + s.price, 0);
  const totalDurationMinutes = selectedServices.reduce((sum, s) => sum + s.durationMinutes, 0);

  const toggleService = (id: string) => {
    if (selectedServiceIds.includes(id)) {
      if (selectedServiceIds.length === 1) {
        setErrorMsg('At least one service must be selected.');
        return;
      }
      setSelectedServiceIds(selectedServiceIds.filter((item) => item !== id));
    } else {
      setSelectedServiceIds([...selectedServiceIds, id]);
    }
    setErrorMsg(null);
  };

  const chosenStaffObj = staff.find((st) => st.id === selectedStaffId);
  const chosenStaffName = chosenStaffObj ? chosenStaffObj.name : 'Any Available Stylist';

  const handleConfirmBooking = async () => {
    if (!user) {
      setErrorMsg('Please log in or create an account to confirm your appointment.');
      return;
    }

    if (selectedServiceIds.length === 0) {
      setErrorMsg('Please select at least one service.');
      return;
    }

    if (!selectedSlot) {
      setErrorMsg('Please select a valid appointment time slot.');
      return;
    }

    if (paymentMethod === 'online') {
      setErrorMsg('Online payment is disabled. Please select "Pay at the Salon".');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await bookingsApi.createBooking({
        salonId: salon.id,
        staffId: selectedStaffId !== 'any' ? selectedStaffId : null,
        serviceIds: selectedServiceIds,
        date: selectedDate,
        startTime: selectedSlot,
        paymentMethod: 'pay_at_salon',
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim()
      });

      setConfirmedBooking(res.booking);
      setCurrentStep(4); // Success step
      onSuccess(res.booking);
    } catch (err: any) {
      setErrorMsg(err.message || 'Booking failed. The selected slot might have been taken.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-neutral-200">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-neutral-50/80 border-b border-neutral-200 flex items-center justify-between shrink-0">
          <div>
            <span className="text-[11px] font-semibold text-purple-900 uppercase tracking-wider block">
              Step {currentStep} of 3 · Appointment Booking
            </span>
            <h2 className="text-lg font-bold text-neutral-900 truncate">{salon.name}</h2>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white border border-neutral-200 text-neutral-500 hover:text-neutral-900 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Progress Indicators */}
        <div className="grid grid-cols-3 border-b border-neutral-100 bg-white text-xs text-center font-semibold">
          <div
            className={`py-2.5 border-b-2 transition-all ${
              currentStep === 1
                ? 'border-purple-950 text-purple-950 bg-purple-50/30'
                : currentStep > 1
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-neutral-400'
            }`}
          >
            1. Services
          </div>
          <div
            className={`py-2.5 border-b-2 transition-all ${
              currentStep === 2
                ? 'border-purple-950 text-purple-950 bg-purple-50/30'
                : currentStep > 2
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-neutral-400'
            }`}
          >
            2. Stylist & Slot
          </div>
          <div
            className={`py-2.5 border-b-2 transition-all ${
              currentStep >= 3
                ? 'border-purple-950 text-purple-950 bg-purple-50/30'
                : 'border-transparent text-neutral-400'
            }`}
          >
            3. Summary
          </div>
        </div>

        {/* Body content based on step */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {loadingInitial ? (
            <div className="py-12 text-center text-xs text-neutral-500">
              Loading salon services and available calendar...
            </div>
          ) : (
            <>
              {/* STEP 1: SELECT SERVICES */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-neutral-900">
                      Select Services (Multiple choice allowed)
                    </h3>
                    <span className="text-xs text-neutral-500">
                      {selectedServiceIds.length} selected
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {services.map((srv) => {
                      const isSelected = selectedServiceIds.includes(srv.id);
                      return (
                        <div
                          key={srv.id}
                          onClick={() => toggleService(srv.id)}
                          className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? 'border-purple-950 bg-purple-50/40 shadow-xs'
                              : 'border-neutral-200 hover:border-neutral-300 bg-white'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 border ${
                                isSelected
                                  ? 'bg-purple-950 border-purple-950 text-white'
                                  : 'border-neutral-300 bg-white'
                              }`}
                            >
                              {isSelected && <Check className="w-3.5 h-3.5 stroke-3" />}
                            </div>
                            <div>
                              <p className="text-xs sm:text-sm font-bold text-neutral-900">{srv.name}</p>
                              <p className="text-[11px] text-neutral-500 line-clamp-1">{srv.description}</p>
                              <span className="text-[11px] text-neutral-400 mt-1 inline-block">
                                Duration: {srv.durationMinutes} mins
                              </span>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-sm font-bold text-purple-950 tabular-nums">
                              ₹{srv.price}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Summary Bar */}
                  <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-neutral-500 block">Total Est. Duration:</span>
                      <strong className="text-neutral-900 font-bold">{totalDurationMinutes} mins</strong>
                    </div>
                    <div className="text-right">
                      <span className="text-neutral-500 block">Total Price:</span>
                      <strong className="text-base font-extrabold text-purple-950 tabular-nums">
                        ₹{totalPrice}
                      </strong>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: SELECT STYLIST, DATE & AVAILABLE TIME SLOT */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  {/* Select Stylist */}
                  <div>
                    <label className="text-xs font-bold text-neutral-900 uppercase tracking-wide block mb-2">
                      Choose Stylist / Professional
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div
                        onClick={() => setSelectedStaffId('any')}
                        className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-center gap-2.5 ${
                          selectedStaffId === 'any'
                            ? 'border-purple-950 bg-purple-50/50 font-semibold text-purple-950'
                            : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300'
                        }`}
                      >
                        <UserIcon className="w-4 h-4 text-purple-900" />
                        <div>
                          <p className="font-bold">Any Available Stylist</p>
                          <p className="text-[10px] text-neutral-500 font-normal">Fastest confirmation</p>
                        </div>
                      </div>

                      {staff.map((st) => (
                        <div
                          key={st.id}
                          onClick={() => setSelectedStaffId(st.id)}
                          className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-center gap-2.5 ${
                            selectedStaffId === st.id
                              ? 'border-purple-950 bg-purple-50/50 font-semibold text-purple-950'
                              : 'border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300'
                          }`}
                        >
                          <div className="w-7 h-7 rounded-full bg-purple-950 text-white font-bold flex items-center justify-center text-[11px] shrink-0">
                            {st.name.charAt(0)}
                          </div>
                          <div className="truncate">
                            <p className="font-bold truncate">{st.name}</p>
                            <p className="text-[10px] text-neutral-500 truncate">{st.roleTitle}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Select Date */}
                  <div>
                    <label className="text-xs font-bold text-neutral-900 uppercase tracking-wide block mb-2">
                      Appointment Date
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-neutral-400">
                          <CalendarIcon className="w-4 h-4" />
                        </div>
                        <input
                          type="date"
                          value={selectedDate}
                          min={new Date().toISOString().split('T')[0]}
                          onChange={(e) => setSelectedDate(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-medium text-neutral-900 focus:outline-none focus:ring-2 focus:ring-purple-900 cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Available Time Slots Grid */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold text-neutral-900 uppercase tracking-wide">
                        Available Time Slots
                      </label>
                      <span className="text-[11px] text-neutral-500">
                        {totalDurationMinutes} mins service duration
                      </span>
                    </div>

                    {loadingSlots ? (
                      <div className="py-8 text-center text-xs text-neutral-400">
                        Checking calendar slots and preventing double booking...
                      </div>
                    ) : availableSlots.length === 0 ? (
                      <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 text-center">
                        No appointment slots available for this stylist on {selectedDate}. Please select another date or choose "Any Available Stylist".
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1">
                        {availableSlots.map((slot) => (
                          <button
                            key={slot.time}
                            disabled={!slot.available}
                            onClick={() => setSelectedSlot(slot.time)}
                            className={`py-2 px-2 text-xs font-semibold rounded-lg border text-center transition-all ${
                              !slot.available
                                ? 'bg-neutral-100 text-neutral-300 border-neutral-200 cursor-not-allowed line-through'
                                : selectedSlot === slot.time
                                ? 'bg-purple-950 text-white border-purple-950 shadow-xs'
                                : 'bg-white hover:bg-neutral-50 text-neutral-800 border-neutral-200 cursor-pointer'
                            }`}
                            title={slot.reason || 'Available for booking'}
                          >
                            {slot.time}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 3: BOOKING SUMMARY & CONFIRMATION */}
              {currentStep === 3 && (
                <div className="space-y-5">
                  {/* Summary Box */}
                  <div className="p-5 bg-[#FAF9F6] rounded-2xl border border-neutral-200 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
                      <div>
                        <span className="text-[11px] text-neutral-400 block font-medium">Salon</span>
                        <h4 className="text-sm font-bold text-neutral-900">{salon.name}</h4>
                        <p className="text-xs text-neutral-500">{salon.locality}, {salon.city}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-[11px] text-neutral-400 block font-medium">Scheduled For</span>
                        <p className="text-xs font-bold text-neutral-900">{selectedDate}</p>
                        <p className="text-xs font-semibold text-purple-950">{selectedSlot}</p>
                      </div>
                    </div>

                    {/* Stylist */}
                    <div className="flex items-center justify-between text-xs py-1">
                      <span className="text-neutral-500">Stylist Assigned:</span>
                      <strong className="text-neutral-900 font-semibold">{chosenStaffName}</strong>
                    </div>

                    {/* Itemized Services Breakdown */}
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[11px] text-neutral-400 block font-medium">Selected Services</span>
                      {selectedServices.map((srv) => (
                        <div key={srv.id} className="flex items-center justify-between text-xs text-neutral-700">
                          <span>
                            {srv.name} ({srv.durationMinutes}m)
                          </span>
                          <span className="tabular-nums font-semibold text-neutral-900">₹{srv.price}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-3 border-t border-neutral-200 flex items-center justify-between">
                      <span className="text-xs font-bold text-neutral-900 uppercase">Total Amount Due</span>
                      <span className="text-lg font-extrabold text-purple-950 tabular-nums">
                        ₹{totalPrice}
                      </span>
                    </div>
                  </div>

                  {/* Customer Information Form */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wide">
                      Client Contact Information
                    </h4>
                    {!user ? (
                      <div className="p-4 bg-purple-50/70 rounded-xl border border-purple-200 text-xs text-purple-900 space-y-2">
                        <p className="font-semibold">
                          You need to log in or create an account to finalize this reservation.
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => onOpenAuth('login')}
                            className="px-3 py-1.5 bg-purple-950 text-white rounded-lg font-semibold hover:bg-purple-900"
                          >
                            Log In
                          </button>
                          <button
                            onClick={() => onOpenAuth('register')}
                            className="px-3 py-1.5 bg-white border border-purple-300 text-purple-950 rounded-lg font-semibold hover:bg-neutral-50"
                          >
                            Create Free Account
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="text-neutral-600 block mb-1">Full Name</label>
                          <input
                            type="text"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl font-medium"
                          />
                        </div>
                        <div>
                          <label className="text-neutral-600 block mb-1">Mobile Number</label>
                          <input
                            type="tel"
                            value={customerPhone}
                            onChange={(e) => setCustomerPhone(e.target.value)}
                            placeholder="+91 98765 43210"
                            className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl font-medium"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Payment Method Selector */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wide">
                      Payment Mode
                    </h4>

                    {/* Pay at Salon (Active) */}
                    <div
                      onClick={() => setPaymentMethod('pay_at_salon')}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                        paymentMethod === 'pay_at_salon'
                          ? 'border-purple-950 bg-purple-50/50 shadow-xs'
                          : 'border-neutral-200 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Building className="w-5 h-5 text-purple-900" />
                        <div>
                          <p className="text-xs font-bold text-neutral-900">Pay at the Salon</p>
                          <p className="text-[11px] text-neutral-500">
                            Pay via Cash, UPI, or Card after your service is completed.
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        Recommended
                      </span>
                    </div>

                    {/* Online Payment (Disabled as per prompt instructions) */}
                    <div className="p-3.5 rounded-xl border border-neutral-200 bg-neutral-50 opacity-60 flex items-center justify-between cursor-not-allowed">
                      <div className="flex items-center gap-3">
                        <CreditCard className="w-5 h-5 text-neutral-400" />
                        <div>
                          <p className="text-xs font-bold text-neutral-600">Online Payment</p>
                          <p className="text-[11px] text-neutral-400">
                            Payment gateway not configured. Only Pay at Salon available.
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] text-neutral-400 bg-neutral-200 px-2 py-0.5 rounded">
                        Unavailable
                      </span>
                    </div>
                  </div>

                  {/* Cancellation Policy Notice */}
                  <div className="text-[11px] text-neutral-500 bg-neutral-50 p-3 rounded-xl border border-neutral-200">
                    <strong>Notice:</strong> {salon.cancellationPolicy}
                  </div>
                </div>
              )}

              {/* STEP 4: SUCCESS CONFIRMATION */}
              {currentStep === 4 && confirmedBooking && (
                <div className="py-6 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-sm">
                    <CheckCircle2 className="w-9 h-9" />
                  </div>

                  <div>
                    <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block mb-1">
                      Appointment Confirmed!
                    </span>
                    <h3 className="text-2xl font-extrabold text-neutral-900">
                      Booking #{confirmedBooking.bookingCode}
                    </h3>
                    <p className="text-xs text-neutral-500 mt-1">
                      We have confirmed your slot with {confirmedBooking.salonName}.
                    </p>
                  </div>

                  <div className="max-w-md mx-auto p-4 bg-neutral-50 rounded-2xl border border-neutral-200 text-left text-xs space-y-2">
                    <div className="flex justify-between py-1 border-b border-neutral-200">
                      <span className="text-neutral-500">Date & Time:</span>
                      <span className="font-bold text-neutral-900">
                        {confirmedBooking.date} at {confirmedBooking.startTime}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-neutral-200">
                      <span className="text-neutral-500">Stylist:</span>
                      <span className="font-bold text-neutral-900">{confirmedBooking.staffName}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-neutral-200">
                      <span className="text-neutral-500">Total Price:</span>
                      <span className="font-bold text-purple-950">₹{confirmedBooking.totalPrice}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-neutral-500">Payment:</span>
                      <span className="font-semibold text-emerald-700">Pay at the Salon</span>
                    </div>
                  </div>

                  <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                    A confirmation voucher has been added to your Customer Dashboard. Please arrive 5 minutes before your slot.
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer Step Navigation */}
        <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-200 flex items-center justify-between shrink-0">
          {currentStep === 1 && (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900"
              >
                Cancel
              </button>
              <button
                disabled={selectedServiceIds.length === 0}
                onClick={() => setCurrentStep(2)}
                className="px-5 py-2.5 bg-purple-950 hover:bg-purple-900 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Continue to Stylist & Slot</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </>
          )}

          {currentStep === 2 && (
            <>
              <button
                onClick={() => setCurrentStep(1)}
                className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900 flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
              <button
                disabled={!selectedSlot}
                onClick={() => setCurrentStep(3)}
                className="px-5 py-2.5 bg-purple-950 hover:bg-purple-900 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Review Booking Summary</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </>
          )}

          {currentStep === 3 && (
            <>
              <button
                onClick={() => setCurrentStep(2)}
                className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900 flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
              <button
                disabled={submitting || !user}
                onClick={handleConfirmBooking}
                className="px-6 py-2.5 bg-purple-950 hover:bg-purple-900 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-98 cursor-pointer flex items-center gap-2"
              >
                {submitting ? 'Confirming...' : 'Confirm Appointment (Pay at Salon)'}
              </button>
            </>
          )}

          {currentStep === 4 && (
            <button
              onClick={onClose}
              className="w-full py-2.5 bg-purple-950 hover:bg-purple-900 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Done & View Appointments
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
