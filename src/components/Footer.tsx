import React, { useState } from 'react';
import { Scissors, Phone, Mail, MapPin, X } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: string) => void;
  onOpenPartner: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenPartner }) => {
  const [modalTitle, setModalTitle] = useState<string | null>(null);
  const [modalContent, setModalContent] = useState<string | null>(null);

  const showPolicyModal = (title: string, content: string) => {
    setModalTitle(title);
    setModalContent(content);
  };

  return (
    <footer className="bg-neutral-950 text-neutral-400 text-xs border-t border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Brand info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5 text-white">
              <div className="w-9 h-9 rounded-xl bg-purple-900 text-amber-300 flex items-center justify-center font-bold">
                <Scissors className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                SalonBook
              </span>
            </div>
            <p className="text-neutral-400 text-xs leading-relaxed max-w-sm">
              India's premier marketplace for hair salons, luxury beauty parlours, barbershops, and wellness spas. Discover, compare, and book verified appointments in real-time.
            </p>
            <div className="flex items-center gap-4 text-neutral-300 pt-1">
              <span className="hover:text-amber-300 transition-colors cursor-pointer" title="Instagram">
                Instagram
              </span>
              <span>·</span>
              <span className="hover:text-amber-300 transition-colors cursor-pointer" title="LinkedIn">
                LinkedIn
              </span>
              <span>·</span>
              <span className="hover:text-amber-300 transition-colors cursor-pointer" title="Twitter / X">
                X / Twitter
              </span>
              <span>·</span>
              <span className="hover:text-amber-300 transition-colors cursor-pointer" title="Facebook">
                Facebook
              </span>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5">
              <li>
                <button
                  onClick={() => onNavigate('explore')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Explore Salons
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('services')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Popular Services
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenPartner}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Partner with Us
                </button>
              </li>
              <li>
                <button
                  onClick={() =>
                    showPolicyModal(
                      'About SalonBook',
                      'SalonBook is an Indian consumer platform founded to digitize the beauty and grooming salon ecosystem. We enable clients in cities like Bengaluru, Mumbai, Delhi NCR, and Hyderabad to easily find hygienic, high-standard salons, check genuine service prices, and secure confirmed appointments without waiting.'
                    )
                  }
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  About Us
                </button>
              </li>
            </ul>
          </div>

          {/* Customer Support */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Support & Help
            </h4>
            <ul className="space-y-2.5">
              <li>
                <button
                  onClick={() =>
                    showPolicyModal(
                      'Help Centre & FAQs',
                      'Frequently Asked Questions:\n\n1. How do I book an appointment?\nBrowse salons, pick your required services, choose your preferred stylist, select a date & slot, and confirm. You pay at the salon upon service completion.\n\n2. Are there any booking fees?\nNo, booking through SalonBook is 100% free with no hidden convenience charges.\n\n3. Can I reschedule or cancel?\nYes! You can cancel or reschedule through your Customer Dashboard up to the salon’s cut-off window (typically 1-2 hours prior).'
                    )
                  }
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Help Centre
                </button>
              </li>
              <li>
                <button
                  onClick={() =>
                    showPolicyModal(
                      'Contact Our Team',
                      'Need assistance with your booking or listing your salon?\n\n• Email Support: care@salonbook.in\n• Partner Inquiries: partners@salonbook.in\n• Helpline: +91 80 4012 8800 (Mon-Sat, 9:00 AM - 8:00 PM IST)\n• Headquarters: Indiranagar, Bengaluru, Karnataka 560038'
                    )
                  }
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Contact Us
                </button>
              </li>
              <li>
                <button
                  onClick={() =>
                    showPolicyModal(
                      'Cancellation & Rescheduling Policy',
                      'Standard Cancellation Policy:\n\n• Appointments can be cancelled or rescheduled for free up to 2 hours before the scheduled time via your Customer Dashboard.\n• For bridal and special makeover packages exceeding 90 minutes, a 4-hour advance notice is requested.\n• In the event of an unavoidable emergency, please contact the salon directly via their contact number shown on the booking voucher.'
                    )
                  }
                  className="hover:text-white transition-colors cursor-pointer text-amber-300 font-medium"
                >
                  Cancellation Policy
                </button>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
              Legal & Trust
            </h4>
            <ul className="space-y-2.5">
              <li>
                <button
                  onClick={() =>
                    showPolicyModal(
                      'Terms and Conditions',
                      'SalonBook Terms & Conditions:\n\n1. Acceptance of Terms: By using SalonBook, you agree to these Terms.\n2. Service Contract: SalonBook facilitates bookings between clients and independent salon partners. Services are fulfilled by the respective salon partner.\n3. Pricing: All prices displayed are in Indian Rupees (₹) and represent the salon’s active tariff.\n4. Walk-ins and Availability: Reserved slots are prioritized over walk-ins.'
                    )
                  }
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Terms and Conditions
                </button>
              </li>
              <li>
                <button
                  onClick={() =>
                    showPolicyModal(
                      'Privacy Policy',
                      'SalonBook Privacy Policy:\n\n• We respect your privacy. Client contact details (phone, email) are shared strictly with the booked salon partner for service coordination and appointment reminders.\n• We do not sell or monetize personal customer records to third-party ad networks.\n• Passwords are encrypted using high-entropy cryptographic hashing.'
                    )
                  }
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Privacy Policy
                </button>
              </li>
              <li className="pt-2 text-[11px] text-neutral-500 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                <span>Made with pride in India</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="pt-8 border-t border-neutral-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
          <p>© {new Date().getFullYear()} SalonBook Technologies India Pvt. Ltd. All rights reserved.</p>
          <p>Local Business Timezone: Asia/Kolkata (IST)</p>
        </div>
      </div>

      {/* Info Modal for Terms, Policies, Contact */}
      {modalTitle && modalContent && (
        <div className="fixed inset-0 z-50 bg-neutral-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white text-neutral-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-neutral-200">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h3 className="text-base font-bold text-neutral-900">{modalTitle}</h3>
              <button
                onClick={() => {
                  setModalTitle(null);
                  setModalContent(null);
                }}
                className="text-neutral-400 hover:text-neutral-700 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="py-4 text-xs sm:text-sm text-neutral-600 leading-relaxed whitespace-pre-line max-h-[60vh] overflow-y-auto">
              {modalContent}
            </div>
            <div className="pt-3 border-t border-neutral-100 text-right">
              <button
                onClick={() => {
                  setModalTitle(null);
                  setModalContent(null);
                }}
                className="px-4 py-2 bg-neutral-900 text-white rounded-xl text-xs font-semibold hover:bg-neutral-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};
