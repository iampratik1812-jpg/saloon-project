import React from 'react';
import {
  Scissors,
  Sparkles,
  Heart,
  Droplets,
  Palette,
  Hand,
  Crown,
  ChevronRight
} from 'lucide-react';

interface PopularServicesProps {
  onSelectService: (serviceCategory: string) => void;
}

export const PopularServices: React.FC<PopularServicesProps> = ({ onSelectService }) => {
  const services = [
    {
      id: 'haircut',
      category: 'Haircut',
      name: 'Haircut & Styling',
      description: 'Precision scissor fades, layered blowouts, customized texturizing, and hair wash.',
      startingPrice: '₹350',
      duration: '45 mins',
      icon: Scissors,
      tag: 'Most Popular'
    },
    {
      id: 'beard',
      category: 'Beard Styling',
      name: 'Beard Styling & Shave',
      description: 'Hot towel steam, crisp razor contouring, conditioning beard oil, and shaping.',
      startingPrice: '₹250',
      duration: '30 mins',
      icon: Sparkles,
      tag: 'Grooming'
    },
    {
      id: 'combo',
      category: 'Combos',
      name: 'Haircut + Beard Styling',
      description: 'The complete grooming duo: signature precision haircut paired with beard detailing.',
      startingPrice: '₹600',
      duration: '60 mins',
      icon: Scissors,
      tag: 'Best Value'
    },
    {
      id: 'facial',
      category: 'Facial',
      name: 'Facial & Skin Therapy',
      description: 'Hydra-dermabrasion, deep pore extraction, LED light therapy, and glow masks.',
      startingPrice: '₹850',
      duration: '50 mins',
      icon: Droplets,
      tag: 'Skin Glow'
    },
    {
      id: 'hairspa',
      category: 'Hair Spa',
      name: 'Hair Spa & Scalp Detox',
      description: 'Deep micro-mist steam therapy, argan hair mask, and relaxing neck massage.',
      startingPrice: '₹1,100',
      duration: '60 mins',
      icon: Heart,
      tag: 'Relaxation'
    },
    {
      id: 'colouring',
      category: 'Hair Colouring',
      name: 'Hair Colouring & Highlights',
      description: 'Balayage, ombre, global ammonia-free tints, and gloss toner treatments.',
      startingPrice: '₹2,200',
      duration: '90 mins',
      icon: Palette,
      tag: 'Trendy'
    },
    {
      id: 'manicure',
      category: 'Manicure and Pedicure',
      name: 'Manicure & Pedicure',
      description: 'Dead sea salt soak, cuticle care, exfoliating scrub, and gel polish coating.',
      startingPrice: '₹900',
      duration: '60 mins',
      icon: Hand,
      tag: 'Hand & Feet'
    },
    {
      id: 'bridal',
      category: 'Bridal Makeup',
      name: 'Bridal Makeup & Makeover',
      description: 'HD camera-ready makeup, lehenga/saree draping, false lashes, and hair couture.',
      startingPrice: '₹5,000',
      duration: '120 mins',
      icon: Crown,
      tag: 'Luxury'
    }
  ];

  return (
    <section className="py-16 bg-white border-y border-neutral-200/70" id="services-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <span className="text-xs font-semibold text-purple-900 tracking-wider uppercase block mb-1">
              Popular Services
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 tracking-tight">
              Bespoke Salon & Grooming Services
            </h2>
          </div>
          <p className="text-sm text-neutral-500 max-w-md">
            Choose from top-rated hair, skin, and grooming treatments performed by verified salon professionals across India.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {services.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                onClick={() => onSelectService(item.category)}
                className="group relative bg-[#FAF9F6] hover:bg-white rounded-2xl p-5 border border-neutral-200/90 hover:border-purple-900/30 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-11 h-11 rounded-xl bg-purple-100/70 group-hover:bg-purple-950 text-purple-950 group-hover:text-amber-300 flex items-center justify-center transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-medium text-neutral-500 bg-white px-2.5 py-0.5 rounded-full border border-neutral-200">
                      {item.tag}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-neutral-900 group-hover:text-purple-950 transition-colors mb-1.5">
                    {item.name}
                  </h3>

                  <p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed mb-4">
                    {item.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-neutral-200/60 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-neutral-500 uppercase block font-medium">Starts from</span>
                    <span className="text-sm font-bold text-purple-950 tabular-nums">{item.startingPrice}</span>
                  </div>
                  <div className="flex items-center gap-1 font-semibold text-purple-950 group-hover:translate-x-0.5 transition-transform">
                    <span>Explore</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
