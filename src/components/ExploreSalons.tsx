import React, { useState, useMemo } from 'react';
import { Salon } from '../types/index.ts';
import { Search, MapPin, Star, Filter, RotateCcw, Clock, Sparkles } from 'lucide-react';

interface ExploreSalonsProps {
  salons: Salon[];
  initialSearch?: string;
  initialCity?: string;
  initialServiceCategory?: string;
  onViewDetails: (salon: Salon) => void;
  onBookNow: (salon: Salon) => void;
}

export const ExploreSalons: React.FC<ExploreSalonsProps> = ({
  salons,
  initialSearch = '',
  initialCity = 'All',
  initialServiceCategory = 'all',
  onViewDetails,
  onBookNow
}) => {
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCity, setSelectedCity] = useState(initialCity);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedService, setSelectedService] = useState<string>(initialServiceCategory);
  const [minRating, setMinRating] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(10000);
  const [sortBy, setSortBy] = useState<string>('rating');
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCity('All');
    setSelectedCategory('all');
    setSelectedService('all');
    setMinRating(0);
    setMaxPrice(10000);
    setSortBy('rating');
  };

  const filteredSalons = useMemo(() => {
    let result = [...salons];

    // Filter by city
    if (selectedCity !== 'All') {
      result = result.filter(
        (s) => s.city.toLowerCase() === selectedCity.toLowerCase()
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      result = result.filter((s) => s.category === selectedCategory);
    }

    // Filter by rating
    if (minRating > 0) {
      result = result.filter((s) => s.rating >= minRating);
    }

    // Filter by price
    if (maxPrice < 10000) {
      result = result.filter((s) => s.startingPrice <= maxPrice);
    }

    // Filter by search query (name, locality, description)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.locality.toLowerCase().includes(q) ||
          s.city.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q)
      );
    }

    // Sort
    if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'price_low') {
      result.sort((a, b) => a.startingPrice - b.startingPrice);
    } else if (sortBy === 'price_high') {
      result.sort((a, b) => b.startingPrice - a.startingPrice);
    } else if (sortBy === 'reviews') {
      result.sort((a, b) => b.reviewCount - a.reviewCount);
    }

    return result;
  }, [salons, selectedCity, selectedCategory, minRating, maxPrice, searchQuery, sortBy]);

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
    <div className="py-8 bg-[#FAF9F6] min-h-[calc(100vh-140px)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Breadcrumb & Title */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs text-neutral-500 mb-1">
            <span>Home</span>
            <span>/</span>
            <span className="text-neutral-900 font-semibold">Explore Salons</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
            Discover Verified Salons & Studios
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
            Compare service menus, verified ratings, and book confirmed slots in real-time.
          </p>
        </div>

        {/* Filter Bar & Controls */}
        <div className="bg-white p-4 rounded-2xl border border-neutral-200/90 shadow-xs mb-8 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            {/* Search Input */}
            <div className="md:col-span-5 relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-neutral-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by salon name, area, or service..."
                className="w-full pl-9 pr-3 py-2 bg-neutral-50 rounded-xl text-xs sm:text-sm text-neutral-900 placeholder-neutral-400 border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-purple-900"
              />
            </div>

            {/* City Dropdown */}
            <div className="md:col-span-3">
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-50 rounded-xl text-xs sm:text-sm text-neutral-800 border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-purple-900 cursor-pointer"
              >
                <option value="All">All Cities</option>
                <option value="Bengaluru">Bengaluru</option>
                <option value="Mumbai">Mumbai</option>
                <option value="New Delhi">New Delhi</option>
                <option value="Hyderabad">Hyderabad</option>
              </select>
            </div>

            {/* Sort Selector */}
            <div className="md:col-span-4 flex items-center gap-2">
              <span className="text-xs text-neutral-500 shrink-0 hidden sm:inline">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-50 rounded-xl text-xs sm:text-sm text-neutral-800 border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-purple-900 cursor-pointer"
              >
                <option value="rating">Top Rated (Highest First)</option>
                <option value="price_low">Starting Price: Low to High</option>
                <option value="price_high">Starting Price: High to Low</option>
                <option value="reviews">Most Reviewed</option>
              </select>
            </div>
          </div>

          {/* Category Tabs & Quick Filters */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-neutral-100">
            {/* Functional Category Filter Buttons */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-neutral-100/70 rounded-xl">
              {[
                { id: 'all', label: 'All Salons' },
                { id: 'unisex', label: 'Unisex Salons' },
                { id: 'barber', label: 'Barber Shops' },
                { id: 'beauty_parlour', label: 'Beauty Parlours' },
                { id: 'hair_studio', label: 'Hair Studios' }
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    selectedCategory === cat.id
                      ? 'bg-purple-950 text-white shadow-xs'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Rating & Reset Filter Actions */}
            <div className="flex items-center gap-2 ml-auto">
              <select
                value={minRating}
                onChange={(e) => setMinRating(Number(e.target.value))}
                className="px-2.5 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-700 cursor-pointer"
              >
                <option value={0}>Any Rating</option>
                <option value={4.0}>4.0★ & above</option>
                <option value={4.5}>4.5★ & above</option>
                <option value={4.8}>4.8★ & above</option>
              </select>

              {(searchQuery || selectedCity !== 'All' || selectedCategory !== 'all' || minRating > 0) && (
                <button
                  onClick={resetFilters}
                  className="px-2.5 py-1.5 text-xs text-neutral-500 hover:text-neutral-900 flex items-center gap-1 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Results Counter & Salons Grid */}
        <div className="mb-4 flex items-center justify-between text-xs text-neutral-500">
          <span>
            Showing <strong className="text-neutral-900 font-semibold">{filteredSalons.length}</strong> verified salons
          </span>
          <span className="hidden sm:inline">Prices displayed in Indian Rupees (₹)</span>
        </div>

        {filteredSalons.length === 0 ? (
          <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center max-w-lg mx-auto my-8">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-950 flex items-center justify-center mx-auto mb-3">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-neutral-900 mb-1">No Salons Matched Your Filters</h3>
            <p className="text-xs text-neutral-500 mb-4">
              Try adjusting your city, minimum rating, or clearing your search term to see more results.
            </p>
            <button
              onClick={resetFilters}
              className="px-4 py-2 bg-purple-950 hover:bg-purple-900 text-white rounded-xl text-xs font-semibold transition-colors"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSalons.map((salon) => (
              <div
                key={salon.id}
                className="group bg-white rounded-2xl overflow-hidden border border-neutral-200/90 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  {/* Salon Image */}
                  <div className="relative aspect-16/10 bg-neutral-100 overflow-hidden">
                    <img
                      src={salon.imageUrl}
                      alt={salon.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/70 via-transparent to-transparent" />

                    <div className="absolute top-3 left-3 bg-neutral-900/80 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-md">
                      {getCategoryLabel(salon.category)}
                    </div>

                    <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-md text-purple-950 text-xs font-bold px-2.5 py-1 rounded-md shadow-xs tabular-nums">
                      From ₹{salon.startingPrice}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5">
                    <div className="flex items-center justify-between text-xs text-neutral-500 mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="flex items-center text-amber-500 font-bold">
                          <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400 mr-1" />
                          {salon.rating.toFixed(1)}
                        </span>
                        <span>·</span>
                        <span className="tabular-nums">({salon.reviewCount} reviews)</span>
                      </div>
                      <span className="text-[11px] text-neutral-500 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-neutral-400" />
                        {salon.openingHours}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-neutral-900 group-hover:text-purple-950 transition-colors line-clamp-1 mb-1">
                      {salon.name}
                    </h3>

                    <div className="flex items-center gap-1 text-xs text-neutral-500 mb-2.5">
                      <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                      <span className="truncate">{salon.locality}, {salon.city}</span>
                    </div>

                    <p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed mb-4">
                      {salon.description}
                    </p>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="px-5 pb-5 pt-3 border-t border-neutral-100 grid grid-cols-2 gap-2">
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
