export type UserRole = 'customer' | 'salon_owner' | 'admin';

export type SalonCategory = 'unisex' | 'barber' | 'beauty_parlour' | 'hair_studio';

export type VerificationStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export type PaymentMethod = 'pay_at_salon' | 'online';

export type PaymentStatus = 'pending' | 'paid' | 'refunded';

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  passwordHash: string;
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
  openingHours: string; // e.g. "09:00 - 21:00"
  openTime: string; // "09:00"
  closeTime: string; // "21:00"
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

export interface StaffSchedule {
  id: string;
  staffId: string;
  dayOfWeek: number; // 0=Sunday, 1=Monday... 6=Saturday
  startTime: string; // "09:00"
  endTime: string; // "20:00"
  breakStart: string; // "13:00"
  breakEnd: string; // "14:00"
  isWorking: boolean;
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
  date: string; // YYYY-MM-DD
  startTime: string; // "10:30"
  endTime: string; // "11:15"
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
  rating: number; // 1 to 5
  comment: string;
  salonResponse?: string;
  createdAt: string;
}
