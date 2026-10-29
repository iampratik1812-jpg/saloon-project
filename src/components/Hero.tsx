import React, { useState } from 'react';
import { Search, MapPin, Sparkles, ArrowRight, ShieldCheck, Clock } from 'lucide-react';

interface HeroProps {
  onSearch: (query: string, city: string) => void;
  onExploreServices: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onSearch, onExploreServices }) => {
  const [query, setQuery] = useState('');
  const [city, setCity] = useState('Bengaluru');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query, city);
  };

  return (
    <section className="relative overflow-hidden pt-8 pb-14 lg:py-16 bg-radial from-purple-950/5 via-transparent to-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Headlines & Search Form */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-purple-900 bg-purple-100/70 px-3 py-1 rounded-md">
              <Sparkles className="w-3.5 h-3.5 text-purple-700" />
              <span>India's Trusted Salon & Beauty Parlour Booking Platform</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-neutral-900 tracking-tight leading-[1.1] text-balance">
              Your Perfect Look <br className="hidden sm:inline" />
              <span className="text-purple-950">Starts Here.</span>
            </h1>

            <p className="text-base sm:text-lg text-neutral-600 max-w-xl leading-relaxed text-balance">
              Discover trusted salons near you. Compare services, find your favourite stylist, and book your next appointment in minutes.
            </p>

            {/* Functional Search Module */}
            <form
              onSubmit={handleSubmit}
              className="bg-white p-3 sm:p-4 rounded-2xl shadow-lg shadow-neutral-200/60 border border-neutral-200/80 space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-3"
            >
              {/* City selector */}
              <div className="relative sm:w-44 shrink-0">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-neutral-400">
                  <MapPin className="w-4 h-4" />
                </div>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full pl-9 pr-8 py-2.5 bg-neutral-50 hover:bg-neutral-100/80 rounded-xl text-sm font-medium text-neutral-800 border-0 focus:ring-2 focus:ring-purple-900 transition-colors cursor-pointer appearance-none"
                >
                  <option value="All">All Cities</option>
                  <option value="Bengaluru">Bengaluru</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="New Delhi">New Delhi</option>
                  <option value="Hyderabad">Hyderabad</option>
                </select>
              </div>

              <div className="hidden sm:block w-px h-8 bg-neutral-200" />

              {/* Service or Salon Query */}
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-neutral-400">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Haircut, beard, facial, bridal..."
                  className="w-full pl-9 pr-4 py-2.5 bg-neutral-50 hover:bg-neutral-100/80 rounded-xl text-sm text-neutral-800 placeholder-neutral-400 border-0 focus:ring-2 focus:ring-purple-900 transition-colors"
                />
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                className="w-full sm:w-auto px-5 py-2.5 bg-purple-950 hover:bg-purple-900 text-white rounded-xl text-sm font-semibold transition-all shadow-sm flex items-center justify-center gap-1.5 shrink-0 active:scale-98 cursor-pointer"
              >
                <span>Find Salons</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick action buttons & hints */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                onClick={onExploreServices}
                type="button"
                className="px-4 py-2 text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors cursor-pointer"
              >
                Explore Popular Services →
              </button>
              <div className="text-xs text-neutral-500 flex items-center gap-2">
                <span>Trending:</span>
                <button
                  type="button"
                  onClick={() => onSearch('Haircut', city)}
                  className="hover:text-purple-900 underline underline-offset-2"
                >
                  Haircut
                </button>
                <span>·</span>
                <button
                  type="button"
                  onClick={() => onSearch('Facial', city)}
                  className="hover:text-purple-900 underline underline-offset-2"
                >
                  Hydra Facial
                </button>
                <span>·</span>
                <button
                  type="button"
                  onClick={() => onSearch('Bridal', city)}
                  className="hover:text-purple-900 underline underline-offset-2"
                >
                  Bridal Makeup
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: High Quality Salon Image Showcase */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-purple-950/15 border border-neutral-200/80 aspect-4/3 lg:aspect-4/3 bg-neutral-100">
              <img
                src="/src/assets/images/hero_salon_interior_1793290119938.jpg"
                alt="Luxury modern Indian salon interior with warm lighting"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/70 via-neutral-950/20 to-transparent" />

              {/* Floating trust card inside hero banner */}
              <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border border-white/40 shadow-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-950 flex items-center justify-center font-bold text-sm">
                    4.9
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-neutral-900">Aura & Urban Edge Salons</p>
                    <p className="text-[11px] text-neutral-500">Verified master stylists · Sanitized</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-neutral-500 block uppercase font-medium">From</span>
                  <span className="text-sm font-bold text-purple-950 tabular-nums">₹450</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Claim-to-Proof Quantitative Strip */}
        <div className="mt-12 pt-8 border-t border-neutral-200 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-950 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-bold text-neutral-900 tabular-nums">100%</p>
              <p className="text-xs text-neutral-500">Verified Indian Salons</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-900 flex items-center justify-center shrink-0">
              <span className="font-bold text-sm">★ 4.8</span>
            </div>
            <div>
              <p className="text-xl font-bold text-neutral-900 tabular-nums">4.8 / 5</p>
              <p className="text-xs text-neutral-500">Average Client Rating</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-950 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-bold text-neutral-900 tabular-nums">Instant</p>
              <p className="text-xs text-neutral-500">Confirmed Booking Slots</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-950 flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-bold text-neutral-900 tabular-nums">4+ Metro</p>
              <p className="text-xs text-neutral-500">Cities Across India</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
