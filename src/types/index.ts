export type UserRole = 'customer' | 'salon_owner' | 'admin';

export type SalonCategory = 'unisex' | 'barber' | 'beauty_parlour' | 'hair_studio';

export type VerificationStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export type PaymentMethod = 'pay_at_salon' | 'online';

export type PaymentStatus = 'pending' | 'paid' | 'refunded';

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  createdAt: string;
}

export interface Salon {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  category: SalonCategory;
  address: string;
  city: string;
  locality: string;
  latitude: number;
  longitude: number;
  openingHours: string;
  openTime: string;
  closeTime: string;
  verificationStatus: VerificationStatus;
  autoConfirm: boolean;
  rating: number;
  reviewCount: number;
  startingPrice: number;
  imageUrl: string;
  cancellationPolicy: string;
  createdAt: string;
}

export interface Service {
  id: string;
  salonId: string;
  name: string;
  description: string;
  price: number;
  durationMinutes: number;
  category: string;
  isActive: boolean;
}

export interface Staff {
  id: string;
  salonId: string;
  name: string;
  roleTitle: string;
  isActive: boolean;
  assignedServiceIds: string[];
  avatarUrl?: string;
}

export interface StaffSchedule {
  id: string;
  staffId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  breakStart: string;
  breakEnd: string;
  isWorking: boolean;
}

export interface BookingServiceSnapshot {
  serviceId: string;
  serviceName: string;
  price: number;
  durationMinutes: number;
}

export interface Booking {
  id: string;
  bookingCode: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  salonId: string;
  salonName: string;
  staffId: string | null;
  staffName: string;
  date: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  cancelReason?: string;
  totalPrice: number;
  totalDurationMinutes: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  isWalkin: boolean;
  services: BookingServiceSnapshot[];
  createdAt: string;
}

export interface Review {
  id: string;
  bookingId: string;
  customerId: string;
  customerName: string;
  salonId: string;
  rating: number;
  comment: string;
  salonResponse?: string;
  createdAt: string;
}

export interface TimeSlot {
  time: string;
  available: boolean;
  reason?: string;
}
