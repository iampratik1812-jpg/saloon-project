/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { Salon, Booking } from './types/index.ts';
import { salonsApi } from './lib/api.ts';
import { Navbar } from './components/Navbar.tsx';
import { Hero } from './components/Hero.tsx';
import { PopularServices } from './components/PopularServices.tsx';
import { FeaturedSalons } from './components/FeaturedSalons.tsx';
import { HowItWorks } from './components/HowItWorks.tsx';
import { OwnerCta } from './components/OwnerCta.tsx';
import { Footer } from './components/Footer.tsx';
import { ExploreSalons } from './components/ExploreSalons.tsx';
import { SalonDetailModal } from './components/SalonDetailModal.tsx';
import { BookingModal } from './components/BookingModal.tsx';
import { CustomerDashboard } from './components/CustomerDashboard.tsx';
import { OwnerDashboard } from './components/OwnerDashboard.tsx';
import { AdminDashboard } from './components/AdminDashboard.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { ReviewModal } from './components/ReviewModal.tsx';
import { OwnerRegisterModal } from './components/OwnerRegisterModal.tsx';

function MainApp() {
  const { user } = useAuth();

  // Navigation State
  const [currentView, setCurrentView] = useState<string>('home');
  const [searchParams, setSearchParams] = useState<{ query: string; city: string }>({
    query: '',
    city: 'All'
  });
  const [selectedServiceCategory, setSelectedServiceCategory] = useState<string>('all');

  // Salons data
  const [salons, setSalons] = useState<Salon[]>([]);
  const [loadingSalons, setLoadingSalons] = useState(true);

  // Modals
  const [detailSalon, setDetailSalon] = useState<Salon | null>(null);
  const [bookingSalon, setBookingSalon] = useState<Salon | null>(null);
  const [preselectedServiceId, setPreselectedServiceId] = useState<string | undefined>(undefined);
  const [authModalConfig, setAuthModalConfig] = useState<{
    open: boolean;
    mode: 'login' | 'register';
    defaultRole: 'customer' | 'salon_owner';
  }>({
    open: false,
    mode: 'login',
    defaultRole: 'customer'
  });
  const [ownerRegisterModalOpen, setOwnerRegisterModalOpen] = useState(false);
  const [reviewBooking, setReviewBooking] = useState<Booking | null>(null);

  // Fetch approved salons
  const loadSalons = async () => {
    try {
      setLoadingSalons(true);
      const res = await salonsApi.getSalons();
      setSalons(res.salons);
    } catch (err) {
      console.error('Failed to load salons:', err);
    } finally {
      setLoadingSalons(false);
    }
  };

  useEffect(() => {
    loadSalons();
  }, []);

  // Handlers
  const handleHeroSearch = (query: string, city: string) => {
    setSearchParams({ query, city });
    setSelectedServiceCategory('all');
    setCurrentView('explore');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectPopularService = (category: string) => {
    setSelectedServiceCategory(category);
    setSearchParams({ query: '', city: 'All' });
    setCurrentView('explore');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenBooking = (salon: Salon, serviceId?: string) => {
    setDetailSalon(null);
    setBookingSalon(salon);
    setPreselectedServiceId(serviceId);
  };

  const handleBookingSuccess = (booking: Booking) => {
    // Refresh salons or bookings
    loadSalons();
  };

  const handleOpenAuth = (
    mode: 'login' | 'register' = 'login',
    defaultRole: 'customer' | 'salon_owner' = 'customer'
  ) => {
    setAuthModalConfig({ open: true, mode, defaultRole });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-[#18181B]">
      {/* Top Navigation */}
      <Navbar
        currentView={currentView}
        onNavigate={(view) => {
          setCurrentView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenAuth={handleOpenAuth}
        onOpenRegisterSalon={() => setOwnerRegisterModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentView === 'home' && (
          <>
            <Hero
              onSearch={handleHeroSearch}
              onExploreServices={() => {
                const el = document.getElementById('services-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            />
            <PopularServices onSelectService={handleSelectPopularService} />
            <FeaturedSalons
              salons={salons}
              onViewDetails={(s) => setDetailSalon(s)}
              onBookNow={(s) => handleOpenBooking(s)}
              onViewAll={() => {
                setCurrentView('explore');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
            <HowItWorks />
            <OwnerCta onListSalon={() => setOwnerRegisterModalOpen(true)} />
          </>
        )}

        {currentView === 'explore' && (
          <ExploreSalons
            salons={salons}
            initialSearch={searchParams.query}
            initialCity={searchParams.city}
            initialServiceCategory={selectedServiceCategory}
            onViewDetails={(s) => setDetailSalon(s)}
            onBookNow={(s) => handleOpenBooking(s)}
          />
        )}

        {currentView === 'services' && (
          <div className="pt-6">
            <PopularServices onSelectService={handleSelectPopularService} />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
              <FeaturedSalons
                salons={salons}
                onViewDetails={(s) => setDetailSalon(s)}
                onBookNow={(s) => handleOpenBooking(s)}
                onViewAll={() => setCurrentView('explore')}
              />
            </div>
          </div>
        )}

        {currentView === 'customer_dashboard' && (
          <CustomerDashboard
            onWriteReview={(b) => setReviewBooking(b)}
            onExploreSalons={() => {
              setCurrentView('explore');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentView === 'owner_dashboard' && <OwnerDashboard />}

        {currentView === 'admin_dashboard' && <AdminDashboard />}
      </main>

      {/* Footer */}
      <Footer
        onNavigate={(view) => {
          setCurrentView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenPartner={() => setOwnerRegisterModalOpen(true)}
      />

      {/* MODALS */}

      {/* 1. Salon Details Modal */}
      {detailSalon && (
        <SalonDetailModal
          salon={detailSalon}
          onClose={() => setDetailSalon(null)}
          onProceedToBook={(s, srvId) => handleOpenBooking(s, srvId)}
        />
      )}

      {/* 2. 8-Step Appointment Booking Flow Modal */}
      {bookingSalon && (
        <BookingModal
          salon={bookingSalon}
          preselectedServiceId={preselectedServiceId}
          onClose={() => {
            setBookingSalon(null);
            setPreselectedServiceId(undefined);
          }}
          onSuccess={handleBookingSuccess}
          onOpenAuth={handleOpenAuth}
        />
      )}

      {/* 3. Authentication Modal */}
      {authModalConfig.open && (
        <AuthModal
          initialMode={authModalConfig.mode}
          defaultRole={authModalConfig.defaultRole}
          onClose={() => setAuthModalConfig({ ...authModalConfig, open: false })}
          onSuccess={() => {
            setAuthModalConfig({ ...authModalConfig, open: false });
            loadSalons();
          }}
        />
      )}

      {/* 4. Owner Salon Registration Wizard Modal */}
      {ownerRegisterModalOpen && (
        <OwnerRegisterModal
          onClose={() => setOwnerRegisterModalOpen(false)}
          onSuccess={() => {
            loadSalons();
            setCurrentView('owner_dashboard');
          }}
        />
      )}

      {/* 5. Client Review Submission Modal */}
      {reviewBooking && (
        <ReviewModal
          booking={reviewBooking}
          onClose={() => setReviewBooking(null)}
          onSuccess={() => {
            setReviewBooking(null);
            loadSalons();
          }}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
