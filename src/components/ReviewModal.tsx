import React, { useState } from 'react';
import { Booking } from '../types/index.ts';
import { reviewsApi } from '../lib/api.ts';
import { X, Star, AlertCircle, CheckCircle2 } from 'lucide-react';

interface ReviewModalProps {
  booking: Booking | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  booking,
  onClose,
  onSuccess
}) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [hoverRating, setHoverRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!booking) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      setErrorMsg('Please enter your written review.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      await reviewsApi.submitReview({
        bookingId: booking.id,
        salonId: booking.salonId,
        rating,
        comment: comment.trim()
      });
      onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-neutral-200 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-500 hover:text-neutral-900 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="mb-5">
          <span className="text-xs font-semibold text-purple-900 tracking-wider uppercase block mb-1">
            Verified Client Review
          </span>
          <h2 className="text-xl font-bold text-neutral-900">
            Rate Your Experience at {booking.salonName}
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            Appointment on {booking.date} with {booking.staffName}
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Star selector */}
          <div>
            <label className="text-neutral-700 font-semibold block mb-2">Overall Rating</label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 cursor-pointer transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-7 h-7 ${
                      (hoverRating || rating) >= star
                        ? 'fill-amber-400 stroke-amber-400'
                        : 'stroke-neutral-300'
                    }`}
                  />
                </button>
              ))}
              <span className="text-sm font-bold text-neutral-800 ml-2">
                {rating} / 5 Stars
              </span>
            </div>
          </div>

          <div>
            <label className="text-neutral-700 font-semibold block mb-1">
              Your Written Feedback
            </label>
            <textarea
              required
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="How was your haircut, styling, or facial? Mention the hygiene, ambiance, and stylist service..."
              className="w-full p-3 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-purple-900"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 bg-purple-950 hover:bg-purple-900 disabled:opacity-50 text-white rounded-xl font-bold transition-all shadow-sm active:scale-98 cursor-pointer"
            >
              {submitting ? 'Submitting...' : 'Post Public Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
