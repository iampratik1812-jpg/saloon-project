import React from 'react';
import { Salon } from '../types/index.ts';
import { MapPin, Star, Clock, ArrowRight } from 'lucide-react';

interface FeaturedSalonsProps {
  salons: Salon[];
  onViewDetails: (salon: Salon) => void;
  onBookNow: (salon: Salon) => void;
  onViewAll: () => void;
}

export const FeaturedSalons: React.FC<FeaturedSalonsProps> = ({
  salons,
  onViewDetails,
  onBookNow,
  onViewAll
}) => {
  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'barber':
        return 'Barber Shop';
      case 'beauty_parlour':
        return 'Beauty Parlour';
      case 'hair_studio':
        return 'Hair Studio';
      default:
        return 'Unisex Salon';
    }
  };

  return (
    <section className="py-16 bg-[#FAF9F6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <span className="text-xs font-semibold text-purple-900 tracking-wider uppercase block mb-1">
              Handpicked Studios
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 tracking-tight">
              Featured Salons & Studios
            </h2>
          </div>
          <button
            onClick={onViewAll}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-purple-950 hover:text-purple-800 transition-colors group cursor-pointer"
          >
            <span>View All Salons</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {salons.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-neutral-200">
            <p className="text-neutral-500 text-sm">No featured salons found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {salons.slice(0, 3).map((salon) => (
              <div
                key={salon.id}
                className="group bg-white rounded-2xl overflow-hidden border border-neutral-200/90 shadow-xs hover:shadow-lg transition-all duration-200 flex flex-col"
              >
                {/* Salon Photo with Category Pill & Starting Price */}
                <div className="relative aspect-16/10 bg-neutral-100 overflow-hidden">
                  <img
                    src={salon.imageUrl}
                    alt={salon.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/70 via-transparent to-transparent" />

                  {/* Category text badge */}
                  <div className="absolute top-3 left-3 bg-neutral-900/80 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-md">
                    {getCategoryLabel(salon.category)}
                  </div>

                  {/* Starting Price Pill */}
                  <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-md text-purple-950 text-xs font-bold px-2.5 py-1 rounded-md shadow-xs tabular-nums">
                    From ₹{salon.startingPrice}
                  </div>
                </div>

                {/* Salon Info Body */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Rating & Review Count */}
                    <div className="flex items-center justify-between text-xs text-neutral-500 mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="flex items-center text-amber-500 font-bold">
                          <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400 mr-1" />
                          {salon.rating.toFixed(1)}
                        </span>
                        <span>·</span>
                        <span className="tabular-nums">({salon.reviewCount} reviews)</span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
                        <Clock className="w-3 h-3" />
                        <span>Next Slot: Today</span>
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-neutral-900 group-hover:text-purple-950 transition-colors line-clamp-1 mb-1">
                      {salon.name}
                    </h3>

                    <div className="flex items-center gap-1 text-xs text-neutral-500 mb-3">
                      <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                      <span className="truncate">{salon.locality}, {salon.city}</span>
                    </div>

                    <p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed mb-4">
                      {salon.description}
                    </p>
                  </div>

                  {/* Action buttons */}
                  <div className="pt-4 border-t border-neutral-100 grid grid-cols-2 gap-2">
                    <button
                      onClick={() => onViewDetails(salon)}
                      className="w-full py-2 px-3 text-xs font-semibold text-neutral-700 bg-neutral-50 hover:bg-neutral-100 rounded-xl border border-neutral-200 transition-colors text-center cursor-pointer"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => onBookNow(salon)}
                      className="w-full py-2 px-3 text-xs font-semibold text-white bg-purple-950 hover:bg-purple-900 rounded-xl transition-colors text-center shadow-xs cursor-pointer"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
