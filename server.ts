import express, { Request, Response, NextFunction } from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { db, verifyPassword } from './src/server/db.ts';
import { UserProfile } from './src/server/types.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Extend express Request
interface AuthenticatedRequest extends Request {
  user?: UserProfile;
}

// Authentication middleware
function getAuthToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
}

function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const token = getAuthToken(req);
  if (token) {
    const user = db.getUserByToken(token);
    if (user) {
      req.user = user;
    }
  }
  next();
}

function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required. Please log in.' });
    return;
  }
  next();
}

function requireRole(...roles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required.' });
      return;
    }
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: `Forbidden. Only [${roles.join(', ')}] have access to this resource.` });
      return;
    }
    next();
  };
}

app.use(authMiddleware);

// ==========================================
// AUTHENTICATION ROUTES
// ==========================================

// Register
app.post('/api/auth/register', (req: Request, res: Response) => {
  try {
    const { fullName, email, phone, password, role } = req.body;
    if (!fullName || !email || !password) {
      res.status(400).json({ error: 'Full name, email, and password are required.' });
      return;
    }
    if (password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters.' });
      return;
    }

    const assignedRole = role === 'salon_owner' ? 'salon_owner' : 'customer';
    const user = db.createUser({
      fullName,
      email,
      phone: phone || '',
      password,
      role: assignedRole
    });

    const token = db.createSession(user.id);
    const { passwordHash: _, ...safeUser } = user;
    res.status(201).json({ user: safeUser, token });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Registration failed' });
  }
});

// Login
app.post('/api/auth/login', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }

    const user = db.findUserByEmail(email);
    if (!user) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const isValid = verifyPassword(password, user.passwordHash);
    if (!isValid) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const token = db.createSession(user.id);
    const { passwordHash: _, ...safeUser } = user;
    res.json({ user: safeUser, token });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Login failed' });
  }
});

// Demo switch login (Instant role toggle for reviewer ease)
app.post('/api/auth/demo-login', (req: Request, res: Response) => {
  try {
    const { role, email } = req.body;
    let targetUser: UserProfile | undefined;

    if (email) {
      targetUser = db.findUserByEmail(email);
    } else if (role === 'admin') {
      targetUser = db.findUserByEmail('admin@salonbook.in');
    } else if (role === 'salon_owner') {
      targetUser = db.findUserByEmail('arjun@urbanedge.in');
    } else {
      targetUser = db.findUserByEmail('rohit.verma@example.com');
    }

    if (!targetUser) {
      res.status(404).json({ error: 'Demo user not found' });
      return;
    }

    const token = db.createSession(targetUser.id);
    const { passwordHash: _, ...safeUser } = targetUser;
    res.json({ user: safeUser, token });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get current profile
app.get('/api/auth/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { passwordHash: _, ...safeUser } = req.user!;
  res.json({ user: safeUser });
});

// Logout
app.post('/api/auth/logout', (req: Request, res: Response) => {
  const token = getAuthToken(req);
  if (token) {
    db.deleteSession(token);
  }
  res.json({ success: true, message: 'Logged out successfully' });
});

// ==========================================
// SALONS ROUTES
// ==========================================

// Discover salons
app.get('/api/salons', (req: AuthenticatedRequest, res: Response) => {
  try {
    const { category, city, locality, minRating, maxPrice, q, sort, ownerId } = req.query;

    // Check if user is admin or filtering by ownerId
    const isOwnerQuery = ownerId && req.user?.id === ownerId;
    const isAdmin = req.user?.role === 'admin';
    const includeUnapproved = Boolean(isAdmin || isOwnerQuery);

    let salons = db.getSalons({
      category: category as string,
      city: city as string,
      locality: locality as string,
      minRating: minRating ? parseFloat(minRating as string) : undefined,
      maxPrice: maxPrice ? parseInt(maxPrice as string, 10) : undefined,
      searchQuery: q as string,
      includeUnapproved,
      ownerId: ownerId as string
    });

    // Sorting
    if (sort === 'rating') {
      salons.sort((a, b) => b.rating - a.rating);
    } else if (sort === 'price_low') {
      salons.sort((a, b) => a.startingPrice - b.startingPrice);
    } else if (sort === 'price_high') {
      salons.sort((a, b) => b.startingPrice - a.startingPrice);
    } else if (sort === 'reviews') {
      salons.sort((a, b) => b.reviewCount - a.reviewCount);
    }

    res.json({ salons, total: salons.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get salon details
app.get('/api/salons/:id', (req: AuthenticatedRequest, res: Response) => {
  try {
    const salon = db.getSalonById(req.params.id);
    if (!salon) {
      res.status(404).json({ error: 'Salon not found' });
      return;
    }

    // Only approved salons are public, unless owner or admin
    if (salon.verificationStatus !== 'approved') {
      const isOwner = req.user?.id === salon.ownerId;
      const isAdmin = req.user?.role === 'admin';
      if (!isOwner && !isAdmin) {
        res.status(403).json({ error: 'This salon is undergoing verification.' });
        return;
      }
    }

    const services = db.getServicesBySalonId(salon.id, true);
    const staff = db.getStaffBySalonId(salon.id, true);
    const reviews = db.getReviewsBySalonId(salon.id);

    res.json({
      salon,
      services,
      staff,
      reviews
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Register a salon (Owner portal)
app.post('/api/salons', requireRole('salon_owner', 'admin'), (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      name,
      description,
      category,
      address,
      city,
      locality,
      openTime,
      closeTime,
      imageUrl,
      cancellationPolicy,
      autoConfirm
    } = req.body;

    if (!name || !address || !city || !locality) {
      res.status(400).json({ error: 'Name, address, city, and locality are required.' });
      return;
    }

    const openingHours = `${openTime || '10:00'} - ${closeTime || '20:00'}`;

    const newSalon = db.createSalon({
      ownerId: req.user!.id,
      name: name.trim(),
      description: description || 'Premium salon offering bespoke hair, skin, and grooming care.',
      category: category || 'unisex',
      address: address.trim(),
      city: city.trim(),
      locality: locality.trim(),
      latitude: 12.9716,
      longitude: 77.5946,
      openingHours,
      openTime: openTime || '10:00',
      closeTime: closeTime || '20:00',
      startingPrice: 350,
      imageUrl: imageUrl || '/src/assets/images/hero_salon_interior_1793290119938.jpg',
      cancellationPolicy: cancellationPolicy || 'Free cancellation up to 2 hours before appointment.',
      autoConfirm: autoConfirm !== undefined ? autoConfirm : true,
      verificationStatus: req.user!.role === 'admin' ? 'approved' : 'pending' // Initial pending verification
    });

    // Automatically add default signature services
    db.createService({
      salonId: newSalon.id,
      name: 'Classic Haircut & Styling',
      description: 'Consultation, refreshing shampoo, haircut, and blow-dry finish.',
      price: 450,
      durationMinutes: 45,
      category: 'Haircut',
      isActive: true
    });
    db.createService({
      salonId: newSalon.id,
      name: 'Beard Trimming & Oil Massage',
      description: 'Precision trimming, neat edging, and soothing beard oil application.',
      price: 250,
      durationMinutes: 25,
      category: 'Beard Styling',
      isActive: true
    });

    // Add owner as initial staff
    db.createStaff({
      salonId: newSalon.id,
      name: req.user!.fullName,
      roleTitle: 'Master Stylist / Owner',
      isActive: true,
      assignedServiceIds: []
    });

    res.status(201).json({ salon: newSalon });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Update salon
app.put('/api/salons/:id', requireRole('salon_owner', 'admin'), (req: AuthenticatedRequest, res: Response) => {
  try {
    const salon = db.getSalonById(req.params.id);
    if (!salon) {
      res.status(404).json({ error: 'Salon not found' });
      return;
    }
    if (salon.ownerId !== req.user!.id && req.user!.role !== 'admin') {
      res.status(403).json({ error: 'You do not have permission to modify this salon.' });
      return;
    }

    const updated = db.updateSalon(salon.id, req.body);
    res.json({ salon: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ==========================================
// SERVICES MANAGEMENT
// ==========================================

// Get services for salon
app.get('/api/salons/:id/services', (req: Request, res: Response) => {
  const services = db.getServicesBySalonId(req.params.id, false);
  res.json({ services });
});

// Add service
app.post('/api/salons/:id/services', requireRole('salon_owner', 'admin'), (req: AuthenticatedRequest, res: Response) => {
  try {
    const salon = db.getSalonById(req.params.id);
    if (!salon) {
      res.status(404).json({ error: 'Salon not found' });
      return;
    }
    if (salon.ownerId !== req.user!.id && req.user!.role !== 'admin') {
      res.status(403).json({ error: 'Unauthorized to modify this salon.' });
      return;
    }

    const { name, description, price, durationMinutes, category } = req.body;
    if (!name || price === undefined || !durationMinutes) {
      res.status(400).json({ error: 'Name, price, and duration are required.' });
      return;
    }

    const service = db.createService({
      salonId: salon.id,
      name: name.trim(),
      description: description || '',
      price: Number(price),
      durationMinutes: Number(durationMinutes),
      category: category || 'Haircut',
      isActive: true
    });

    res.status(201).json({ service });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Update service
app.put('/api/services/:id', requireRole('salon_owner', 'admin'), (req: AuthenticatedRequest, res: Response) => {
  try {
    const service = db.getServiceById(req.params.id);
    if (!service) {
      res.status(404).json({ error: 'Service not found' });
      return;
    }
    const salon = db.getSalonById(service.salonId);
    if (!salon || (salon.ownerId !== req.user!.id && req.user!.role !== 'admin')) {
      res.status(403).json({ error: 'Unauthorized.' });
      return;
    }

    const updated = db.updateService(service.id, req.body);
    res.json({ service: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Delete service
app.delete('/api/services/:id', requireRole('salon_owner', 'admin'), (req: AuthenticatedRequest, res: Response) => {
  try {
    const service = db.getServiceById(req.params.id);
    if (!service) {
      res.status(404).json({ error: 'Service not found' });
      return;
    }
    const salon = db.getSalonById(service.salonId);
    if (!salon || (salon.ownerId !== req.user!.id && req.user!.role !== 'admin')) {
      res.status(403).json({ error: 'Unauthorized.' });
      return;
    }

    db.deleteService(service.id);
    res.json({ success: true, message: 'Service removed successfully.' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ==========================================
// STAFF & SCHEDULES
// ==========================================

// Get staff
app.get('/api/salons/:id/staff', (req: Request, res: Response) => {
  const staff = db.getStaffBySalonId(req.params.id, false);
  res.json({ staff });
});

// Create staff
app.post('/api/salons/:id/staff', requireRole('salon_owner', 'admin'), (req: AuthenticatedRequest, res: Response) => {
  try {
    const salon = db.getSalonById(req.params.id);
    if (!salon || (salon.ownerId !== req.user!.id && req.user!.role !== 'admin')) {
      res.status(403).json({ error: 'Unauthorized.' });
      return;
    }

    const { name, roleTitle, assignedServiceIds } = req.body;
    if (!name) {
      res.status(400).json({ error: 'Staff name is required.' });
      return;
    }

    const staffMember = db.createStaff({
      salonId: salon.id,
      name: name.trim(),
      roleTitle: roleTitle || 'Stylist',
      isActive: true,
      assignedServiceIds: Array.isArray(assignedServiceIds) ? assignedServiceIds : []
    });

    res.status(201).json({ staff: staffMember });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Update staff
app.put('/api/staff/:id', requireRole('salon_owner', 'admin'), (req: AuthenticatedRequest, res: Response) => {
  try {
    const st = db.getStaffById(req.params.id);
    if (!st) {
      res.status(404).json({ error: 'Staff not found' });
      return;
    }
    const salon = db.getSalonById(st.salonId);
    if (!salon || (salon.ownerId !== req.user!.id && req.user!.role !== 'admin')) {
      res.status(403).json({ error: 'Unauthorized.' });
      return;
    }

    const updated = db.updateStaff(st.id, req.body);
    res.json({ staff: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Get staff schedules
app.get('/api/staff/:id/schedules', (req: Request, res: Response) => {
  const schedules = db.getStaffSchedules(req.params.id);
  res.json({ schedules });
});

// Update schedule
app.put('/api/schedules/:id', requireRole('salon_owner', 'admin'), (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = db.updateStaffSchedule(req.params.id, req.body);
    res.json({ schedule: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ==========================================
// AVAILABILITY & SLOTS CALCULATION
// ==========================================

app.get('/api/salons/:id/slots', (req: Request, res: Response) => {
  try {
    const { date, staffId, serviceIds } = req.query;
    if (!date) {
      res.status(400).json({ error: 'Date (YYYY-MM-DD) is required.' });
      return;
    }

    let totalDurationMinutes = 45; // default
    if (serviceIds) {
      const sIds = (serviceIds as string).split(',');
      const services = db.getServicesBySalonId(req.params.id, false);
      const chosen = services.filter((s) => sIds.includes(s.id));
      if (chosen.length > 0) {
        totalDurationMinutes = chosen.reduce((acc, s) => acc + s.durationMinutes, 0);
      }
    }

    const slots = db.getAvailableSlots({
      salonId: req.params.id,
      staffId: (staffId as string) || undefined,
      date: date as string,
      totalDurationMinutes
    });

    res.json({ slots, totalDurationMinutes, date });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// APPOINTMENTS & BOOKINGS
// ==========================================

// Create booking
app.post('/api/bookings', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      salonId,
      staffId,
      serviceIds,
      date,
      startTime,
      paymentMethod,
      customerName,
      customerEmail,
      customerPhone,
      isWalkin
    } = req.body;

    if (!salonId || !serviceIds || !date || !startTime) {
      res.status(400).json({ error: 'Salon, services, date, and appointment time are required.' });
      return;
    }

    // Payment validation: online payment is disabled if gateway not configured
    if (paymentMethod === 'online') {
      res.status(400).json({
        error: 'Online payment gateway is not configured. Please select "Pay at the Salon".'
      });
      return;
    }

    // If walk-in, require salon_owner or admin
    if (isWalkin && req.user!.role !== 'salon_owner' && req.user!.role !== 'admin') {
      res.status(403).json({ error: 'Only salon owners or staff can record walk-ins.' });
      return;
    }

    const booking = db.createBooking({
      customerId: req.user!.id,
      salonId,
      staffId: staffId || null,
      serviceIds: Array.isArray(serviceIds) ? serviceIds : [serviceIds],
      date,
      startTime,
      paymentMethod: 'pay_at_salon',
      customerName: customerName || req.user!.fullName,
      customerEmail: customerEmail || req.user!.email,
      customerPhone: customerPhone || req.user!.phone,
      isWalkin: Boolean(isWalkin)
    });

    res.status(201).json({ booking, message: 'Appointment booked successfully!' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// List bookings with strict RBAC:
// Customer can only view their own bookings
// Salon Owner can only view their salon's bookings
// Admin can view all
app.get('/api/bookings', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { salonId, status, date } = req.query;

    if (req.user!.role === 'customer') {
      const bookings = db.getBookings({
        customerId: req.user!.id,
        status: status as string,
        date: date as string
      });
      res.json({ bookings });
      return;
    }

    if (req.user!.role === 'salon_owner') {
      // Find all salons owned by this user
      const ownedSalons = db.getSalons({ ownerId: req.user!.id, includeUnapproved: true });
      const ownedIds = ownedSalons.map((s) => s.id);

      if (salonId && !ownedIds.includes(salonId as string)) {
        res.status(403).json({ error: 'Access denied to bookings for another salon.' });
        return;
      }

      const targetSalonId = (salonId as string) || (ownedIds[0] ?? '');
      const bookings = db.getBookings({
        salonId: targetSalonId,
        status: status as string,
        date: date as string
      });

      res.json({ bookings, salons: ownedSalons });
      return;
    }

    if (req.user!.role === 'admin') {
      const bookings = db.getBookings({
        salonId: salonId as string,
        status: status as string,
        date: date as string
      });
      res.json({ bookings });
      return;
    }

    res.status(403).json({ error: 'Unauthorized.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Update booking status (confirm, complete, cancel)
app.patch('/api/bookings/:id/status', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status, cancelReason } = req.body;
    const booking = db.getBookingById(req.params.id);
    if (!booking) {
      res.status(404).json({ error: 'Booking not found.' });
      return;
    }

    // Role checks
    const isCustomer = req.user!.id === booking.customerId;
    const salon = db.getSalonById(booking.salonId);
    const isOwner = salon?.ownerId === req.user!.id;
    const isAdmin = req.user!.role === 'admin';

    if (!isCustomer && !isOwner && !isAdmin) {
      res.status(403).json({ error: 'You do not have permission to modify this booking.' });
      return;
    }

    // Cancellation policy check for customer
    if (status === 'cancelled' && isCustomer) {
      // Allow cancellation
    }

    // Only owner or admin can mark as completed
    if (status === 'completed' && !isOwner && !isAdmin) {
      res.status(403).json({ error: 'Only salon staff or admin can mark appointment as completed.' });
      return;
    }

    const updated = db.updateBookingStatus(booking.id, status, cancelReason);
    res.json({ booking: updated, message: `Booking marked as ${status}.` });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ==========================================
// REVIEWS & RATINGS
// ==========================================

// Submit review
app.post('/api/reviews', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { bookingId, salonId, rating, comment } = req.body;
    if (!bookingId || !salonId || !rating || !comment) {
      res.status(400).json({ error: 'Booking ID, salon ID, rating, and feedback are required.' });
      return;
    }

    const review = db.createReview({
      bookingId,
      customerId: req.user!.id,
      salonId,
      rating: Number(rating),
      comment
    });

    res.status(201).json({ review, message: 'Review submitted successfully. Thank you!' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Reply to review (Salon Owner)
app.post('/api/reviews/:id/reply', requireRole('salon_owner', 'admin'), (req: AuthenticatedRequest, res: Response) => {
  try {
    const { response } = req.body;
    if (!response || !response.trim()) {
      res.status(400).json({ error: 'Response message is required.' });
      return;
    }

    const updated = db.replyToReview(req.params.id, response);
    res.json({ review: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ==========================================
// ADMIN DASHBOARD & VERIFICATION
// ==========================================

app.get('/api/admin/stats', requireRole('admin'), (req: AuthenticatedRequest, res: Response) => {
  const stats = db.getPlatformStats();
  res.json({ stats });
});

app.get('/api/admin/salons', requireRole('admin'), (req: AuthenticatedRequest, res: Response) => {
  const salons = db.getSalons({ includeUnapproved: true });
  res.json({ salons });
});

app.patch('/api/admin/salons/:id/verification', requireRole('admin'), (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status } = req.body;
    if (!['pending', 'approved', 'rejected', 'suspended'].includes(status)) {
      res.status(400).json({ error: 'Invalid verification status.' });
      return;
    }

    const salon = db.getSalonById(req.params.id);
    if (!salon) {
      res.status(404).json({ error: 'Salon not found.' });
      return;
    }

    const updated = db.updateSalon(salon.id, { verificationStatus: status });
    res.json({ salon: updated, message: `Salon listing updated to ${status}.` });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/admin/users', requireRole('admin'), (req: AuthenticatedRequest, res: Response) => {
  const users = db.getAllUsers().map(({ passwordHash: _, ...safe }) => safe);
  res.json({ users });
});

// Database demo reset endpoint
app.post('/api/demo/reset', (req: Request, res: Response) => {
  db.resetSeedData();
  res.json({ success: true, message: 'Database reset to default seed data.' });
});

// ==========================================
// SERVER INITIALIZATION & VITE MIDDLEWARE
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    // In development, mount Vite middleware
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SalonBook] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
