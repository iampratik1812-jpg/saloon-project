import React from 'react';
import { Store, Users, Calendar, TrendingUp, ShieldCheck, ArrowRight } from 'lucide-react';

interface OwnerCtaProps {
  onListSalon: () => void;
}

export const OwnerCta: React.FC<OwnerCtaProps> = ({ onListSalon }) => {
  const benefits = [
    {
      icon: Users,
      title: 'Reach New Customers',
      desc: 'Showcase your salon to thousands of clients searching for premium beauty and grooming services in your neighborhood.'
    },
    {
      icon: Calendar,
      title: 'Accept Online Bookings',
      desc: 'Fill empty chairs during off-peak hours with automated 24/7 calendar scheduling and instant slot confirmations.'
    },
    {
      icon: TrendingUp,
      title: 'Organize Menus & Pricing',
      desc: 'Update services, festive discounts, staff rotas, and custom packages on the fly with our intuitive owner dashboard.'
    },
    {
      icon: ShieldCheck,
      title: 'Eliminate Double-Booking',
      desc: 'Smart scheduling engine respects staff shifts, tea breaks, and walk-ins so your team never gets double-booked.'
    }
  ];

  return (
    <section className="py-16 bg-neutral-900 text-white relative overflow-hidden" id="partner-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Heading & Call to action */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-amber-300 bg-amber-400/10 px-3 py-1 rounded-md border border-amber-300/20">
              <Store className="w-3.5 h-3.5" />
              <span>Partner With SalonBook</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
              Grow Your Salon Business with SalonBook.
            </h2>

            <p className="text-sm sm:text-base text-neutral-300 leading-relaxed">
              Join India's fastest-growing salon network. Streamline your appointments, delight your clients, and focus on what you do best — delivering impeccable style.
            </p>

            <div className="pt-2">
              <button
                onClick={onListSalon}
                className="px-6 py-3.5 bg-amber-400 hover:bg-amber-300 text-neutral-950 rounded-xl font-bold text-sm transition-all shadow-md flex items-center gap-2 cursor-pointer active:scale-98"
              >
                <span>List Your Salon</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <p className="text-xs text-neutral-400 mt-2.5">
                Takes 3 minutes · Verified listing review within 24 hours
              </p>
            </div>
          </div>

          {/* Right Column: 4-Grid Benefits */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {benefits.map((b) => {
              const Icon = b.icon;
              return (
                <div
                  key={b.title}
                  className="bg-neutral-800/80 border border-neutral-700/80 p-5 rounded-2xl hover:border-amber-400/40 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-400/15 text-amber-300 flex items-center justify-center mb-3">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-1.5">{b.title}</h3>
                  <p className="text-xs text-neutral-300 leading-relaxed">{b.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
