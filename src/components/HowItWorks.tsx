import React from 'react';
import { Search, CalendarCheck, Sparkles } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'Discover Salons',
      description: 'Explore verified barbershops, unisex salons, and bridal parlours in your locality with verified reviews and genuine prices.',
      icon: Search
    },
    {
      num: '02',
      title: 'Choose Service & Time',
      description: 'Select your preferred hair or beauty rituals, pick your favorite stylist, and lock in an exact appointment slot without wait times.',
      icon: CalendarCheck
    },
    {
      num: '03',
      title: 'Visit & Enjoy Experience',
      description: 'Walk into the salon at your scheduled time, enjoy your personalized grooming experience, and pay conveniently at the salon.',
      icon: Sparkles
    }
  ];

  return (
    <section className="py-16 bg-white border-t border-neutral-200/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-semibold text-purple-900 tracking-wider uppercase block mb-1">
            Simple 3-Step Process
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 tracking-tight mb-3">
            How SalonBook Works
          </h2>
          <p className="text-sm text-neutral-500">
            Say goodbye to endless salon queues and uncertain pricing. Booking your appointment takes less than two minutes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="relative bg-[#FAF9F6] p-7 rounded-2xl border border-neutral-200/80 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-xl bg-purple-950 text-amber-300 flex items-center justify-center shadow-xs">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-2xl font-black text-neutral-300 font-mono">
                      {step.num}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-neutral-900 mb-2">
                    {step.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-neutral-200/60 flex items-center text-[11px] font-semibold text-purple-950">
                  <span>Step {idx + 1} of 3</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
