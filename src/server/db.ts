import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {
  UserProfile,
  Salon,
  Service,
  Staff,
  StaffSchedule,
  Booking,
  Review
} from './types.ts';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'salonbook-db.json');

// Password security helpers using crypto scrypt
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const [salt, key] = storedHash.split(':');
    if (!salt || !key) return false;
    const keyBuffer = Buffer.from(key, 'hex');
    const derivedBuffer = crypto.scryptSync(password, salt, 64);
    return crypto.timingSafeEqual(keyBuffer, derivedBuffer);
  } catch {
    return false;
  }
}

interface DatabaseSchema {
  users: UserProfile[];
  salons: Salon[];
  services: Service[];
  staff: Staff[];
  staffSchedules: StaffSchedule[];
  bookings: Booking[];
  reviews: Review[];
  sessions: Record<string, string>; // token -> userId
}

// Initial seed data
function createInitialData(): DatabaseSchema {
  const defaultPasswordHash = hashPassword('password123');
  const adminPasswordHash = hashPassword('admin123');

  const users: UserProfile[] = [
    {
      id: 'usr_admin',
      fullName: 'Vikramaditya Roy (Admin)',
      email: 'admin@salonbook.in',
      phone: '+91 98201 12345',
      role: 'admin',
      passwordHash: adminPasswordHash,
      createdAt: '2026-01-10T10:00:00.000Z'
    },
    {
      id: 'usr_owner_1',
      fullName: 'Arjun Sharma',
      email: 'arjun@urbanedge.in',
      phone: '+91 98450 99881',
      role: 'salon_owner',
      passwordHash: defaultPasswordHash,
      createdAt: '2026-01-15T11:00:00.000Z'
    },
    {
      id: 'usr_owner_2',
      fullName: 'Sunil Rao',
      email: 'sunil@barberclub.in',
      phone: '+91 98112 33445',
      role: 'salon_owner',
      passwordHash: defaultPasswordHash,
      createdAt: '2026-01-20T09:30:00.000Z'
    },
    {
      id: 'usr_owner_3',
      fullName: 'Meera Kapoor',
      email: 'meera@lavishbridal.in',
      phone: '+91 98220 55667',
      role: 'salon_owner',
      passwordHash: defaultPasswordHash,
      createdAt: '2026-02-01T14:15:00.000Z'
    },
    {
      id: 'usr_customer_1',
      fullName: 'Rohit Verma',
      email: 'rohit.verma@example.com',
      phone: '+91 98765 43210',
      role: 'customer',
      passwordHash: defaultPasswordHash,
      createdAt: '2026-02-10T10:00:00.000Z'
    },
    {
      id: 'usr_customer_2',
      fullName: 'Ananya Sen',
      email: 'ananya.sen@example.com',
      phone: '+91 98234 56789',
      role: 'customer',
      passwordHash: defaultPasswordHash,
      createdAt: '2026-02-15T12:00:00.000Z'
    }
  ];

  const salons: Salon[] = [
    {
      id: 'salon_1',
      ownerId: 'usr_owner_1',
      name: 'Urban Edge Hair Lounge',
      description: 'Premier unisex hair & beauty atelier in Indiranagar. Specializing in precision haircutting, balayage, luxury hair spas, and bespoke skin rituals with certified master stylists.',
      category: 'unisex',
      address: '742, 12th Main Road, HAL 2nd Stage, Indiranagar',
      city: 'Bengaluru',
      locality: 'Indiranagar',
      latitude: 12.9716,
      longitude: 77.6412,
      openingHours: '09:00 - 21:00',
      openTime: '09:00',
      closeTime: '21:00',
      verificationStatus: 'approved',
      autoConfirm: true,
      rating: 4.9,
      reviewCount: 148,
      startingPrice: 450,
      imageUrl: '/src/assets/images/hero_salon_interior_1793290119938.jpg',
      cancellationPolicy: 'Free cancellation up to 2 hours prior to scheduled appointment. Later cancellations may attract a ₹100 rescheduling fee.',
      createdAt: '2026-01-15T12:00:00.000Z'
    },
    {
      id: 'salon_2',
      ownerId: 'usr_owner_2',
      name: "The Gentleman's Grooming Lounge",
      description: 'Classic bespoke barbershop experience featuring artisanal hot towel shaves, precision fade haircuts, beard sculpting, and charcoal scalp detox treatments.',
      category: 'barber',
      address: 'Shop 14, Main Market, South Extension Part II',
      city: 'New Delhi',
      locality: 'South Extension',
      latitude: 28.5684,
      longitude: 77.2185,
      openingHours: '10:00 - 20:30',
      openTime: '10:00',
      closeTime: '20:30',
      verificationStatus: 'approved',
      autoConfirm: true,
      rating: 4.8,
      reviewCount: 94,
      startingPrice: 350,
      imageUrl: '/src/assets/images/salon_barber_lounge_1793290120784.jpg',
      cancellationPolicy: 'Free cancellation up to 1 hour before appointment. Pay at the salon upon service completion.',
      createdAt: '2026-01-20T10:00:00.000Z'
    },
    {
      id: 'salon_3',
      ownerId: 'usr_owner_3',
      name: 'Lavish Bridal & Beauty Studio',
      description: 'Exquisite bridal makeover, HD airbrush makeup, rejuvenating organic facials, and luxury manicure-pedicure rituals designed for weddings and special celebrations.',
      category: 'beauty_parlour',
      address: '2nd Floor, Pali Hill Road, Bandra West',
      city: 'Mumbai',
      locality: 'Bandra West',
      latitude: 19.0607,
      longitude: 72.8258,
      openingHours: '10:00 - 20:00',
      openTime: '10:00',
      closeTime: '20:00',
      verificationStatus: 'approved',
      autoConfirm: false, // requires owner approval
      rating: 4.9,
      reviewCount: 112,
      startingPrice: 600,
      imageUrl: '/src/assets/images/salon_bridal_parlour_1793290122194.jpg',
      cancellationPolicy: 'Free cancellation up to 4 hours in advance. Bridal consultations require 12-hour notice.',
      createdAt: '2026-02-01T15:00:00.000Z'
    },
    {
      id: 'salon_4',
      ownerId: 'usr_owner_1',
      name: 'Aura Hair Studio & Wellness Spa',
      description: 'Holistic haircare and calming botanical scalp therapies located in posh Jubilee Hills. Botanical protein hair spas, customized tone-on-tone tinting, and relaxing foot reflexology.',
      category: 'hair_studio',
      address: 'Road No. 36, Near Peddamma Temple, Jubilee Hills',
      city: 'Hyderabad',
      locality: 'Jubilee Hills',
      latitude: 17.4319,
      longitude: 78.4073,
      openingHours: '09:30 - 20:30',
      openTime: '09:30',
      closeTime: '20:30',
      verificationStatus: 'approved',
      autoConfirm: true,
      rating: 4.7,
      reviewCount: 76,
      startingPrice: 500,
      imageUrl: '/src/assets/images/salon_hair_spa_1793290121730.jpg',
      cancellationPolicy: 'Complimentary rescheduling up to 2 hours prior to slot. Cash & UPI accepted at the salon.',
      createdAt: '2026-02-05T09:00:00.000Z'
    },
    {
      id: 'salon_5',
      ownerId: 'usr_owner_2',
      name: 'Koramangala Style Lab',
      description: 'Trendy Gen-Z and young professional hair salon offering vibrant highlights, trendy buzz cuts, and anti-pollution skin treatments.',
      category: 'unisex',
      address: '80 Feet Road, 4th Block, Koramangala',
      city: 'Bengaluru',
      locality: 'Koramangala',
      latitude: 12.9352,
      longitude: 77.6245,
      openingHours: '10:00 - 21:00',
      openTime: '10:00',
      closeTime: '21:00',
      verificationStatus: 'pending', // Demonstrates pending verification for admin
      autoConfirm: true,
      rating: 4.6,
      reviewCount: 18,
      startingPrice: 399,
      imageUrl: '/src/assets/images/hero_salon_interior_1793290119938.jpg',
      cancellationPolicy: 'Free cancellation anytime up to 2 hours before the appointment.',
      createdAt: '2026-02-20T11:00:00.000Z'
    }
  ];

  const services: Service[] = [
    // Salon 1 - Urban Edge (Unisex)
    {
      id: 'srv_101',
      salonId: 'salon_1',
      name: 'Signature Precision Haircut',
      description: 'Comprehensive consultation, invigorating scalp wash, custom precision cut, and blow-dry styling by senior stylist.',
      price: 650,
      durationMinutes: 45,
      category: 'Haircut',
      isActive: true
    },
    {
      id: 'srv_102',
      salonId: 'salon_1',
      name: 'Beard Sculpting & Hot Towel',
      description: 'Razor sharp line work, conditioning beard wash, organic argan oil massage, and soothing hot towel wrap.',
      price: 350,
      durationMinutes: 30,
      category: 'Beard Styling',
      isActive: true
    },
    {
      id: 'srv_103',
      salonId: 'salon_1',
      name: 'Haircut + Beard Styling Combo',
      description: 'Complete grooming package: customized haircut, wash, beard shaping, and refreshing mint toner.',
      price: 900,
      durationMinutes: 60,
      category: 'Combos',
      isActive: true
    },
    {
      id: 'srv_104',
      salonId: 'salon_1',
      name: 'Hydra-Boost Organic Facial',
      description: 'Deep pore vacuum suction, botanical fruit enzyme exfoliation, LED rejuvenation, and hyaluronic hydrating mask.',
      price: 1499,
      durationMinutes: 60,
      category: 'Facial',
      isActive: true
    },
    {
      id: 'srv_105',
      salonId: 'salon_1',
      name: 'Keratin Infusion Hair Spa',
      description: 'Intense micro-mist steam therapy, customized hair mask, 20-minute relaxing neck & shoulder massage, and gloss blow-dry.',
      price: 1200,
      durationMinutes: 60,
      category: 'Hair Spa',
      isActive: true
    },
    {
      id: 'srv_106',
      salonId: 'salon_1',
      name: 'Global Hair Colouring / Highlights',
      description: 'Ammonia-free premium Italian formulation with plex bond builder for rich tone and silky luminosity.',
      price: 2800,
      durationMinutes: 90,
      category: 'Hair Colouring',
      isActive: true
    },

    // Salon 2 - The Gentleman's Club (Barber)
    {
      id: 'srv_201',
      salonId: 'salon_2',
      name: 'Classic Executive Haircut',
      description: 'Scissor-over-comb fade, refreshing menthol scalp shampoo, and matte clay styling.',
      price: 450,
      durationMinutes: 35,
      category: 'Haircut',
      isActive: true
    },
    {
      id: 'srv_202',
      salonId: 'salon_2',
      name: 'Royal Shave with Straight Razor',
      description: 'Traditional badger-brush lather, double hot towel steam, feather-edge razor shave, and cooling sandalwood balm.',
      price: 400,
      durationMinutes: 30,
      category: 'Beard Styling',
      isActive: true
    },
    {
      id: 'srv_203',
      salonId: 'salon_2',
      name: 'The Gentleman Full Overhaul Combo',
      description: 'Executive cut, beard detailing, charcoal peel-off nose strip, and relaxing head massage.',
      price: 950,
      durationMinutes: 65,
      category: 'Combos',
      isActive: true
    },
    {
      id: 'srv_204',
      salonId: 'salon_2',
      name: 'Charcoal Anti-Pollution Facial',
      description: 'Targeted skin detox for metropolitan dust and oil control with tea tree extract and cold stone massage.',
      price: 850,
      durationMinutes: 40,
      category: 'Facial',
      isActive: true
    },

    // Salon 3 - Lavish Bridal & Beauty Studio (Beauty Parlour)
    {
      id: 'srv_301',
      salonId: 'salon_3',
      name: 'HD Bridal Makeup & Draping',
      description: 'Full high-definition water-resistant bridal makeup, premium lash extension, saree/lehenga draping, and floral hair accessories.',
      price: 8500,
      durationMinutes: 120,
      category: 'Bridal Makeup',
      isActive: true
    },
    {
      id: 'srv_302',
      salonId: 'salon_3',
      name: 'Party Glow Makeover',
      description: 'Flawless camera-ready party makeup with contouring, shimmer eye accent, and sleek hair setting.',
      price: 2500,
      durationMinutes: 60,
      category: 'Bridal Makeup',
      isActive: true
    },
    {
      id: 'srv_303',
      salonId: 'salon_3',
      name: 'Gold Radiance Ayurvedic Facial',
      description: '24k micro-gold dust massage, saffron serum, gentle vacuum extraction, and tightening peptide mask.',
      price: 1800,
      durationMinutes: 60,
      category: 'Facial',
      isActive: true
    },
    {
      id: 'srv_304',
      salonId: 'salon_3',
      name: 'Deluxe Manicure & Spa Pedicure',
      description: 'Dead sea salt scrub, cuticle therapy, paraffin wax moisturizing dip, and gel polish coating.',
      price: 1100,
      durationMinutes: 60,
      category: 'Manicure and Pedicure',
      isActive: true
    },

    // Salon 4 - Aura Hair Studio (Hair Studio & Spa)
    {
      id: 'srv_401',
      salonId: 'salon_4',
      name: 'Moroccan Argan Hair Spa',
      description: 'Deep lipid repair with pure Moroccan oil steam infusion and pressure-point head massage.',
      price: 1350,
      durationMinutes: 50,
      category: 'Hair Spa',
      isActive: true
    },
    {
      id: 'srv_402',
      salonId: 'salon_4',
      name: 'Creative Layered Haircut',
      description: 'Face-framing curtain bangs or layered blowout tailored to hair texture and face shape.',
      price: 750,
      durationMinutes: 45,
      category: 'Haircut',
      isActive: true
    },
    {
      id: 'srv_403',
      salonId: 'salon_4',
      name: 'Balayage & Ombre Hair Highlights',
      description: 'Hand-painted natural sun-kissed gradient highlights with bonding gloss treatment.',
      price: 3600,
      durationMinutes: 120,
      category: 'Hair Colouring',
      isActive: true
    }
  ];

  const staff: Staff[] = [
    // Staff for Salon 1 (Urban Edge)
    {
      id: 'stf_1',
      salonId: 'salon_1',
      name: 'Karan Mehra',
      roleTitle: 'Senior Creative Stylist',
      isActive: true,
      assignedServiceIds: ['srv_101', 'srv_102', 'srv_103', 'srv_106']
    },
    {
      id: 'stf_2',
      salonId: 'salon_1',
      name: 'Pooja Bhatia',
      roleTitle: 'Lead Skin & Spa Therapist',
      isActive: true,
      assignedServiceIds: ['srv_104', 'srv_105']
    },
    // Staff for Salon 2 (Gentleman's Club)
    {
      id: 'stf_3',
      salonId: 'salon_2',
      name: 'Sardar Gurpreet Singh',
      roleTitle: 'Master Barber',
      isActive: true,
      assignedServiceIds: ['srv_201', 'srv_202', 'srv_203', 'srv_204']
    },
    {
      id: 'stf_4',
      salonId: 'salon_2',
      name: 'Ramesh Chander',
      roleTitle: 'Beard & Skin Specialist',
      isActive: true,
      assignedServiceIds: ['srv_201', 'srv_202', 'srv_204']
    },
    // Staff for Salon 3 (Lavish Bridal)
    {
      id: 'stf_5',
      salonId: 'salon_3',
      name: 'Deepika Rao',
      roleTitle: 'Celebrity Makeup Artist',
      isActive: true,
      assignedServiceIds: ['srv_301', 'srv_302', 'srv_303']
    },
    {
      id: 'stf_6',
      salonId: 'salon_3',
      name: 'Farzana Khan',
      roleTitle: 'Nail & Esthetician Specialist',
      isActive: true,
      assignedServiceIds: ['srv_303', 'srv_304']
    },
    // Staff for Salon 4 (Aura Hair Studio)
    {
      id: 'stf_7',
      salonId: 'salon_4',
      name: 'Vinay Reddy',
      roleTitle: 'Principal Hair Colorist',
      isActive: true,
      assignedServiceIds: ['srv_401', 'srv_402', 'srv_403']
    }
  ];

  // Schedule template for all days of the week (0=Sunday to 6=Saturday)
  const staffSchedules: StaffSchedule[] = [];
  staff.forEach((s) => {
    for (let day = 0; day <= 6; day++) {
      // Give Monday off for salon 1 & 2 staff; Tuesday off for salon 3 staff
      const isOff = (s.salonId === 'salon_3' && day === 2) || (s.salonId !== 'salon_3' && day === 1);
      staffSchedules.push({
        id: `sch_${s.id}_${day}`,
        staffId: s.id,
        dayOfWeek: day,
        startTime: '10:00',
        endTime: '19:30',
        breakStart: '13:30',
        breakEnd: '14:30',
        isWorking: !isOff
      });
    }
  });

  const bookings: Booking[] = [
    {
      id: 'bk_1',
      bookingCode: 'SB-8021',
      customerId: 'usr_customer_1',
      customerName: 'Rohit Verma',
      customerEmail: 'rohit.verma@example.com',
      customerPhone: '+91 98765 43210',
      salonId: 'salon_1',
      salonName: 'Urban Edge Hair Lounge',
      staffId: 'stf_1',
      staffName: 'Karan Mehra',
      date: '2026-10-29', // Today
      startTime: '14:30',
      endTime: '15:30',
      status: 'confirmed',
      totalPrice: 900,
      totalDurationMinutes: 60,
      paymentMethod: 'pay_at_salon',
      paymentStatus: 'pending',
      isWalkin: false,
      services: [
        {
          serviceId: 'srv_103',
          serviceName: 'Haircut + Beard Styling Combo',
          price: 900,
          durationMinutes: 60
        }
      ],
      createdAt: '2026-10-28T16:20:00.000Z'
    },
    {
      id: 'bk_2',
      bookingCode: 'SB-7193',
      customerId: 'usr_customer_2',
      customerName: 'Ananya Sen',
      customerEmail: 'ananya.sen@example.com',
      customerPhone: '+91 98234 56789',
      salonId: 'salon_1',
      salonName: 'Urban Edge Hair Lounge',
      staffId: 'stf_2',
      staffName: 'Pooja Bhatia',
      date: '2026-10-25',
      startTime: '11:00',
      endTime: '12:00',
      status: 'completed',
      totalPrice: 1499,
      totalDurationMinutes: 60,
      paymentMethod: 'pay_at_salon',
      paymentStatus: 'paid',
      isWalkin: false,
      services: [
        {
          serviceId: 'srv_104',
          serviceName: 'Hydra-Boost Organic Facial',
          price: 1499,
          durationMinutes: 60
        }
      ],
      createdAt: '2026-10-24T09:15:00.000Z'
    }
  ];

  const reviews: Review[] = [
    {
      id: 'rev_1',
      bookingId: 'bk_2',
      customerId: 'usr_customer_2',
      customerName: 'Ananya Sen',
      salonId: 'salon_1',
      rating: 5,
      comment: 'Absolutely spectacular facial treatment! Pooja took the time to assess my dry sensitive skin before applying the hyaluronic serum. The salon ambiance is serene and hygienic.',
      salonResponse: 'Thank you so much Ananya! It was a pleasure pampering you at Urban Edge. Looking forward to welcoming you back next month!',
      createdAt: '2026-10-25T14:30:00.000Z'
    },
    {
      id: 'rev_2',
      bookingId: 'bk_sample_99',
      customerId: 'usr_customer_1',
      customerName: 'Devika Singhania',
      salonId: 'salon_3',
      rating: 5,
      comment: 'Deepika and her crew handled my pre-wedding sangeet look flawlessly. The HD airbrush lasted through all the dance performances without a smudge. Highly recommended!',
      salonResponse: 'Warmest congratulations Devika! You looked radiant. Wishing you all the love and happiness ahead.',
      createdAt: '2026-10-18T18:00:00.000Z'
    },
    {
      id: 'rev_3',
      bookingId: 'bk_sample_98',
      customerId: 'usr_customer_2',
      customerName: 'Aditya Mathur',
      salonId: 'salon_2',
      rating: 5,
      comment: 'Old-school barbershop elegance at its best. Sardar Gurpreet gave me the cleanest razor fade and hot towel shave in Delhi.',
      salonResponse: 'Cheers Aditya! Always a pleasure having you at the Gentlemen’s Lounge.',
      createdAt: '2026-10-20T12:00:00.000Z'
    }
  ];

  return {
    users,
    salons,
    services,
    staff,
    staffSchedules,
    bookings,
    reviews,
    sessions: {}
  };
}

class SalonDatabase {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.salons) && Array.isArray(parsed.users)) {
          return parsed;
        }
      }
    } catch (err) {
      console.warn('Could not read existing database file, initializing seed data:', err);
    }
    const initial = createInitialData();
    this.saveData(initial);
    return initial;
  }

  private saveData(dataToSave: DatabaseSchema = this.data) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(dataToSave, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write database file:', err);
    }
  }

  public resetSeedData(): DatabaseSchema {
    this.data = createInitialData();
    this.saveData();
    return this.data;
  }

  // --- Auth & Users ---
  public findUserByEmail(email: string): UserProfile | undefined {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  public findUserById(id: string): UserProfile | undefined {
    return this.data.users.find((u) => u.id === id);
  }

  public createUser(userData: {
    fullName: string;
    email: string;
    phone: string;
    password: string;
    role: UserProfile['role'];
  }): UserProfile {
    const existing = this.findUserByEmail(userData.email);
    if (existing) {
      throw new Error('An account with this email address already exists');
    }

    const newUser: UserProfile = {
      id: `usr_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      fullName: userData.fullName.trim(),
      email: userData.email.trim().toLowerCase(),
      phone: userData.phone.trim(),
      role: userData.role,
      passwordHash: hashPassword(userData.password),
      createdAt: new Date().toISOString()
    };

    this.data.users.push(newUser);
    this.saveData();
    return newUser;
  }

  public createSession(userId: string): string {
    const token = crypto.randomBytes(32).toString('hex');
    this.data.sessions[token] = userId;
    this.saveData();
    return token;
  }

  public getUserByToken(token: string): UserProfile | null {
    const userId = this.data.sessions[token];
    if (!userId) return null;
    return this.findUserById(userId) || null;
  }

  public deleteSession(token: string): void {
    delete this.data.sessions[token];
    this.saveData();
  }

  public getAllUsers(): UserProfile[] {
    return this.data.users;
  }

  // --- Salons ---
  public getSalons(filters?: {
    category?: string;
    city?: string;
    locality?: string;
    minRating?: number;
    maxPrice?: number;
    searchQuery?: string;
    includeUnapproved?: boolean;
    ownerId?: string;
  }): Salon[] {
    let list = this.data.salons;

    if (!filters?.includeUnapproved) {
      list = list.filter((s) => s.verificationStatus === 'approved');
    }

    if (filters?.ownerId) {
      list = list.filter((s) => s.ownerId === filters.ownerId);
    }

    if (filters?.category && filters.category !== 'all') {
      list = list.filter((s) => s.category === filters.category);
    }

    if (filters?.city && filters.city !== 'all') {
      list = list.filter((s) => s.city.toLowerCase() === filters.city!.toLowerCase());
    }

    if (filters?.locality && filters.locality !== 'all') {
      list = list.filter((s) => s.locality.toLowerCase().includes(filters.locality!.toLowerCase()));
    }

    if (filters?.minRating) {
      list = list.filter((s) => s.rating >= filters.minRating!);
    }

    if (filters?.maxPrice) {
      list = list.filter((s) => s.startingPrice <= filters.maxPrice!);
    }

    if (filters?.searchQuery) {
      const q = filters.searchQuery.toLowerCase().trim();
      list = list.filter((s) => {
        const matchesName = s.name.toLowerCase().includes(q);
        const matchesLocality = s.locality.toLowerCase().includes(q);
        const matchesCity = s.city.toLowerCase().includes(q);
        const matchesDesc = s.description.toLowerCase().includes(q);
        // check if any service matches
        const salonServices = this.data.services.filter((srv) => srv.salonId === s.id && srv.isActive);
        const matchesService = salonServices.some((srv) => srv.name.toLowerCase().includes(q) || srv.category.toLowerCase().includes(q));
        return matchesName || matchesLocality || matchesCity || matchesDesc || matchesService;
      });
    }

    return list;
  }

  public getSalonById(id: string): Salon | undefined {
    return this.data.salons.find((s) => s.id === id);
  }

  public createSalon(salonData: Omit<Salon, 'id' | 'rating' | 'reviewCount' | 'createdAt' | 'verificationStatus'> & { verificationStatus?: Salon['verificationStatus'] }): Salon {
    const newSalon: Salon = {
      ...salonData,
      id: `salon_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      rating: 5.0,
      reviewCount: 0,
      verificationStatus: salonData.verificationStatus || 'pending',
      createdAt: new Date().toISOString()
    };
    this.data.salons.push(newSalon);
    this.saveData();
    return newSalon;
  }

  public updateSalon(id: string, updates: Partial<Salon>): Salon {
    const idx = this.data.salons.findIndex((s) => s.id === id);
    if (idx === -1) throw new Error('Salon not found');
    this.data.salons[idx] = { ...this.data.salons[idx], ...updates };
    this.saveData();
    return this.data.salons[idx];
  }

  // --- Services ---
  public getServicesBySalonId(salonId: string, onlyActive = true): Service[] {
    return this.data.services.filter((s) => s.salonId === salonId && (!onlyActive || s.isActive));
  }

  public getServiceById(id: string): Service | undefined {
    return this.data.services.find((s) => s.id === id);
  }

  public createService(serviceData: Omit<Service, 'id'>): Service {
    const newService: Service = {
      ...serviceData,
      id: `srv_${Date.now()}_${Math.floor(Math.random() * 1000)}`
    };
    this.data.services.push(newService);

    // Update salon starting price if lower
    const salon = this.getSalonById(serviceData.salonId);
    if (salon && (salon.startingPrice === 0 || serviceData.price < salon.startingPrice)) {
      this.updateSalon(salon.id, { startingPrice: serviceData.price });
    }

    this.saveData();
    return newService;
  }

  public updateService(id: string, updates: Partial<Service>): Service {
    const idx = this.data.services.findIndex((s) => s.id === id);
    if (idx === -1) throw new Error('Service not found');
    this.data.services[idx] = { ...this.data.services[idx], ...updates };
    this.saveData();
    return this.data.services[idx];
  }

  public deleteService(id: string): void {
    const idx = this.data.services.findIndex((s) => s.id === id);
    if (idx !== -1) {
      this.data.services.splice(idx, 1);
      this.saveData();
    }
  }

  // --- Staff & Schedules ---
  public getStaffBySalonId(salonId: string, onlyActive = true): Staff[] {
    return this.data.staff.filter((st) => st.salonId === salonId && (!onlyActive || st.isActive));
  }

  public getStaffById(id: string): Staff | undefined {
    return this.data.staff.find((st) => st.id === id);
  }

  public createStaff(staffData: Omit<Staff, 'id'>): Staff {
    const newStaff: Staff = {
      ...staffData,
      id: `stf_${Date.now()}_${Math.floor(Math.random() * 1000)}`
    };
    this.data.staff.push(newStaff);

    // Create default schedule for 7 days
    for (let day = 0; day <= 6; day++) {
      this.data.staffSchedules.push({
        id: `sch_${newStaff.id}_${day}`,
        staffId: newStaff.id,
        dayOfWeek: day,
        startTime: '10:00',
        endTime: '20:00',
        breakStart: '13:30',
        breakEnd: '14:30',
        isWorking: day !== 1 // Monday off default
      });
    }

    this.saveData();
    return newStaff;
  }

  public updateStaff(id: string, updates: Partial<Staff>): Staff {
    const idx = this.data.staff.findIndex((st) => st.id === id);
    if (idx === -1) throw new Error('Staff member not found');
    this.data.staff[idx] = { ...this.data.staff[idx], ...updates };
    this.saveData();
    return this.data.staff[idx];
  }

  public getStaffSchedules(staffId: string): StaffSchedule[] {
    return this.data.staffSchedules.filter((sch) => sch.staffId === staffId);
  }

  public updateStaffSchedule(id: string, updates: Partial<StaffSchedule>): StaffSchedule {
    const idx = this.data.staffSchedules.findIndex((sch) => sch.id === id);
    if (idx === -1) throw new Error('Schedule not found');
    this.data.staffSchedules[idx] = { ...this.data.staffSchedules[idx], ...updates };
    this.saveData();
    return this.data.staffSchedules[idx];
  }

  // --- Availability & Slots Calculation ---
  public getAvailableSlots(params: {
    salonId: string;
    staffId?: string | null;
    date: string; // YYYY-MM-DD
    totalDurationMinutes: number;
  }): { time: string; available: boolean; reason?: string }[] {
    const { salonId, staffId, date, totalDurationMinutes } = params;
    const salon = this.getSalonById(salonId);
    if (!salon) return [];

    // Parse date for day of week in Indian Timezone
    // YYYY-MM-DD
    const dateObj = new Date(`${date}T12:00:00+05:30`);
    const dayOfWeek = dateObj.getDay(); // 0 to 6

    const [openH, openM] = salon.openTime.split(':').map(Number);
    const [closeH, closeM] = salon.closeTime.split(':').map(Number);
    const openTotalM = openH * 60 + openM;
    const closeTotalM = closeH * 60 + closeM;

    // Filter staff candidates
    let candidateStaff: Staff[] = [];
    if (staffId && staffId !== 'any') {
      const st = this.getStaffById(staffId);
      if (st && st.salonId === salonId && st.isActive) {
        candidateStaff = [st];
      }
    } else {
      candidateStaff = this.getStaffBySalonId(salonId, true);
    }

    if (candidateStaff.length === 0) {
      return [];
    }

    // Existing bookings for this date and salon
    const existingBookings = this.data.bookings.filter(
      (b) => b.salonId === salonId && b.date === date && (b.status === 'confirmed' || b.status === 'pending')
    );

    const slotInterval = 30; // 30-minute intervals
    const slots: { time: string; available: boolean; reason?: string }[] = [];

    for (let m = openTotalM; m + totalDurationMinutes <= closeTotalM; m += slotInterval) {
      const slotHour = Math.floor(m / 60);
      const slotMin = m % 60;
      const timeStr = `${slotHour.toString().padStart(2, '0')}:${slotMin.toString().padStart(2, '0')}`;

      const slotStartM = m;
      const slotEndM = m + totalDurationMinutes;

      // Check if at least one candidate staff is free
      let isAvailable = false;

      for (const st of candidateStaff) {
        const schedule = this.data.staffSchedules.find(
          (sch) => sch.staffId === st.id && sch.dayOfWeek === dayOfWeek
        );

        if (!schedule || !schedule.isWorking) {
          continue;
        }

        const [stStartH, stStartM] = schedule.startTime.split(':').map(Number);
        const [stEndH, stEndM] = schedule.endTime.split(':').map(Number);
        const workStartM = stStartH * 60 + stStartM;
        const workEndM = stEndH * 60 + stEndM;

        if (slotStartM < workStartM || slotEndM > workEndM) {
          continue;
        }

        // Check break time
        if (schedule.breakStart && schedule.breakEnd) {
          const [brkStartH, brkStartM] = schedule.breakStart.split(':').map(Number);
          const [brkEndH, brkEndM] = schedule.breakEnd.split(':').map(Number);
          const breakStartM = brkStartH * 60 + brkStartM;
          const breakEndM = brkEndH * 60 + brkEndM;

          // Check overlap with break: slotStart < breakEnd && slotEnd > breakStart
          if (slotStartM < breakEndM && slotEndM > breakStartM) {
            continue;
          }
        }

        // Check existing bookings for this staff member
        const staffBookings = existingBookings.filter((b) => b.staffId === st.id);
        const hasOverlap = staffBookings.some((b) => {
          const [bSH, bSM] = b.startTime.split(':').map(Number);
          const [bEH, bEM] = b.endTime.split(':').map(Number);
          const bStartM = bSH * 60 + bSM;
          const bEndM = bEH * 60 + bEM;
          return slotStartM < bEndM && slotEndM > bStartM;
        });

        if (!hasOverlap) {
          isAvailable = true;
          break; // found an eligible staff member
        }
      }

      slots.push({
        time: timeStr,
        available: isAvailable,
        reason: isAvailable ? undefined : 'Slot already booked or stylist on break'
      });
    }

    return slots;
  }

  // --- Bookings ---
  public createBooking(bookingData: {
    customerId: string;
    salonId: string;
    staffId: string | null;
    serviceIds: string[];
    date: string; // YYYY-MM-DD
    startTime: string; // "10:30"
    paymentMethod: Booking['paymentMethod'];
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
    isWalkin?: boolean;
  }): Booking {
    const salon = this.getSalonById(bookingData.salonId);
    if (!salon) throw new Error('Salon not found');

    if (salon.verificationStatus !== 'approved' && !bookingData.isWalkin) {
      throw new Error('This salon is not verified for public bookings yet.');
    }

    // Resolve customer details
    let customerName = bookingData.customerName || '';
    let customerEmail = bookingData.customerEmail || '';
    let customerPhone = bookingData.customerPhone || '';

    if (bookingData.customerId) {
      const user = this.findUserById(bookingData.customerId);
      if (user) {
        customerName = customerName || user.fullName;
        customerEmail = customerEmail || user.email;
        customerPhone = customerPhone || user.phone;
      }
    }

    // Validate services
    const activeServices = this.getServicesBySalonId(salon.id, true);
    const selectedServices = activeServices.filter((s) => bookingData.serviceIds.includes(s.id));
    if (selectedServices.length === 0) {
      throw new Error('Please select at least one active service.');
    }

    const totalDurationMinutes = selectedServices.reduce((sum, s) => sum + s.durationMinutes, 0);
    const totalPrice = selectedServices.reduce((sum, s) => sum + s.price, 0);

    // Calculate end time
    const [startH, startM] = bookingData.startTime.split(':').map(Number);
    const startMinutes = startH * 60 + startM;
    const endMinutes = startMinutes + totalDurationMinutes;
    const endH = Math.floor(endMinutes / 60);
    const endM = endMinutes % 60;
    const endTime = `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;

    // Resolve or auto-assign staff
    let chosenStaffId = bookingData.staffId;
    let chosenStaffName = 'Any Available Stylist';

    if (chosenStaffId && chosenStaffId !== 'any') {
      const st = this.getStaffById(chosenStaffId);
      if (!st || !st.isActive || st.salonId !== salon.id) {
        throw new Error('Selected stylist is currently unavailable.');
      }
      chosenStaffName = st.name;
    } else {
      // Auto-assign first available staff
      const availableStaff = this.getStaffBySalonId(salon.id, true);
      const dateObj = new Date(`${bookingData.date}T12:00:00+05:30`);
      const dayOfWeek = dateObj.getDay();

      for (const st of availableStaff) {
        const schedule = this.data.staffSchedules.find(
          (sch) => sch.staffId === st.id && sch.dayOfWeek === dayOfWeek
        );
        if (!schedule || !schedule.isWorking) continue;

        // check bookings overlap
        const existingStaffBookings = this.data.bookings.filter(
          (b) => b.staffId === st.id && b.date === bookingData.date && (b.status === 'confirmed' || b.status === 'pending')
        );
        const overlap = existingStaffBookings.some((b) => {
          const [bSH, bSM] = b.startTime.split(':').map(Number);
          const [bEH, bEM] = b.endTime.split(':').map(Number);
          const bStartM = bSH * 60 + bSM;
          const bEndM = bEH * 60 + bEM;
          return startMinutes < bEndM && endMinutes > bStartM;
        });

        if (!overlap) {
          chosenStaffId = st.id;
          chosenStaffName = st.name;
          break;
        }
      }
    }

    // SERVER-SIDE CONFLICT / OVERLAP CHECK (ATOMIC PRE-INSERT VALIDATION)
    if (chosenStaffId) {
      const conflicts = this.data.bookings.filter((b) => {
        if (b.salonId !== salon.id || b.date !== bookingData.date) return false;
        if (b.status !== 'confirmed' && b.status !== 'pending') return false;
        if (b.staffId !== chosenStaffId) return false;

        const [bSH, bSM] = b.startTime.split(':').map(Number);
        const [bEH, bEM] = b.endTime.split(':').map(Number);
        const bStartM = bSH * 60 + bSM;
        const bEndM = bEH * 60 + bEM;
        return startMinutes < bEndM && endMinutes > bStartM;
      });

      if (conflicts.length > 0) {
        throw new Error(
          `The selected time slot (${bookingData.startTime} - ${endTime}) overlaps with an existing appointment for ${chosenStaffName}. Please select another time slot.`
        );
      }
    }

    const bookingCode = `SB-${Math.floor(1000 + Math.random() * 9000)}`;

    const newBooking: Booking = {
      id: `bk_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      bookingCode,
      customerId: bookingData.customerId,
      customerName,
      customerEmail,
      customerPhone,
      salonId: salon.id,
      salonName: salon.name,
      staffId: chosenStaffId || null,
      staffName: chosenStaffName,
      date: bookingData.date,
      startTime: bookingData.startTime,
      endTime,
      status: salon.autoConfirm ? 'confirmed' : 'pending',
      totalPrice,
      totalDurationMinutes,
      paymentMethod: bookingData.paymentMethod,
      paymentStatus: 'pending',
      isWalkin: !!bookingData.isWalkin,
      services: selectedServices.map((s) => ({
        serviceId: s.id,
        serviceName: s.name,
        price: s.price,
        durationMinutes: s.durationMinutes
      })),
      createdAt: new Date().toISOString()
    };

    this.data.bookings.push(newBooking);
    this.saveData();
    return newBooking;
  }

  public getBookings(filters?: {
    customerId?: string;
    salonId?: string;
    status?: string;
    date?: string;
  }): Booking[] {
    let list = this.data.bookings;
    if (filters?.customerId) {
      list = list.filter((b) => b.customerId === filters.customerId);
    }
    if (filters?.salonId) {
      list = list.filter((b) => b.salonId === filters.salonId);
    }
    if (filters?.status && filters.status !== 'all') {
      list = list.filter((b) => b.status === filters.status);
    }
    if (filters?.date) {
      list = list.filter((b) => b.date === filters.date);
    }
    return [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getBookingById(id: string): Booking | undefined {
    return this.data.bookings.find((b) => b.id === id);
  }

  public updateBookingStatus(
    id: string,
    status: Booking['status'],
    cancelReason?: string
  ): Booking {
    const idx = this.data.bookings.findIndex((b) => b.id === id);
    if (idx === -1) throw new Error('Booking not found');

    this.data.bookings[idx].status = status;
    if (cancelReason) {
      this.data.bookings[idx].cancelReason = cancelReason;
    }
    if (status === 'completed') {
      this.data.bookings[idx].paymentStatus = 'paid';
    }
    this.saveData();
    return this.data.bookings[idx];
  }

  // --- Reviews ---
  public getReviewsBySalonId(salonId: string): Review[] {
    return this.data.reviews
      .filter((r) => r.salonId === salonId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public createReview(params: {
    bookingId: string;
    customerId: string;
    salonId: string;
    rating: number;
    comment: string;
  }): Review {
    const booking = this.getBookingById(params.bookingId);
    if (!booking) throw new Error('Booking not found');

    if (booking.customerId !== params.customerId) {
      throw new Error('You can only review your own appointments.');
    }

    if (booking.status !== 'completed') {
      throw new Error('You can only review completed appointments.');
    }

    const existingReview = this.data.reviews.find((r) => r.bookingId === params.bookingId);
    if (existingReview) {
      throw new Error('A review has already been submitted for this appointment.');
    }

    const user = this.findUserById(params.customerId);
    const newReview: Review = {
      id: `rev_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      bookingId: params.bookingId,
      customerId: params.customerId,
      customerName: user?.fullName || 'Verified Client',
      salonId: params.salonId,
      rating: Math.max(1, Math.min(5, Math.round(params.rating))),
      comment: params.comment.trim(),
      createdAt: new Date().toISOString()
    };

    this.data.reviews.push(newReview);

    // Recalculate salon rating & count
    const salonReviews = this.data.reviews.filter((r) => r.salonId === params.salonId);
    const avgRating = Number(
      (salonReviews.reduce((sum, r) => sum + r.rating, 0) / salonReviews.length).toFixed(1)
    );
    this.updateSalon(params.salonId, {
      rating: avgRating,
      reviewCount: salonReviews.length
    });

    this.saveData();
    return newReview;
  }

  public replyToReview(reviewId: string, response: string): Review {
    const idx = this.data.reviews.findIndex((r) => r.id === reviewId);
    if (idx === -1) throw new Error('Review not found');
    this.data.reviews[idx].salonResponse = response.trim();
    this.saveData();
    return this.data.reviews[idx];
  }

  // --- Admin stats ---
  public getPlatformStats() {
    const totalCustomers = this.data.users.filter((u) => u.role === 'customer').length;
    const totalOwners = this.data.users.filter((u) => u.role === 'salon_owner').length;
    const totalSalons = this.data.salons.length;
    const pendingSalons = this.data.salons.filter((s) => s.verificationStatus === 'pending').length;
    const totalBookings = this.data.bookings.length;
    const completedBookings = this.data.bookings.filter((b) => b.status === 'completed').length;
    const totalGrossRevenue = this.data.bookings
      .filter((b) => b.status === 'completed' || b.status === 'confirmed')
      .reduce((sum, b) => sum + b.totalPrice, 0);

    return {
      totalCustomers,
      totalOwners,
      totalSalons,
      pendingSalons,
      totalBookings,
      completedBookings,
      totalGrossRevenue
    };
  }
}

export const db = new SalonDatabase();
