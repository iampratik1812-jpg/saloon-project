import {
  User,
  Salon,
  Service,
  Staff,
  StaffSchedule,
  Booking,
  Review,
  TimeSlot
} from '../types/index.ts';

const TOKEN_KEY = 'salonbook_auth_token';

export const tokenStorage = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY)
};

async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = tokenStorage.get();
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(endpoint, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.error || data.message || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data as T;
}

// Auth API
export const authApi = {
  async register(params: {
    fullName: string;
    email: string;
    phone: string;
    password: string;
    role: 'customer' | 'salon_owner';
  }): Promise<{ user: User; token: string }> {
    const res = await apiFetch<{ user: User; token: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(params)
    });
    tokenStorage.set(res.token);
    return res;
  },

  async login(params: { email: string; password: string }): Promise<{ user: User; token: string }> {
    const res = await apiFetch<{ user: User; token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(params)
    });
    tokenStorage.set(res.token);
    return res;
  },

  async demoLogin(role: 'customer' | 'salon_owner' | 'admin', email?: string): Promise<{ user: User; token: string }> {
    const res = await apiFetch<{ user: User; token: string }>('/api/auth/demo-login', {
      method: 'POST',
      body: JSON.stringify({ role, email })
    });
    tokenStorage.set(res.token);
    return res;
  },

  async getMe(): Promise<{ user: User }> {
    return apiFetch<{ user: User }>('/api/auth/me');
  },

  async logout(): Promise<void> {
    try {
      await apiFetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    } finally {
      tokenStorage.clear();
    }
  }
};

// Salons API
export const salonsApi = {
  async getSalons(params?: {
    category?: string;
    city?: string;
    locality?: string;
    minRating?: number;
    maxPrice?: number;
    q?: string;
    sort?: string;
    ownerId?: string;
  }): Promise<{ salons: Salon[]; total: number }> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          searchParams.append(key, String(val));
        }
      });
    }
    const queryStr = searchParams.toString();
    return apiFetch<{ salons: Salon[]; total: number }>(`/api/salons${queryStr ? `?${queryStr}` : ''}`);
  },

  async getSalonById(id: string): Promise<{
    salon: Salon;
    services: Service[];
    staff: Staff[];
    reviews: Review[];
  }> {
    return apiFetch(`/api/salons/${id}`);
  },

  async createSalon(salonData: Partial<Salon>): Promise<{ salon: Salon }> {
    return apiFetch('/api/salons', {
      method: 'POST',
      body: JSON.stringify(salonData)
    });
  },

  async updateSalon(id: string, updates: Partial<Salon>): Promise<{ salon: Salon }> {
    return apiFetch(`/api/salons/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }
};

// Services API
export const servicesApi = {
  async getServices(salonId: string): Promise<{ services: Service[] }> {
    return apiFetch(`/api/salons/${salonId}/services`);
  },

  async createService(salonId: string, serviceData: Partial<Service>): Promise<{ service: Service }> {
    return apiFetch(`/api/salons/${salonId}/services`, {
      method: 'POST',
      body: JSON.stringify(serviceData)
    });
  },

  async updateService(id: string, updates: Partial<Service>): Promise<{ service: Service }> {
    return apiFetch(`/api/services/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  },

  async deleteService(id: string): Promise<{ success: boolean }> {
    return apiFetch(`/api/services/${id}`, {
      method: 'DELETE'
    });
  }
};

// Staff API
export const staffApi = {
  async getStaff(salonId: string): Promise<{ staff: Staff[] }> {
    return apiFetch(`/api/salons/${salonId}/staff`);
  },

  async createStaff(salonId: string, data: Partial<Staff>): Promise<{ staff: Staff }> {
    return apiFetch(`/api/salons/${salonId}/staff`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async updateStaff(id: string, updates: Partial<Staff>): Promise<{ staff: Staff }> {
    return apiFetch(`/api/staff/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  },

  async getSchedules(staffId: string): Promise<{ schedules: StaffSchedule[] }> {
    return apiFetch(`/api/staff/${staffId}/schedules`);
  },

  async updateSchedule(scheduleId: string, updates: Partial<StaffSchedule>): Promise<{ schedule: StaffSchedule }> {
    return apiFetch(`/api/schedules/${scheduleId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }
};

// Slots API
export const slotsApi = {
  async getSlots(params: {
    salonId: string;
    date: string;
    staffId?: string;
    serviceIds?: string[];
  }): Promise<{ slots: TimeSlot[]; totalDurationMinutes: number; date: string }> {
    const q = new URLSearchParams({
      date: params.date,
      ...(params.staffId ? { staffId: params.staffId } : {}),
      ...(params.serviceIds && params.serviceIds.length ? { serviceIds: params.serviceIds.join(',') } : {})
    });
    return apiFetch(`/api/salons/${params.salonId}/slots?${q.toString()}`);
  }
};

// Bookings API
export const bookingsApi = {
  async createBooking(params: {
    salonId: string;
    staffId?: string | null;
    serviceIds: string[];
    date: string;
    startTime: string;
    paymentMethod: 'pay_at_salon' | 'online';
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
    isWalkin?: boolean;
  }): Promise<{ booking: Booking; message: string }> {
    return apiFetch('/api/bookings', {
      method: 'POST',
      body: JSON.stringify(params)
    });
  },

  async getBookings(params?: {
    salonId?: string;
    status?: string;
    date?: string;
  }): Promise<{ bookings: Booking[]; salons?: Salon[] }> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v) searchParams.append(k, v);
      });
    }
    const q = searchParams.toString();
    return apiFetch(`/api/bookings${q ? `?${q}` : ''}`);
  },

  async updateStatus(
    id: string,
    status: Booking['status'],
    cancelReason?: string
  ): Promise<{ booking: Booking; message: string }> {
    return apiFetch(`/api/bookings/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, cancelReason })
    });
  }
};

// Reviews API
export const reviewsApi = {
  async submitReview(params: {
    bookingId: string;
    salonId: string;
    rating: number;
    comment: string;
  }): Promise<{ review: Review; message: string }> {
    return apiFetch('/api/reviews', {
      method: 'POST',
      body: JSON.stringify(params)
    });
  },

  async replyToReview(reviewId: string, response: string): Promise<{ review: Review }> {
    return apiFetch(`/api/reviews/${reviewId}/reply`, {
      method: 'POST',
      body: JSON.stringify({ response })
    });
  }
};

// Admin API
export const adminApi = {
  async getStats(): Promise<{
    stats: {
      totalCustomers: number;
      totalOwners: number;
      totalSalons: number;
      pendingSalons: number;
      totalBookings: number;
      completedBookings: number;
      totalGrossRevenue: number;
    };
  }> {
    return apiFetch('/api/admin/stats');
  },

  async getSalons(): Promise<{ salons: Salon[] }> {
    return apiFetch('/api/admin/salons');
  },

  async updateVerification(salonId: string, status: string): Promise<{ salon: Salon; message: string }> {
    return apiFetch(`/api/admin/salons/${salonId}/verification`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  },

  async getUsers(): Promise<{ users: User[] }> {
    return apiFetch('/api/admin/users');
  },

  async resetSeedData(): Promise<{ success: boolean; message: string }> {
    return apiFetch('/api/demo/reset', { method: 'POST' });
  }
};
